import type { WidgetOptions, WidgetPayload } from '../types'

export interface ProjectInfoDataResponse {
  project_id: number
}

export interface ProjectInfoResponse {
  data: ProjectInfoDataResponse
}

export interface SiteBroadcastStatusInactiveResponse {
  status: 'offline'
}

export interface SiteBroadcastStatusLiveResponse {
  broadcast_id: number
}

export type SiteBroadcastControllerStatus0200Response =
  | SiteBroadcastStatusInactiveResponse
  | SiteBroadcastStatusLiveResponse

export interface MethodBroadcastRestreamItemResponse {
  id: number
  channel_type: string
  viewer?: number
}

export interface MethodBroadcastRestreamsResponse {
  results: Array<MethodBroadcastRestreamItemResponse>
}

export interface SitePlatformsSupportedItem {
  id: number
  title: string
  type: string
}

export interface SitePlatformsSupportedResponse {
  results: Array<SitePlatformsSupportedItem>
}

export interface CentrifugoChannelAccessTokenResponse {
  access_token: string
}

export interface CentrifugoConnectionAccessTokenResponse {
  access_token: string
}

export interface CentrifugoStreamStartPayload {
  broadcast_id: number
}

export interface CentrifugoStreamStartResponse {
  event: 'stream-start'
  payload: CentrifugoStreamStartPayload
}

export interface CentrifugoStreamEndResponse {
  event: 'stream-end'
}

export interface CentrifugoBroadcastViewsResponse {
  event: 'views'
  broadcast_id: number
  restream_id: number
  payload: number
}

export interface CentrifugoBroadcastRestreamsResponse {
  event: 'restreams.started' | 'restreams.stopped'
}

export type CentrifugoBroadcastEventResponseUnionEvent =
  | CentrifugoBroadcastViewsResponse
  | CentrifugoBroadcastRestreamsResponse

export interface CentrifugoWidgetTemplatePayloadResponse {
  event: 'widget-template-payload'
  payload: WidgetPayload | null
}

export interface IntegrationTemplateWidgetResponse {
  payload?: WidgetPayload | null
  data?: {
    payload?: WidgetPayload | null
  } | null
}

export interface ViewerChannel {
  restream_id: number
  platform_icon_url: string | null
  platform_title: string
  viewer: number
}

export interface ViewerWidgetViewModel {
  channels: ViewerChannel[]
  isStreamActive: boolean
  options: WidgetOptions
  status: 'loading' | 'ready' | 'offline' | 'error'
  totalViewers: number
}
