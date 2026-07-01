import { useState, useRef, useEffect, useCallback } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import { THEMES, THEME_GROUPS, applyTheme } from './themes'
import { childApi, userApi } from './api/client'
import { startTour } from './tour'
import AuthPage    from './pages/AuthPage'
import AdminPage   from './pages/AdminPage'
import LandingPage from './pages/LandingPage'
import ChildList   from './pages/ChildList'
import ChildForm   from './pages/ChildForm'
import Stories     from './pages/Stories'
import Journal     from './pages/Journal'
import Activities  from './pages/Activities'
import Curiosity   from './pages/Curiosity'
import Timeline    from './pages/Timeline'
import Draw        from './pages/Draw'
import ReadQuiz    from './pages/ReadQuiz'
import MyWriting   from './pages/MyWriting'
import DemoPage    from './pages/DemoPage'
import ErrorPage   from './pages/ErrorPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import TermsPage   from './pages/legal/TermsPage'
import ContactPage from './pages/legal/ContactPage'
import MobileMenu  from './components/MobileMenu'
import NotificationBell from './components/NotificationBell'
import AppFooter   from './components/AppFooter'
import PublicHeader from './components/PublicHeader'
import Footer      from './components/Footer'
import './index.css'

function ErrorPageRoute() {
  const { code } = useParams()
  return <ErrorPage code={code} />
}

const ALL_NAV = [
  { path: 'stories',    label: 'Stories',    emoji: '📖', id: 'tour-stories-tab' },
  { path: 'activities', label: 'Activities', emoji: '🎮', id: 'tour-activities-tab' },
  { path: 'curiosity',  label: 'Curiosity',  emoji: '🔍', id: 'tour-curiosity-tab' },
  { path: 'draw',       label: 'Draw',       emoji: '🎨', id: 'tour-draw-tab' },
  { path: 'journal',    label: 'Journal',    emoji: '📝', id: 'tour-journal-tab' },
  { path: 'readquiz',   label: 'Read & Quiz',emoji: '📚', id: 'tour-readquiz-tab' },
  { path: 'mywriting',  label: 'My Writing', emoji: '✍️', id: 'tour-writing-tab'  },
  { path: 'timeline',   label: 'Timeline',   emoji: '🗓️', id: 'tour-timeline-tab' },
]

function calcChildAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const dob = new Date(birthDate)
  let age = today.getFullYear() - dob.getFullYear()
  if (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())) age--
  return age
}

function navForChild(child) {
  if (!child?.enabledFeatures) return ALL_NAV
  try {
    const enabled = JSON.parse(child.enabledFeatures)
    return ALL_NAV.filter(n => enabled.includes(n.path))
  } catch { return ALL_NAV }
}

