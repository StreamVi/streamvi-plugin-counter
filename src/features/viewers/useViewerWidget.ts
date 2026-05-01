import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import type {
  CentrifugoBroadcastViewsResponse,
  CentrifugoStreamEndResponse,
  CentrifugoStreamStartResponse,
  MethodBroadcastRestreamItemResponse,
  SiteBroadcastControllerStatus0200Response,
  ViewerWidgetViewModel,
} from './api/contracts'
import {
  useBroadcastChannelTokenQuery,
  useBroadcastRestreamsQuery,
  useBroadcastStatusQuery,
  useChannelTokenQuery,
  usePlatformsQuery,
  useProjectInfoQuery,
  useTemplateWidgetQuery,
  viewerQueryKeys,
} from './queries'
import {
  defaultWidgetOptions,
  getWidgetOptionsFromPayload,
  type WidgetPayload,
  type WidgetQueryParams,
} from './types'
import { buildChannels } from './lib/build-channels'
import { isLiveStatus } from './lib/is-live-status'
import { useBroadcastSubscription } from './realtime/use-broadcast-subscription'
import { useCentrifugoClient } from './realtime/use-centrifugo-client'
import { useProjectSubscription } from './realtime/use-project-subscription'
import { useWidgetTemplateSubscription } from './realtime/use-widget-template-subscription'
import { useAnimatedTestChannels } from './useAnimatedTestChannels'

export function useViewerWidget({
  templateId,
  token,
}: WidgetQueryParams): ViewerWidgetViewModel {
  const queryClient = useQueryClient()

  const templateWidgetQuery = useTemplateWidgetQuery(token, templateId)
  const templatePayload = templateWidgetQuery.data ?? null
  const options = useMemo(
    () => (templatePayload ? getWidgetOptionsFromPayload(templatePayload) : defaultWidgetOptions),
    [templatePayload],
  )
  const isTemplateSettingsResolved =
    templateWidgetQuery.isSuccess || templateWidgetQuery.isError
  const testMode = options.testMode
  const liveToken = isTemplateSettingsResolved && !testMode ? token : ''
  const projectInfoQuery = useProjectInfoQuery(liveToken)
  const platformsQuery = usePlatformsQuery(liveToken)
  const projectId = projectInfoQuery.data?.data.project_id ?? null
  const broadcastStatusQuery = useBroadcastStatusQuery(liveToken, projectId)
  const broadcastId =
    testMode || !isLiveStatus(broadcastStatusQuery.data)
      ? null
      : broadcastStatusQuery.data.broadcast_id
  const { clientRef, connectionState } = useCentrifugoClient({
    token,
  })
  const testChannelsState = useAnimatedTestChannels(testMode)

  const broadcastChannelTokenQuery = useBroadcastChannelTokenQuery(liveToken, broadcastId)
  const templateChannelName = templateId ? `$widget_template:${templateId}` : null
  const templateChannelTokenQuery = useChannelTokenQuery(token, templateChannelName)
  const broadcastRestreamsQuery = useBroadcastRestreamsQuery(liveToken, broadcastId)

  const handleProjectEvent = useCallback(
    (payload: CentrifugoStreamStartResponse | CentrifugoStreamEndResponse) => {
      if (projectId === null) {
        return
      }

      if (payload.event === 'stream-end') {
        queryClient.setQueryData<SiteBroadcastControllerStatus0200Response>(
          viewerQueryKeys.broadcastStatus(token, projectId),
          { status: 'offline' },
        )
        void queryClient.invalidateQueries({
          queryKey: viewerQueryKeys.broadcastStatus(token, projectId),
        })
        return
      }

      queryClient.setQueryData<SiteBroadcastControllerStatus0200Response>(
        viewerQueryKeys.broadcastStatus(token, projectId),
        { broadcast_id: payload.payload.broadcast_id },
      )
      void queryClient.invalidateQueries({
        queryKey: viewerQueryKeys.broadcastStatus(token, projectId),
      })
      void queryClient.invalidateQueries({
        queryKey: viewerQueryKeys.broadcastRestreams(
          liveToken,
          payload.payload.broadcast_id,
        ),
      })
    },
    [liveToken, projectId, queryClient, token],
  )

  const handleBroadcastEvent = useCallback(
    (payload: CentrifugoBroadcastViewsResponse) => {
      queryClient.setQueryData(
        viewerQueryKeys.broadcastRestreams(liveToken, payload.broadcast_id),
        (
          current:
            | {
                results: Array<MethodBroadcastRestreamItemResponse>
              }
            | undefined,
        ) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            results: current.results.map((item) =>
              item.id === payload.restream_id
                ? { ...item, viewer: payload.payload }
                : item,
            ),
          }
        },
      )
    },
    [liveToken, queryClient],
  )

  useProjectSubscription({
    clientRef,
    onProjectEvent: handleProjectEvent,
    projectId,
  })

  useBroadcastSubscription({
    accessToken: broadcastChannelTokenQuery.data?.access_token,
    broadcastId,
    clientRef,
    onBroadcastEvent: handleBroadcastEvent,
    onRestreamsChange: () => {
      if (broadcastId === null) {
        return
      }

      void queryClient.invalidateQueries({
        queryKey: viewerQueryKeys.broadcastRestreams(liveToken, broadcastId),
      })
    },
  })

  const handleTemplatePayload = useCallback((payload: WidgetPayload | null) => {
    if (!templateId) {
      return
    }

    queryClient.setQueryData(
      viewerQueryKeys.templateWidget(token, templateId),
      payload,
    )
  }, [queryClient, templateId, token])

  const handleTemplateChange = useCallback(() => {
    if (!templateId) {
      return
    }

    void queryClient.invalidateQueries({
      queryKey: viewerQueryKeys.templateWidget(token, templateId),
    })
  }, [queryClient, templateId, token])

  useWidgetTemplateSubscription({
    accessToken: templateChannelTokenQuery.data?.access_token,
    channelName: templateChannelName ?? '',
    clientRef,
    onTemplateChange: handleTemplateChange,
    onTemplatePayload: handleTemplatePayload,
  })

  const channels = useMemo(
    () => buildChannels(broadcastRestreamsQuery.data, platformsQuery.data),
    [broadcastRestreamsQuery.data, platformsQuery.data],
  )

  if (testMode) {
    return {
      channels: testChannelsState.channels,
      isStreamActive: true,
      options,
      status: 'ready',
      totalViewers: testChannelsState.totalViewers,
    }
  }

  const totalViewers = channels.reduce((sum, channel) => sum + channel.viewer, 0)
  const isLoading =
    templateWidgetQuery.isLoading ||
    (!testMode &&
      (projectInfoQuery.isLoading ||
        platformsQuery.isLoading ||
        broadcastStatusQuery.isLoading ||
        (broadcastId !== null && broadcastRestreamsQuery.isLoading)))

  const hasError =
    templateWidgetQuery.isError ||
    templateChannelTokenQuery.isError ||
    (!testMode &&
      (projectInfoQuery.isError ||
        platformsQuery.isError ||
        broadcastStatusQuery.isError ||
        broadcastRestreamsQuery.isError ||
        broadcastChannelTokenQuery.isError))

  const status: ViewerWidgetViewModel['status'] = hasError
    ? 'error'
    : isLoading
      ? 'loading'
      : broadcastId !== null
        ? 'ready'
        : 'offline'

  return {
    channels,
    isStreamActive: broadcastId !== null,
    options,
    status: connectionState === 'error' ? 'error' : status,
    totalViewers,
  }
}
