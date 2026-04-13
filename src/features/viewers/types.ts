export interface WidgetQueryParams {
  templateId: string
  token: string
}

export function getMissingWidgetParams(params: Pick<WidgetQueryParams, 'templateId' | 'token'>): string[] {
  const missingParams: string[] = []

  if (!params.templateId) {
    missingParams.push('template_id')
  }

  if (!params.token) {
    missingParams.push('token')
  }

  return missingParams
}

export interface WidgetOptions {
  backgroundColor: string
  textColor: string
  backgroundOpacity: number
  fontSize: number
  channelsSize: number
  testMode: boolean
  showChannels: boolean
  channelsLayout: 'row' | 'column'
  showTotal: boolean
  showIcon: boolean
}

export const defaultWidgetOptions: WidgetOptions = {
  backgroundColor: '#09121d',
  textColor: '#f6f7fb',
  backgroundOpacity: 100,
  fontSize: 120,
  channelsSize: 40,
  testMode: false,
  showChannels: true,
  channelsLayout: 'row',
  showTotal: true,
  showIcon: false,
}

function readHexColor(value: string | null, fallback: string): string {
  if (!value) {
    return fallback
  }

  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
}

export function getWidgetOptions(search: string): WidgetOptions {
  const searchParams = new URLSearchParams(search)
  const channelsLayout = searchParams.get('channels_layout')

  return {
    backgroundColor: readHexColor(
      searchParams.get('bg'),
      defaultWidgetOptions.backgroundColor,
    ),
    textColor: readHexColor(
      searchParams.get('text'),
      defaultWidgetOptions.textColor,
    ),
    backgroundOpacity: defaultWidgetOptions.backgroundOpacity,
    fontSize: defaultWidgetOptions.fontSize,
    channelsSize: defaultWidgetOptions.channelsSize,
    testMode: searchParams.get('test') === '1',
    showChannels: searchParams.get('channels') !== '0',
    channelsLayout: channelsLayout === 'column' ? 'column' : 'row',
    showTotal: searchParams.get('total') !== '0',
    showIcon: searchParams.get('icon') === '1',
  }
}

export function applyWidgetOptions(
  searchParams: URLSearchParams,
  options: WidgetOptions,
): void {
  searchParams.set('bg', options.backgroundColor)
  searchParams.set('text', options.textColor)
  searchParams.set('opacity', String(options.backgroundOpacity))
  searchParams.set('size', String(options.fontSize))
  searchParams.set('channels_size', String(options.channelsSize))
  searchParams.set('test', options.testMode ? '1' : '0')
  searchParams.set('channels', options.showChannels ? '1' : '0')
  searchParams.set('channels_layout', options.channelsLayout)
  searchParams.set('total', options.showTotal ? '1' : '0')
  searchParams.set('icon', options.showIcon ? '1' : '0')
}

export function getWidgetQueryParams(search: string): WidgetQueryParams {
  const searchParams = new URLSearchParams(search)

  return {
    templateId: searchParams.get('template_id') ?? '',
    token: searchParams.get('token') ?? '',
  }
}
