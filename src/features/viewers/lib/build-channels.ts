import type {
  MethodBroadcastRestreamsResponse,
  SitePlatformsSupportedResponse,
  ViewerChannel,
} from '../api/contracts'

export function buildChannels(
  restreams: MethodBroadcastRestreamsResponse | undefined,
  platforms: SitePlatformsSupportedResponse | undefined,
): ViewerChannel[] {
  if (!restreams) {
    return []
  }

  const platformsByType = new Map(
    (platforms?.results ?? []).map((item) => [item.type.toLowerCase(), item]),
  )

  return restreams.results
    .filter((item) => item.viewer !== undefined && typeof item.viewer === 'number')
    .map((item) => {
      const platform = platformsByType.get(item.channel_type.toLowerCase())

      return {
        restream_id: item.id,
        platform_icon_url: platform
          ? `https://cdn.platform-icons.streamvi.io/dark/s/${platform.id}.svg`
          : null,
        platform_title: platform?.title ?? item.channel_type,
        viewer: item.viewer ?? 0,
      }
    })
}
