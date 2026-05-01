import type {
  CentrifugoBroadcastRestreamsResponse,
  CentrifugoBroadcastViewsResponse,
  CentrifugoStreamEndResponse,
  CentrifugoStreamStartResponse,
  CentrifugoWidgetTemplatePayloadResponse,
} from '../api/contracts'
import { isWidgetPayload } from '../types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function isCentrifugoBroadcastViewsEvent(
  value: unknown,
): value is CentrifugoBroadcastViewsResponse {
  return (
    isRecord(value) &&
    value.event === 'views' &&
    isFiniteNumber(value.broadcast_id) &&
    isFiniteNumber(value.restream_id) &&
    isFiniteNumber(value.payload)
  )
}

export function isCentrifugoBroadcastRestreamsEvent(
  value: unknown,
): value is CentrifugoBroadcastRestreamsResponse {
  return (
    isRecord(value) &&
    (value.event === 'restreams.started' ||
      value.event === 'restreams.stopped')
  )
}

export function isCentrifugoStreamStartEvent(
  value: unknown,
): value is CentrifugoStreamStartResponse {
  return (
    isRecord(value) &&
    value.event === 'stream-start' &&
    isRecord(value.payload) &&
    isFiniteNumber(value.payload.broadcast_id)
  )
}

export function isCentrifugoStreamEndEvent(
  value: unknown,
): value is CentrifugoStreamEndResponse {
  return isRecord(value) && value.event === 'stream-end'
}

export function isCentrifugoWidgetTemplatePayloadEvent(
  value: unknown,
): value is CentrifugoWidgetTemplatePayloadResponse {
  return (
    isRecord(value) &&
    value.event === 'widget-template-payload' &&
    Object.prototype.hasOwnProperty.call(value, 'payload') &&
    (value.payload === null || isWidgetPayload(value.payload))
  )
}
