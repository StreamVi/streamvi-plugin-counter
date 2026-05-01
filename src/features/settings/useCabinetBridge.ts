import { useEffect, useRef } from 'react'
import { isWidgetPayload, type WidgetPayload } from '../viewers/types'

type CabinetToWidgetMessage = {
  type: 'streamvi:cabinet:init' | 'streamvi:cabinet:sync'
  token: string
  template_id: string
  project_id: number
  payload: WidgetPayload
}

type WidgetToCabinetMessage = {
  type: 'streamvi:widget:ready' | 'streamvi:widget:update'
  token: string
  template_id: string
  project_id: number
  payload: WidgetPayload
}

interface BridgeSession {
  origin: string
  token: string
  templateId: string
  projectId: number
}

interface UseCabinetBridgeProps {
  payload: WidgetPayload
  onSyncPayload: (payload: WidgetPayload) => void
}

const SAVE_DEBOUNCE_MS = 400

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCabinetMessage(value: unknown): value is CabinetToWidgetMessage {
  if (!isRecord(value)) {
    return false
  }

  return (
    (value.type === 'streamvi:cabinet:init' ||
      value.type === 'streamvi:cabinet:sync') &&
    typeof value.token === 'string' &&
    typeof value.template_id === 'string' &&
    typeof value.project_id === 'number' &&
    isWidgetPayload(value.payload)
  )
}

export function useCabinetBridge({
  payload,
  onSyncPayload,
}: UseCabinetBridgeProps): void {
  const sessionRef = useRef<BridgeSession | null>(null)
  const lastReceivedPayloadRef = useRef<string | null>(null)
  const lastSentPayloadRef = useRef<string | null>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isCabinetMessage(event.data)) {
        return
      }

      sessionRef.current = {
        origin: event.origin,
        token: event.data.token,
        templateId: event.data.template_id,
        projectId: event.data.project_id,
      }

      const payloadString = JSON.stringify(event.data.payload)
      lastReceivedPayloadRef.current = payloadString
      lastSentPayloadRef.current = payloadString

      onSyncPayload(event.data.payload)

      const readyMessage: WidgetToCabinetMessage = {
        type: 'streamvi:widget:ready',
        token: event.data.token,
        template_id: event.data.template_id,
        project_id: event.data.project_id,
        payload: event.data.payload,
      }

      window.parent.postMessage(readyMessage, event.origin)
    }

    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [onSyncPayload])

  useEffect(() => {
    const session = sessionRef.current

    if (!session) {
      return
    }

    const payloadString = JSON.stringify(payload)

    if (
      payloadString === lastSentPayloadRef.current ||
      payloadString === lastReceivedPayloadRef.current
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const updateMessage: WidgetToCabinetMessage = {
        type: 'streamvi:widget:update',
        token: session.token,
        template_id: session.templateId,
        project_id: session.projectId,
        payload,
      }

      lastSentPayloadRef.current = payloadString
      window.parent.postMessage(updateMessage, session.origin)
    }, SAVE_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [payload])
}
