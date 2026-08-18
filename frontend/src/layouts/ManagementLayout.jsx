import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'
import AppFooter from '../components/AppFooter'
import CreditInfoModal from '../components/CreditInfoModal'

function fmtExpiry(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(d)} ${months[parseInt(m) - 1]}, ${y}`
}

/* Scrollable promo popup — same gradient colors as the quota pill */
function PromoPopup({ quota, onClose, anchorRef }) {
  const popupRef = useRef(null)
  const today = new Date().toISOString().slice(0, 10)
  const grants = quota?.promoGrants ?? []

  useEffect(() => {
    function handler(e) {
      if (popupRef.current && !popupRef.current.contains(e.target) &&
          anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorRef])

  return (
    <div ref={popupRef} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      background: 'white', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 9999,
      fontSize: 12, color: '#333', lineWidth: 1.7, minWidth: 240, maxWidth: 280,
      maxHeight: 320, display: 'flex', flexDirection: 'column',
      border: '1.5px solid #f0e8ff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#1a1a2e' }}>🎁 Bonus Credits</div>
        <button onClick={onClose}
          style={{ width: 22, height: 22, minWidth: 22, minHeight: 22, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 11, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
      </div>
      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10, flexShrink: 0 }}>
        Drawn automatically when monthly credits run out.
      </div>
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {grants.length === 0
          ? <div style={{ color: '#aaa', fontSize: 12 }}>No bonus grants on your account.</div>
          : grants.map(g => {
              const expired = g.expiresOn < today
              const exhausted = g.usedCredits >= g.totalCredits
              const remaining = Math.max(0, g.totalCredits - g.usedCredits)
              const gPct = Math.min(g.usedCredits / (g.totalCredits || 1), 1)
              // Same gradient scale as the quota pill
              const barColor   = exhausted || expired ? '#d1d5db' : gPct >= 1 ? '#ff4444' : gPct >= 0.8 ? '#ffd93d' : gPct >= 0.5 ? '#3b82f6' : '#6bcb77'
              const textColor  = exhausted || expired ? '#9ca3af' : gPct >= 1 ? '#cc0033' : gPct >= 0.8 ? '#b45309' : gPct >= 0.5 ? '#1d4ed8' : '#15803d'
              const statusText = exhausted ? 'Used up' : expired ? 'Expired' : `${remaining} cr left`
              return (
                <div key={g.id} style={{ padding: '10px 12px', borderRadius: 12, background: exhausted || expired ? '#f9fafb' : '#f0fdf4', border: `1.5px solid ${exhausted || expired ? '#e5e7eb' : '#bbf7d0'}`, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                    <span style={{ fontWeight: 800, fontSize: 12, color: exhausted || expired ? '#6b7280' : '#1a1a2e', flex: 1, marginRight: 8 }}>{g.label}</span>
                    <span style={{ fontWeight: 900, fontSize: 12, color: textColor, whiteSpace: 'nowrap' }}>{statusText}</span>
                  </div>
                  <div style={{ height: 5, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ width: `${gPct * 100}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>
                    {g.usedCredits}/{g.totalCredits} cr used · expires {fmtExpiry(g.expiresOn)}
                  </div>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}

