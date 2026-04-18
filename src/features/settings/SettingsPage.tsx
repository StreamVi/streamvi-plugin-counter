import { useCallback, useMemo, useState } from 'react'
import { WidgetCard } from '../viewers/ViewerWidget'
import {
  createWidgetPayload,
  getWidgetOptions,
  getWidgetOptionsFromPayload,
  getWidgetQueryParams,
  type WidgetPayload,
  type WidgetOptions,
} from '../viewers/types'
import { SettingsControls } from './components/SettingsControls'
import { SettingsUrlField } from './components/SettingsUrlField'
import { buildObsUrl } from './lib/build-obs-url'
import { previewChannels } from './preview-data'
import { useCabinetBridge } from './useCabinetBridge'

export function SettingsPage() {
  const initialWidgetParams = useMemo(
    () => getWidgetQueryParams(window.location.search),
    [],
  )
  const [options, setOptions] = useState<WidgetOptions>(() =>
    getWidgetOptions(window.location.search),
  )
  const [isCopied, setIsCopied] = useState(false)
  const bridgePayload = useMemo(() => createWidgetPayload(options), [options])
  const obsUrl = useMemo(
    () => buildObsUrl(initialWidgetParams),
    [initialWidgetParams],
  )

  const handleSyncPayload = useCallback((payload: WidgetPayload) => {
    const nextOptions = getWidgetOptionsFromPayload(payload)
    setOptions(nextOptions)
  }, [])

  useCabinetBridge({
    payload: bridgePayload,
    onSyncPayload: handleSyncPayload,
  })

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

      {initialWidgetParams.templateId === '' || initialWidgetParams.token === '' ? (
        <section className="settings-panel settings-notice">
          <h2 className="settings-notice-title">Missing widget parameters</h2>
          <p className="settings-notice-text">
            Open this page with the required query parameters:
            {' '}
            ?template_id=YOUR_TEMPLATE_ID&token=YOUR_TOKEN.
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
