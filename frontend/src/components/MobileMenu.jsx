import { useNavigate, useLocation } from 'react-router-dom'

const NAV_GROUPS = [
  {
    id: 'stories', label: 'Stories', emoji: '📖',
    items: [
      { path: 'stories',   label: 'Stories',     emoji: '📖' },
      { path: 'mywriting', label: 'My Writing',  emoji: '✍️' },
      { path: 'readquiz',  label: 'Read & Quiz', emoji: '📚' },
    ]
  },
  {
    id: 'play', label: 'Play', emoji: '🎮',
    items: [
      { path: 'memory',     label: 'Memory',     emoji: '🧠' },
      { path: 'activities', label: 'Activities', emoji: '🎯' },
      { path: 'trace',      label: 'Trace',      emoji: '🐾' },
    ]
  },
  {
    id: 'curiosity', label: 'Curiosity', emoji: '🔍',
    items: [
      { path: 'curiosity', label: 'Ask Anything', emoji: '🔍' },
      { path: 'riddle',    label: 'Riddle',       emoji: '🧩' },
    ]
  },
  {
    id: 'create', label: 'Create', emoji: '🎨',
    items: [
      { path: 'draw',  label: 'Draw',        emoji: '🎨' },
      { path: 'learn', label: 'Learn to Write', emoji: '✏️' },
    ]
  },
  {
    id: 'parent', label: 'Parent Corner', emoji: '👪', parentOnly: true,
    items: [
      { path: 'journal',  label: 'Journal',  emoji: '📝', parentOnly: true },
      { path: 'timeline', label: 'Timeline', emoji: '🗓️', parentOnly: true },
    ]
  },
]

export default function MobileMenu({ open, onClose, onLogout, onSwitchChild, child, theme, onTour, wotd, childLocked, onUnlock }) {
  const navigate = useNavigate()
  const location = useLocation()

  function go(path) {
    navigate(path)
    onClose()
  }

  const enabledKeys = child?.enabledFeatures
    ? (() => { try { return JSON.parse(child.enabledFeatures) } catch { return null } })()
    : null

  const groups = NAV_GROUPS
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (enabledKeys && !enabledKeys.includes(item.path)) return false
        if (childLocked && item.parentOnly) return false
        return true
      })
    }))
    .filter(group => {
      if (childLocked && group.parentOnly) return false
      return group.items.length > 0
    })

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
            style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: 0, flexShrink: 0 }}>
            ✕
          </button>
        </div>

        {/* Word of Day */}
        {wotd && childLocked && (
          <div style={{ margin: '0 16px 8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>🧠 Word of the Day</div>
            <button onClick={() => go(`/child/${child?.id}/memory?tab=wordofday`)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: 10, padding: 0 }}>
              <span style={{ fontSize: 28 }}>{wotd.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'white', fontFamily: 'Nunito, sans-serif' }}>{wotd.word}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wotd.meaning}</div>
              </div>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>›</span>
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ tab: 'flashcards', label: '📇 Flashcards' }, { tab: 'match', label: '🎴 Match' }].map(({ tab, label }) => (
                <button key={tab} onClick={() => go(`/child/${child?.id}/memory?tab=${tab}`)}
                  style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {groups.map((group, gi) => {
            const isSingleItem = group.items.length === 1
            const currentPath = location.pathname

            return (
              <div key={group.id}>
                {/* Divider before Parent Corner */}
                {group.parentOnly && (
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '8px 20px 10px' }} />
                )}

                {/* Group label */}
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1, padding: gi === 0 ? '8px 20px 4px' : '4px 20px' }}>
                  {group.emoji} {group.label}
                </div>

                {/* Items */}
                {group.items.map(item => {
                  const path = `/child/${child?.id}/${item.path}`
                  const active = currentPath === path
                  return (
                    <button key={item.path} onClick={() => go(path)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        width: '100%', padding: '10px 20px 10px 28px', border: 'none',
                        fontSize: 14, fontWeight: active ? 900 : 700,
                        color: 'white', cursor: 'pointer', textAlign: 'left',
                        background: active ? 'rgba(255,255,255,0.25)' : 'none',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none' }}>
                      <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{item.emoji}</span>
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!childLocked && <button id="tour-mobile-switch" onClick={() => { onSwitchChild(); onClose() }}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🔀 Switch Child
          </button>}
          {!childLocked && <button onClick={() => { onClose(); setTimeout(onTour, 300) }}
            style={{ padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🗺️ Take a Tour
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
        </div>
      </div>
    </>
  )
}
