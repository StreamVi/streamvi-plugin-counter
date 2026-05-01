import { skipToken, useQuery } from '@tanstack/react-query'
import {
  getBroadcastRestreams,
  getBroadcastStatus,
  getBroadcastChannelToken,
  getChannelToken,
  getPlatforms,
  getProjectInfo,
  getTemplateWidget,
} from './api/client'

export const viewerQueryKeys = {
  broadcastChannelToken: (tokenId: string, broadcastId: number | null) =>
    ['viewer-widget', 'broadcast-channel-token', tokenId, broadcastId] as const,
  broadcastRestreams: (tokenId: string, broadcastId: number | null) =>
    ['viewer-widget', 'broadcast-restreams', tokenId, broadcastId] as const,
  broadcastStatus: (tokenId: string, projectId: number | null) =>
    ['viewer-widget', 'broadcast-status', tokenId, projectId] as const,
  channelToken: (tokenId: string, channelName: string | null) =>
    ['viewer-widget', 'channel-token', tokenId, channelName] as const,
  platforms: (tokenId: string) => ['viewer-widget', 'platforms', tokenId] as const,
  projectInfo: (tokenId: string) => ['viewer-widget', 'project-info', tokenId] as const,
  templateWidget: (tokenId: string, templateId: string) =>
    ['viewer-widget', 'template-widget', tokenId, templateId] as const,
}

export function useProjectInfoQuery(tokenId: string) {
  return useQuery({
    enabled: Boolean(tokenId),
    queryFn: () => getProjectInfo(tokenId),
    queryKey: viewerQueryKeys.projectInfo(tokenId),
  })
}

export function useBroadcastStatusQuery(tokenId: string, projectId: number | null) {
  return useQuery({
    enabled: Boolean(tokenId) && projectId !== null,
    queryFn:
      tokenId && projectId !== null
        ? () => getBroadcastStatus(tokenId, projectId)
        : skipToken,
    queryKey: viewerQueryKeys.broadcastStatus(tokenId, projectId),
  })
}

export function useBroadcastRestreamsQuery(
  tokenId: string,
  broadcastId: number | null,
) {
  return useQuery({
    enabled: Boolean(tokenId) && broadcastId !== null,
    queryFn:
      tokenId && broadcastId !== null
        ? () => getBroadcastRestreams(tokenId, broadcastId)
        : skipToken,
    queryKey: viewerQueryKeys.broadcastRestreams(tokenId, broadcastId),
    refetchInterval: 30_000,
  })
}

export function usePlatformsQuery(tokenId: string) {
  return useQuery({
    enabled: Boolean(tokenId),
    queryFn: () => getPlatforms(tokenId),
    queryKey: viewerQueryKeys.platforms(tokenId),
    staleTime: 10 * 60_000,
  })
}

export function useBroadcastChannelTokenQuery(
  tokenId: string,
  broadcastId: number | null,
) {
  return useQuery({
    enabled: Boolean(tokenId) && broadcastId !== null,
    queryFn:
      tokenId && broadcastId !== null
        ? () => getBroadcastChannelToken(tokenId, broadcastId)
        : skipToken,
    queryKey: viewerQueryKeys.broadcastChannelToken(tokenId, broadcastId),
    staleTime: 60_000,
  })
}

export function useChannelTokenQuery(tokenId: string, channelName: string | null) {
  return useQuery({
    enabled: Boolean(tokenId) && Boolean(channelName),
    queryFn:
      tokenId && channelName
        ? () => getChannelToken(tokenId, channelName)
        : skipToken,
    queryKey: viewerQueryKeys.channelToken(tokenId, channelName),
    staleTime: 60_000,
  })
}

export function useTemplateWidgetQuery(tokenId: string, templateId: string) {
  return useQuery({
    enabled: Boolean(tokenId) && Boolean(templateId),
    queryFn: () => getTemplateWidget(tokenId, templateId),
    queryKey: viewerQueryKeys.templateWidget(tokenId, templateId),
    staleTime: 60_000,
  })
}
