import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

export default function MobileMenu({ open, onClose, onLogout, child, onTour, wotd, childLocked, onUnlock }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  function go(path) {
    navigate(path)
    onClose()
  }

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

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {<button onClick={() => { onClose(); setTimeout(onTour, 300) }}
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
