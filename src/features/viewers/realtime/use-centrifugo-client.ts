import { Centrifuge } from 'centrifuge'
import { useEffect, useRef, useState } from 'react'
import type { ViewerWidgetViewModel } from '../api/contracts'
import { getCentrifugoConnectionToken } from '../api/client'

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
      `${import.meta.env.VITE_CENTRIFUGO_HOST}/connection/websocket`,
      {
        getToken: getCentrifugoConnectionToken(token),
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
      console.error(context.error?.message ?? 'Failed to connect to Centrifugo.')
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
