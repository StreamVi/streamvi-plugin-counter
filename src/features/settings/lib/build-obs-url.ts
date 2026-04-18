import {
  type WidgetQueryParams,
} from '../../viewers/types'

export function buildObsUrl(
  queryParams: WidgetQueryParams,
): string {
  const url = new URL(window.location.origin)
  url.pathname = '/obs'

  if (queryParams.templateId) {
    url.searchParams.set('template_id', queryParams.templateId)
  }

  if (queryParams.token) {
    url.searchParams.set('token', queryParams.token)
  }

  return url.toString()
}
