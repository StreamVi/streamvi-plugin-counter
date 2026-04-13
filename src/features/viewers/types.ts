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

function readNumberInRange(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === null) {
    return fallback
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(max, Math.max(min, parsed))
}

function syncSearchParam(
  searchParams: URLSearchParams,
  key: string,
  value: string,
  defaultValue: string,
): void {
  if (value === defaultValue) {
    searchParams.delete(key)
    return
  }

  searchParams.set(key, value)
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
    backgroundOpacity: readNumberInRange(
      searchParams.get('opacity'),
      defaultWidgetOptions.backgroundOpacity,
      0,
      100,
    ),
    fontSize: readNumberInRange(
      searchParams.get('size'),
      defaultWidgetOptions.fontSize,
      20,
      400,
    ),
    channelsSize: readNumberInRange(
      searchParams.get('channels_size'),
      defaultWidgetOptions.channelsSize,
      8,
      200,
    ),
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
  syncSearchParam(
    searchParams,
    'bg',
    options.backgroundColor,
    defaultWidgetOptions.backgroundColor,
  )
  syncSearchParam(
    searchParams,
    'text',
    options.textColor,
    defaultWidgetOptions.textColor,
  )
  syncSearchParam(
    searchParams,
    'opacity',
    String(options.backgroundOpacity),
    String(defaultWidgetOptions.backgroundOpacity),
  )
  syncSearchParam(
    searchParams,
    'size',
    String(options.fontSize),
    String(defaultWidgetOptions.fontSize),
  )
  syncSearchParam(
    searchParams,
    'channels_size',
    String(options.channelsSize),
    String(defaultWidgetOptions.channelsSize),
  )
  syncSearchParam(
    searchParams,
    'test',
    options.testMode ? '1' : '0',
    defaultWidgetOptions.testMode ? '1' : '0',
  )
  syncSearchParam(
    searchParams,
    'channels',
    options.showChannels ? '1' : '0',
    defaultWidgetOptions.showChannels ? '1' : '0',
  )
  syncSearchParam(
    searchParams,
    'channels_layout',
    options.channelsLayout,
    defaultWidgetOptions.channelsLayout,
  )
  syncSearchParam(
    searchParams,
    'total',
    options.showTotal ? '1' : '0',
    defaultWidgetOptions.showTotal ? '1' : '0',
  )
  syncSearchParam(
    searchParams,
    'icon',
    options.showIcon ? '1' : '0',
    defaultWidgetOptions.showIcon ? '1' : '0',
  )
}

export function getWidgetQueryParams(search: string): WidgetQueryParams {
  const searchParams = new URLSearchParams(search)

  return {
    templateId: searchParams.get('template_id') ?? '',
    token: searchParams.get('token') ?? '',
  }
}
