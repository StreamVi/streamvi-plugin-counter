import type { Dispatch, SetStateAction } from 'react'
import { SvCheckbox, SvRadioGroup, SvSlider } from '@streamvi/streamvi-ui'
import { text } from '../../../shared/i18n'
import type { WidgetOptions } from '../../viewers/types'
import { fromUiScale, toUiScale } from '../lib/scale'

interface SettingsControlsProps {
  options: WidgetOptions
  setOptions: Dispatch<SetStateAction<WidgetOptions>>
}

interface SettingsSliderFieldProps {
  className?: string
  label: string
  max: number
  min: number
  onValueChange: (value: number) => void
  step?: number
  value: number
  valueLabel: string | number
}

interface SettingsCheckboxFieldProps {
  checked: boolean
  description?: string
  label: string
  onCheckedChange: (checked: boolean) => void
}

function SettingsSliderField({
  className,
  label,
  max,
  min,
  onValueChange,
  step = 1,
  value,
  valueLabel,
}: SettingsSliderFieldProps) {
  return (
    <label className={`settings-field${className ? ` ${className}` : ''}`}>
      <span className="settings-field-label">
        {label}: {valueLabel}
      </span>
      <SvSlider
        className="settings-ui-slider"
        innerProps={{
          control: {
            className: 'settings-ui-slider-control',
          },
        }}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(nextValue) => {
          if (typeof nextValue === 'number') {
            onValueChange(nextValue)
          }
        }}
      />
    </label>
  )
}

function SettingsCheckboxField({
  checked,
  description,
  label,
  onCheckedChange,
}: SettingsCheckboxFieldProps) {
  return (
    <div className="settings-checkbox-field">
      <SvCheckbox
        className="settings-ui-checkbox-control"
        checked={checked}
        labelContent={label}
        innerProps={{
          label: {
            className: 'settings-ui-checkbox',
          },
        }}
        onCheckedChange={onCheckedChange}
      />
      {description ? (
        <p className="settings-checkbox-description">{description}</p>
      ) : null}
    </div>
  )
}

export function SettingsControls({
  options,
  setOptions,
}: SettingsControlsProps) {
  return (
    <div className="minimal-builder-controls">
      <div className="settings-color-row">
        <label className="settings-color-swatch">
          <span className="settings-field-label">{text.settings.background}</span>
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
          <span className="settings-field-label">{text.settings.text}</span>
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

      <SettingsSliderField
        className="settings-field-full"
        label={text.settings.backgroundOpacity}
        min={0}
        max={100}
        value={options.backgroundOpacity}
        valueLabel={`${options.backgroundOpacity}%`}
        onValueChange={(value) =>
          setOptions((current) => ({
            ...current,
            backgroundOpacity: value,
          }))
        }
      />

      <div className="settings-slider-row">
        <SettingsSliderField
          label={text.settings.textScale}
          min={5}
          max={100}
          value={toUiScale(options.fontSize)}
          valueLabel={`${toUiScale(options.fontSize)}%`}
          onValueChange={(value) =>
            setOptions((current) => ({
              ...current,
              fontSize: fromUiScale(value),
            }))
          }
        />

        <SettingsSliderField
          label={text.settings.channelsScale}
          min={8}
          max={96}
          value={options.channelsSize}
          valueLabel={`${options.channelsSize}%`}
          onValueChange={(value) =>
            setOptions((current) => ({
              ...current,
              channelsSize: value,
            }))
          }
        />
      </div>

      <SettingsCheckboxField
        checked={options.testMode}
        description={text.settings.testModeDescription}
        label={text.settings.testMode}
        onCheckedChange={(checked) =>
          setOptions((current) => ({
            ...current,
            testMode: checked,
          }))
        }
      />

      <SettingsCheckboxField
        checked={options.showTotal}
        label={text.settings.showTotalViewers}
        onCheckedChange={(checked) =>
          setOptions((current) => ({
            ...current,
            showTotal: checked,
          }))
        }
      />

      <SettingsCheckboxField
        checked={options.showChannels}
        label={text.settings.showChannels}
        onCheckedChange={(checked) =>
          setOptions((current) => ({
            ...current,
            showChannels: checked,
          }))
        }
      />

      <SettingsCheckboxField
        checked={options.showIcon}
        label={text.settings.showIconBeforeValue}
        onCheckedChange={(checked) =>
          setOptions((current) => ({
            ...current,
            showIcon: checked,
          }))
        }
      />

      <div className="settings-field">
        <span className="settings-field-label">{text.settings.channelsLayout}</span>
        <SvRadioGroup
          className="settings-ui-radio-group"
          innerProps={{
            listLabel: {
              className: 'settings-ui-radio-tab',
            },
          }}
          value={options.channelsLayout}
          itemList={[
            {
              id: 'row',
              itemLabel: text.settings.row,
              itemProps: {
                label: {
                  className:
                    options.channelsLayout === 'row' ? 'is-active' : undefined,
                },
              },
            },
            {
              id: 'column',
              itemLabel: text.settings.column,
              itemProps: {
                label: {
                  className:
                    options.channelsLayout === 'column'
                      ? 'is-active'
                      : undefined,
                },
              },
            },
          ]}
          onValueChange={(channelsLayout: WidgetOptions['channelsLayout']) =>
            setOptions((current) => ({
              ...current,
              channelsLayout,
            }))
          }
        />
      </div>
    </div>
  )
}
