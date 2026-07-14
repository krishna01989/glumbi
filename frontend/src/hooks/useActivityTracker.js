import { useEffect, useCallback, useRef } from 'react'
import { analyticsApi } from '../api/client'

const QUEUE_KEY = 'glm_activity_queue'

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}

function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch {}
}

export default function useActivityTracker(child, isOffline) {
  const flushingRef = useRef(false)

  const flush = useCallback(async () => {
    if (flushingRef.current) return
    const queue = readQueue()
    if (queue.length === 0) return
    flushingRef.current = true
    try {
      await analyticsApi.batchEvents(queue)
      writeQueue([])
    } catch {
      // keep in queue; retry next time
    } finally {
      flushingRef.current = false
    }
  }, [])

  // Flush when network comes back
  useEffect(() => {
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [flush])

  const track = useCallback((feature, eventType, opts = {}) => {
    if (!child?.id) return
    const event = {
      childId:         child.id,
      childName:       child.name || '',
      feature,
      eventType,
      online:          !isOffline,
      durationSeconds: opts.durationSeconds ?? null,
      metadata:        opts.metadata ? JSON.stringify(opts.metadata) : null,
      occurredAt:      new Date().toISOString().slice(0, 19),
      clientKey:       crypto.randomUUID(),
    }
    const queue = readQueue()
    queue.push(event)
    writeQueue(queue)

    if (navigator.onLine) flush()
  }, [child?.id, child?.name, isOffline, flush])

  return { track }
}
