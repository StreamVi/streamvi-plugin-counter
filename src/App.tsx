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
  const [isCopied, setIsCopied] = useState(false)
  const obsUrl = useMemo(() => buildObsUrl(options), [options])

  async function handleCopyClick() {
    await navigator.clipboard.writeText(obsUrl)
    setIsCopied(true)
    window.setTimeout(() => setIsCopied(false), 1500)
  }

  return (
    <main className="app-shell">
      {/* <section className="settings-card"> */}
        <div className="settings-hero">
          <h1 className="settings-title">Viewer counter for OBS</h1>
        </div>

        <div className="settings-panel">
            <div className="settings-link-row">
              <div className="settings-link-field">
                <input
                  className="settings-link-input"
                  type="text"
                  value={obsUrl}
                  readOnly
                  aria-label="OBS widget URL"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <button
                  className="settings-icon-button"
                  type="button"
                  aria-label={isCopied ? 'Copied' : 'Copy URL'}
                  title={isCopied ? 'Copied' : 'Copy URL'}
                  onClick={() => {
                    void handleCopyClick()
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M9 9.75A2.25 2.25 0 0 1 11.25 7.5h7.5A2.25 2.25 0 0 1 21 9.75v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 9 17.25v-7.5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M15 7.5V6.75A2.25 2.25 0 0 0 12.75 4.5h-7.5A2.25 2.25 0 0 0 3 6.75v7.5a2.25 2.25 0 0 0 2.25 2.25H6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

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
          </div>
      {/* </section> */}
    </main>
  )
}

function App() {
  return window.location.pathname.startsWith('/obs') ? <ViewerWidget /> : <SettingsPage />
}

export default App
