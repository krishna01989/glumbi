import { useState } from 'react'

const FEATURE_DISPLAY = {
  'story': { label: 'Story', icon: '📖' }, 'activity': { label: 'Activity', icon: '🎮' },
  'curiosity': { label: 'Curiosity', icon: '🔍' }, 'read-quiz': { label: 'Read & Quiz', icon: '📚' },
  'writing-coach': { label: 'Writing Coach', icon: '✍️' }, 'draw': { label: 'What did I draw?', icon: '🎨' },
  'draw-animate': { label: 'Bring to Life', icon: '✨' }, 'draw-guide': { label: 'Draw Guide', icon: '🖌️' },
  'learn-validate': { label: 'Letter Check', icon: '🔤' }, 'learn-word': { label: 'Learn Word', icon: '✏️' },
}

function fmtExpiry(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(d)} ${months[parseInt(m) - 1]}, ${y}`
}

export default function QuotaBadge({ quota, featureConfig = [] }) {
  const [showInfo, setShowInfo] = useState(false)
  if (!quota) return null
  const pct = Math.min(quota.used / quota.limit, 1)
  // Alert states override theme colour; normal state uses theme
  const barColor   = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#f59e0b' : pct >= 0.5 ? '#3b82f6' : '#6bcb77'
  const textColor  = pct >= 1 ? '#cc0033' : pct >= 0.8 ? '#b45309' : pct >= 0.5 ? '#1d4ed8' : '#15803d'
  return (
    <div id="tour-quota" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary-lt)', borderRadius: 50, padding: '5px 12px', cursor: 'pointer' }}
        onClick={() => setShowInfo(v => !v)}>
        <div style={{ width: 60, height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: textColor }}>{quota.used}/{quota.limit} cr</span>
        <span style={{ fontSize: 11, color: 'var(--primary)', opacity: 0.6 }}>ⓘ</span>
      </div>
      {showInfo && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#1e2a3a', borderRadius: 14, padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)', zIndex: 999,
          fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, minWidth: 220,
        }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6, color: 'white' }}>🤖 Monthly AI Credits</div>
          <div>You get <strong style={{ color: '#6bcb77' }}>{quota.limit} credits/month</strong>, shared across all children.</div>
          {featureConfig.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {featureConfig.map(fc => {
                const meta = FEATURE_DISPLAY[fc.featureName]
                if (!meta) return null
                return (
                  <div key={fc.featureName} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{meta.icon} {meta.label}</span>
                    <span style={{ fontWeight: 800, color: fc.creditCost >= 3 ? '#ffd93d' : fc.creditCost >= 2 ? '#74b9ff' : '#6bcb77' }}>{fc.creditCost} cr</span>
                  </div>
                )
              })}
            </div>
          )}
          {pct >= 0.8 && <div style={{ marginTop: 8, color: pct >= 1 ? '#ff6b6b' : '#ffd93d', fontWeight: 700 }}>
            {pct >= 1 ? '🚫 Limit reached — resets on 1st' : '⚠️ Almost at your monthly limit'}
          </div>}
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Resets on the 1st of each month.</div>
          {quota.promoGrants && quota.promoGrants.length > 0 && (() => {
            const today = new Date().toISOString().slice(0, 10)
            const active = quota.promoGrants.filter(g => g.expiresOn >= today && g.usedCredits < g.totalCredits)
            if (active.length === 0) return null
            return (
              <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: '#c4b5fd', marginBottom: 6 }}>🎁 Bonus Credits</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                  Drawn automatically when monthly credits run out.
                </div>
                {active.map(g => {
                  const remaining = g.totalCredits - g.usedCredits
                  const gPct = Math.min(g.usedCredits / g.totalCredits, 1)
                  return (
                    <div key={g.id} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{g.label}</span>
                        <span style={{ color: '#c4b5fd', fontWeight: 800 }}>{remaining} cr left</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${gPct * 100}%`, height: '100%', background: '#9333ea', borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                        expires {fmtExpiry(g.expiresOn)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
          <button onClick={() => setShowInfo(false)} style={{ marginTop: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>Close</button>
        </div>
      )}
    </div>
  )
}
