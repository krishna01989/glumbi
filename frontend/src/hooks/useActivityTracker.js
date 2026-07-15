import { useEffect, useCallback, useRef } from 'react'
import { analyticsSocket } from '../grpc/analyticsSocket'

const QUEUE_KEY = 'glm_activity_queue'

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}

function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch {}
}

export default function useActivityTracker(child, isOffline, childLocked) {
  const sendingRef = useRef(0)  // how many events are in-flight waiting for ACK

  const flush = useCallback(() => {
    if (sendingRef.current > 0) return  // wait for ACK before sending more
    const queue = readQueue()
    if (!queue.length || !analyticsSocket.isOpen()) return
    sendingRef.current = queue.length
    const sent = analyticsSocket.send(queue)
    if (!sent) sendingRef.current = 0
  }, [])

  // Open socket when child locks in, close when session ends
  useEffect(() => {
    if (!childLocked || !child?.id) return
    analyticsSocket.open()

    analyticsSocket.onAck = () => {
      // Drop exactly the events we sent, preserving any newly enqueued ones
      const current = readQueue()
      writeQueue(current.slice(sendingRef.current))
      sendingRef.current = 0
      // Drain remaining queue if more events accumulated while we were waiting
      if (readQueue().length > 0) flush()
    }

    return () => {
      analyticsSocket.onAck = null
      analyticsSocket.close()
      sendingRef.current = 0
    }
  }, [childLocked, child?.id, flush])

  // Poll every 2s to drain the queue after a reconnect
  useEffect(() => {
    const interval = setInterval(flush, 2000)
    return () => clearInterval(interval)
  }, [flush])

  // Flush when network comes back
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
    writeQueue(queue)

    if (navigator.onLine) flush()
  }, [child?.id, child?.name, isOffline, childLocked, flush])

  return { track }
}
