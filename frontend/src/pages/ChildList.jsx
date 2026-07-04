import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi, userApi } from '../api/client'
import { THEMES } from '../themes'
import QuotaBadge from '../components/QuotaBadge'

const CORAL = THEMES.coral

function calcAge(birthYear) {
  return !birthYear ? null : new Date().getFullYear() - parseInt(birthYear)
}

function QuotaPill({ quota }) {
  if (!quota) return null
  const pct = Math.min(quota.used / quota.limit, 1)
  const barColor  = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : '#6bcb77'
  const textColor = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : 'white'
  const borderColor = pct >= 1 ? 'rgba(255,68,68,0.5)' : pct >= 0.8 ? 'rgba(255,217,61,0.5)' : 'rgba(255,255,255,0.3)'
  const label = pct >= 1 ? '🚫 Limit reached' : pct >= 0.8 ? '⚠️ Almost full' : null
  return (
    <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}`, borderRadius: 50, padding: '6px 14px', animation: 'glm-fadein 0.5s ease both' }}>
      <div style={{ width: 48, height: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: textColor }}>
        {label ? `${label} · ${quota.used}/${quota.limit}` : `${Math.round(pct * 100)}% · ${quota.used}/${quota.limit} cr`}
      </span>
    </div>
  )
}

function UnlockModal({ child, onClose, onLock, onParent }) {
  const pt = THEMES[child.theme] || THEMES.coral
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '32px 28px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 14, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ fontSize: 52, marginBottom: 10 }}>{child.avatarEmoji}</div>
        <div style={{ fontWeight: 900, fontSize: 18, color: pt.primary, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>Opening without child lock</div>
        <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6, marginBottom: 24, fontFamily: 'Nunito, sans-serif' }}>
          <strong>{child.name}</strong>'s profile will open in <strong>parent mode</strong> — all features visible, no restrictions.
          <br /><br />
          Handing the device to {child.name}? Use <strong>🔒 Lock</strong> instead.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onLock} style={{ background: pt.headerGrad, color: 'white', border: 'none', borderRadius: 50, padding: '13px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', boxShadow: `0 6px 20px ${pt.primary}44` }}>
            🔒 Lock & hand to {child.name}
          </button>
          <button onClick={onParent} style={{ background: pt.primaryLt, color: pt.primary, border: 'none', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
            Continue in parent mode
          </button>
        </div>
      </div>
    </div>
  )
}

function CreditModal({ c, t, stats, onClose }) {
  const activeFeatures = stats.features.filter(f => f.credits > 0)
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 24, padding: '32px 28px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 14, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <div style={{ fontSize: 52, marginBottom: 10 }}>{c.avatarEmoji}</div>
        <div style={{ fontWeight: 900, fontSize: 18, color: t.primary, marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>{c.name}</div>
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>AI credits used this month</div>

        {activeFeatures.length === 0 ? (
          <div style={{ color: '#bbb', fontSize: 14, padding: '12px 0 20px' }}>✨ No AI usage this month</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, textAlign: 'left' }}>
            {activeFeatures.map(f => (
              <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: t.primaryLt }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#444', fontFamily: 'Nunito, sans-serif' }}>{f.label}</span>
                <span style={{ fontSize: 12, color: '#bbb' }}>×{f.count}</span>
                <span style={{ fontWeight: 900, fontSize: 14, color: t.primary }}>{f.credits} cr</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontFamily: 'Nunito, sans-serif' }}>
              <span style={{ fontSize: 13, color: '#888', fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: t.primary }}>{stats.totalCredits} cr</span>
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, color: '#ccc' }}>Resets on the 1st of each month</div>
      </div>
    </div>
  )
}

function ProfileCard({ c, t, offline, breakdown, onSelect, onLock, onEdit, onToggleOffline, isTouch, onShowCredit }) {
  const [hovered, setHovered] = useState(false)
  const stats = breakdown[c.id]
  const actionsVisible = isTouch || hovered

  return (
    <div
      onMouseEnter={() => !isTouch && setHovered(true)}
      onMouseLeave={() => { if (!isTouch) setHovered(false) }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative' }}>

      {/* Avatar circle */}
      <div
        onClick={() => onSelect(c)}
        style={{
          position: 'relative',
          width: isTouch ? 100 : 120, height: isTouch ? 100 : 120,
          borderRadius: '50%',
          background: t.headerGrad,
          cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          fontSize: isTouch ? 42 : 50,
          boxShadow: hovered
            ? `0 0 0 4px white, 0 0 0 7px ${t.primary}, 0 20px 60px ${t.primary}55`
            : `0 8px 32px ${t.primary}33`,
          transform: hovered ? 'scale(1.12) translateY(-6px)' : 'scale(1) translateY(0)',
          transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
          userSelect: 'none',
        }}>
        <span style={{ lineHeight: 1 }}>{c.avatarEmoji}</span>

        {/* Offline badge */}
        {offline && (
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            background: '#555', borderRadius: '50%',
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, border: '2px solid white',
          }}>✈️</div>
        )}
      </div>

      {/* Name + age */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: isTouch ? 14 : 16,
          color: 'white',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.2s ease',
        }}>{c.name}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
          {c.gender === 'girl' ? '👧' : '👦'} {calcAge(c.birthYear)} yrs
        </div>
      </div>

      {/* Action buttons row */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
        opacity: actionsVisible ? 1 : 0,
        transform: actionsVisible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        pointerEvents: actionsVisible ? 'auto' : 'none',
      }}>
        <button
          onClick={e => { e.stopPropagation(); onLock(c) }}
          title="Hand to child (locked)"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          🔒 Lock
        </button>
        <button
          onClick={e => { e.stopPropagation(); onToggleOffline(e, c) }}
          title={offline ? 'AI off — tap to enable' : 'AI on — tap to disable'}
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          {offline ? '✈️' : '🤖'}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onEdit(c) }}
          title="Edit"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          ✏️
        </button>
        {stats && (
          <button
            onClick={e => { e.stopPropagation(); onShowCredit(c) }}
            title="Credits"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            📊
          </button>
        )}
      </div>
    </div>
  )
}

export default function ChildList({ onChildSelected, onLogout, onChildSelectedLocked, onToggleOffline, quota, featureConfig }) {
  const [children, setChildren] = useState([])
  const [loading, setLoading]   = useState(true)
  const [offlineModes, setOfflineModes] = useState({})
  const [pendingChild, setPendingChild] = useState(null)
  const [creditChild, setCreditChild] = useState(null)
  const [breakdown, setBreakdown] = useState({})
  const navigate = useNavigate()
  const isTouch = window.innerWidth < 1024

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
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontFamily: 'Nunito, sans-serif', fontSize: 18 }}>
      ✨ Loading…
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes glm-float {
          0%, 100% { transform: translateY(0px) }
          50%       { transform: translateY(-12px) }
        }
        @keyframes glm-fadein {
          from { opacity: 0; transform: translateY(24px) scale(0.95) }
          to   { opacity: 1; transform: translateY(0)   scale(1) }
        }
        @keyframes glm-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.7 }
          100% { transform: scale(1.5); opacity: 0 }
        }
        .glm-profile-card {
          animation: glm-fadein 0.5s cubic-bezier(0.34,1.2,0.64,1) both;
        }
        @keyframes glm-bar-grow {
          from { width: 0% }
        }
      `}</style>

      {/* Full-page cinematic backdrop */}
      <div style={{
        minHeight: 'calc(100vh - 60px)',
        background: CORAL.headerGrad,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '48px 24px',
        fontFamily: 'Nunito, sans-serif',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Decorative blobs */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)', top: -100, left: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)', bottom: -150, right: -100, pointerEvents: 'none' }} />

        {/* Quota pill top-right */}
        <QuotaPill quota={quota} />

        {children.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: 72, marginBottom: 20, animation: 'glm-float 3s ease-in-out infinite' }}>🌟</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>No adventurers yet!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 32 }}>Add your little one to get started with stories and adventures!</p>
            <button onClick={() => navigate('/child/new')}
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)', color: 'white', border: 'none', borderRadius: 50, padding: '14px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 32px rgba(255,107,107,0.4)' }}>
              + Add Your Child
            </button>
          </div>
        ) : (
          <>
            {/* Heading */}
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 10 }}>
                Glumbi
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 900, color: 'white', margin: 0, letterSpacing: -0.5 }}>
                Who's playing today? 🎮
              </h1>
            </div>

            {/* Profile grid */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 5vw, 56px)',
              justifyContent: 'center', alignItems: 'flex-start',
              maxWidth: 800,
            }}>
              {children.map((c, i) => {
                const t = THEMES[c.theme] || THEMES.coral
                return (
                  <div key={c.id} className="glm-profile-card" style={{ animationDelay: `${i * 0.08}s` }}>
                    <ProfileCard
                      c={c} t={t}
                      offline={offlineModes[c.id]}
                      breakdown={breakdown}
                      onSelect={setPendingChild}
                      onLock={onChildSelectedLocked}
                      onEdit={c => navigate(`/child/${c.id}/edit`)}
                      onToggleOffline={handleToggleOffline}
                      isTouch={isTouch}
                      onShowCredit={setCreditChild}
                    />
                  </div>
                )
              })}

              {/* Add child card */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div
                  onClick={() => navigate('/child/new')}
                  style={{
                    width: 120, height: 120, borderRadius: '50%',
                    border: '3px dashed rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.transform = 'scale(1.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}>
                  +
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700 }}>Add child</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Credit modal — rendered here (top level) so position:fixed escapes card animation stacking context */}
      {creditChild && breakdown[creditChild.id] && (
        <CreditModal
          c={creditChild}
          t={THEMES[creditChild.theme] || THEMES.coral}
          stats={breakdown[creditChild.id]}
          onClose={() => setCreditChild(null)}
        />
      )}

      {/* Unlocked-access modal */}
      {pendingChild && (
        <UnlockModal
          child={pendingChild}
          onClose={() => setPendingChild(null)}
          onLock={() => { onChildSelectedLocked(pendingChild); setPendingChild(null) }}
          onParent={() => { onChildSelected(pendingChild); setPendingChild(null) }}
        />
      )}
    </>
  )
}
