import type { Dispatch, SetStateAction } from 'react'
import type { WidgetOptions } from '../../viewers/types'
import { fromUiScale, toUiScale } from '../lib/scale'

interface SettingsControlsProps {
  options: WidgetOptions
  setOptions: Dispatch<SetStateAction<WidgetOptions>>
}

export function SettingsControls({
  options,
  setOptions,
}: SettingsControlsProps) {
  return (
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
          Text scale: {toUiScale(options.fontSize)}
        </span>
        <input
          className="settings-range-input"
          type="range"
          min="5"
          max="100"
          step="1"
          value={toUiScale(options.fontSize)}
          onChange={(event) =>
            setOptions((current) => ({
              ...current,
              fontSize: fromUiScale(Number(event.target.value)),
            }))
          }
        />
      </label>

      <label className="settings-field">
        <span className="settings-field-label">
          Channels scale: {options.channelsSize}
        </span>
        <input
          className="settings-range-input"
          type="range"
          min="8"
          max="96"
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
          checked={options.testMode}
          onChange={(event) =>
            setOptions((current) => ({
              ...current,
              testMode: event.target.checked,
            }))
          }
        />
        <span>Test mode</span>
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
  )
}