function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth
    if (w < 640) return 'mobile'
    if (w < 1024) return 'tablet'
    if (w < 1600) return 'desktop'
    return 'tv'
  })
  useEffect(() => {
    function update() {
      const w = window.innerWidth
      if (w < 640) setBp('mobile')
      else if (w < 1024) setBp('tablet')
      else if (w < 1600) setBp('desktop')
      else setBp('tv')
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return bp
}

function getStoredRole()  { return localStorage.getItem('glm_role') }
function getStoredToken() { return localStorage.getItem('glm_token') }

function ThemePicker({ child, onThemeChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handlePick(key) {
    applyTheme(key)
    setOpen(false)
    onThemeChange(key)
    try {
      await childApi.update(child.id, {
        name: child.name, birthDate: child.birthDate,
        avatarEmoji: child.avatarEmoji, gender: child.gender, theme: key
      })
    } catch (_) {}
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button id="tour-theme-btn" onClick={() => setOpen(o => !o)} title="Change theme"
        style={{
          width: 38, height: 38, borderRadius: 10,
          border: '1.5px solid #eee', cursor: 'pointer',
          fontSize: 18, background: '#fafafa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        🎨
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          right: 16, top: 68,
          background: 'white', borderRadius: 18, padding: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          width: 'min(300px, calc(100vw - 32px))',
          zIndex: 1000, maxHeight: '70vh', overflowY: 'auto',
        }}>
          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 16, color: '#444', marginBottom: 12 }}>🎨 Pick a Theme</div>
          {THEME_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', marginBottom: 8, letterSpacing: 0.5 }}>{group.label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {group.keys.map(key => {
                  const t = THEMES[key]
                  const active = child.theme === key
                  return (
                    <button key={key} onClick={() => handlePick(key)}
                      style={{
                        padding: '8px 4px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                        background: active ? t.primaryLt : '#f5f5f5',
                        border: active ? `2px solid ${t.primary}` : '2px solid transparent',
                        color: active ? t.primary : '#888',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      }}>
                      <div style={{ width: '100%', height: 12, borderRadius: 4, background: t.headerGrad }} />
                      <span style={{ fontSize: 16, marginTop: 2 }}>{t.emoji}</span>
                      <span>{t.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Toast({ toasts, onDismiss }) {
  return (
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onDismiss(t.id)}
          style={{
            background: t.type === 'warning' ? '#fff3cd' : t.type === 'error' ? '#fff0f0' : '#f0fff4',
            border: `1.5px solid ${t.type === 'warning' ? '#ffc107' : t.type === 'error' ? '#ffb3b3' : '#6bcb77'}`,
            color: t.type === 'warning' ? '#856404' : t.type === 'error' ? '#c0392b' : '#1e6b3c',
            borderRadius: 50, padding: '10px 20px', fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)', pointerEvents: 'all', cursor: 'pointer',
            animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap',
          }}>
          {t.message}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [authed, setAuthed]       = useState(!!getStoredToken())
  const [role, setRole]           = useState(getStoredRole())
  const [child, setChild]         = useState(null)
  const [restoring, setRestoring] = useState(
    () => !!getStoredToken() && /^\/child\/\d+\//.test(window.location.pathname)
  )
  const [collapsed, setCollapsed] = useState(false)
  const [quota, setQuota]         = useState(null)   // { used, limit }
  const [toasts, setToasts]       = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const bp        = useBreakpoint()

  const isMobile  = bp === 'mobile'
  const isTablet  = bp === 'tablet'
  const isTV      = bp === 'tv'

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    setCollapsed(isTablet)
  }, [isTablet])

  // Fetch quota when authenticated (not admin), refresh every 5 min
  useEffect(() => {
    if (!authed || role === 'ADMIN') return
    function fetchQuota() {
      userApi.quota().then(setQuota).catch(() => {})
    }
    fetchQuota()
    const interval = setInterval(fetchQuota, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [authed, role])

  // Warn at 80% usage
  useEffect(() => {
    if (!quota) return
    const pct = quota.used / quota.limit
    if (pct >= 1) {
      addToast('🚫 Monthly limit reached — usage resets on the 1st', 'error')
    } else if (pct >= 0.8 && quota.used % 10 === 0) {
      addToast(`⚠️ ${quota.used}/${quota.limit} monthly AI calls used`, 'warning')
    }
  }, [quota])

  // Restore child from URL on hard refresh
  useEffect(() => {
    if (!authed || role === 'ADMIN' || child) { setRestoring(false); return }
    const m = window.location.pathname.match(/^\/child\/(\d+)\//)
    if (!m) { setRestoring(false); return }
    childApi.get(m[1])
      .then(c => { applyTheme(c.theme); setChild(c) })
      .catch(() => navigate('/child', { replace: true }))
      .finally(() => setRestoring(false))
  }, []) // intentionally run only on mount

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
  }, [])

  function dismissToast(id) { setToasts(t => t.filter(x => x.id !== id)) }

  // Expose addToast so quota refreshes after API calls
  useEffect(() => { window.__glumbiRefreshQuota = () => userApi.quota().then(setQuota).catch(() => {}) }, [])

  function handleAuth(userRole) {
    setRole(userRole)
    setAuthed(true)
    navigate(userRole === 'ADMIN' ? '/admin/users' : '/child')
  }

  function handleLogout() {
    localStorage.removeItem('glm_token')
    localStorage.removeItem('glm_role')
    setAuthed(false); setRole(null); setChild(null)
    navigate('/')
  }

  function handleThemeChange(key) { setChild(c => ({ ...c, theme: key })) }

  function handleChildSelected(c) {
    applyTheme(c.theme)
    setChild(c)
    navigate(`/child/${c.id}/stories`)
    if (!localStorage.getItem('glm_tour_done')) {
      localStorage.setItem('glm_tour_done', '1')
      const features = c.enabledFeatures ? JSON.parse(c.enabledFeatures) : null
      setTimeout(() => startTour(features), 600)
    }
  }

  // ── Unauthenticated ──
  if (!authed) {
    return (
      <Routes>
        <Route path="/"        element={<Navigate to="/login" replace />} />
        <Route path="/about"   element={<LandingPage />} />
        <Route path="/demo"    element={<DemoPage />} />
        <Route path="/login"   element={<AuthPage onAuth={handleAuth} />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms"   element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/error/:code" element={<ErrorPageRoute />} />
        <Route path="*"        element={<ErrorPage code={404} />} />
      </Routes>
    )
  }

  // ── Admin ──
  if (role === 'ADMIN') {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminPage onLogout={handleLogout} onBack={() => navigate('/child')} />} />
        <Route path="*"        element={<Navigate to="/admin" replace />} />
      </Routes>
    )
  }

  // ── Child edit/new — always full-page, even when a child is active ──
  const isChildManagementRoute = /^\/child(\/new|\/\d+\/edit)$/.test(location.pathname)
  if (restoring) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#fff9f0' }}>
        <span className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
        <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: '#ff6b6b' }}>Loading Glumbi…</span>
      </div>
    )
  }
  if (isChildManagementRoute || !child) {
    const isManage = isChildManagementRoute
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'white', borderBottom: '1px solid #f0f0f0',
          padding: '0 clamp(16px,4vw,40px)', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', fontFamily: 'Nunito, sans-serif',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/icon.svg" alt="Glumbi" style={{ width: 32, height: 32 }} />
            <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20, color: '#ff6b6b' }}>Glumbi</span>
          </div>
          {isManage ? (
            <button onClick={() => navigate(child ? `/child/${child.id}/stories` : '/child')}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: '#999', cursor: 'pointer', padding: '6px 12px' }}>
              ← Back
            </button>
          ) : (
            <button onClick={handleLogout}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: '#999', cursor: 'pointer', padding: '6px 12px' }}>
              Sign out
            </button>
          )}
        </header>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/child"          element={<ChildList onChildSelected={handleChildSelected} onLogout={handleLogout} />} />
            <Route path="/child/new"      element={<ChildForm onChildCreated={handleChildSelected} />} />
            <Route path="/child/:id/edit" element={<ChildForm />} />
            <Route path="/privacy"        element={<PrivacyPage />} />
            <Route path="/terms"          element={<TermsPage />} />
            <Route path="/contact"        element={<ContactPage />} />
            <Route path="*"               element={<Navigate to="/child" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    )
  }

  const theme = THEMES[child.theme] || THEMES.coral
  const SW = isTV ? 260 : collapsed ? 64 : 220
  const NAV = navForChild(child)
  const childAge = calcChildAge(child.birthDate)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar (tablet / desktop / TV) ── */}
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
              <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: isTV ? 24 : 18, color: 'white', lineHeight: 1 }}>Glumbi</div>
              <div style={{ fontSize: isTV ? 12 : 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Where little stories grow ✨</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: collapsed ? '0 8px' : '0 12px' }}>
          {NAV.map(n => (
            <div key={n.path} id={n.id}>
              <NavLink to={`/child/${child.id}/${n.path}`}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: collapsed ? '12px 0' : isTV ? '14px 18px' : '11px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 12, textDecoration: 'none',
                  fontWeight: 700, fontSize: isTV ? 16 : 14,
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
                  color: 'white', transition: 'background 0.15s',
                })}
                title={collapsed ? n.label : undefined}>
                <span style={{ fontSize: isTV ? 24 : 20, flexShrink: 0 }}>{n.emoji}</span>
                {!collapsed && <span>{n.label}</span>}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Usage bar */}
        {quota && !collapsed && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            {(() => {
              const pct = Math.min(quota.used / quota.limit, 1)
              const color = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : 'rgba(255,255,255,0.7)'
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Monthly usage</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color }}>{quota.used}/{quota.limit}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 10, transition: 'width 0.4s ease' }} />
                  </div>
                  {pct >= 0.8 && (
                    <div style={{ fontSize: 10, color, marginTop: 4, fontWeight: 700 }}>
                      {pct >= 1 ? '🚫 Limit reached — resets on 1st' : '⚠️ Almost at your monthly limit'}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* Collapse toggle (not on TV) */}
        {!isTV && (
          <button onClick={() => setCollapsed(c => !c)}
            style={{
              position: 'absolute', top: 24, right: -14,
              width: 28, height: 28, borderRadius: '50%',
              background: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              fontSize: 12, color: theme.primary, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 20,
            }}>
            {collapsed ? '›' : '‹'}
          </button>
        )}
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── Desktop / TV / Tablet Header ── */}
        <header className="app-header" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `0 ${isTV ? 40 : 24}px`, height: isTV ? 72 : 60, flexShrink: 0,
          background: 'white', borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div id="tour-child-name" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: isTV ? 36 : 28 }}>{child.avatarEmoji}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: isTV ? 18 : 14, color: '#333' }}>{child.name}</span>
                {childAge !== null && <span style={{ fontWeight: 400, fontSize: isTV ? 13 : 11, color: '#aaa' }}>{childAge} yrs</span>}
                <button onClick={() => navigate(`/child/${child.id}/edit`)}
                  title="Edit child"
                  style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: '#888', cursor: 'pointer', lineHeight: '18px' }}>
                  ✏️ Edit
                </button>
              </div>
              <button onClick={() => { setChild(null); navigate('/child') }}
                style={{ fontSize: isTV ? 13 : 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700 }}>
                Switch child →
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemePicker child={child} onThemeChange={handleThemeChange} />
            <button onClick={() => startTour(child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null)} title="Tour"
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1.5px solid #eee', cursor: 'pointer',
                fontSize: 18, background: '#fafafa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>❓</button>
            <NotificationBell />
            <button onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 38, padding: '0 14px', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                background: '#fff0f0', color: '#cc0033',
                border: '1.5px solid #fcc', cursor: 'pointer',
              }}>
              <span style={{ fontSize: 16 }}>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* ── Mobile Header ── */}
        <header className="mobile-header" style={{
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 56, flexShrink: 0,
          background: theme.headerGrad,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/icon.svg" alt="Glumbi" style={{ width: 30, height: 30 }} />
            <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20, color: 'white' }}>Glumbi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span id="tour-child-name" style={{ fontSize: 24 }}>{child.avatarEmoji}</span>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{child.name}</div>
              {childAge !== null && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{childAge} yrs</div>}
            </div>
            <ThemePicker child={child} onThemeChange={handleThemeChange} />
            <NotificationBell isMobile />
            <button onClick={() => setMobileMenuOpen(true)}
              style={{
                width: 36, height: 36, borderRadius: 10, padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 18, cursor: 'pointer',
              }}>☰</button>
          </div>
        </header>
        <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onLogout={handleLogout} child={child} />

        {/* ── Page content ── */}
        <main className="main-scroll" style={{
          flex: 1,
          padding: isMobile ? '16px 12px' : isTV ? '32px 40px' : '24px',
          overflowY: 'auto',
        }}>
          <div className="page-content">
            <Routes>
              <Route path="/child/:childId/stories"    element={<Stories    child={child} />} />
              <Route path="/child/:childId/activities" element={<Activities child={child} />} />
              <Route path="/child/:childId/curiosity"  element={<Curiosity  child={child} />} />
              <Route path="/child/:childId/draw"       element={<Draw       child={child} />} />
              <Route path="/child/:childId/journal"    element={<Journal    child={child} />} />
              <Route path="/child/:childId/timeline"   element={<Timeline   child={child} />} />
              <Route path="/child/:childId/readquiz"   element={<ReadQuiz   child={child} />} />
              <Route path="/child/:childId/mywriting"  element={<MyWriting  child={child} />} />
              <Route path="/privacy"             element={<PrivacyPage />} />
              <Route path="/terms"               element={<TermsPage />} />
              <Route path="/contact"             element={<ContactPage />} />
              <Route path="/error/:code"         element={<ErrorPageRoute />} />
              <Route path="*"                    element={<Navigate to={`/child/${child.id}/stories`} replace />} />
            </Routes>
          </div>
        </main>
        <AppFooter />
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* ── Bottom nav (mobile only) ── */}
      <nav className="bottom-nav">
        {NAV.map(n => (
          <NavLink key={n.path} to={`/child/${child.id}/${n.path}`}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              textDecoration: 'none', fontSize: 9, fontWeight: 700,
              color: isActive ? theme.primary : '#bbb',
              borderTop: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
              paddingTop: 4,
              transition: 'color 0.15s',
            })}>
            <span style={{ fontSize: 22 }}>{n.emoji}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
