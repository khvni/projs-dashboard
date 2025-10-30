'use client'

import { useEffect, useState } from 'react'

interface RealtimeUpdate {
  type: string
  data?: any
  timestamp: number
  message?: string
}

interface UseRealtimeUpdatesOptions {
  projectId?: string
  onUpdate?: (update: RealtimeUpdate) => void
}

export function useRealtimeUpdates(options?: UseRealtimeUpdatesOptions) {
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null)

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/updates')

    eventSource.onopen = () => {
      setConnected(true)
      console.log('[SSE] Connected to real-time updates')
    }

    eventSource.onmessage = (event) => {
      try {
        const update: RealtimeUpdate = JSON.parse(event.data)
        setLastUpdate(update)

        // Call the optional callback
        if (options?.onUpdate) {
          options.onUpdate(update)
        }

        // Handle different update types
        switch (update.type) {
          case 'connected':
            console.log('[SSE]', update.message)
            break
          case 'project_updated':
            console.log('[SSE] Project updated:', update.data)
            break
          case 'task_updated':
          case 'task_moved':
            console.log('[SSE] Task updated:', update.data)
            break
          case 'comment_added':
            console.log('[SSE] Comment added:', update.data)
            break
          default:
            console.log('[SSE] Unknown update type:', update.type)
        }
      } catch (error) {
        console.error('[SSE] Failed to parse update:', error)
      }
    }

    eventSource.onerror = () => {
      setConnected(false)
      console.error('[SSE] Connection error, reconnecting...')
      // Browser will automatically attempt to reconnect
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
      setConnected(false)
    }
  }, [options?.projectId, options?.onUpdate])

  return { connected, lastUpdate }
}
