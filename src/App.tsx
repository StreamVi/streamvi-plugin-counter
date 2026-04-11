import { useMemo, useState } from 'react'
import './App.css'
import { WidgetCard, ViewerWidget } from './features/viewers/ViewerWidget'
import type { ViewerChannel } from './features/viewers/api/contracts'
import {
  applyWidgetOptions,
  getWidgetOptions,
  type WidgetOptions,
} from './features/viewers/types'

const previewChannels: ViewerChannel[] = [
  {
    channel_id: 1,
    name: 'YouTube',
    restream_id: 1,
    message: 0,
    channel_type: 'youtube',
    platform_id: 4,
    platform_icon_url: 'https://cdn.platform-icons.streamvi.io/dark/s/4.svg',
    platform_title: 'YouTube',
    viewer: 6420,
  },
  {
    channel_id: 2,
    name: 'Twitch',
    restream_id: 2,
    message: 0,
    channel_type: 'twitch',
    platform_id: 2,
    platform_icon_url: 'https://cdn.platform-icons.streamvi.io/dark/s/2.svg',
    platform_title: 'Twitch',
    viewer: 3810,
  },
  {
    channel_id: 3,
    name: 'VK',
    restream_id: 3,
    message: 0,
    channel_type: 'vk',
    platform_id: 1,
    platform_icon_url: 'https://cdn.platform-icons.streamvi.io/dark/s/1.svg',
    platform_title: 'VK',
    viewer: 2310,
  },
]

function buildObsUrl(options: WidgetOptions): string {
  const currentUrl = new URL(window.location.href)
  const url = new URL(window.location.origin)
  url.pathname = '/obs'

  const templateId = currentUrl.searchParams.get('template_id')
  const token = currentUrl.searchParams.get('token')

  if (templateId) {
    url.searchParams.set('template_id', templateId)
  }

  if (token) {
    url.searchParams.set('token', token)
  }

  applyWidgetOptions(url.searchParams, options)

  return url.toString()
}

function SettingsPage() {
  const [options, setOptions] = useState<WidgetOptions>(() =>
    getWidgetOptions(window.location.search),
  )
  const obsUrl = useMemo(() => buildObsUrl(options), [options])

  return (
    <main className="app-shell">
      <section className="settings-card">
        <div className="settings-hero">
          <p className="settings-kicker">StreamVi Widget</p>
          <h1 className="settings-title">Viewer counter for OBS</h1>
          <p className="settings-description">
            This page is the control surface for the widget. Use the OBS link below
            as a browser source inside OBS Studio.
          </p>
        </div>

        <div className="settings-panel">
          <h2 className="settings-panel-title">How to use it</h2>
          <ol className="settings-steps">
            <li>Open this page with `?template_id=...&token=...` in the URL.</li>
            <li>Adjust the widget appearance below.</li>
            <li>Copy the OBS link and add it as a Browser Source.</li>
          </ol>
        </div>

        <div className="settings-panel">
          <h2 className="settings-panel-title">OBS URL</h2>
          <div className="settings-variant">
            <p className="settings-variant-title">Widget</p>
            <p className="settings-link" title={obsUrl}>
              {obsUrl}
            </p>

            <div className="minimal-builder">
              <div className="minimal-builder-controls">
                <div className="settings-color-row">
                  <label className="settings-color-swatch">
                    <span className="settings-field-label">Background</span>
                    <input
                      className="settings-color-input"
                      type="color"
                      value={options.backgroundColor}
                      onChange={(event) =>
                        setOptions((current) => ({
                          ...current,
                          backgroundColor: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="settings-color-swatch">
                    <span className="settings-field-label">Text</span>
                    <input
                      className="settings-color-input"
                      type="color"
                      value={options.textColor}
                      onChange={(event) =>
                        setOptions((current) => ({
                          ...current,
                          textColor: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <label className="settings-field">
                  <span className="settings-field-label">
                    Background opacity: {options.backgroundOpacity}%
                  </span>
                  <input
                    className="settings-range-input"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={options.backgroundOpacity}
                    onChange={(event) =>
                      setOptions((current) => ({
                        ...current,
                        backgroundOpacity: Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <label className="settings-field">
                  <span className="settings-field-label">
                    Font size: {options.fontSize}px
                  </span>
                  <input
                    className="settings-range-input"
                    type="range"
                    min="16"
                    max="160"
                    step="1"
                    value={options.fontSize}
                    onChange={(event) =>
                      setOptions((current) => ({
                        ...current,
                        fontSize: Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <label className="settings-field">
                  <span className="settings-field-label">
                    Channels size: {options.channelsSize}px
                  </span>
                  <input
                    className="settings-range-input"
                    type="range"
                    min="12"
                    max="64"
                    step="1"
                    value={options.channelsSize}
                    onChange={(event) =>
                      setOptions((current) => ({
                        ...current,
                        channelsSize: Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={options.showTotal}
                    onChange={(event) =>
                      setOptions((current) => ({
                        ...current,
                        showTotal: event.target.checked,
                      }))
                    }
                  />
                  <span>Show total viewers</span>
                </label>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={options.showChannels}
                    onChange={(event) =>
                      setOptions((current) => ({
                        ...current,
                        showChannels: event.target.checked,
                      }))
                    }
                  />
                  <span>Show channels</span>
                </label>

                <label className="settings-field">
                  <span className="settings-field-label">Channels layout</span>
                  <div className="settings-segmented">
                    <button
                      className={`settings-segment${options.channelsLayout === 'row' ? ' is-active' : ''}`}
                      type="button"
                      onClick={() =>
                        setOptions((current) => ({
                          ...current,
                          channelsLayout: 'row',
                        }))
                      }
                    >
                      Row
                    </button>
                    <button
                      className={`settings-segment${options.channelsLayout === 'column' ? ' is-active' : ''}`}
                      type="button"
                      onClick={() =>
                        setOptions((current) => ({
                          ...current,
                          channelsLayout: 'column',
                        }))
                      }
                    >
                      Column
                    </button>
                  </div>
                </label>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={options.showIcon}
                    onChange={(event) =>
                      setOptions((current) => ({
                        ...current,
                        showIcon: event.target.checked,
                      }))
                    }
                  />
                  <span>Show icon before the value</span>
                </label>
              </div>

              <div className="minimal-builder-preview">
                <WidgetCard
                  channels={previewChannels}
                  count="12,540"
                  options={options}
                  preview
                />
              </div>
            </div>

            <a className="settings-button" href={obsUrl} target="_blank" rel="noreferrer">
              Open widget
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

function App() {
  return window.location.pathname.startsWith('/obs') ? <ViewerWidget /> : <SettingsPage />
}

export default App
