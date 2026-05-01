import type {
  SiteBroadcastControllerStatus0200Response,
  SiteBroadcastStatusLiveResponse,
} from '../api/contracts'

export function isLiveStatus(
  value: SiteBroadcastControllerStatus0200Response | undefined,
): value is SiteBroadcastStatusLiveResponse {
  return Boolean(value && 'broadcast_id' in value)
}
