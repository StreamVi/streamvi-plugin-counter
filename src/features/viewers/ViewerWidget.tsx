import type { CSSProperties } from 'react'
import { appLocale, text } from '../../shared/i18n'
import type { ViewerChannel } from './api/contracts'
import {
  defaultWidgetOptions,
  getWidgetQueryParams,
  type WidgetOptions,
  type WidgetQueryParams,
} from './types'
import { useViewerWidget } from './useViewerWidget'

type ViewerWidgetState = ReturnType<typeof useViewerWidget>

function formatViewerCount(viewerCount: number | null): string {
  if (viewerCount === null) {
    return '...'
  }

  return new Intl.NumberFormat(appLocale).format(viewerCount)
}

function ChannelPlatformIcon({
  iconUrl,
  title,
}: {
  iconUrl: string | null
  title: string
}) {
  if (!iconUrl) {
    return null
  }

  return <img className="channel-row-image" src={iconUrl} alt={title} loading="lazy" />
}

function hexToRgbTriplet(hexColor: string): string {
  const normalizedColor = hexColor.replace('#', '')
  const red = Number.parseInt(normalizedColor.slice(0, 2), 16)
  const green = Number.parseInt(normalizedColor.slice(2, 4), 16)
  const blue = Number.parseInt(normalizedColor.slice(4, 6), 16)

  return `${red} ${green} ${blue}`
}

function getWidgetCardStyle(options: WidgetOptions): CSSProperties {
  const isFullyTransparent = options.backgroundOpacity === 0

  return {
    background: `rgb(${hexToRgbTriplet(options.backgroundColor)} / ${options.backgroundOpacity}%)`,
    backdropFilter: isFullyTransparent ? 'none' : undefined,
    borderColor: isFullyTransparent
      ? 'transparent'
      : `rgb(${hexToRgbTriplet(options.textColor)} / 14%)`,
    boxShadow: isFullyTransparent ? 'none' : undefined,
    color: options.textColor,
    ['--widget-font-size' as string]: `clamp(24px, ${(
      options.fontSize * 0.12
    ).toFixed(2)}cqw, 50vh)`,
    ['--widget-icon-size' as string]: `clamp(20px, ${(
      options.fontSize * 0.07
    ).toFixed(2)}cqw, 28vh)`,
    ['--widget-channel-font-size' as string]: `clamp(10px, ${(
      options.channelsSize * 0.1
    ).toFixed(2)}cqw, 14vh)`,
    ['--widget-channel-icon-size' as string]: `clamp(12px, ${(
      options.channelsSize * 0.12
    ).toFixed(2)}cqw, 16vh)`,
    ['--widget-stack-gap' as string]: `clamp(6px, ${(
      Math.max(options.fontSize * 0.028, options.channelsSize * 0.08)
    ).toFixed(2)}cqw, 24px)`,
    ['--widget-value-gap' as string]: `clamp(6px, ${(
      options.fontSize * 0.014
    ).toFixed(2)}cqw, 14px)`,
    ['--widget-channel-gap' as string]: `clamp(6px, ${(
      options.channelsSize * 0.03
    ).toFixed(2)}cqw, 12px)`,
    ['--widget-channel-item-gap' as string]: `clamp(4px, ${(
      options.channelsSize * 0.024
    ).toFixed(2)}cqw, 10px)`,
  }
}

function ViewersIcon() {
  return (
    <svg
      className="minimal-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 12C4.4 7.8 7.84 5.7 12 5.7C16.16 5.7 19.6 7.8 22 12C19.6 16.2 16.16 18.3 12 18.3C7.84 18.3 4.4 16.2 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.1" fill="currentColor" />
    </svg>
  )
}

export function WidgetCard({
  channels = [],
  count,
  options = defaultWidgetOptions,
  preview = false,
  status = 'ready',
}: {
  channels?: ViewerChannel[]
  count: string
  options?: WidgetOptions
  preview?: boolean
  status?: ViewerWidgetState['status']
}) {
  return (
    <section
      className={`widget-card widget-card-obs widget-card-minimal${preview ? ' widget-card-preview' : ''}`}
      data-status={status}
      aria-live="polite"
      style={getWidgetCardStyle(options)}
    >
      {options.showTotal ? (
        <div className="minimal-value-row">
          {options.showIcon ? <ViewersIcon /> : null}
          <strong className="minimal-value">{count}</strong>
        </div>
      ) : null}

      {options.showChannels && channels.length > 0 ? (
        <div className={`minimal-channel-list minimal-channel-list-${options.channelsLayout}`}>
          {channels.slice(0, 4).map((channel) => (
            <div className="minimal-channel-item" key={channel.restream_id}>
              <ChannelPlatformIcon
                iconUrl={channel.platform_icon_url}
                title={channel.platform_title}
              />
              <span className="minimal-channel-value">
                {formatViewerCount(channel.viewer)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ViewerWidgetContent({
  widgetParams,
}: {
  widgetParams: WidgetQueryParams
}) {
  const { channels, isStreamActive, options, status, totalViewers } = useViewerWidget(widgetParams)

  const formattedCount = isStreamActive ? formatViewerCount(totalViewers) : '—'

  return (
    <main className="app-shell app-shell-minimal">
      <WidgetCard
        channels={channels}
        count={formattedCount}
        options={options}
        status={status}
      />
    </main>
  )
}

export function ViewerWidget() {
  const widgetParams = getWidgetQueryParams(window.location.search)
  if (widgetParams.templateId === '' || widgetParams.token === '') {
    return (
      <main className="app-shell app-shell-minimal">
        <section className="widget-card widget-card-obs widget-card-minimal widget-card-notice">
          <h2 className="widget-notice-title">
            {text.notices.missingWidgetParamsTitle}
          </h2>
          <p className="widget-notice-text">
            {text.notices.obsMissingWidgetParamsText}
          </p>
        </section>
      </main>
    )
  }

  return <ViewerWidgetContent widgetParams={widgetParams} />
}
