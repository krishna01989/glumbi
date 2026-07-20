import { useState, useEffect, useRef } from 'react'

export function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const STORAGE_KEY = 'history_drawer_corner'

const POSITIONS = {
  tl: { left: 0,  top: 20,    bottom: undefined, mid: false, borderRadius: '0 14px 14px 0', shadow: '3px 0 14px rgba(0,0,0,0.18)',  side: 'left'  },
  ml: { left: 0,  top: '50%', bottom: undefined, mid: true,  borderRadius: '0 14px 14px 0', shadow: '3px 0 14px rgba(0,0,0,0.18)',  side: 'left'  },
  bl: { left: 0,  top: undefined, bottom: 90,    mid: false, borderRadius: '0 14px 14px 0', shadow: '3px 0 14px rgba(0,0,0,0.18)',  side: 'left'  },
  tr: { right: 0, top: 20,    bottom: undefined, mid: false, borderRadius: '14px 0 0 14px', shadow: '-3px 0 14px rgba(0,0,0,0.18)', side: 'right' },
  mr: { right: 0, top: '50%', bottom: undefined, mid: true,  borderRadius: '14px 0 0 14px', shadow: '-3px 0 14px rgba(0,0,0,0.18)', side: 'right' },
  br: { right: 0, top: undefined, bottom: 90,    mid: false, borderRadius: '14px 0 0 14px', shadow: '-3px 0 14px rgba(0,0,0,0.18)', side: 'right' },
}

function nearestPosition(x, y) {
  const h = x < window.innerWidth  / 2 ? 'l' : 'r'
  const third = window.innerHeight / 3
  const v = y < third ? 't' : y < third * 2 ? 'm' : 'b'
  return v + h
}

function readPos() {
  try { return localStorage.getItem(STORAGE_KEY) || (window.innerWidth < 640 ? 'tl' : 'tr') }
  catch { return 'tr' }
}

function posStyle(ps, extraTransform = '') {
  return {
    left: ps.left, right: ps.right, top: ps.top, bottom: ps.bottom,
    transform: ps.mid
      ? `translateY(-50%)${extraTransform ? ' ' + extraTransform : ''}`
      : extraTransform || undefined,
  }
}

const FADE_DELAY = 2500

export default function HistoryDrawer({ title, count, icon = '📖', children }) {
  const [open,     setOpen]     = useState(false)
  const [pos,      setPos]      = useState(readPos)
  const [dragging, setDragging] = useState(false)
  const [snapHint, setSnapHint] = useState(null)
  const [faded,    setFaded]    = useState(false)
  const dragRef   = useRef({ startX: 0, startY: 0 })
  const didDrag   = useRef(false)   // true if pointer moved > 8px — suppresses onClick
  const fadeTimer = useRef(null)

  useEffect(() => {
    scheduleFade()
    return () => clearTimeout(fadeTimer.current)
  }, [])

  useEffect(() => {
    if (open) { clearTimeout(fadeTimer.current); setFaded(false) }
    else scheduleFade()
  }, [open])

  function scheduleFade() {
    clearTimeout(fadeTimer.current)
    setFaded(false)
    fadeTimer.current = setTimeout(() => setFaded(true), FADE_DELAY)
  }

  function savePos(p) {
    setPos(p)
    try { localStorage.setItem(STORAGE_KEY, p) } catch {}
  }

  // onClick is the single source of truth for open/close — works on both mouse and touch
  function handleClick() {
    if (didDrag.current) { didDrag.current = false; return }
    scheduleFade()
    setOpen(v => !v)
  }

  function startDrag(clientX, clientY) {
    scheduleFade()
    didDrag.current = false
    dragRef.current = { startX: clientX, startY: clientY }

    function onMove(x, y) {
      if (!didDrag.current) {
        if (Math.abs(x - dragRef.current.startX) > 8 || Math.abs(y - dragRef.current.startY) > 8) {
          didDrag.current = true
          setDragging(true)
        }
      }
      if (didDrag.current) setSnapHint(nearestPosition(x, y))
    }

    function onEnd(x, y) {
      cleanup()
      setDragging(false)
      setSnapHint(null)
      if (didDrag.current) savePos(nearestPosition(x, y))
      // open/close is handled by onClick — don't call setOpen here
    }

    function onMouseMove(e) { onMove(e.clientX, e.clientY) }
    function onMouseUp(e)   { onEnd(e.clientX, e.clientY) }
    function onTouchMove(e) {
      const t = e.touches[0]
      onMove(t.clientX, t.clientY)
      if (didDrag.current) e.preventDefault()  // stop page scroll while dragging
    }
    function onTouchEnd(e) { const t = e.changedTouches[0]; onEnd(t.clientX, t.clientY) }

    function cleanup() {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend',  onTouchEnd)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend',  onTouchEnd)
  }

  if (!count) return null

  const cs     = POSITIONS[pos]
  const onLeft = cs.side === 'left'
  const hintCs = snapHint && snapHint !== pos ? POSITIONS[snapHint] : null

  return (
    <>
      <style>{`
        @keyframes hd-pulse {
          0%   { opacity: 0.12; transform: var(--hd-base, '') scale(1); }
          50%  { opacity: 0.45; transform: var(--hd-base, '') scale(1.14); }
          100% { opacity: 0.12; transform: var(--hd-base, '') scale(1); }
        }
      `}</style>

      {/* Pulsing snap-hint ghost */}
      {hintCs && (
        <div style={{
          position: 'fixed',
          left: hintCs.left, right: hintCs.right,
          top: hintCs.top, bottom: hintCs.bottom,
          borderRadius: hintCs.borderRadius,
          zIndex: 998,
          width: 34, padding: '14px 0',
          background: 'var(--primary)',
          pointerEvents: 'none',
          '--hd-base': hintCs.mid ? 'translateY(-50%)' : '',
          animation: 'hd-pulse 0.85s ease-in-out infinite',
        }} />
      )}

      {/* Draggable trigger tab */}
      <div
        onClick={handleClick}
        onMouseDown={e => startDrag(e.clientX, e.clientY)}
        onMouseEnter={scheduleFade}
        onTouchStart={e => { const t = e.touches[0]; startDrag(t.clientX, t.clientY) }}
        style={{
          position: 'fixed',
          ...posStyle(cs, dragging ? 'scale(1.15)' : ''),
          borderRadius: cs.borderRadius,
          boxShadow: cs.shadow,
          zIndex: 999,
          background: 'var(--primary)',
          color: 'white',
          width: 34,
          padding: '14px 0',
          cursor: dragging ? 'grabbing' : 'grab',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          opacity: dragging ? 0.85 : faded ? 0.18 : 1,
          transition: dragging
            ? 'transform 0.1s, opacity 0.1s'
            : 'top 0.3s cubic-bezier(0.4,0,0.2,1), bottom 0.3s cubic-bezier(0.4,0,0.2,1), left 0.3s cubic-bezier(0.4,0,0.2,1), right 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease, border-radius 0.3s',
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
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
        ...(onLeft ? { left: 0 } : { right: 0 }),
        width: window.innerWidth < 640 ? '88vw' : 360,
        maxWidth: '100vw',
        zIndex: 1001,
        background: 'white',
        boxShadow: onLeft ? '4px 0 24px rgba(0,0,0,0.18)' : '-4px 0 24px rgba(0,0,0,0.18)',
        transform: open ? 'translateX(0)' : (onLeft ? 'translateX(-100%)' : 'translateX(100%)'),
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      </div>
    </>
  )
}
