import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi, userApi } from '../api/client'
import { THEMES } from '../themes'
import QuotaBadge from '../components/QuotaBadge'

const CORAL = THEMES.coral

function calcAge(birthYear) {
  return !birthYear ? null : new Date().getFullYear() - parseInt(birthYear)
}

const FEATURE_META = {
  'story':          { label: 'Stories',        emoji: '📖' },
  'activity':       { label: 'Activities',     emoji: '🎮' },
  'learn-validate': { label: 'Learn to Write', emoji: '✏️' },
  'curiosity':      { label: 'Curiosity',      emoji: '🔍' },
  'draw':           { label: 'Draw',           emoji: '🎨' },
  'read-quiz':      { label: 'Read & Quiz',    emoji: '📚' },
  'writing-coach':  { label: 'My Writing',     emoji: '✍️' },
  'memory':         { label: 'Memory Play',    emoji: '🧠' },
}

/* ── Credit info modal ── */
function CreditInfoModal({ featureConfig, onClose }) {
  const items = featureConfig.filter(f => f.featureName && FEATURE_META[f.featureName])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 24, padding: '24px 20px', maxWidth: 360, width: '100%', maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.35)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both', fontFamily: 'Nunito, sans-serif' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 13, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
        <div style={{ fontSize: 26, marginBottom: 4 }}>🪙</div>
        <div style={{ fontWeight: 900, fontSize: 16, color: '#333', marginBottom: 3 }}>How AI Credits Work</div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16, lineHeight: 1.5 }}>Each AI interaction uses a small number of credits. Here's the cost per use:</div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {items.map(f => {
            const meta = FEATURE_META[f.featureName]
            return (
              <div key={f.featureName} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 12, background: '#fafafa', border: '1.5px solid #f0f0f0', flexShrink: 0 }}>
                <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{meta.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#333' }}>{meta.label}</div>
                  {f.description && <div style={{ fontSize: 11, color: '#aaa', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: '#ff6b6b' }}>{f.creditCost} cr</div>
                  <div style={{ fontSize: 10, color: '#ccc' }}>per use</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 14, flexShrink: 0 }}>Credits reset on the 1st of each month</div>
      </div>
    </div>
  )
}

