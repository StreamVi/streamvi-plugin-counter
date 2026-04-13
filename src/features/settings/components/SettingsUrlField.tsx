interface SettingsUrlFieldProps {
  isCopied: boolean
  onCopyClick: () => void
  url: string
}

export function SettingsUrlField({
  isCopied,
  onCopyClick,
  url,
}: SettingsUrlFieldProps) {
  return (
    <div className="settings-link-row">
      <div className="settings-link-field">
        <input
          className="settings-link-input"
          type="text"
          value={url}
          readOnly
          aria-label="OBS widget URL"
          onFocus={(event) => event.currentTarget.select()}
        />
        <button
          className="settings-icon-button"
          type="button"
          aria-label={isCopied ? 'Copied' : 'Copy URL'}
          title={isCopied ? 'Copied' : 'Copy URL'}
          onClick={onCopyClick}
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
  )
}
