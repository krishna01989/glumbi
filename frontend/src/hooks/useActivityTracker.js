import { useEffect, useCallback, useRef } from 'react'
import { analyticsSocket } from '../grpc/analyticsSocket'
import { analyticsApi } from '../api/client'

const QUEUE_KEY  = 'glm_activity_queue'
const QUEUE_MAX  = 5000  // emergency brake only — real protection is the deadlock fix
const WS_FAIL_HTTP_THRESHOLD = 3   // fall back to HTTP after this many consecutive WS failures

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}

function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch {}
}

export default function useActivityTracker(child, isOffline, childLocked) {
  const sendingRef    = useRef(0)    // events currently in-flight waiting for ACK
  const closeTimerRef = useRef(null)

  const flush = useCallback(() => {
    if (sendingRef.current > 0) return   // wait for ACK before sending more
    const queue = readQueue()
    if (!queue.length) return

    // Fall back to HTTP if WebSocket has failed repeatedly
    if (!analyticsSocket.isOpen()) {
      if (analyticsSocket.consecutiveFailures >= WS_FAIL_HTTP_THRESHOLD) {
        analyticsApi.batchEvents(queue)
          .then(() => writeQueue([]))
          .catch(() => {})  // keep queue intact on HTTP failure, retry next poll
      }
      return
    }

    sendingRef.current = queue.length
    const sent = analyticsSocket.send(queue)
    if (!sent) sendingRef.current = 0
  }, [])

  // Open socket when child locks in, close when session ends
  useEffect(() => {
    if (!childLocked || !child?.id) return

    analyticsSocket.open()

    // Reset in-flight counter whenever the socket (re)connects so a mid-flight
    // disconnect doesn't permanently block flush() for the rest of the session.
    // Events re-sent after reconnect are deduplicated server-side by clientKey.
    analyticsSocket.onReconnect = () => {
      sendingRef.current = 0
      flush()
    }

    analyticsSocket.onAck = () => {
      const current = readQueue()
      writeQueue(current.slice(sendingRef.current))
      sendingRef.current = 0
      if (readQueue().length > 0) flush()
    }

    return () => {
      // Defer close so child useFeatureDuration cleanups enqueue their session
      // events before the socket shuts down (React runs parent cleanups first).
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      closeTimerRef.current = setTimeout(() => {
        flush()
        analyticsSocket.onAck       = null
        analyticsSocket.onReconnect = null
        analyticsSocket.close()
        sendingRef.current    = 0
        closeTimerRef.current = null
      }, 0)
    }
  }, [childLocked, child?.id, flush])

  useEffect(() => {
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current) }
  }, [])

  // Poll every 2s — drains queue after reconnect or HTTP fallback window
  useEffect(() => {
    const interval = setInterval(flush, 2000)
    return () => clearInterval(interval)
  }, [flush])

  useEffect(() => {
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [flush])

  const track = useCallback((feature, eventType, opts = {}) => {
    if (!child?.id || !childLocked) return
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
    // Cap queue size — drop oldest events when over limit
    if (queue.length > QUEUE_MAX) queue.splice(0, queue.length - QUEUE_MAX)
    writeQueue(queue)
    if (navigator.onLine) flush()
  }, [child?.id, child?.name, isOffline, childLocked, flush])

  return { track }
}
