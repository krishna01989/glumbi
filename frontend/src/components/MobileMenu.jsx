import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function MobileQuotaBar({ quota }) {
  const [showInfo, setShowInfo] = useState(false)
  const pct      = Math.min(quota.used / quota.limit, 1)
  const alertColor = pct >= 1 ? '#ff6b6b' : pct >= 0.8 ? '#ffd93d' : null
  const barColor   = pct >= 1 ? '#ff6b6b' : pct >= 0.8 ? '#ffd93d' : 'rgba(255,255,255,0.8)'
  return (
    <div id="tour-quota" style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 14px', marginBottom: 4, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Monthly AI calls</span>
          <button onClick={() => setShowInfo(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: 0, lineHeight: 1 }}
            title="What counts?">ⓘ</button>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: alertColor || 'rgba(255,255,255,0.9)' }}>{quota.used}/{quota.limit}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: 'width 0.4s ease' }} />
      </div>
      {pct >= 0.8 && (
        <div style={{ fontSize: 10, color: alertColor, marginTop: 4, fontWeight: 700 }}>
          {pct >= 1 ? '🚫 Limit reached — resets on 1st' : '⚠️ Almost at your monthly limit'}
        </div>
      )}
      {showInfo && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#1e2a3a', borderRadius: 12, padding: '12px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 999,
          fontSize: 11, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6, color: 'white' }}>🤖 What counts as an AI call?</div>
          <div>Every time Glumbi asks Claude AI to do something — generate a story, answer a curiosity question, give writing feedback, validate a letter you drew, or identify a word — it uses <strong style={{ color: '#ffd93d' }}>1 call</strong>.</div>
          <div style={{ marginTop: 8 }}>You get <strong style={{ color: '#6bcb77' }}>{quota.limit} calls per month</strong>, shared across all AI features: Stories, Activities, Curiosity, Read &amp; Quiz, My Writing, Draw, and Learn to Write.</div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.5)' }}>Resets on the 1st of each month.</div>
          <button onClick={() => setShowInfo(false)} style={{ marginTop: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>Close</button>
        </div>
      )}
    </div>
  )
}

const ALL_APP_ITEMS = [
  { emoji: '📖', label: 'Stories',        key: 'stories' },
  { emoji: '🎮', label: 'Activities',     key: 'activities' },
  { emoji: '✏️', label: 'Learn to Write',  key: 'learn' },
  { emoji: '🔍', label: 'Curiosity',      key: 'curiosity' },
  { emoji: '🎨', label: 'Draw',           key: 'draw' },
  { emoji: '📝', label: 'Journal',        key: 'journal' },
  { emoji: '📚', label: 'Read & Quiz',    key: 'readquiz' },
  { emoji: '✍️', label: 'My Writing',     key: 'mywriting' },
  { emoji: '🗓️', label: 'Timeline',       key: 'timeline' },
]

const INFO_ITEMS = [
  { emoji: '💡', label: 'About Glumbi',     path: '/about' },
  { emoji: '📬', label: 'Contact Us',       path: '/contact' },
  { emoji: '🔒', label: 'Privacy Policy',   path: '/privacy' },
  { emoji: '⚖️', label: 'Terms of Service', path: '/terms' },
]

export default function MobileMenu({ open, onClose, onLogout, onSwitchChild, child, quota, theme, onTour }) {
  const navigate = useNavigate()

  function go(path) {
    navigate(path)
    onClose()
  }

  const enabledKeys = child?.enabledFeatures
    ? (() => { try { return JSON.parse(child.enabledFeatures) } catch { return null } })()
    : null

  const appItems = ALL_APP_ITEMS
    .filter(i => !enabledKeys || enabledKeys.includes(i.key))
    .map(i => ({ ...i, path: `/child/${child?.id}/${i.key}` }))

  return (
    <>
      {open && (
        <div onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 280, background: theme?.headerGrad || 'linear-gradient(135deg,#ff6b6b,#ff8e53)', zIndex: 201,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        fontFamily: 'Nunito, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/icon.svg" alt="Glumbi" style={{ width: 28, height: 28 }} />
            <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: 'white' }}>Glumbi</span>
          </div>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {[{ heading: 'App', items: appItems }, { heading: 'Info', items: INFO_ITEMS }].map(section => (
            <div key={section.heading}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, padding: '16px 20px 6px' }}>
                {section.heading}
              </div>
              {section.items.map(item => (
                <button key={item.path} onClick={() => go(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    width: '100%', padding: '12px 20px', background: 'none', border: 'none',
                    fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {quota && <MobileQuotaBar quota={quota} />}
          <button id="tour-mobile-switch" onClick={() => { onSwitchChild(); onClose() }}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🔀 Switch Child
          </button>
          <button onClick={() => { onClose(); setTimeout(onTour, 300) }}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            ❓ Take a Tour
          </button>
          <button onClick={() => go('/profile')}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            👤 My Account
          </button>
          <button onClick={onLogout}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.3)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🚪 Sign Out
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([l, p]) => (
              <button key={p} onClick={() => go(p)}
                style={{ background: 'none', border: 'none', fontSize: 11, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
