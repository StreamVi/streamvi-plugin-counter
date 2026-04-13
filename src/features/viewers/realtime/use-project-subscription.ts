import type { Centrifuge, Subscription } from 'centrifuge'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type {
  CentrifugoStreamEndResponse,
  CentrifugoStreamStartResponse,
} from '../api/contracts'

interface UseProjectSubscriptionOptions {
  clientRef: RefObject<Centrifuge | null>
  onProjectEvent: (payload: CentrifugoStreamStartResponse | CentrifugoStreamEndResponse) => void
  projectId: number | null
}

export function useProjectSubscription({
  clientRef,
  onProjectEvent,
  projectId,
}: UseProjectSubscriptionOptions) {
  const subscriptionRef = useRef<Subscription | null>(null)

  useEffect(() => {
    const client = clientRef.current

    if (!client || !projectId) {
      return
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      client.removeSubscription(subscriptionRef.current)
      subscriptionRef.current = null
    }

    const subscription = client.newSubscription(`project#${projectId}`)
    subscriptionRef.current = subscription

    subscription.on('publication', (context) => {
      const data = context.data as
        | Partial<CentrifugoStreamStartResponse | CentrifugoStreamEndResponse>
        | undefined

      if (data?.event === 'stream-start' && data.payload) {
        onProjectEvent(data as CentrifugoStreamStartResponse)
      }

      if (data?.event === 'stream-end') {
        onProjectEvent({ event: 'stream-end' })
      }
    })

    subscription.subscribe()

    return () => {
      if (subscriptionRef.current === subscription) {
        subscription.unsubscribe()
        client.removeSubscription(subscription)
        subscriptionRef.current = null
      }
    }
  }, [clientRef, onProjectEvent, projectId])

  useEffect(
    () => () => {
      const client = clientRef.current

      if (client && subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        client.removeSubscription(subscriptionRef.current)
        subscriptionRef.current = null
      }
    },
    [clientRef],
  )
}
