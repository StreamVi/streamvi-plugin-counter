import { useQueryClient } from "@tanstack/react-query";
import { Centrifuge, type Subscription } from "centrifuge";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import type {
  CentrifugoBroadcastEventResponseUnionEvent,
  CentrifugoStreamEndResponse,
  CentrifugoStreamStartResponse,
  MethodBroadcastRestreamItemResponse,
  SitePlatformsSupportedResponse,
  ViewerChannel,
  ViewerWidgetViewModel,
} from "./api/contracts";
import {
  useBroadcastChannelTokenQuery,
  useBroadcastRestreamsQuery,
  useBroadcastStatusQuery,
  useCentrifugoConnectionTokenQuery,
  usePlatformsQuery,
  useProjectInfoQuery,
  viewerQueryKeys,
} from "./queries";
import { getWidgetOptions, getWidgetQueryParams } from "./types";
import { getCentrifugoConnectionToken } from "./api/client";

const TEST_CHANNELS: ViewerChannel[] = [
  {
    restream_id: 1,
    platform_icon_url: "https://cdn.platform-icons.streamvi.io/dark/s/4.svg",
    platform_title: "YouTube",
    viewer: 6420,
  },
  {
    restream_id: 2,
    platform_icon_url: "https://cdn.platform-icons.streamvi.io/dark/s/2.svg",
    platform_title: "Twitch",
    viewer: 3810,
  },
  {
    restream_id: 3,
    platform_icon_url: "https://cdn.platform-icons.streamvi.io/dark/s/1.svg",
    platform_title: "VK",
    viewer: 2310,
  },
];

function isLiveStatus(
  value: ReturnType<typeof useBroadcastStatusQuery>["data"],
): value is Exclude<
  ReturnType<typeof useBroadcastStatusQuery>["data"],
  undefined
> & {
  broadcast_id: number;
  restreams: Array<{ id: number; status?: string }>;
} {
  return Boolean(value && "broadcast_id" in value);
}

function buildChannels(
  restreams: ReturnType<typeof useBroadcastRestreamsQuery>["data"],
  platforms: SitePlatformsSupportedResponse | undefined,
): ViewerChannel[] {
  if (!restreams)
    return [];

  const platformsByType = new Map(
    (platforms?.results ?? []).map((item) => [item.type.toLowerCase(), item]),
  );

  return restreams.results
    .filter(
      (item) =>
        item.viewer !== undefined && typeof item.viewer === "number",
    )
    .map((item) => {
      const platform = platformsByType.get(item.channel_type.toLowerCase());

      return {
        restream_id: item.id,
        platform_icon_url: platform
          ? `https://cdn.platform-icons.streamvi.io/dark/s/${platform.id}.svg`
          : null,
        platform_title: platform?.title ?? item.channel_type,
        viewer: item.viewer ?? 0,
      };
    });
}

