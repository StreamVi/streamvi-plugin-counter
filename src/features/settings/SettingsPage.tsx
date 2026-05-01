import { useCallback, useMemo, useState } from 'react'
import '@streamvi/streamvi-ui/style.css'
import { appLocale, text } from '../../shared/i18n'
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
import './settings-ui.css'
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
  const previewCount = useMemo(() => new Intl.NumberFormat(appLocale).format(12540), [])

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
      {initialWidgetParams.templateId === '' || initialWidgetParams.token === '' ? (
        <section className="settings-notice">
          <h2 className="settings-notice-title">
            {text.notices.missingWidgetParamsTitle}
          </h2>
          <p className="settings-notice-text">
            {text.notices.settingsMissingWidgetParamsText}
            {' '}
            ?template_id=YOUR_TEMPLATE_ID&token=YOUR_TOKEN.
          </p>
          <p className="settings-notice-text">
            {text.notices.missingWidgetParamsExample}
            {' '}
            <code>?template_id=YOUR_TEMPLATE_ID&token=YOUR_TOKEN</code>
          </p>
        </section>
      ) : (
        <>
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
                count={previewCount}
                options={options}
                preview
              />
            </div>
          </div>
        </>
      )}
    </main>
  )
}
