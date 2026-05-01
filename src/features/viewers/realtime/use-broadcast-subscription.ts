import type { Centrifuge, Subscription } from 'centrifuge'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { CentrifugoBroadcastViewsResponse } from '../api/contracts'
import {
  isCentrifugoBroadcastRestreamsEvent,
  isCentrifugoBroadcastViewsEvent,
} from './guards'

interface UseBroadcastSubscriptionOptions {
  accessToken: string | undefined
  broadcastId: number | null
  clientRef: RefObject<Centrifuge | null>
  onBroadcastEvent: (payload: CentrifugoBroadcastViewsResponse) => void
  onRestreamsChange: () => void
}

export function useBroadcastSubscription({
  accessToken,
  broadcastId,
  clientRef,
  onBroadcastEvent,
  onRestreamsChange,
}: UseBroadcastSubscriptionOptions) {
  const subscriptionRef = useRef<Subscription | null>(null)

  useEffect(() => {
    const client = clientRef.current

    if (client && subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      client.removeSubscription(subscriptionRef.current)
      subscriptionRef.current = null
    }

    if (!client || !broadcastId || !accessToken) {
      return
    }

    const subscription = client.newSubscription(`$broadcast:${broadcastId}`, {
      token: accessToken,
    })
    subscriptionRef.current = subscription

    subscription.on('publication', (context) => {
      if (isCentrifugoBroadcastViewsEvent(context.data)) {
        onBroadcastEvent(context.data)
        return
      }

      if (isCentrifugoBroadcastRestreamsEvent(context.data)) {
        onRestreamsChange()
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
  }, [accessToken, broadcastId, clientRef, onBroadcastEvent, onRestreamsChange])

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
