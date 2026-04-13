import type { SiteBroadcastStatusLiveResponse } from '../api/contracts'
import type { useBroadcastStatusQuery } from '../queries'

export function isLiveStatus(
  value: ReturnType<typeof useBroadcastStatusQuery>['data'],
): value is SiteBroadcastStatusLiveResponse {
  return Boolean(value && 'broadcast_id' in value)
}
