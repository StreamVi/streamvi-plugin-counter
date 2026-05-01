import { Centrifuge } from 'centrifuge'
import { useEffect, useRef, useState } from 'react'
import { config } from '../../../config'
import { text } from '../../../shared/i18n'
import type { ViewerWidgetViewModel } from '../api/contracts'
import { createCentrifugoConnectionTokenGetter } from '../api/client'

interface UseCentrifugoClientOptions {
  token: string
}

export function useCentrifugoClient({
  token,
}: UseCentrifugoClientOptions) {
  const clientRef = useRef<Centrifuge | null>(null)
  const [connectionState, setConnectionState] = useState<ViewerWidgetViewModel['status']>(
    token ? 'loading' : 'error',
  )

  useEffect(() => {
    if (!token) {
      return
    }

    const client = new Centrifuge(
      `${config.centrifugoHost}/connection/websocket`,
      {
        getToken: createCentrifugoConnectionTokenGetter(token),
      },
    )

    clientRef.current = client

    client.on('connected', () => {
      setConnectionState((current) => (current === 'error' ? current : 'ready'))
    })
    client.on('connecting', () => {
      setConnectionState((current) => (current === 'ready' ? current : 'loading'))
    })
    client.on('disconnected', () => {
      setConnectionState((current) => (current === 'error' ? current : 'offline'))
    })
    client.on('error', (context) => {
      setConnectionState('error')
      console.error(context.error?.message ?? text.errors.centrifugoConnection)
    })

    client.connect()

    return () => {
      client.disconnect()
      clientRef.current = null
    }
  }, [token])

  return {
    clientRef,
    connectionState,
  }
}
