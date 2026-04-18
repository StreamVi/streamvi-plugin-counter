import { useEffect, useMemo, useState } from 'react'
import type { ViewerChannel } from './api/contracts'
import { TEST_CHANNELS } from './lib/test-channels'

const TEST_CHANNEL_UPDATE_INTERVAL_MS = 2_000
const TEST_CHANNEL_MIN_FACTOR = 0.5
const TEST_CHANNEL_MAX_FACTOR = 2.5
const TEST_CHANNEL_STEP_FACTOR = 0.05

type AnimatedTestChannelMeta = {
  maxViewer: number
  minViewer: number
}

function getNextViewerCount(
  currentViewer: number,
  minViewer: number,
  maxViewer: number,
): number {
  const step = Math.max(1, Math.round(currentViewer * TEST_CHANNEL_STEP_FACTOR))
  const delta = Math.floor(Math.random() * (step * 2 + 1)) - step
  const nextViewer = currentViewer + delta

  return Math.min(maxViewer, Math.max(minViewer, nextViewer))
}

export function useAnimatedTestChannels(enabled: boolean) {
  const channelMeta = useMemo<Array<AnimatedTestChannelMeta>>(
    () =>
      TEST_CHANNELS.map((channel) => ({
        maxViewer: Math.max(
          channel.viewer,
          Math.round(channel.viewer * TEST_CHANNEL_MAX_FACTOR),
        ),
        minViewer: Math.max(
          0,
          Math.min(channel.viewer, Math.round(channel.viewer * TEST_CHANNEL_MIN_FACTOR)),
        ),
      })),
    [],
  )

  const [channels, setChannels] = useState<ViewerChannel[]>(TEST_CHANNELS)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const intervalId = window.setInterval(() => {
      setChannels((currentChannels) =>
        currentChannels.map((channel, index) => {
          const meta = channelMeta[index]

          if (!meta) {
            return channel
          }

          return {
            ...channel,
            viewer: getNextViewerCount(
              channel.viewer,
              meta.minViewer,
              meta.maxViewer,
            ),
          }
        }),
      )
    }, TEST_CHANNEL_UPDATE_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [channelMeta, enabled])

  const visibleChannels = enabled ? channels : TEST_CHANNELS
  const totalViewers = useMemo(
    () => visibleChannels.reduce((sum, channel) => sum + channel.viewer, 0),
    [visibleChannels],
  )

  return {
    channels: visibleChannels,
    totalViewers,
  }
}
