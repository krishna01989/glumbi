/**
 * Persistent WebSocket connection for analytics event streaming.
 *
 * One connection per child session. Events are sent as JSON arrays.
 * Server replies {"saved": N} for each batch — queue only clears on ACK.
 *
 * Lifecycle:
 *   - open()  called when child locks in
 *   - close() called when child session ends
 *   - Tab hidden → socket closed to free server resources; reopens when tab becomes visible again
 *   - Reconnect: exponential backoff 1s → 2s → 4s … 32s cap
 *   - Server closes idle sessions after 10 min (close code 1001); client does NOT retry on 1001
 */

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
  .replace(/\/api$/, '')
  .replace(/^http/, 'ws')  // http → ws, https → wss

function getToken() {
  return localStorage.getItem('glm_token') || ''
}

class AnalyticsSocket {
  constructor() {
    this.ws           = null
    this.backoff      = 1000
    this.retryTimer   = null
    this.active       = false  // true only during a child session
    this.onAck        = null   // callback() — set by useActivityTracker
    this._onVisible   = this._handleVisibilityChange.bind(this)
  }

  // Call when child session starts (child locked in)
  open() {
    this.active  = true
    this.backoff = 1000
    document.addEventListener('visibilitychange', this._onVisible)
    if (!document.hidden) this._connect()
  }

  // Call when child session ends
  close() {
    this.active = false
    document.removeEventListener('visibilitychange', this._onVisible)
    clearTimeout(this.retryTimer)
    if (this.ws) {
      this.ws.close(1000, 'session ended')
      this.ws = null
    }
  }

  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Send a batch of events. Returns true if sent, false if not connected.
  send(events) {
    if (!this.isOpen() || !events?.length) return false
    try {
      this.ws.send(JSON.stringify(events))
      return true
    } catch {
      return false
    }
  }

  _handleVisibilityChange() {
    if (document.hidden) {
      // Tab went to background — release the server connection
      clearTimeout(this.retryTimer)
      if (this.ws) {
        this.ws.close(1000, 'tab hidden')
        this.ws = null
      }
    } else {
      // Tab came back — reconnect immediately (reset backoff for a snappy resume)
      this.backoff = 1000
      this._connect()
    }
  }

  _connect() {
    if (!this.active || document.hidden) return
    const url = `${BASE_URL}/ws/events?token=${encodeURIComponent(getToken())}`
    const ws  = new WebSocket(url)

    ws.onopen = () => {
      this.backoff = 1000
    }

    ws.onmessage = (e) => {
      try {
        const { saved } = JSON.parse(e.data)
        this.onAck?.(saved)
      } catch {}
    }

    ws.onclose = (e) => {
      this.ws = null
      if (!this.active) return
      // 1000 = normal close (session ended or tab hidden — we initiated it)
      // 1001 = server idle timeout (child walked away) — don't retry
      // 4001 = auth rejected — don't retry
      if (e.code === 1000 || e.code === 1001 || e.code === 4001) return
      this._scheduleReconnect()
    }

    ws.onerror = () => {
      // onclose always fires after onerror — reconnect logic lives there
    }

    this.ws = ws
  }

  _scheduleReconnect() {
    const delay   = this.backoff
    this.backoff  = Math.min(this.backoff * 2, 32000)
    this.retryTimer = setTimeout(() => this._connect(), delay)
  }
}

// Singleton — one socket for the lifetime of the page
export const analyticsSocket = new AnalyticsSocket()
