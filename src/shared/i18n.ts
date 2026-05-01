const supportedLanguages = ['en', 'ru'] as const

export type SupportedLanguage = (typeof supportedLanguages)[number]

const fallbackLanguage: SupportedLanguage = 'en'

function isSupportedLanguage(language: string): language is SupportedLanguage {
  return supportedLanguages.includes(language as SupportedLanguage)
}

function getBrowserLanguages(): string[] {
  if (typeof navigator === 'undefined') {
    return [fallbackLanguage]
  }

  if (navigator.languages.length > 0) {
    return [...navigator.languages]
  }

  return navigator.language ? [navigator.language] : [fallbackLanguage]
}

export function getPreferredLanguage(
  languages: readonly string[] = getBrowserLanguages(),
): SupportedLanguage {
  for (const language of languages) {
    const languageCode = language.toLowerCase().split(/[-_]/)[0]

    if (isSupportedLanguage(languageCode)) {
      return languageCode
    }
  }

  return fallbackLanguage
}

export const appLanguage = getPreferredLanguage()
export const appLocale = appLanguage === 'ru' ? 'ru-RU' : 'en-US'

export const i18n = {
  en: {
    common: {
      copyObsUrl: 'Copy OBS URL',
      copied: 'Copied',
      obsWidgetUrl: 'OBS widget URL',
    },
    notices: {
      missingWidgetParamsTitle: 'Missing widget parameters',
      settingsMissingWidgetParamsText:
        'Open this page with the required query parameters:',
      missingWidgetParamsExample: 'Example:',
      obsMissingWidgetParamsText:
        'Add ?template_id=YOUR_TEMPLATE_ID&token=YOUR_TOKEN to the URL before opening the widget.',
    },
    settings: {
      background: 'Background',
      text: 'Text',
      backgroundOpacity: 'Background opacity',
      textScale: 'Text size',
      channelsScale: 'Channels size',
      testMode: 'Test mode',
      testModeDescription:
        'Show a fake online count before the stream starts so you can preview how it will look after launch.',
      showTotalViewers: 'Show total viewers',
      showChannels: 'Show channels',
      channelsLayout: 'Channels layout',
      row: 'Row',
      column: 'Column',
      showIconBeforeValue: 'Show icon before the value',
    },
    errors: {
      centrifugoConnection: 'Failed to connect to Centrifugo.',
    },
  },
  ru: {
    common: {
      copyObsUrl: 'Скопировать URL для OBS',
      copied: 'Скопировано',
      obsWidgetUrl: 'URL OBS-виджета',
    },
    notices: {
      missingWidgetParamsTitle: 'Не хватает параметров виджета',
      settingsMissingWidgetParamsText:
        'Откройте страницу с обязательными query-параметрами:',
      missingWidgetParamsExample: 'Пример:',
      obsMissingWidgetParamsText:
        'Добавьте ?template_id=YOUR_TEMPLATE_ID&token=YOUR_TOKEN в URL перед открытием виджета.',
    },
    settings: {
      background: 'Цвет фона',
      text: 'Цвет текста',
      backgroundOpacity: 'Прозрачность фона',
      textScale: 'Размер текста',
      channelsScale: 'Размер каналов',
      testMode: 'Тестовый режим',
      testModeDescription:
        'Показывать фейковое количество онлайн до запуска трансляции, чтобы наглядно увидеть, как будет показываться после запуска',
      showTotalViewers: 'Показывать общее число зрителей',
      showChannels: 'Показывать число зрителей по каналам',
      channelsLayout: 'Расположение каналов',
      row: 'Строка',
      column: 'Колонка',
      showIconBeforeValue: 'Показывать иконку перед общим числом зрителей',
    },
    errors: {
      centrifugoConnection: 'Не удалось подключиться к Centrifugo.',
    },
  },
} as const

export const text = i18n[appLanguage]
