import { useMemo, useState } from 'react'
import { WidgetCard } from '../viewers/ViewerWidget'
import {
  getMissingWidgetParams,
  getWidgetOptions,
  getWidgetQueryParams,
  type WidgetOptions,
} from '../viewers/types'
import { SettingsControls } from './components/SettingsControls'
import { SettingsUrlField } from './components/SettingsUrlField'
import { buildObsUrl } from './lib/build-obs-url'
import { previewChannels } from './preview-data'

export function SettingsPage() {
  const widgetParams = useMemo(
    () => getWidgetQueryParams(window.location.search),
    [],
  )
  const [options, setOptions] = useState<WidgetOptions>(() =>
    getWidgetOptions(window.location.search),
  )
  const [isCopied, setIsCopied] = useState(false)
  const obsUrl = useMemo(() => buildObsUrl(options), [options])
  const missingParams = getMissingWidgetParams(widgetParams)

  async function handleCopyClick() {
    await navigator.clipboard.writeText(obsUrl)
    setIsCopied(true)
    window.setTimeout(() => setIsCopied(false), 1500)
  }

  return (
    <main className="app-shell">
      <div className="settings-hero">
        <h1 className="settings-title">Viewer counter for OBS</h1>
      </div>

      {missingParams.length > 0 ? (
        <section className="settings-panel settings-notice">
          <h2 className="settings-notice-title">Missing widget parameters</h2>
          <p className="settings-notice-text">
            Open this page with the required query parameters:
            {' '}
            {missingParams.join(', ')}.
          </p>
          <p className="settings-notice-text">
            Example:
            {' '}
            <code>?template_id=YOUR_TEMPLATE_ID&token=YOUR_TOKEN</code>
          </p>
        </section>
      ) : (
        <div className="settings-panel">
          <SettingsUrlField
            isCopied={isCopied}
            onCopyClick={() => {
              void handleCopyClick()
            }}
            url={obsUrl}
          />

          <div className="minimal-builder">
            <SettingsControls options={options} setOptions={setOptions} />

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
      )}
    </main>
  )
}
