import { applyWidgetOptions, type WidgetOptions } from '../../viewers/types'

export function buildObsUrl(options: WidgetOptions): string {
  const currentUrl = new URL(window.location.href)
  const url = new URL(window.location.origin)
  url.pathname = '/obs'

  const templateId = currentUrl.searchParams.get('template_id')
  const token = currentUrl.searchParams.get('token')

  if (templateId) {
    url.searchParams.set('template_id', templateId)
  }

  if (token) {
    url.searchParams.set('token', token)
  }

  applyWidgetOptions(url.searchParams, options)

  return url.toString()
}