export default function ManagementLayout({ children, lockModalEl, quota, featureConfig, handleLogout }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mgmtMenuOpen, setMgmtMenuOpen] = useState(false)
  const [showPromoDesktop, setShowPromoDesktop] = useState(false)
  const [showPromoMobile, setShowPromoMobile]   = useState(false)
  const [showCreditInfo, setShowCreditInfo]     = useState(false)
  const promoDesktopRef = useRef(null)
  const promoMobileRef  = useRef(null)

  useEffect(() => {
    const handler = () => setShowCreditInfo(true)
    window.addEventListener('glumbi:credit-info', handler)
    return () => window.removeEventListener('glumbi:credit-info', handler)
  }, [])

  const hasPromo = (quota?.totalPromoRemaining ?? 0) > 0 || (quota?.promoGrants?.length ?? 0) > 0
  const pct = quota ? Math.min(quota.used / quota.limit, 1) : 0
  const barColor    = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#f59e0b' : '#6bcb77'
  const hdrTextColor = pct >= 1 ? '#cc0033' : pct >= 0.8 ? '#b45309' : '#15803d'
  const overLimit = quota && quota.used > quota.limit
  const pillLabel = overLimit ? '⛔ Over limit' : pct >= 1 ? '🚫 Limit reached' : pct >= 0.8 ? '⚠️ Almost full' : null

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

          {/* Quota pill — same frosted-glass style as ChildList QuotaPill */}
          {quota && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f5f5f5', borderRadius: 50, padding: '6px 14px',
            }}>
              <div style={{ width: 48, height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: hdrTextColor, lineHeight: 1.2 }}>
                  {pillLabel ? `${pillLabel} · ${quota.used}/${quota.limit}` : `${Math.round(pct * 100)}% · ${quota.used}/${quota.limit} cr`}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#999', lineHeight: 1.2 }}>
                  {quota.usedActual ?? quota.used} used this month
                </span>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('glumbi:credit-info'))}
                title="How credits work"
                style={{ width: 20, height: 20, minWidth: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', border: 'none', color: '#555', fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0, padding: 0 }}>
                i
              </button>
            </div>
          )}

          {/* 🎁 Promo icon — opens promo popup (desktop) */}
          {hasPromo && (
            <div ref={promoDesktopRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowPromoDesktop(v => !v)}
                title="Bonus Credits"
                style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e9d5ff', background: showPromoDesktop ? '#f5f2ff' : '#faf5ff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🎁
              </button>
              {showPromoDesktop && (
                <PromoPopup quota={quota} onClose={() => setShowPromoDesktop(false)} anchorRef={promoDesktopRef} />
              )}
            </div>
          )}

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

        {/* Mobile: promo icon + notification bell + hamburger */}
        <div className="mgmt-mobile-btn" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
          {hasPromo && (
            <div ref={promoMobileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowPromoMobile(v => !v)}
                title="Bonus Credits"
                style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.2)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🎁
              </button>
              {showPromoMobile && (
                <PromoPopup quota={quota} onClose={() => setShowPromoMobile(false)} anchorRef={promoMobileRef} />
              )}
            </div>
          )}
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
          const pctD = Math.min(quota.used / quota.limit, 1)
          const overLimitD = quota.used > quota.limit
          const barColorD = pctD >= 1 ? '#ff4444' : pctD >= 0.8 ? '#ffd93d' : '#6bcb77'
          const labelD = overLimitD ? '⛔ Over limit' : pctD >= 1 ? '🚫 Limit reached' : pctD >= 0.8 ? '⚠️ Almost full' : '✅ Good'
          return (
            <div style={{ margin: '0 16px 8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>🪙 AI Credits</div>
                <button onClick={() => { setMgmtMenuOpen(false); setTimeout(() => window.dispatchEvent(new CustomEvent('glumbi:credit-info')), 300) }}
                  style={{ width: 18, height: 18, minWidth: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', fontSize: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>i</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: 'white' }}>{quota.used} / {quota.limit} cr</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: barColorD }}>{labelD}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pctD * 100}%`, background: barColorD, borderRadius: 10, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginTop: 5 }}>
                {quota.usedActual ?? quota.used} used this month (total)
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
        /* Pill lives in the desktop header only — hide the in-carousel copy everywhere */
        .quota-pill-carousel { display: none !important; }
        @media (max-width: 767px) {
          .mgmt-desktop-btns { display: none !important; }
          .mgmt-mobile-btn   { display: flex !important; }
          .app-footer        { display: none !important; }
        }
      `}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <AppFooter />

      {showCreditInfo && (
        <CreditInfoModal featureConfig={featureConfig || []} onClose={() => setShowCreditInfo(false)} />
      )}
    </div>
  )
}
