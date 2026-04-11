export interface ProjectInfoDataResponse {
  project_id: number
  name: string
  fename: string
  photo_50: string
  photo_100: string
  external_id: string
}

export interface ProjectInfoResponse {
  data: ProjectInfoDataResponse
}

export interface SiteBroadcastLiveStatusRestream {
  id: number
  status?: string
}

export interface SiteBroadcastStatusInactiveResponse {
  status: 'offline'
}

export interface SiteBroadcastStatusLiveResponse {
  broadcast_id: number
  stream_id: number
  reconnects: number
  date_start: string
  resolution: string
  fps: number
  bitrate: number
  key_frame?: number
  status: 'active' | 'pause' | 'lost' | 'done'
  url: string
  video_codec_name: string
  restreams: Array<SiteBroadcastLiveStatusRestream>
  app: 'live' | 'scheduler' | 'transcoding'
}

export type SiteBroadcastControllerStatus0200Response =
  | SiteBroadcastStatusInactiveResponse
  | SiteBroadcastStatusLiveResponse

export interface MethodBroadcastRestreamItemResponse {
  id: number
  channel_id: number
  channel_name: string
  channel_type: string
  message?: number
  viewer?: number
}

export interface MethodBroadcastRestreamsResponse {
  results: Array<MethodBroadcastRestreamItemResponse>
}

export interface SitePlatformsSupportedItem {
  id: number
  is_adding: number
  title: string
  extension: 'png' | 'svg'
  url: string
  type: string
  oauth: number
  read_chat: number
  write_chat: number
  edit_name: number
  set_title: number
  set_description: number
  created_stream: number
  rtmp_url: number
  rtmp_key: number
  planned: number
  options: number
  url_stream: number
  viewers: number
  messages: number
  like: number
}

export interface SitePlatformsSupportedResponse {
  results: Array<SitePlatformsSupportedItem>
}

export interface SiteSearchChannelPlatformDto {
  title: string
  type: string
  url: string
  extension: 'png' | 'svg'
  edit_name: number
}

export interface CentrifugoChannelAccessTokenResponse {
  access_token: string
  expires_in: number
  channel: string
}

export interface CentrifugoConnectionAccessTokenResponse {
  access_token: string
  expires_in: number
}

export interface CentrifugoStreamStartPayload {
  broadcast_id: number
  stream_id: number
  app: string
}

export interface CentrifugoStreamStartResponse {
  event: 'stream-start'
  payload: CentrifugoStreamStartPayload
}

export interface CentrifugoStreamEndResponse {
  event: 'stream-end'
}

export interface CentrifugoBroadcastViewsResponse {
  event: 'views' | 'restreams.started' | 'restreams.stopped'
  broadcast_id: number
  event_id: string
  platform: string
  restream_id: number
  payload: number
}

export type CentrifugoBroadcastEventResponseUnionEvent =
  | CentrifugoBroadcastViewsResponse

export interface ViewerChannel {
  channel_id: number
  name: string
  restream_id: number
  message: number
  channel_type: string
  platform_id: number | null
  platform_icon_url: string | null
  platform_title: string
  viewer: number
}

export interface ViewerWidgetViewModel {
  channels: ViewerChannel[]
  connectionLabel: string
  errorMessage: string | null
  isLoading: boolean
  isStreamActive: boolean
  project: ProjectInfoDataResponse | null
  status: 'loading' | 'ready' | 'offline' | 'error'
  templateId: string
  totalViewers: number
}