/* ── Quota pill ── */
function QuotaPill({ quota, onInfo }) {
  if (!quota) return null
  const overLimit = quota.used > quota.limit
  const pct = Math.min(quota.used / quota.limit, 1)
  const barColor   = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : '#6bcb77'
  const textColor  = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : 'white'
  const borderColor = pct >= 1 ? 'rgba(255,68,68,0.5)' : pct >= 0.8 ? 'rgba(255,217,61,0.5)' : 'rgba(255,255,255,0.3)'
  const label = overLimit ? '⛔ Over limit' : pct >= 1 ? '🚫 Limit reached' : pct >= 0.8 ? '⚠️ Almost full' : null
  return (
    <div className="quota-pill-desktop" style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}`, borderRadius: 50, padding: '6px 14px', animation: 'glm-fadein 0.5s ease both', zIndex: 10 }}>
      <div style={{ width: 48, height: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: textColor, lineHeight: 1.2 }}>
          {label ? `${label} · ${quota.used}/${quota.limit}` : `${Math.round(pct * 100)}% · ${quota.used}/${quota.limit} cr`}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: textColor, opacity: 0.7, lineHeight: 1.2 }}>
          {quota.usedActual ?? quota.used} used this month
        </span>
      </div>
      <button onClick={e => { e.stopPropagation(); onInfo() }} title="How credits work"
        style={{ width: 20, height: 20, minWidth: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0, padding: 0 }}>
        i
      </button>
    </div>
  )
}

/* ── Unlock modal ── */
function UnlockModal({ child, offline, onClose, onLock, onToggleOffline, onPinChanged }) {
  const pt = THEMES[child.theme] || THEMES.coral
  const [hasPin, setHasPin]           = useState(() => !!localStorage.getItem(`glm_lock_pin_${child.id}`))
  const [showPinForm, setShowPinForm] = useState(false)
  const [pinVal, setPinVal]           = useState('')
  const [pinConfirm, setPinConfirm]   = useState('')
  const [pinError, setPinError]       = useState('')

  function savePin() {
    if (pinVal.length !== 4) { setPinError('Enter a 4-digit PIN'); return }
    if (pinVal !== pinConfirm) { setPinError('PINs do not match'); return }
    localStorage.setItem(`glm_lock_pin_${child.id}`, pinVal)
    setHasPin(true); setShowPinForm(false)
    setPinVal(''); setPinConfirm(''); setPinError('')
    onPinChanged?.(String(child.id), true)
  }

  function clearPin() {
    localStorage.removeItem(`glm_lock_pin_${child.id}`)
    setHasPin(false); setShowPinForm(false)
    setPinVal(''); setPinConfirm(''); setPinError('')
    onPinChanged?.(String(child.id), false)
  }

  const inputStyle = (err) => ({
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: `1.5px solid ${err ? '#e74c3c' : '#eee'}`,
    fontSize: 22, fontWeight: 900, letterSpacing: 14, textAlign: 'center',
    boxSizing: 'border-box', WebkitTextSecurity: 'disc',
    fontFamily: 'Nunito, sans-serif', outline: 'none',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '32px 28px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, minWidth: 30, minHeight: 30, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 14, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
        <div style={{ fontSize: 52, marginBottom: 10 }}>{child.avatarEmoji}</div>
        <div style={{ fontWeight: 900, fontSize: 18, color: pt.primary, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>Hand to {child.name}</div>
        <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6, marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>
          Set AI and lock options before handing the device to {child.name}.
        </div>

        {/* AI toggle row */}
        <div onClick={onToggleOffline}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: pt.primaryLt, borderRadius: 14, padding: '12px 16px', marginBottom: 12, cursor: 'pointer', userSelect: 'none' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#333', fontFamily: 'Nunito, sans-serif' }}>
              {offline ? '✈️' : '🤖'} AI features
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {offline ? 'Taking a break from AI ✈️' : 'AI is ready to help! 🤖'}
            </div>
          </div>
          <div style={{ width: 42, height: 24, borderRadius: 12, background: offline ? '#ddd' : pt.primary, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: offline ? 3 : 21, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
          </div>
        </div>

        {/* PIN row */}
        <div style={{ background: '#fafafa', borderRadius: 14, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPinForm ? 12 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#333', fontFamily: 'Nunito, sans-serif' }}>
                🔐 Lock PIN
              </span>
              {hasPin
                ? <span style={{ fontSize: 11, fontWeight: 800, color: '#27ae60', background: '#e8f8f0', border: '1.5px solid #6bcb77', borderRadius: 50, padding: '2px 10px' }}>Set</span>
                : <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', background: '#f0f0f0', borderRadius: 50, padding: '2px 10px' }}>Not set</span>
              }
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => { setShowPinForm(p => !p); setPinError('') }}
                style={{ fontSize: 11, fontWeight: 700, color: pt.primary, background: 'transparent', border: `1.5px solid ${pt.primary}55`, borderRadius: 50, padding: '3px 10px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                {showPinForm ? 'Cancel' : hasPin ? 'Change' : 'Set PIN'}
              </button>
              {hasPin && !showPinForm && (
                <button type="button" onClick={clearPin}
                  style={{ fontSize: 11, fontWeight: 700, color: '#e55', background: 'transparent', border: '1.5px solid #ffb3b3', borderRadius: 50, padding: '3px 10px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {showPinForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                placeholder="• • • •" autoFocus value={pinVal}
                onChange={e => { setPinVal(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError('') }}
                style={inputStyle(pinError)} />
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                placeholder="Confirm" value={pinConfirm}
                onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError('') }}
                style={inputStyle(pinError)} />
              {pinError && <div style={{ fontSize: 12, color: '#e74c3c', fontWeight: 700, textAlign: 'center' }}>{pinError}</div>}
              <button type="button" onClick={savePin}
                style={{ padding: '10px', borderRadius: 50, border: 'none', background: pt.headerGrad, color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                Save PIN
              </button>
            </div>
          )}
        </div>

        <button onClick={onLock} style={{ width: '100%', background: pt.headerGrad, color: 'white', border: 'none', borderRadius: 50, padding: '13px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', boxShadow: `0 6px 20px ${pt.primary}44` }}>
          🔒 Lock & hand to {child.name}
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   CHILD CAROUSEL CARD — the big focused card
══════════════════════════════════════════════════════ */
function ChildCard({ c, t, onSelect, onEdit, onInsights, animDir, hasPin }) {
  const age = calcAge(c.birthYear)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      animation: animDir > 0 ? 'globe-in-right 0.5s cubic-bezier(0.22,1,0.36,1) both'
                             : 'globe-in-left 0.5s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      {/* ── Avatar ── */}
      <div
        onClick={() => onSelect(c)}
        style={{
          width: 'clamp(140px, 22vw, 180px)',
          height: 'clamp(140px, 22vw, 180px)',
          borderRadius: '50%',
          background: t.headerGrad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(58px, 9vw, 76px)',
          cursor: 'pointer',
          boxShadow: `0 0 0 6px rgba(255,255,255,0.2), 0 0 0 12px rgba(255,255,255,0.08), 0 24px 64px ${t.primary}55`,
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.07) translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1) translateY(0)'}
      >
        <span style={{ lineHeight: 1 }}>{c.avatarEmoji}</span>
      </div>

      {/* ── Name & age ── */}
      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(22px,4vw,30px)', color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.35)', letterSpacing: -0.3 }}>
          {c.name}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 5 }}>
          {c.gender === 'girl' ? '👧' : '👦'} &nbsp;
          {age ? `${age} year${age !== 1 ? 's' : ''} old` : 'Little one'}
          {c.theme && (
            <span style={{ marginLeft: 10, opacity: 0.7 }}>{THEMES[c.theme]?.emoji || '🌈'}</span>
          )}
        </div>
      </div>

      {/* ── PIN status ── */}
      {hasPin
        ? <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 50, padding: '3px 12px', marginBottom: 14 }}>🔐 Lock PIN set</div>
        : <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)', border: '1.5px dashed rgba(255,255,255,0.2)', borderRadius: 50, padding: '3px 12px', marginBottom: 14 }}>○ No lock PIN</div>
      }

      {/* ── Tap to open hint ── */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontStyle: 'italic' }}>
        tap avatar to open
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { icon: '✏️', label: 'Edit',     action: e => { e.stopPropagation(); onEdit(c) } },
          { icon: '📊', label: 'Insights', action: e => { e.stopPropagation(); onInsights(c) } },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.25)',
              padding: '8px 20px',
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.28)'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.18)'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <span>{btn.icon}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Add child slide ── */
function AddChildSlide({ onAdd, animDir }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      animation: animDir > 0 ? 'globe-in-right 0.5s cubic-bezier(0.22,1,0.36,1) both'
                             : 'globe-in-left 0.5s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <div
        onClick={onAdd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 'clamp(140px, 22vw, 180px)',
          height: 'clamp(140px, 22vw, 180px)',
          borderRadius: '50%',
          border: `3px dashed ${hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'}`,
          background: hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.07) translateY(-4px)' : 'scale(1)',
          boxShadow: hovered ? '0 24px 64px rgba(255,255,255,0.12)' : 'none',
        }}
      >
        <span style={{ fontSize: 52, color: hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)', transition: 'color 0.2s', lineHeight: 1 }}>+</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(20px,3.5vw,26px)', color: 'rgba(255,255,255,0.7)' }}>
          Add a child
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>
          Up to 3 profiles per account
        </div>
      </div>

    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function ChildList({ onChildSelected, onLogout, onChildSelectedLocked, onToggleOffline, quota, featureConfig }) {
  const [children, setChildren]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [offlineModes, setOfflineModes] = useState({})
  const [pendingChild, setPendingChild] = useState(null)
  const [showCreditInfo, setShowCreditInfo] = useState(false)
  const [pinMap, setPinMap] = useState(() => {
    const map = {}
    Object.keys(localStorage).filter(k => k.startsWith('glm_lock_pin_')).forEach(k => {
      map[k.replace('glm_lock_pin_', '')] = true
    })
    return map
  })

  // Carousel state
  const [activeIdx, setActiveIdx] = useState(0)
  const [animDir, setAnimDir]     = useState(1)
  const [animKey, setAnimKey]     = useState(0)
  const touchStartX = useRef(null)

  const navigate = useNavigate()

  // Total slides = children + 1 (add new)
  const totalSlides = children.length + 1

  const goTo = useCallback((idx, dir) => {
    setAnimDir(dir)
    setActiveIdx(idx)
    setAnimKey(k => k + 1)
  }, [])

  const prev = useCallback(() => {
    goTo((activeIdx - 1 + totalSlides) % totalSlides, -1)
  }, [activeIdx, totalSlides, goTo])

  const next = useCallback(() => {
    goTo((activeIdx + 1) % totalSlides, 1)
  }, [activeIdx, totalSlides, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  // Load data on mount ([] = runs once per mount; React Router unmounts ChildList on navigation
  // so this naturally re-runs each time the user returns to the child list)
  useEffect(() => {
    childApi.getAll().then(data => {
      setChildren(data)
      const modes = {}
      data.forEach(c => { modes[c.id] = localStorage.getItem(`glm_offline_${c.id}`) === '1' })
      setOfflineModes(modes)
      setLoading(false)
    }).catch(() => setLoading(false))

    // Refresh the quota pill in the header too
    window.__glumbiRefreshQuota?.()

    const openInfo = () => setShowCreditInfo(true)
    window.addEventListener('glumbi:credit-info', openInfo)
    return () => window.removeEventListener('glumbi:credit-info', openInfo)
  }, [])

  function handleToggleOffline(e, c) {
    if (e) e.stopPropagation()
    const next = !offlineModes[c.id]
    localStorage.setItem(`glm_offline_${c.id}`, next ? '1' : '0')
    setOfflineModes(prev => ({ ...prev, [c.id]: next }))
  }

  // Touch swipe
  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (dx > 48)  next()
    if (dx < -48) prev()
    touchStartX.current = null
  }

  // Background — morph between child themes as you slide
  const activeChild = activeIdx < children.length ? children[activeIdx] : null
  const activeTheme = activeChild ? (THEMES[activeChild.theme] || THEMES.coral) : THEMES.coral
  const bgGrad = activeChild ? activeTheme.headerGrad : 'linear-gradient(135deg,#667eea,#764ba2)'

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontFamily: 'Nunito, sans-serif', fontSize: 18, background: CORAL.headerGrad }}>
      ✨ Loading…
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes glm-fadein {
          from { opacity: 0; transform: translateY(24px) scale(0.95) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes globe-in-right {
          from { opacity: 0; transform: perspective(700px) rotateY(35deg) translateX(80px) scale(0.88); }
          to   { opacity: 1; transform: perspective(700px) rotateY(0deg) translateX(0) scale(1); }
        }
        @keyframes globe-in-left {
          from { opacity: 0; transform: perspective(700px) rotateY(-35deg) translateX(-80px) scale(0.88); }
          to   { opacity: 1; transform: perspective(700px) rotateY(0deg) translateX(0) scale(1); }
        }
        .nav-arrow:hover { background: rgba(255,255,255,0.25) !important; transform: scale(1.1); }
        .nav-dot:hover { transform: scale(1.3); }
      `}</style>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          minHeight: 'calc(100vh - 60px)',
          background: bgGrad,
          transition: 'background 0.7s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px 24px',
          fontFamily: 'Nunito, sans-serif',
          position: 'relative', overflow: 'hidden',
        }}>

        {/* Background blobs */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)', top: -150, left: -150, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)', bottom: -120, right: -100, pointerEvents: 'none' }} />

        {/* Quota pill */}
        <QuotaPill quota={quota} onInfo={() => setShowCreditInfo(true)} />

        {children.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ textAlign: 'center', color: 'white', animation: 'glm-fadein 0.5s ease both' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🌟</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>No adventurers yet!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 32 }}>Add your little one to get started with stories and adventures!</p>
            <button onClick={() => navigate('/child/new')}
              style={{ background: 'white', color: '#ff6b6b', border: 'none', borderRadius: 50, padding: '14px 36px', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              + Add Your Child
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'glm-fadein 0.4s ease both' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Glumbi</div>
              <h1 style={{ fontSize: 'clamp(22px, 4.5vw, 34px)', fontWeight: 900, color: 'white', margin: 0, letterSpacing: -0.5 }}>
                Who's playing today? 🎮
              </h1>
            </div>

            {/* ── Carousel row ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,36px)', width: '100%', maxWidth: 560, justifyContent: 'center' }}>

              {/* Left arrow */}
              <button
                className="nav-arrow"
                onClick={prev}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', flexShrink: 0,
                  backdropFilter: 'blur(8px)',
                }}>
                ←
              </button>

              {/* Active slide */}
              <div key={animKey} style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
                {activeIdx < children.length ? (
                  <ChildCard
                    c={children[activeIdx]}
                    t={THEMES[children[activeIdx].theme] || THEMES.coral}
                    hasPin={!!pinMap[String(children[activeIdx].id)]}
                    onSelect={c => {
                      localStorage.setItem(`glm_offline_${c.id}`, '0')
                      setOfflineModes(prev => ({ ...prev, [c.id]: false }))
                      setPendingChild(c)
                    }}
                    onEdit={c => navigate(`/child/${c.id}/edit`)}
                    onInsights={c => navigate(`/child/${c.id}/insights`)}
                    animDir={animDir}
                  />
                ) : (
                  <AddChildSlide onAdd={() => navigate('/child/new')} animDir={animDir} />
                )}
              </div>

              {/* Right arrow */}
              <button
                className="nav-arrow"
                onClick={next}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', flexShrink: 0,
                  backdropFilter: 'blur(8px)',
                }}>
                →
              </button>
            </div>

            {/* ── Dots ── */}
            <div style={{ display: 'flex', gap: 8, marginTop: 36, alignItems: 'center' }}>
              {Array.from({ length: totalSlides }).map((_, i) => {
                const isAdd = i === children.length
                return (
                  <button
                    key={i}
                    className="nav-dot"
                    onClick={() => goTo(i, i > activeIdx ? 1 : -1)}
                    title={isAdd ? 'Add child' : children[i]?.name}
                    style={{
                      width: i === activeIdx ? 28 : 10,
                      height: 10,
                      borderRadius: 50,
                      border: 'none',
                      cursor: 'pointer',
                      background: i === activeIdx
                        ? 'white'
                        : isAdd
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(255,255,255,0.35)',
                      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                      padding: 0,
                    }}
                  />
                )
              })}
            </div>

            {/* ── Swipe hint (mobile) ── */}
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              {totalSlides > 1 ? 'swipe or use ← → keys' : ''}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showCreditInfo && (
        <CreditInfoModal featureConfig={featureConfig} onClose={() => setShowCreditInfo(false)} />
      )}
      {pendingChild && (
        <UnlockModal
          child={pendingChild}
          offline={!!offlineModes[pendingChild.id]}
          onClose={() => setPendingChild(null)}
          onLock={() => { onChildSelectedLocked(pendingChild); setPendingChild(null) }}
          onToggleOffline={() => handleToggleOffline(null, pendingChild)}
          onPinChanged={(childId, hasPin) => setPinMap(prev => ({ ...prev, [childId]: hasPin }))}
        />
      )}
    </>
  )
}
