export interface WidgetQueryParams {
  templateId: string
  token: string
}

export interface WidgetPayload {
  bg?: string
  text?: string
  opacity?: number
  size?: number
  channels_size?: number
  test?: boolean
  channels?: boolean
  channels_layout?: 'row' | 'column'
  total?: boolean
  icon?: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string'
}

function isOptionalFiniteNumber(value: unknown): boolean {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value))
}

function isOptionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === 'boolean'
}

export function isWidgetPayload(value: unknown): value is WidgetPayload {
  if (!isRecord(value)) {
    return false
  }

  return (
    isOptionalString(value.bg) &&
    isOptionalString(value.text) &&
    isOptionalFiniteNumber(value.opacity) &&
    isOptionalFiniteNumber(value.size) &&
    isOptionalFiniteNumber(value.channels_size) &&
    isOptionalBoolean(value.test) &&
    isOptionalBoolean(value.channels) &&
    (value.channels_layout === undefined ||
      value.channels_layout === 'row' ||
      value.channels_layout === 'column') &&
    isOptionalBoolean(value.total) &&
    isOptionalBoolean(value.icon)
  )
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

function readHexColorValue(value: unknown, fallback: string): string {
  return typeof value === 'string' ? readHexColor(value, fallback) : fallback
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

function readNumberValue(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(max, Math.max(min, value))
  }

  if (typeof value === 'string') {
    return readNumberInRange(value, fallback, min, max)
  }

  return fallback
}

function readBooleanValue(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === '1') {
    return true
  }

  if (value === '0') {
    return false
  }

  return fallback
}

function readChannelsLayoutValue(
  value: unknown,
  fallback: WidgetOptions['channelsLayout'],
): WidgetOptions['channelsLayout'] {
  return value === 'column' ? 'column' : value === 'row' ? 'row' : fallback
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

export function getWidgetOptionsFromPayload(payload: WidgetPayload): WidgetOptions {
  return {
    backgroundColor: readHexColorValue(
      payload.bg,
      defaultWidgetOptions.backgroundColor,
    ),
    textColor: readHexColorValue(
      payload.text,
      defaultWidgetOptions.textColor,
    ),
    backgroundOpacity: readNumberValue(
      payload.opacity,
      defaultWidgetOptions.backgroundOpacity,
      0,
      100,
    ),
    fontSize: readNumberValue(
      payload.size,
      defaultWidgetOptions.fontSize,
      20,
      400,
    ),
    channelsSize: readNumberValue(
      payload.channels_size,
      defaultWidgetOptions.channelsSize,
      8,
      200,
    ),
    testMode: readBooleanValue(payload.test, defaultWidgetOptions.testMode),
    showChannels: readBooleanValue(
      payload.channels,
      defaultWidgetOptions.showChannels,
    ),
    channelsLayout: readChannelsLayoutValue(
      payload.channels_layout,
      defaultWidgetOptions.channelsLayout,
    ),
    showTotal: readBooleanValue(payload.total, defaultWidgetOptions.showTotal),
    showIcon: readBooleanValue(payload.icon, defaultWidgetOptions.showIcon),
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

export function createWidgetPayload(options: WidgetOptions): WidgetPayload {
  const payload: WidgetPayload = {}

  if (options.backgroundColor !== defaultWidgetOptions.backgroundColor) {
    payload.bg = options.backgroundColor
  }

  if (options.textColor !== defaultWidgetOptions.textColor) {
    payload.text = options.textColor
  }

  if (options.backgroundOpacity !== defaultWidgetOptions.backgroundOpacity) {
    payload.opacity = options.backgroundOpacity
  }

  if (options.fontSize !== defaultWidgetOptions.fontSize) {
    payload.size = options.fontSize
  }

  if (options.channelsSize !== defaultWidgetOptions.channelsSize) {
    payload.channels_size = options.channelsSize
  }

  if (options.testMode !== defaultWidgetOptions.testMode) {
    payload.test = options.testMode
  }

  if (options.showChannels !== defaultWidgetOptions.showChannels) {
    payload.channels = options.showChannels
  }

  if (options.channelsLayout !== defaultWidgetOptions.channelsLayout) {
    payload.channels_layout = options.channelsLayout
  }

  if (options.showTotal !== defaultWidgetOptions.showTotal) {
    payload.total = options.showTotal
  }

  if (options.showIcon !== defaultWidgetOptions.showIcon) {
    payload.icon = options.showIcon
  }

  return payload
}
