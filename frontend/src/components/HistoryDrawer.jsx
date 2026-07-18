import { useState, useEffect, useRef } from 'react'

export function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function HistoryDrawer({ title, count, children }) {
  const [open, setOpen] = useState(false)
  const mobile = typeof window !== 'undefined' && window.innerWidth < 640
  const dragStart = useRef(null)
  const dragged = useRef(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Mouse drag (desktop only) ───────────────────────────────────────────────
  function onMouseDown(e) {
    dragStart.current = e.clientX
    dragged.current = false

    function onMouseMove(ev) {
      if (dragStart.current === null) return
      const delta = ev.clientX - dragStart.current
      if (mobile && delta > 20) { setOpen(true); dragged.current = true; cleanup() }
      if (!mobile && delta < -20) { setOpen(true); dragged.current = true; cleanup() }
    }

    function onMouseUp() {
      cleanup()
    }

    function cleanup() {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      dragStart.current = null
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onClick() {
    if (dragged.current) { dragged.current = false; return }
    setOpen(v => !v)
  }

  if (!count) return null

  return (
    <>
      {/* Floating trigger tab */}
      <div
        onClick={onClick}
        onMouseDown={onMouseDown}
        style={{
          position: 'fixed',
          top: '50%',
          transform: 'translateY(-50%)',
          ...(mobile ? { left: 0, borderRadius: '0 14px 14px 0' } : { right: 0, borderRadius: '14px 0 0 14px' }),
          zIndex: 999,
          background: 'var(--primary)',
          color: 'white',
          width: 34,
          padding: '14px 0',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          boxShadow: mobile ? '3px 0 14px rgba(0,0,0,0.18)' : '-3px 0 14px rgba(0,0,0,0.18)',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          transition: 'opacity 0.15s',
        }}
      >
        <span style={{ fontSize: 16 }}>📚</span>
        <span style={{
          fontSize: 11, fontWeight: 800, fontFamily: 'Nunito, sans-serif',
          background: 'rgba(255,255,255,0.25)', borderRadius: '50%',
          width: 20, height: 20, minWidth: 20, minHeight: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}>{count}</span>
      </div>

      {/* Backdrop */}
      <div onClick={() => setOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.25s',
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, bottom: 0,
        ...(mobile ? { left: 0 } : { right: 0 }),
        width: mobile ? '88vw' : 360,
        maxWidth: '100vw',
        zIndex: 1001,
        background: 'white',
        boxShadow: mobile ? '4px 0 24px rgba(0,0,0,0.18)' : '-4px 0 24px rgba(0,0,0,0.18)',
        transform: open ? 'translateX(0)' : (mobile ? 'translateX(-100%)' : 'translateX(100%)'),
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1.5px solid #f0f0f0',
          background: 'var(--primary-lt)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Nunito, sans-serif' }}>
              {title}
            </span>
            <span style={{ background: 'var(--primary)', color: 'white', fontSize: 11, fontWeight: 800,
              borderRadius: '50%', width: 22, height: 22, minWidth: 22, minHeight: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
              {count}
            </span>
          </div>
          <button onClick={() => setOpen(false)}
            style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, borderRadius: '50%', border: 'none',
              background: 'var(--primary)', color: 'white', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      </div>
    </>
  )
}
