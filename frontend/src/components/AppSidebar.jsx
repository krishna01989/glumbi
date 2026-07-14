import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AppSidebar({
  child, isTV, collapsed, setCollapsed,
  GROUPS, openGroupId, setOpenGroupId, currentSegment,
  sidebarWotd, childLocked, navigate,
}) {
  const theme = useTheme()
  const SW = isTV ? 260 : collapsed ? 64 : 220

  return (
    <aside className="app-sidebar" style={{
      width: SW, flexShrink: 0,
      background: theme.headerGrad,
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease',
      boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
      position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '24px 20px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <img src="/icon.svg" alt="Glumbi" style={{ width: isTV ? 40 : 32, height: isTV ? 40 : 32, flexShrink: 0 }} />
        {!collapsed && (
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: isTV ? 24 : 18, color: 'white', lineHeight: 1 }}>Glumbi</div>
            <div style={{ fontSize: isTV ? 12 : 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Where little stories grow ✨</div>
          </div>
        )}
      </div>

      {/* Word of Day widget — child locked mode only */}
      {sidebarWotd && !collapsed && childLocked && (() => {
        try {
          const enabled = child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null
          if (enabled && !enabled.includes('memory')) return null
        } catch {}
        return (
          <div style={{ margin: '0 12px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>🧠 Word of the Day</div>
            <div onClick={() => navigate(`/child/${child.id}/memory?tab=wordofday`)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 22 }}>{sidebarWotd.emoji}</span>
              <div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 900, color: 'white' }}>{sidebarWotd.word}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>{sidebarWotd.meaning?.slice(0, 40)}{sidebarWotd.meaning?.length > 40 ? '…' : ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ tab: 'flashcards', label: '📇 Cards' }, { tab: 'match', label: '🎴 Match' }].map(({ tab, label }) => (
                <button key={tab} onClick={() => navigate(`/child/${child.id}/memory?tab=${tab}`)}
                  style={{ flex: 1, padding: '5px 0', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: collapsed ? '0 8px' : '0 10px', overflowY: 'auto' }}>
        {GROUPS.map((group, gi) => {
          const isOpen = openGroupId === group.id
          const groupActive = group.items.some(i => i.path === currentSegment)
          const isSingleItem = group.items.length === 1

          if (collapsed) {
            return (
              <button key={group.id}
                onClick={() => {
                  if (isSingleItem) navigate(`/child/${child.id}/${group.items[0].path}`)
                  else { setCollapsed(false); setOpenGroupId(group.id) }
                }}
                title={group.label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '11px 0', border: 'none', borderRadius: 50, cursor: 'pointer',
                  background: groupActive ? 'rgba(255,255,255,0.92)' : 'transparent',
                  color: groupActive ? theme.primary : 'white', fontSize: isTV ? 26 : 22,
                }}>
                {group.emoji}
              </button>
            )
          }

          return (
            <div key={group.id} style={{ marginBottom: gi < GROUPS.length - 1 ? 2 : 0 }}>
              {group.parentOnly && (
                <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '6px 4px 8px' }} />
              )}

              {isSingleItem ? (
                <NavLink to={`/child/${child.id}/${group.items[0].path}`} id={group.items[0].id}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: isTV ? '13px 13px' : '10px 9px',
                    borderRadius: 50, textDecoration: 'none',
                    fontWeight: 800, fontSize: isTV ? 16 : 13,
                    background: isActive ? 'rgba(255,255,255,0.92)' : 'transparent',
                    color: isActive ? theme.primary : 'white',
                    transition: 'background 0.15s',
                  })}>
                  <span style={{ fontSize: isTV ? 22 : 18 }}>{group.emoji}</span>
                  <span style={{ flex: 1 }}>{group.label}</span>
                </NavLink>
              ) : (
                <button onClick={() => setOpenGroupId(isOpen ? null : group.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: isTV ? '13px 13px' : '10px 9px',
                    border: 'none', borderRadius: 50, cursor: 'pointer',
                    background: groupActive && !isOpen ? 'rgba(255,255,255,0.92)' : 'transparent',
                    color: groupActive && !isOpen ? theme.primary : 'white',
                    fontWeight: 800, fontSize: isTV ? 16 : 13,
                  }}>
                  <span style={{ fontSize: isTV ? 22 : 18 }}>{group.emoji}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.6, transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
                </button>
              )}

              {!isSingleItem && isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingLeft: 8, marginTop: 2 }}>
                  {group.items.map(item => (
                    <NavLink key={item.path} to={`/child/${child.id}/${item.path}`} id={item.id}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: isTV ? '10px 13px' : '8px 9px',
                        borderRadius: 50, textDecoration: 'none',
                        fontWeight: isActive ? 800 : 600, fontSize: isTV ? 14 : 13,
                        background: isActive ? 'rgba(255,255,255,0.92)' : 'transparent',
                        color: isActive ? theme.primary : 'rgba(255,255,255,0.8)',
                        transition: 'background 0.15s',
                      })}>
                      <span style={{ fontSize: isTV ? 18 : 15 }}>{item.emoji}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Collapse toggle (not on TV) */}
      {!isTV && (
        <button onClick={() => setCollapsed(c => !c)}
          style={{
            position: 'absolute', top: 24, right: -14,
            width: 28, height: 28, minWidth: 28, borderRadius: '50%',
            background: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            fontSize: 12, color: theme.primary, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, flexShrink: 0, zIndex: 20,
          }}>
          {collapsed ? '›' : '‹'}
        </button>
      )}
    </aside>
  )
}
