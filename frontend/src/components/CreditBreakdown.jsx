import { useState, useEffect, useRef } from 'react'
import { userApi } from '../api/client'
import { THEMES } from '../themes'

export default function CreditBreakdown() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    userApi.creditBreakdown()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const maxTotal = data
    ? Math.max(...data.children.map(c => c.totalCredits), 1)
    : 1

  return (
    <div ref={ref} id="tour-credit-breakdown" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        title="Credit usage by child"
        onClick={() => setOpen(v => !v)}
        style={{
          background: open ? 'var(--primary-lt)' : 'transparent',
          border: 'none', cursor: 'pointer', fontSize: 18,
          padding: '4px 6px', borderRadius: 8,
          color: 'var(--primary)', lineHeight: 1,
          transition: 'background 0.15s',
        }}
      >
        📊
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#1e2a3a', borderRadius: 16, padding: '16px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 999,
          minWidth: 280, maxWidth: 340,
          fontSize: 13, color: 'rgba(255,255,255,0.85)',
        }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'white', marginBottom: 12 }}>
            📊 Credits this month
          </div>

          {loading && (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '16px 0' }}>Loading…</div>
          )}

          {!loading && data && data.children.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '8px 0' }}>No children added yet.</div>
          )}

          {!loading && data && data.children.map(child => {
            const t = THEMES[child.theme] || THEMES.coral
            const pct = child.totalCredits / maxTotal
            return (
              <div key={child.childId} style={{ marginBottom: 16 }}>
                {/* Child header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{child.avatarEmoji}</span>
                  <span style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>{child.name}</span>
                  <span style={{
                    marginLeft: 'auto', fontWeight: 800, fontSize: 13,
                    color: child.totalCredits === 0 ? 'rgba(255,255,255,0.3)' : '#6bcb77',
                  }}>
                    {child.totalCredits} cr
                  </span>
                </div>

                {/* Total bar */}
                <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 10, transition: 'width 0.4s ease',
                    width: `${pct * 100}%`,
                    background: t.headerGrad || t.primary,
                  }} />
                </div>

                {/* Feature breakdown */}
                {child.features.filter(f => f.credits > 0).map(f => (
                  <div key={f.feature} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {f.icon} {f.label}
                      <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>×{f.count}</span>
                    </span>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{f.credits} cr</span>
                  </div>
                ))}

                {child.features.every(f => f.credits === 0) && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', paddingLeft: 2 }}>No AI usage this month</div>
                )}
              </div>
            )
          })}

          {!loading && data && (
            <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
              {data.month} · resets on the 1st
            </div>
          )}

          <button
            onClick={() => setOpen(false)}
            style={{ marginTop: 10, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
