import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi, userApi } from '../api/client'
import { THEMES } from '../themes'

function calcAge(birthYear) {
  return !birthYear ? null : new Date().getFullYear() - parseInt(birthYear)
}


export default function ChildList({ onChildSelected, onLogout, onChildSelectedLocked, onToggleOffline }) {
  const [children, setChildren] = useState([])
  const [loading, setLoading]   = useState(true)
  const [offlineModes, setOfflineModes] = useState({})
  const [pendingChild, setPendingChild] = useState(null)
  const [breakdown, setBreakdown] = useState({})   // keyed by childId
  const [expandedChild, setExpandedChild] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    childApi.getAll().then(data => {
      setChildren(data)
      const modes = {}
      data.forEach(c => { modes[c.id] = localStorage.getItem(`glm_offline_${c.id}`) === '1' })
      setOfflineModes(modes)
      setLoading(false)
    }).catch(() => setLoading(false))

    userApi.creditBreakdown().then(data => {
      const map = {}
      data.children.forEach(c => { map[c.childId] = c })
      setBreakdown(map)
    }).catch(() => {})
  }, [])

  function handleToggleOffline(e, c) {
    e.stopPropagation()
    const next = !offlineModes[c.id]
    localStorage.setItem(`glm_offline_${c.id}`, next ? '1' : '0')
    setOfflineModes(prev => ({ ...prev, [c.id]: next }))
    if (onToggleOffline) onToggleOffline(c.id)
  }

  if (loading) return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px', textAlign: 'center', color: '#aaa' }}>
      Loading…
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 20px' }}>

      {children.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
          <h2 style={{ fontSize: 20, color: '#444', marginBottom: 8 }}>No children added yet</h2>
          <p style={{ color: '#aaa', fontSize: 14, marginBottom: 28 }}>Add your little one to get started with stories and adventures!</p>
          <button className="btn-primary" style={{ fontSize: 16, padding: '12px 32px' }} onClick={() => navigate('/child/new')}>
            + Add Your Child
          </button>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: 16, color: '#888', marginBottom: 12 }}>Choose a child</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {children.map(c => {
              const t = THEMES[c.theme] || THEMES.coral
              const stats = breakdown[c.id]
              const expanded = expandedChild === c.id
              return (
              <div key={c.id} style={{ borderRadius: 14, border: `2px solid transparent`, transition: 'border-color 0.15s', overflow: 'hidden', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.primary}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                {/* Main row */}
                <div className="card" onClick={() => setPendingChild(c)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: 0, margin: 0, boxShadow: 'none', border: 'none', borderRadius: 0 }}>
                  <div style={{ width: 6, alignSelf: 'stretch', background: t.headerGrad, flexShrink: 0 }} />
                  <span style={{ fontSize: 36, padding: '14px 0 14px 8px' }}>{c.avatarEmoji}</span>
                  <div style={{ flex: 1, padding: '14px 0' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: t.primary }}>{c.name}</div>
                    <div style={{ color: '#aaa', fontSize: 13 }}>
                      {c.gender === 'girl' ? '👧' : '👦'} · {calcAge(c.birthYear)} yrs old
                    </div>
                  </div>
                  <button onClick={e => handleToggleOffline(e, c)}
                    title={offlineModes[c.id] ? 'Practice mode (AI off) — tap to enable AI' : 'AI on — tap for practice mode'}
                    style={{
                      padding: '6px 10px', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, flexShrink: 0,
                      background: offlineModes[c.id] ? '#f5f5f5' : '#f0fff4',
                      color:      offlineModes[c.id] ? '#999'    : '#27ae60',
                    }}>
                    {offlineModes[c.id] ? '✈️' : '🤖'}
                  </button>
                  <button onClick={e => { e.stopPropagation(); onChildSelectedLocked(c) }}
                    title="Hand to child (locked)"
                    style={{ background: t.primaryLt, color: t.primary, padding: '6px 12px', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
                    🔒
                  </button>
                  <button onClick={e => { e.stopPropagation(); navigate(`/child/${c.id}/edit`) }}
                    style={{ background: '#f0ebe6', color: '#888', padding: '6px 12px', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                    ✏️
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setExpandedChild(expanded ? null : c.id) }}
                    title="Credit usage"
                    style={{ background: expanded ? t.primaryLt : 'transparent', color: expanded ? t.primary : '#bbb', padding: '6px 10px', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0, marginRight: 10, fontWeight: 700 }}>
                    📊
                  </button>
                </div>

                {/* Usage breakdown — expands below the card row */}
                {expanded && stats && (
                  <div style={{ borderTop: `1px solid ${t.primaryLt}`, padding: '10px 16px 12px', background: t.primaryLt }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: t.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        AI credits this month
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: t.primary }}>{stats.totalCredits} cr</span>
                    </div>
                    {stats.totalCredits === 0 ? (
                      <div style={{ fontSize: 12, color: '#aaa' }}>No AI usage this month</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {stats.features.filter(f => f.credits > 0).map(f => (
                          <div key={f.feature} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                            <span style={{ color: '#666' }}>{f.icon} {f.label} <span style={{ color: '#bbb' }}>×{f.count}</span></span>
                            <span style={{ fontWeight: 700, color: t.primary }}>{f.credits} cr</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )})}

          </div>
          <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }}
            onClick={() => navigate('/child/new')}>
            + Add another child
          </button>
        </div>
      )}

      {/* Unlocked-access reminder */}
      {pendingChild && (() => {
        const pt = THEMES[pendingChild.theme] || THEMES.coral
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: 20,
          }}>
            <div style={{
              background: 'white', borderRadius: 20, padding: '28px 24px',
              maxWidth: 360, width: '100%', textAlign: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🔓</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: pt.primary, marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>
                Opening without child lock
              </div>
              <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6, marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>
                <strong>{pendingChild.name}</strong>'s profile will open in <strong>parent mode</strong> — all features visible, no restrictions.
                <br /><br />
                If you're handing the device to {pendingChild.name}, use the <strong>🔒 lock button</strong> instead so they stay in a safe, focused experience.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => { onChildSelectedLocked(pendingChild); setPendingChild(null) }}
                  style={{
                    background: pt.headerGrad, color: 'white',
                    border: 'none', borderRadius: 50, padding: '12px 20px',
                    fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                  }}>
                  🔒 Lock & hand to {pendingChild.name}
                </button>
                <button
                  onClick={() => { onChildSelected(pendingChild); setPendingChild(null) }}
                  style={{
                    background: pt.primaryLt, color: pt.primary,
                    border: 'none', borderRadius: 50, padding: '12px 20px',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                  }}>
                  Continue in parent mode
                </button>
                <button
                  onClick={() => setPendingChild(null)}
                  style={{ background: 'none', border: 'none', color: '#bbb', fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', padding: '4px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
