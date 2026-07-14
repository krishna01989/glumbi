import { useState, useEffect, useRef, useCallback } from 'react'
import { notificationApi } from '../api/client'

const TYPE_ICON = {
  PROGRESS_REPORT:      '📊',
  MILESTONE:            '🏆',
  STORY_RECOMMENDATION: '✨',
  LEARNING_INSIGHT:     '💡',
  LEARN_TO_WRITE:       '✏️',
  MEMORY_PLAY:          '🧠',
  QUOTA_WARNING:        '⚠️',
}

const TYPE_LABEL = {
  PROGRESS_REPORT:      'Weekly Report',
  MILESTONE:            'Milestone',
  STORY_RECOMMENDATION: 'Story Idea',
  LEARNING_INSIGHT:     'Learning Insight',
  LEARN_TO_WRITE:       'Learn to Write',
  MEMORY_PLAY:          'Memory Play',
  QUOTA_WARNING:        'Quota Warning',
}

export default function NotificationBell({ isMobile = false }) {
  const [open, setOpen]           = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]       = useState(0)
  const panelRef                  = useRef(null)
  const btnRef                    = useRef(null)

  const fetchCount = useCallback(() => {
    notificationApi.unreadCount()
      .then(d => setUnread(d.count))
      .catch(() => {})
  }, [])

  // Poll unread count every 5 minutes
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchCount])

  function openPanel() {
    if (open) { setOpen(false); return }
    notificationApi.getAll()
      .then(data => { setNotifications(data); setOpen(true) })
      .catch(() => {})
    if (unread > 0) {
      notificationApi.markAllRead()
        .then(() => setUnread(0))
        .catch(() => {})
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function formatTime(iso) {
    const d = new Date(iso)
    const now = new Date()
    const diff = now - d
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 1)    return 'just now'
    if (mins < 60)   return `${mins}m ago`
    if (hours < 24)  return `${hours}h ago`
    if (days < 7)    return `${days}d ago`
    return d.toLocaleDateString()
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={openPanel}
        title="Notifications"
        style={{
          position: 'relative',
          width: isMobile ? 34 : 38,
          height: isMobile ? 34 : 38,
          borderRadius: 10,
          border: isMobile ? 'none' : '1.5px solid #eee',
          cursor: 'pointer',
          fontSize: isMobile ? 20 : 18,
          background: isMobile ? 'rgba(255,255,255,0.2)' : '#fafafa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: isMobile ? 2 : 4,
            right: isMobile ? 2 : 4,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: '#e74c3c',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Notification panel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: isMobile ? 60 : 56,
            right: 12,
            width: Math.min(380, window.innerWidth - 24),
            maxHeight: '70vh',
            overflowY: 'auto',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 9999,
            border: '1px solid #f0f0f0',
          }}>
          {/* Header */}
          <div style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid #f5f5f5',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#222' }}>Notifications</span>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#aaa', padding: 0 }}>
              ✕
            </button>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
              <div style={{ fontSize: 14 }}>No notifications yet.</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Weekly reports appear every Sunday.</div>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{
                padding: '14px 18px',
                borderBottom: '1px solid #fafafa',
                background: n.read ? '#fff' : '#f8f4ff',
                transition: 'background 0.2s',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>
                    {TYPE_ICON[n.type] || '🔔'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--primary, #4d96ff)',
                        background: 'var(--primary-light, #EFF6FF)',
                        padding: '2px 8px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {TYPE_LABEL[n.type] || n.type}
                      </span>
                      {n.child && (
                        <span style={{ fontSize: 11, color: '#aaa' }}>
                          {n.child.avatarEmoji} {n.child.name}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#333', lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
                      {formatTime(n.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
