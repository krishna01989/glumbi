import { useNavigate } from 'react-router-dom'


const ALL_APP_ITEMS = [
  { emoji: '📖', label: 'Stories',        key: 'stories' },
  { emoji: '🎮', label: 'Activities',     key: 'activities' },
  { emoji: '✏️', label: 'Learn to Write',  key: 'learn' },
  { emoji: '🔍', label: 'Curiosity',      key: 'curiosity' },
  { emoji: '🎨', label: 'Draw',           key: 'draw' },
  { emoji: '📝', label: 'Journal',        key: 'journal',   parentOnly: true },
  { emoji: '📚', label: 'Read & Quiz',    key: 'readquiz' },
  { emoji: '✍️', label: 'My Writing',     key: 'mywriting' },
  { emoji: '🧠', label: 'Memory Play',    key: 'memory' },
  { emoji: '🗓️', label: 'Timeline',       key: 'timeline',  parentOnly: true },
]

const INFO_ITEMS = [
  { emoji: '💡', label: 'About Glumbi',     path: '/about' },
  { emoji: '📬', label: 'Contact Us',       path: '/contact' },
  { emoji: '🔒', label: 'Privacy Policy',   path: '/privacy' },
  { emoji: '⚖️', label: 'Terms of Service', path: '/terms' },
]

export default function MobileMenu({ open, onClose, onLogout, onSwitchChild, child, theme, onTour, wotd, childLocked, onUnlock }) {
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
    .filter(i => !childLocked || !i.parentOnly)
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
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: 'white' }}>Glumbi</span>
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
          {wotd && (
            <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>🧠 Memory Play</div>
              <button onClick={() => go(`/child/${child?.id}/memory?tab=wordofday`)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: 8, padding: 0 }}>
                <span style={{ fontSize: 24 }}>{wotd.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Word of the Day</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'white', fontFamily: 'Nunito, sans-serif' }}>{wotd.word}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wotd.meaning}</div>
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>›</span>
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { tab: 'flashcards', label: '📇 Flashcards' },
                  { tab: 'match',      label: '🎴 Match' },
                ].map(({ tab, label }) => (
                  <button key={tab} onClick={() => go(`/child/${child?.id}/memory?tab=${tab}`)}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {!childLocked && <button id="tour-mobile-switch" onClick={() => { onSwitchChild(); onClose() }}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🔀 Switch Child
          </button>}
          {!childLocked && <button onClick={() => { onClose(); setTimeout(onTour, 300) }}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🗺️ Take a Tour
          </button>}
          {!childLocked && <button onClick={() => go('/profile')}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            👤 My Account
          </button>}
          {!childLocked && <button onClick={onLogout}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.3)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🚪 Sign Out
          </button>}
          {childLocked && (
            <button onClick={() => { onClose(); setTimeout(onUnlock, 100) }}
              style={{ padding: '11px', borderRadius: 50, fontWeight: 800, fontSize: 14, cursor: 'pointer',
                background: 'rgba(255,255,255,0.25)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)' }}>
              🔒 Parent access
            </button>
          )}
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
