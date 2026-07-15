import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi, userApi, analyticsApi } from '../api/client'
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
  const pct = Math.min(quota.used / quota.limit, 1)
  const barColor   = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : '#6bcb77'
  const textColor  = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : 'white'
  const borderColor = pct >= 1 ? 'rgba(255,68,68,0.5)' : pct >= 0.8 ? 'rgba(255,217,61,0.5)' : 'rgba(255,255,255,0.3)'
  const label = pct >= 1 ? '🚫 Limit reached' : pct >= 0.8 ? '⚠️ Almost full' : null
  return (
    <div className="quota-pill-desktop" style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}`, borderRadius: 50, padding: '6px 14px', animation: 'glm-fadein 0.5s ease both', zIndex: 10 }}>
      <div style={{ width: 48, height: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: textColor }}>
        {label ? `${label} · ${quota.used}/${quota.limit}` : `${Math.round(pct * 100)}% · ${quota.used}/${quota.limit} cr`}
      </span>
      <button onClick={e => { e.stopPropagation(); onInfo() }} title="How credits work"
        style={{ width: 20, height: 20, minWidth: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0, padding: 0 }}>
        i
      </button>
    </div>
  )
}

/* ── Unlock modal ── */
function UnlockModal({ child, onClose, onLock, onParent }) {
  const pt = THEMES[child.theme] || THEMES.coral
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '32px 28px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, minWidth: 30, minHeight: 30, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 14, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
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

/* ── Credit modal ── */
function CreditModal({ c, t, stats, onClose }) {
  const activeFeatures = stats.features.filter(f => f.credits > 0)
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 24, padding: '32px 28px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, minWidth: 30, minHeight: 30, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 14, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
        <div style={{ fontSize: 52, marginBottom: 10 }}>{c.avatarEmoji}</div>
        <div style={{ fontWeight: 900, fontSize: 18, color: t.primary, marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>{c.name}</div>
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>AI credits used this month</div>
        {activeFeatures.length === 0 ? (
          <div style={{ color: '#bbb', fontSize: 14, padding: '12px 0 20px' }}>✨ No AI usage this month</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, textAlign: 'left', maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
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

/* ══════════════════════════════════════════════════════
   CHILD CAROUSEL CARD — the big focused card
══════════════════════════════════════════════════════ */
function ChildCard({ c, t, offline, breakdown, onSelect, onLock, onEdit, onToggleOffline, onShowCredit, onShowActivity, animDir }) {
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

        {/* Offline badge */}
        {offline && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: '#555', borderRadius: '50%',
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, border: '2px solid white',
          }}>✈️</div>
        )}
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

      {/* ── Tap to open hint ── */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontStyle: 'italic' }}>
        tap avatar to open
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '🔒', label: 'Lock', action: e => { e.stopPropagation(); onLock(c) } },
          { icon: offline ? '✈️' : '🤖', label: offline ? 'AI off' : 'AI on', action: e => { e.stopPropagation(); onToggleOffline(e, c) } },
          { icon: '✏️', label: 'Edit', action: e => { e.stopPropagation(); onEdit(c) } },
          { icon: '📊', label: 'Credits', action: e => { e.stopPropagation(); onShowCredit(c) } },
          { icon: '📈', label: 'Activity', action: e => { e.stopPropagation(); onShowActivity(c) } },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.25)',
              padding: '8px 16px',
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

const ACTIVITY_FEATURES = {
  stories:     { label: 'Stories',        emoji: '📖' },
  draw:        { label: 'Draw',           emoji: '🎨' },
  journal:     { label: 'Journal',        emoji: '📓' },
  curiosity:   { label: 'Curiosity',      emoji: '🔍' },
  readquiz:    { label: 'Read & Quiz',    emoji: '📚' },
  activities:  { label: 'Activities',     emoji: '🎮' },
  mywriting:   { label: 'My Writing',     emoji: '✍️' },
  riddle:      { label: 'Riddles',        emoji: '🎯' },
  maze:        { label: 'Maze',           emoji: '🌀' },
  learn:       { label: 'Learn',          emoji: '✏️' },
  flashcards:  { label: 'Flashcards',     emoji: '📇' },
  wordofday:   { label: 'Word of Day',    emoji: '🌟' },
  memorymatch: { label: 'Memory Match',   emoji: '🧠' },
}

function fmtDuration(sec) {
  if (!sec || sec < 60) return sec > 0 ? `${sec}s` : null
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

/* ── Child Activity Modal ── */
function ActivityModal({ child, t, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays]       = useState(30)
  const [featureMode, setFeatureMode] = useState('count') // 'count' | 'time'
  const [activeDailyBar, setActiveDailyBar] = useState(null)  // { label, value } for daily chart tap
  const [activeHourBar, setActiveHourBar]   = useState(null)  // { label, value } for hourly chart tap

  useEffect(() => {
    setLoading(true)
    analyticsApi.getChildAnalytics(child.id, days)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [child.id, days])

  const totalEvents   = data?.totalEvents ?? 0
  const totalSessions = data?.totalSessions ?? 0
  const recentDays   = data?.dailyActivity?.slice(-days).filter(d => d.count > 0).length ?? 0
  const totalSec     = data?.totalEngagementSeconds ?? 0
  const peakHour     = data?.hourlyActivity
    ? data.hourlyActivity.reduce((best, v, i) => v > data.hourlyActivity[best] ? i : best, 0)
    : null
  const fmtHour = h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
  const lastActiveDate = data?.dailyActivity
    ? (() => {
        const last = [...data.dailyActivity].reverse().find(d => d.count > 0)
        if (!last) return null
        const d = new Date(last.date)
        const today = new Date(); today.setHours(0,0,0,0)
        const diff = Math.round((today - d) / 86400000)
        if (diff === 0) return 'today'
        if (diff === 1) return 'yesterday'
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      })()
    : null

  // Merge count + duration per feature, sorted by selected mode
  const allFeatures = data
    ? Array.from(new Set([
        ...Object.keys(data.featureBreakdown ?? {}),
        ...Object.keys(data.durationByFeature ?? {}),
      ])).map(f => ({
        feature: f,
        count: data.featureBreakdown?.[f] ?? 0,
        sec:   data.durationByFeature?.[f] ?? 0,
      })).sort((a, b) => featureMode === 'time' ? b.sec - a.sec : b.count - a.count)
    : []
  const featureMax = allFeatures.length > 0
    ? (featureMode === 'time' ? allFeatures[0].sec : allFeatures[0].count)
    : 1

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 24, padding: '24px 20px', maxWidth: 420, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.35)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both', fontFamily: 'Nunito, sans-serif', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 13, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>{child.avatarEmoji}</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: t.primary, lineHeight: 1.2 }}>{child.name}'s Activity</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Learning insights for parents</div>
          </div>
        </div>

        {/* Range pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              style={{ padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', background: days === d ? t.primary : '#f0f0f0', color: days === d ? 'white' : '#777', transition: 'all 0.15s' }}>
              {d === 7 ? 'Last week' : d === 30 ? 'Last month' : 'Last 3 months'}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa', fontSize: 13 }}>Loading…</div>}
        {!loading && !data && <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb', fontSize: 13 }}>No activity data yet.</div>}

        {!loading && data && (
          <>
            {/* 4-stat row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Active days',    value: recentDays,                   icon: '📅', sub: `of ${days}` },
                { label: 'Sessions',       value: totalSessions,                icon: '⚡', sub: 'play sessions' },
                { label: 'Screen time',    value: fmtDuration(totalSec) ?? '—', icon: '⏱️', sub: 'engaged time' },
                { label: 'Streak',         value: `${data.currentStreak ?? 0}d`,icon: '🔥', sub: lastActiveDate ? `last active: ${lastActiveDate}` : `best: ${data.longestStreak ?? 0}d` },
              ].map(s => (
                <div key={s.label} style={{ background: t.primaryLt, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: t.primary, lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: '#bbb' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily activity bar chart */}
            {data.dailyActivity?.length > 0 && (() => {
              const recent = data.dailyActivity.slice(-days)
              const maxVal = Math.max(...recent.map(d => d.count), 1)
              return (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#555', marginBottom: 8 }}>Daily sessions</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: days > 30 ? 1 : 2, height: 52, background: '#fafafa', borderRadius: 10, padding: '6px 8px', boxSizing: 'border-box' }}>
                    {recent.map((d, i) => (
                      <div key={i}
                        onClick={() => d.count > 0 && setActiveDailyBar(b => b?.label === d.date ? null : { label: d.date, value: `${d.count} session${d.count !== 1 ? 's' : ''}` })}
                        style={{ flex: 1, background: d.count > 0 ? t.primary : '#e8e8e8', borderRadius: 3, height: `${Math.max(d.count / maxVal * 100, d.count > 0 ? 12 : 4)}%`, opacity: d.count > 0 ? 0.8 + (d.count / maxVal) * 0.2 : 0.3, transition: 'height 0.3s ease', cursor: d.count > 0 ? 'pointer' : 'default' }} />
                    ))}
                  </div>
                  {activeDailyBar && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: 4, background: t.primaryLt || '#f0f0ff', borderRadius: 8, padding: '6px 10px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.primary }}>{activeDailyBar.label} — {activeDailyBar.value}</span>
                      <button onClick={() => setActiveDailyBar(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#ccc', marginTop: 3 }}>
                    <span>{recent[0]?.date?.slice(5)}</span>
                    <span>{recent[recent.length - 1]?.date?.slice(5)}</span>
                  </div>
                </div>
              )
            })()}

            {/* Feature breakdown with count/time toggle */}
            {allFeatures.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#555' }}>Top features</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['count', 'time'].map(m => (
                      <button key={m} onClick={() => setFeatureMode(m)}
                        style={{ padding: '3px 10px', borderRadius: 50, fontSize: 10, fontWeight: 800, border: 'none', cursor: 'pointer', background: featureMode === m ? t.primary : '#f0f0f0', color: featureMode === m ? 'white' : '#999' }}>
                        {m === 'count' ? '# Sessions' : '⏱ Time'}
                      </button>
                    ))}
                  </div>
                </div>
                {allFeatures.map(({ feature, count, sec }) => {
                  const meta     = ACTIVITY_FEATURES[feature] || { label: feature, emoji: '🎮' }
                  const val      = featureMode === 'time' ? sec : count
                  const pct      = Math.round((val / featureMax) * 100)
                  const label    = featureMode === 'time' ? (fmtDuration(sec) ?? '—') : `${count}×`
                  const sub      = featureMode === 'time' ? `${count} sessions` : (fmtDuration(sec) ? fmtDuration(sec) : null)
                  const accuracy    = data?.accuracyByFeature?.[feature]
                  const completions = data?.completionsByFeature?.[feature]
                  const flipEff     = feature === 'memorymatch' && data?.flipEfficiency > 0 ? data.flipEfficiency : null
                  // Feature-specific insight chips
                  const extraChips = []
                  if (feature === 'stories' && data?.storiesSimilarViewed > 0)
                    extraChips.push({ key: 'sim', icon: '🔗', text: `${data.storiesSimilarViewed} similar explored`, color: '#0ea5e9', bg: '#f0f9ff' })
                  if (feature === 'maze' && (data?.mazeGaveUpCount > 0 || data?.mazeAvgWallHits > 0))
                    extraChips.push({ key: 'maze', icon: '🧱', text: `${data.mazeGaveUpCount ?? 0} gave up · avg ${data.mazeAvgWallHits ?? 0} wall hits`, color: '#f97316', bg: '#fff7ed' })
                  if (feature === 'riddle' && data?.riddleHints > 0)
                    extraChips.push({ key: 'hints', icon: '💡', text: `Used ${data.riddleHints} hint${data.riddleHints !== 1 ? 's' : ''}`, color: '#f59e0b', bg: '#fffbeb' })
                  if (feature === 'mywriting' && data?.mywritingAvgWordCount > 0)
                    extraChips.push({ key: 'words', icon: '✍️', text: `avg ${data.mywritingAvgWordCount} words/submission`, color: '#10b981', bg: '#f0fdf4' })
                  if (feature === 'memorymatch' && data?.topMemoryMatchTheme)
                    extraChips.push({ key: 'theme', icon: '⭐', text: `Fav theme: ${data.topMemoryMatchTheme}`, color: '#8b5cf6', bg: '#faf5ff' })
                  return (
                    <div key={feature} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 15 }}>{meta.emoji}</span>
                          {meta.label}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 900, color: t.primary }}>{label}</span>
                          {sub && <span style={{ color: '#ccc', fontSize: 10 }}>{sub}</span>}
                        </span>
                      </div>
                      <div style={{ background: '#f0f0f0', borderRadius: 6, height: 7, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: t.primary, height: '100%', borderRadius: 6, opacity: 0.75, transition: 'width 0.4s ease' }} />
                      </div>
                      {/* Performance + insight chips */}
                      {(accuracy || completions || flipEff || extraChips.length > 0) && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                          {accuracy && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: accuracy.rate >= 70 ? '#22c55e' : accuracy.rate >= 40 ? '#f59e0b' : '#ef4444',
                              background: accuracy.rate >= 70 ? '#f0fdf4' : accuracy.rate >= 40 ? '#fffbeb' : '#fef2f2',
                              borderRadius: 50, padding: '2px 8px' }}>
                              ✓ {accuracy.rate}% accurate
                            </span>
                          )}
                          {completions && count > 0 && feature !== 'memorymatch' && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', background: '#f0f0ff', borderRadius: 50, padding: '2px 8px' }}>
                              🏁 {completions}/{count} completed
                            </span>
                          )}
                          {feature === 'memorymatch' && completions > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', background: '#f0f0ff', borderRadius: 50, padding: '2px 8px' }}>
                              🏁 {completions} games played
                            </span>
                          )}
                          {flipEff && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', background: '#faf5ff', borderRadius: 50, padding: '2px 8px' }}>
                              🃏 avg {flipEff} flips/game
                            </span>
                          )}
                          {extraChips.map(c => (
                            <span key={c.key} style={{ fontSize: 10, fontWeight: 700, color: c.color, background: c.bg, borderRadius: 50, padding: '2px 8px' }}>
                              {c.icon} {c.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Hourly activity — dot strip */}
            {data.hourlyActivity?.length === 24 && totalEvents > 0 && (() => {
              const max = Math.max(...data.hourlyActivity, 1)
              return (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#555', marginBottom: 8 }}>
                    When is {child.name} most active?
                  </div>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 36, background: '#fafafa', borderRadius: 10, padding: '4px 6px', boxSizing: 'border-box' }}>
                    {data.hourlyActivity.map((v, h) => (
                      <div key={h}
                        onClick={() => v > 0 && setActiveHourBar(b => b?.label === fmtHour(h) ? null : { label: fmtHour(h), value: `${v} session${v !== 1 ? 's' : ''}` })}
                        style={{ flex: 1, background: v > 0 ? t.primary : '#e8e8e8', borderRadius: 3, height: `${Math.max(v / max * 100, v > 0 ? 12 : 5)}%`, opacity: v > 0 ? 0.6 + (v / max) * 0.4 : 0.3, cursor: v > 0 ? 'pointer' : 'default' }} />
                    ))}
                  </div>
                  {activeHourBar && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: 4, background: t.primaryLt || '#f0f0ff', borderRadius: 8, padding: '6px 10px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.primary }}>{activeHourBar.label} — {activeHourBar.value}</span>
                      <button onClick={() => setActiveHourBar(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#ccc', marginTop: 3 }}>
                    <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
                  </div>
                  {peakHour !== null && (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#888', textAlign: 'center' }}>
                      Peak time: <strong style={{ color: t.primary }}>{fmtHour(peakHour)}</strong>
                      {' · '}AI credits this period: <strong style={{ color: t.primary }}>{data.creditsUsedInPeriod ?? 0} 🪙</strong>
                    </div>
                  )}
                </div>
              )
            })()}

            {totalEvents === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#bbb', fontSize: 13 }}>✨ No activity recorded in this period.</div>
            )}
          </>
        )}
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
  const [creditChild, setCreditChild]  = useState(null)
  const [activityChild, setActivityChild] = useState(null)
  const [showCreditInfo, setShowCreditInfo] = useState(false)
  const [breakdown, setBreakdown]     = useState({})

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

    userApi.creditBreakdown().then(data => {
      const map = {}
      data.children.forEach(c => { map[c.childId] = c })
      setBreakdown(map)
    }).catch(() => {})

    // Refresh the quota pill in the header too
    window.__glumbiRefreshQuota?.()

    const openInfo = () => setShowCreditInfo(true)
    window.addEventListener('glumbi:credit-info', openInfo)
    return () => window.removeEventListener('glumbi:credit-info', openInfo)
  }, [])

  function handleToggleOffline(e, c) {
    e.stopPropagation()
    const next = !offlineModes[c.id]
    localStorage.setItem(`glm_offline_${c.id}`, next ? '1' : '0')
    setOfflineModes(prev => ({ ...prev, [c.id]: next }))
    if (onToggleOffline) onToggleOffline(c.id)
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
                    offline={offlineModes[children[activeIdx].id]}
                    breakdown={breakdown}
                    onSelect={setPendingChild}
                    onLock={onChildSelectedLocked}
                    onEdit={c => navigate(`/child/${c.id}/edit`)}
                    onToggleOffline={handleToggleOffline}
                    onShowCredit={setCreditChild}
                    onShowActivity={setActivityChild}
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
      {creditChild && (
        <CreditModal
          c={creditChild}
          t={THEMES[creditChild.theme] || THEMES.coral}
          stats={breakdown[creditChild.id] || { features: [], totalCredits: 0 }}
          onClose={() => setCreditChild(null)}
        />
      )}
      {activityChild && (
        <ActivityModal
          child={activityChild}
          t={THEMES[activityChild.theme] || THEMES.coral}
          onClose={() => setActivityChild(null)}
        />
      )}
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
