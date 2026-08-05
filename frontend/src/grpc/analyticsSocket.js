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
 *   - onReconnect callback fires on every successful open so the hook can reset in-flight state
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
    this.failCount    = 0      // consecutive failed connections
    this.retryTimer   = null
    this.active       = false
    this.onAck        = null   // (saved: number) => void — set by useActivityTracker
    this.onReconnect  = null   // () => void — fires on every successful open
    this._onVisible   = this._handleVisibilityChange.bind(this)
  }

  open() {
    this.active    = true
    this.backoff   = 1000
    this.failCount = 0
    document.addEventListener('visibilitychange', this._onVisible)
    if (!document.hidden) this._connect()
  }

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
      clearTimeout(this.retryTimer)
      if (this.ws) {
        this.ws.close(1000, 'tab hidden')
        this.ws = null
      }
    } else {
      this.backoff = 1000
      this._connect()
    }
  }

  _connect() {
    if (!this.active || document.hidden) return
    const token = getToken()
    if (!token) { this.active = false; return }
    const url = `${BASE_URL}/ws/events?token=${encodeURIComponent(token)}`
    const ws  = new WebSocket(url)

    ws.onopen = () => {
      this.backoff   = 1000
      this.failCount = 0
      // Notify the hook so it can reset any in-flight counter and flush immediately
      this.onReconnect?.()
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
      // 4001 = auth rejected — don't retry (token won't fix itself)
      if (e.code === 4001) return
      // All other codes (including 1000 tab-hidden self-close and 1001 server idle)
      // should reconnect — 1001 means server timed out the idle connection, not that
      // the session is over; visibility-change will reconnect on resume anyway, but
      // if the tab is still visible we want an immediate retry
      this.failCount++
      this._scheduleReconnect()
    }

    ws.onerror = () => {}  // onclose always fires after onerror

    this.ws = ws
  }

  _scheduleReconnect() {
    const delay  = this.backoff
    this.backoff = Math.min(this.backoff * 2, 32000)
    this.retryTimer = setTimeout(() => this._connect(), delay)
  }

  // How many consecutive failures — used by the hook to decide on HTTP fallback
  get consecutiveFailures() { return this.failCount }
}

export const analyticsSocket = new AnalyticsSocket()
