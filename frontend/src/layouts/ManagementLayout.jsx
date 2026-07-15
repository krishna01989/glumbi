import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'
import AppFooter from '../components/AppFooter'

export default function ManagementLayout({ children, lockModalEl, quota, handleLogout }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mgmtMenuOpen, setMgmtMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa', color: '#3d3d3d' }}>
      {lockModalEl}

      {/* ── Sticky header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'white', borderBottom: '1px solid #f0f0f0',
        padding: '0 clamp(16px,4vw,40px)', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', fontFamily: 'Nunito, sans-serif',
      }}>
        <div onClick={() => navigate('/child')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <img src="/icon.svg" alt="Glumbi" style={{ width: 32, height: 32 }} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 20, color: '#ff6b6b' }}>Glumbi</span>
        </div>

        {/* Desktop buttons */}
        <div className="mgmt-desktop-btns" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button id="tour-help-btn" onClick={() => navigate('/help')}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Help">💡</button>
          <span id="tour-notifications"><NotificationBell /></span>
          <button onClick={() => navigate('/profile')}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="My Account">👤</button>
          <button onClick={handleLogout} title="Sign out"
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🚪
          </button>
        </div>

        {/* Mobile: notification bell + hamburger */}
        <div className="mgmt-mobile-btn" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
          <span id="tour-notifications-mobile"><NotificationBell /></span>
          <button onClick={() => setMgmtMenuOpen(true)}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #eee', background: '#fafafa', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ☰
          </button>
        </div>
      </header>

      {/* Mobile slide-out backdrop */}
      {mgmtMenuOpen && (
        <div onClick={() => setMgmtMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      )}

      {/* Mobile slide-out drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 260,
        background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)', zIndex: 201,
        transform: mgmtMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        fontFamily: 'Nunito, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/icon.svg" alt="Glumbi" style={{ width: 28, height: 28 }} />
            <span style={{ fontSize: 18, color: 'white', fontFamily: 'Nunito, sans-serif' }}>Glumbi</span>
          </div>
          <button onClick={() => setMgmtMenuOpen(false)}
            style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 18, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
        </div>

        {/* AI Credits summary */}
        {quota && (() => {
          const pct = Math.min(quota.used / quota.limit, 1)
          const barColor = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : '#6bcb77'
          const label = pct >= 1 ? '🚫 Limit reached' : pct >= 0.8 ? '⚠️ Almost full' : '✅ Good'
          return (
            <div style={{ margin: '0 16px 8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>🪙 AI Credits</div>
                <button onClick={() => { setMgmtMenuOpen(false); setTimeout(() => window.dispatchEvent(new CustomEvent('glumbi:credit-info')), 300) }}
                  style={{ width: 18, height: 18, minWidth: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', fontSize: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>i</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: 'white' }}>{quota.used} / {quota.limit} cr</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: barColor }}>{label}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          )
        })()}

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {[
            { heading: 'Account', items: [
              { emoji: '👤', label: 'My Account', path: '/profile' },
              { emoji: '💡', label: 'Help',        path: '/help' },
            ]},
            { heading: 'Info', items: [
              { emoji: '📬', label: 'Contact Us',       path: '/contact' },
              { emoji: '🔒', label: 'Privacy Policy',   path: '/privacy' },
              { emoji: '⚖️', label: 'Terms of Service', path: '/terms' },
            ]},
          ].map(section => (
            <div key={section.heading}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, padding: '16px 20px 6px' }}>
                {section.heading}
              </div>
              {section.items.map(item => {
                const active = location.pathname === item.path
                return (
                  <button key={item.path} onClick={() => { navigate(item.path); setMgmtMenuOpen(false) }}
                    className="mgmt-menu-item"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      width: 'calc(100% - 24px)', margin: '2px 12px',
                      padding: '10px 16px', border: 'none', borderRadius: 50,
                      fontSize: 15, cursor: 'pointer', textAlign: 'left',
                      background: active ? 'rgba(255,255,255,0.25)' : 'transparent',
                      fontWeight: active ? 900 : 700,
                      color: 'rgba(255,255,255,0.9)',
                    }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.emoji}</span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', padding: 16 }}>
          <button onClick={() => { handleLogout(); setMgmtMenuOpen(false) }}
            style={{ width: '100%', padding: '11px', borderRadius: 50, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(255,255,255,0.3)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      <style>{`
        .mgmt-menu-item:hover { background: rgba(255,255,255,0.15) !important; }
        @media (max-width: 767px) {
          .mgmt-desktop-btns  { display: none !important; }
          .mgmt-mobile-btn    { display: flex !important; }
          .app-footer         { display: none !important; }
          .quota-pill-desktop { display: none !important; }
        }
      `}</style>

      <div style={{ flex: 1 }}>
        {children}
      </div>
      <AppFooter />
    </div>
  )
}
