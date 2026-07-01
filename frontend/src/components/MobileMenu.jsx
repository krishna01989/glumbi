import { useNavigate } from 'react-router-dom'

const ALL_APP_ITEMS = [
  { emoji: '📖', label: 'Stories',     key: 'stories' },
  { emoji: '🎮', label: 'Activities',  key: 'activities' },
  { emoji: '🔍', label: 'Curiosity',   key: 'curiosity' },
  { emoji: '🎨', label: 'Draw',        key: 'draw' },
  { emoji: '📝', label: 'Journal',     key: 'journal' },
  { emoji: '📚', label: 'Read & Quiz', key: 'readquiz' },
  { emoji: '✍️', label: 'My Writing',  key: 'mywriting' },
  { emoji: '🗓️', label: 'Timeline',    key: 'timeline' },
]

const INFO_ITEMS = [
  { emoji: '💡', label: 'About Glumbi',     path: '/about' },
  { emoji: '📬', label: 'Contact Us',       path: '/contact' },
  { emoji: '🔒', label: 'Privacy Policy',   path: '/privacy' },
  { emoji: '⚖️', label: 'Terms of Service', path: '/terms' },
]

export default function MobileMenu({ open, onClose, onLogout, child }) {
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
        width: 280, background: 'white', zIndex: 201,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        fontFamily: 'Nunito, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>📖</span>
            <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: '#ff6b6b' }}>Glumbi</span>
          </div>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {[{ heading: 'App', items: appItems }, { heading: 'Info', items: INFO_ITEMS }].map(section => (
            <div key={section.heading}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, padding: '16px 20px 6px' }}>
                {section.heading}
              </div>
              {section.items.map(item => (
                <button key={item.path} onClick={() => go(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    width: '100%', padding: '12px 20px', background: 'none', border: 'none',
                    fontSize: 15, fontWeight: 700, color: '#333', cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff9f0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onLogout}
            style={{ padding: '11px', borderRadius: 50, background: '#fff0f0', color: '#ff6b6b', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🚪 Sign Out
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([l, p]) => (
              <button key={p} onClick={() => go(p)}
                style={{ background: 'none', border: 'none', fontSize: 11, color: '#bbb', cursor: 'pointer', padding: 0 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