export function useViewerWidget(): ViewerWidgetViewModel {
  const queryClient = useQueryClient();
  const { token } = useMemo(
    () => getWidgetQueryParams(window.location.search),
    [],
  );
  const { testMode } = useMemo(
    () => getWidgetOptions(window.location.search),
    [],
  );
  const liveToken = testMode ? "" : token;
  const clientRef = useRef<Centrifuge | null>(null);
  const projectSubscriptionRef = useRef<Subscription | null>(null);
  const broadcastSubscriptionRef = useRef<Subscription | null>(null);
  const [broadcastId, setBroadcastId] = useState<number | null>(null);
  const [connectionState, setConnectionState] = useState<
    ViewerWidgetViewModel["status"]
  >(testMode ? "ready" : token ? "loading" : "error");

  const projectInfoQuery = useProjectInfoQuery(liveToken);
  const platformsQuery = usePlatformsQuery(liveToken);
  const projectId = projectInfoQuery.data?.data.project_id ?? null;
  const broadcastStatusQuery = useBroadcastStatusQuery(liveToken, projectId);
  const connectionTokenQuery = useCentrifugoConnectionTokenQuery(liveToken);

  const liveBroadcastId = isLiveStatus(broadcastStatusQuery.data)
    ? broadcastStatusQuery.data.broadcast_id
    : null;

  useEffect(() => {
    setBroadcastId(liveBroadcastId);
  }, [liveBroadcastId]);

  const broadcastChannelTokenQuery = useBroadcastChannelTokenQuery(
    liveToken,
    broadcastId,
  );
  const broadcastRestreamsQuery = useBroadcastRestreamsQuery(
    liveToken,
    broadcastId,
  );

  const handleProjectEvent = useEffectEvent(
    (payload: CentrifugoStreamStartResponse | CentrifugoStreamEndResponse) => {
      if (payload.event === "stream-end") {
        setBroadcastId(null);
        if (projectId !== null) {
          void queryClient.invalidateQueries({
            queryKey: viewerQueryKeys.broadcastStatus(token, projectId),
          });
        }
        return;
      }

      if (payload.event !== "stream-start") {
        return;
      }

      setBroadcastId(payload.payload.broadcast_id);
      if (projectId !== null) {
        void queryClient.invalidateQueries({
          queryKey: viewerQueryKeys.broadcastStatus(token, projectId),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: viewerQueryKeys.broadcastRestreams(
          liveToken,
          payload.payload.broadcast_id,
        ),
      });
    },
  );

  useEffect(() => {
    if (!liveToken || testMode) return;

    const client = new Centrifuge(
      `${import.meta.env.VITE_CENTRIFUGO_HOST}/connection/websocket`,
      {
        getToken: getCentrifugoConnectionToken(liveToken),
      },
    );
    clientRef.current = client;

    client.on("connected", () => {
      setConnectionState((current) =>
        current === "error" ? current : "ready",
      );
    });
    client.on("connecting", () => {
      setConnectionState((current) =>
        current === "ready" ? current : "loading",
      );
    });
    client.on("disconnected", () => {
      setConnectionState((current) =>
        current === "error" ? current : "offline",
      );
    });
    client.on("error", (context) => {
      setConnectionState("error");
      console.error(
        context.error?.message ?? "Failed to connect to Centrifugo.",
      );
    });

    client.connect();

    return () => {
      if (broadcastSubscriptionRef.current) {
        broadcastSubscriptionRef.current.unsubscribe();
        broadcastSubscriptionRef.current = null;
      }

      if (projectSubscriptionRef.current) {
        projectSubscriptionRef.current.unsubscribe();
        projectSubscriptionRef.current = null;
      }

      client.disconnect();
      clientRef.current = null;
    };
  }, [liveToken, testMode]);

  useEffect(() => {
    const client = clientRef.current;

    if (!client || !projectId) {
      return;
    }

    if (projectSubscriptionRef.current) {
      projectSubscriptionRef.current.unsubscribe();
      projectSubscriptionRef.current = null;
    }

    const subscription = client.newSubscription(`project#${projectId}`);
    projectSubscriptionRef.current = subscription;

    subscription.on("publication", (context) => {
      const data = context.data as
        | Partial<CentrifugoStreamStartResponse | CentrifugoStreamEndResponse>
        | undefined;

      if (data?.event === "stream-start" && data.payload) {
        handleProjectEvent(data as CentrifugoStreamStartResponse);
      }

      if (data?.event === "stream-end") {
        handleProjectEvent({ event: "stream-end" });
      }
    });

    subscription.subscribe();

    return () => {
      if (projectSubscriptionRef.current === subscription) {
        subscription.unsubscribe();
        projectSubscriptionRef.current = null;
      }
    };
  }, [projectId]);

  const handleBroadcastEvent = useEffectEvent(
    (payload: CentrifugoBroadcastEventResponseUnionEvent) => {
      if (payload.event !== "views") {
        return;
      }

      console.log("data", payload);

      queryClient.setQueryData(
        viewerQueryKeys.broadcastRestreams(liveToken, payload.broadcast_id),
        (
          current:
            | {
                results: Array<MethodBroadcastRestreamItemResponse>;
              }
            | undefined,
        ) => {
          if (!current) {
            return current;
          }
          console.log("current", current);

          return {
            ...current,
            results: current.results.map((item) =>
              item.id === payload.restream_id
                ? { ...item, viewer: payload.payload }
                : item,
            ),
          };
        },
      );
    },
  );

  useEffect(() => {
    const client = clientRef.current;

    if (broadcastSubscriptionRef.current) {
      broadcastSubscriptionRef.current.unsubscribe();
      broadcastSubscriptionRef.current = null;
    }

    if (
      !client ||
      !broadcastId ||
      !broadcastChannelTokenQuery.data?.access_token
    ) {
      return;
    }

    const subscription = client.newSubscription(`$broadcast:${broadcastId}`, {
      token: broadcastChannelTokenQuery.data.access_token,
    });
    broadcastSubscriptionRef.current = subscription;

    subscription.on("publication", (context) => {
      const data = context.data as
        | Partial<CentrifugoBroadcastEventResponseUnionEvent>
        | undefined;

      console.log("broadcast event", data);
      if (data?.event === "views") {
        handleBroadcastEvent(
          data as CentrifugoBroadcastEventResponseUnionEvent,
        );
      }

      if (
        data?.event === "restreams.started" ||
        data?.event === "restreams.stopped"
      ) {
        void queryClient.invalidateQueries({
          queryKey: viewerQueryKeys.broadcastRestreams(liveToken, broadcastId),
        });
      }
    });

    subscription.subscribe();

    return () => {
      if (broadcastSubscriptionRef.current === subscription) {
        subscription.unsubscribe();
        broadcastSubscriptionRef.current = null;
      }
    };
  }, [
    broadcastChannelTokenQuery.data?.access_token,
    broadcastId,
    queryClient,
    liveToken,
  ]);

  const channels = useMemo(
    () => buildChannels(broadcastRestreamsQuery.data, platformsQuery.data),
    [broadcastRestreamsQuery.data, platformsQuery.data],
  );

  if (testMode) {
    return {
      channels: TEST_CHANNELS,
      isStreamActive: true,
      status: "ready",
      totalViewers: TEST_CHANNELS.reduce((sum, channel) => sum + channel.viewer, 0),
    };
  }

  const totalViewers = channels.reduce(
    (sum, channel) => sum + channel.viewer,
    0,
  );
  const isLoading =
    projectInfoQuery.isLoading ||
    platformsQuery.isLoading ||
    broadcastStatusQuery.isLoading ||
    (broadcastId !== null && broadcastRestreamsQuery.isLoading);

  const hasError =
    projectInfoQuery.isError ||
    platformsQuery.isError ||
    broadcastStatusQuery.isError ||
    broadcastRestreamsQuery.isError ||
    connectionTokenQuery.isError ||
    broadcastChannelTokenQuery.isError;

  const status: ViewerWidgetViewModel["status"] = hasError
    ? "error"
    : isLoading
      ? "loading"
      : broadcastId !== null
        ? "ready"
        : "offline";

  return {
    channels,
    isStreamActive: broadcastId !== null,
    status: connectionState === "error" ? "error" : status,
    totalViewers,
  };
}
