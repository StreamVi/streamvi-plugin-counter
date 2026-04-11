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
import { getWidgetQueryParams } from "./types";
import { getCentrifugoConnectionToken } from "./api/client";

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
        item.viewer !== undefined &&
        item.message !== undefined &&
        typeof item.viewer === "number" &&
        typeof item.message === "number",
    )
    .map((item) => {
      const platform = platformsByType.get(item.channel_type.toLowerCase());

      return {
        channel_id: item.channel_id,
        name: item.channel_name,
        restream_id: item.id,
        message: item.message ?? 0,
        channel_type: item.channel_type,
        platform_id: platform?.id ?? null,
        platform_icon_url: platform
          ? `https://cdn.platform-icons.streamvi.io/dark/s/${platform.id}.svg`
          : null,
        platform_title: platform?.title ?? item.channel_type,
        viewer: item.viewer ?? 0,
      };
    });
}

function getStatusLabel(
  status: ViewerWidgetViewModel["status"],
  isStreamActive: boolean,
): string {
  if (status === "loading") {
    return "Connecting";
  }

  if (status === "error") {
    return "Error";
  }

  return isStreamActive ? "" : "Offline";
}

export function useViewerWidget(): ViewerWidgetViewModel {
  const queryClient = useQueryClient();
  const { templateId, token } = useMemo(
    () => getWidgetQueryParams(window.location.search),
    [],
  );
  const clientRef = useRef<Centrifuge | null>(null);
  const projectSubscriptionRef = useRef<Subscription | null>(null);
  const broadcastSubscriptionRef = useRef<Subscription | null>(null);
  const [broadcastId, setBroadcastId] = useState<number | null>(null);
  const [connectionState, setConnectionState] = useState<
    ViewerWidgetViewModel["status"]
  >(token ? "loading" : "error");
  const [connectionError, setConnectionError] = useState<string | null>(
    token ? null : "Add ?template_id=...&token=... to the OBS widget URL.",
  );

  const projectInfoQuery = useProjectInfoQuery(token);
  const platformsQuery = usePlatformsQuery(token);
  const projectId = projectInfoQuery.data?.data.project_id ?? null;
  const broadcastStatusQuery = useBroadcastStatusQuery(token, projectId);
  const connectionTokenQuery = useCentrifugoConnectionTokenQuery(token);

  const liveBroadcastId = isLiveStatus(broadcastStatusQuery.data)
    ? broadcastStatusQuery.data.broadcast_id
    : null;

  useEffect(() => {
    setBroadcastId(liveBroadcastId);
  }, [liveBroadcastId]);

  const broadcastChannelTokenQuery = useBroadcastChannelTokenQuery(
    token,
    broadcastId,
  );
  const broadcastRestreamsQuery = useBroadcastRestreamsQuery(
    token,
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
          token,
          payload.payload.broadcast_id,
        ),
      });
    },
  );

  useEffect(() => {
    if (!token) return;

    const client = new Centrifuge(
      `${import.meta.env.VITE_CENTRIFUGO_HOST}/connection/websocket`,
      {
        getToken: getCentrifugoConnectionToken(token),
      },
    );
    clientRef.current = client;

    client.on("connected", () => {
      setConnectionState((current) =>
        current === "error" ? current : "ready",
      );
      setConnectionError(null);
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
      setConnectionError(
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
  }, [token]);

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
        viewerQueryKeys.broadcastRestreams(token, payload.broadcast_id),
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
          queryKey: viewerQueryKeys.broadcastRestreams(token, broadcastId),
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
    token,
  ]);

  const channels = useMemo(
    () => buildChannels(broadcastRestreamsQuery.data, platformsQuery.data),
    [broadcastRestreamsQuery.data, platformsQuery.data],
  );

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

  const errorMessage =
    connectionError ||
    projectInfoQuery.error?.message ||
    platformsQuery.error?.message ||
    broadcastStatusQuery.error?.message ||
    broadcastRestreamsQuery.error?.message ||
    connectionTokenQuery.error?.message ||
    broadcastChannelTokenQuery.error?.message ||
    null;

  return {
    channels,
    connectionLabel: getStatusLabel(
      connectionState === "error" ? "error" : status,
      broadcastId !== null,
    ),
    errorMessage,
    isLoading,
    isStreamActive: broadcastId !== null,
    project: projectInfoQuery.data?.data ?? null,
    status: connectionState === "error" ? "error" : status,
    templateId,
    totalViewers,
  };
}
