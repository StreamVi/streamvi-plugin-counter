import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  CentrifugoBroadcastEventResponseUnionEvent,
  CentrifugoStreamEndResponse,
  CentrifugoStreamStartResponse,
  MethodBroadcastRestreamItemResponse,
  ViewerWidgetViewModel,
} from './api/contracts'
import {
  useBroadcastChannelTokenQuery,
  useBroadcastRestreamsQuery,
  useBroadcastStatusQuery,
  useCentrifugoConnectionTokenQuery,
  usePlatformsQuery,
  useProjectInfoQuery,
  viewerQueryKeys,
} from './queries'
import { getWidgetOptions, getWidgetQueryParams } from './types'
import { buildChannels } from './lib/build-channels'
import { isLiveStatus } from './lib/is-live-status'
import { TEST_CHANNELS } from './lib/test-channels'
import { useBroadcastSubscription } from './realtime/use-broadcast-subscription'
import { useCentrifugoClient } from './realtime/use-centrifugo-client'
import { useProjectSubscription } from './realtime/use-project-subscription'

export function useViewerWidget(): ViewerWidgetViewModel {
  const queryClient = useQueryClient()
  const { token } = useMemo(() => getWidgetQueryParams(window.location.search), [])
  const { testMode } = useMemo(() => getWidgetOptions(window.location.search), [])
  const liveToken = testMode ? '' : token
  const [broadcastId, setBroadcastId] = useState<number | null>(null)

  const projectInfoQuery = useProjectInfoQuery(liveToken)
  const platformsQuery = usePlatformsQuery(liveToken)
  const projectId = projectInfoQuery.data?.data.project_id ?? null
  const broadcastStatusQuery = useBroadcastStatusQuery(liveToken, projectId)
  const connectionTokenQuery = useCentrifugoConnectionTokenQuery(liveToken)
  const { clientRef, connectionState } = useCentrifugoClient({
    liveToken,
    testMode,
  })

  const liveBroadcastId = isLiveStatus(broadcastStatusQuery.data)
    ? broadcastStatusQuery.data.broadcast_id
    : null

  useEffect(() => {
    setBroadcastId(liveBroadcastId)
  }, [liveBroadcastId])

  const broadcastChannelTokenQuery = useBroadcastChannelTokenQuery(liveToken, broadcastId)
  const broadcastRestreamsQuery = useBroadcastRestreamsQuery(liveToken, broadcastId)

  const handleProjectEvent = useCallback(
    (payload: CentrifugoStreamStartResponse | CentrifugoStreamEndResponse) => {
      if (payload.event === 'stream-end') {
        setBroadcastId(null)
        if (projectId !== null) {
          void queryClient.invalidateQueries({
            queryKey: viewerQueryKeys.broadcastStatus(token, projectId),
          })
        }
        return
      }

      setBroadcastId(payload.payload.broadcast_id)
      if (projectId !== null) {
        void queryClient.invalidateQueries({
          queryKey: viewerQueryKeys.broadcastStatus(token, projectId),
        })
      }
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
    (payload: CentrifugoBroadcastEventResponseUnionEvent) => {
      if (payload.event !== 'views') {
        return
      }

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

  const channels = useMemo(
    () => buildChannels(broadcastRestreamsQuery.data, platformsQuery.data),
    [broadcastRestreamsQuery.data, platformsQuery.data],
  )

  if (testMode) {
    return {
      channels: TEST_CHANNELS,
      isStreamActive: true,
      status: 'ready',
      totalViewers: TEST_CHANNELS.reduce((sum, channel) => sum + channel.viewer, 0),
    }
  }

  const totalViewers = channels.reduce((sum, channel) => sum + channel.viewer, 0)
  const isLoading =
    projectInfoQuery.isLoading ||
    platformsQuery.isLoading ||
    broadcastStatusQuery.isLoading ||
    (broadcastId !== null && broadcastRestreamsQuery.isLoading)

  const hasError =
    projectInfoQuery.isError ||
    platformsQuery.isError ||
    broadcastStatusQuery.isError ||
    broadcastRestreamsQuery.isError ||
    connectionTokenQuery.isError ||
    broadcastChannelTokenQuery.isError

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
    status: connectionState === 'error' ? 'error' : status,
    totalViewers,
  }
}
