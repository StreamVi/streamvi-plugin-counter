import type { Centrifuge, Subscription } from 'centrifuge'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { CentrifugoWidgetTemplatePayloadResponse } from '../api/contracts'
import type { WidgetPayload } from '../types'

interface UseWidgetTemplateSubscriptionOptions {
  accessToken: string | undefined
  clientRef: RefObject<Centrifuge | null>
  onTemplateChange: () => void
  onTemplatePayload: (payload: WidgetPayload | null) => void
  channelName: string
}

export function useWidgetTemplateSubscription({
  accessToken,
  channelName,
  clientRef,
  onTemplateChange,
  onTemplatePayload,
}: UseWidgetTemplateSubscriptionOptions) {
  const subscriptionRef = useRef<Subscription | null>(null)

  useEffect(() => {
    const client = clientRef.current

    if (client && subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      client.removeSubscription(subscriptionRef.current)
      subscriptionRef.current = null
    }

    if (!client || !channelName || !accessToken) {
      return
    }

    const subscription = client.newSubscription(channelName, {
      token: accessToken,
    })
    subscriptionRef.current = subscription

    subscription.on('publication', (context) => {
      const data = context.data as Partial<CentrifugoWidgetTemplatePayloadResponse> | undefined

      if (data?.event === 'widget-template-payload') {
        onTemplatePayload(data.payload ?? null)
        return
      }

      onTemplateChange()
    })

    subscription.subscribe()

    return () => {
      if (subscriptionRef.current === subscription) {
        subscription.unsubscribe()
        client.removeSubscription(subscription)
        subscriptionRef.current = null
      }
    }
  }, [accessToken, channelName, clientRef, onTemplateChange, onTemplatePayload])

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
