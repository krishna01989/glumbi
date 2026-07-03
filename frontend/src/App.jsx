import { useState, useRef, useEffect, useCallback } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import { THEMES, THEME_GROUPS, applyTheme } from './themes'
import { childApi, userApi, memoryApi } from './api/client'
import { startTour } from './tour'
import AuthPage    from './pages/AuthPage'
import AdminPage   from './pages/AdminPage'
import LandingPage from './pages/LandingPage'
import ChildList   from './pages/ChildList'
import ChildForm   from './pages/ChildForm'
import Stories     from './features/stories/Stories'
import Journal     from './features/journal/Journal'
import Activities  from './features/activities/Activities'
import Curiosity   from './features/curiosity/Curiosity'
import Timeline    from './features/timeline/Timeline'
import Draw        from './features/draw/Draw'
import ReadQuiz    from './features/readquiz/ReadQuiz'
import MyWriting   from './features/mywriting/MyWriting'
import MemoryPlay  from './features/memory/MemoryPlay'
import DemoPage    from './pages/DemoPage'
import LearnPage   from './features/learn/LearnPage'
import ProfilePage from './pages/ProfilePage'
import ErrorPage   from './pages/ErrorPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import TermsPage   from './pages/legal/TermsPage'
import ContactPage from './pages/legal/ContactPage'
import HelpPage    from './pages/HelpPage'
import MobileMenu  from './components/MobileMenu'
import NotificationBell from './components/NotificationBell'
import { OfflineContext } from './contexts/OfflineContext'
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
  { path: 'learn',      label: 'Learn to Write', emoji: '✏️', id: 'tour-learn-tab' },
  { path: 'curiosity',  label: 'Curiosity',  emoji: '🔍', id: 'tour-curiosity-tab' },
  { path: 'draw',       label: 'Draw',       emoji: '🎨', id: 'tour-draw-tab' },
  { path: 'readquiz',   label: 'Read & Quiz',emoji: '📚', id: 'tour-readquiz-tab' },
  { path: 'mywriting',  label: 'My Writing', emoji: '✍️', id: 'tour-writing-tab'  },
  { path: 'memory',     label: 'Memory',     emoji: '🧠', id: 'tour-memory-tab' },
  { path: 'journal',    label: 'Journal',    emoji: '📝', id: 'tour-journal-tab' },
  { path: 'timeline',   label: 'Timeline',   emoji: '🗓️', id: 'tour-timeline-tab' },
]

function calcChildAge(birthYear) {
  if (!birthYear) return null
  return new Date().getFullYear() - parseInt(birthYear)
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
        name: child.name, birthYear: child.birthYear,
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
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, color: '#444', marginBottom: 12 }}>🎨 Pick a Theme</div>
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

const FEATURE_DISPLAY = {
  'story':          { label: 'Story',         icon: '📖' },
  'activity':       { label: 'Activity',      icon: '🎮' },
  'curiosity':      { label: 'Curiosity',     icon: '🔍' },
  'read-quiz':      { label: 'Read & Quiz',   icon: '📚' },
  'writing-coach':  { label: 'Writing Coach', icon: '✍️'  },
  'translation':    { label: 'Translation',   icon: '🌐' },
  'draw':           { label: 'Drawing',       icon: '🎨' },
  'learn-validate': { label: 'Letter Check',  icon: '🔤' },
  'learn-word':     { label: 'Learn Word',    icon: '✏️'  },
  'memory-flashcards': { label: 'Memory Play', icon: '🧠' },
}

// Guards a feature route — shows unavailable screen if the feature is disabled for this user
function FeatureGuard({ featureName, featureConfig, children }) {
  const fc = featureConfig.find(f => f.featureName === featureName)
  // If featureConfig not yet loaded, render normally (API will reject if needed)
  if (!fc || fc.enabled !== false) return children
  const display = FEATURE_DISPLAY[featureName] || { label: featureName, icon: '⚙️' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
      <div style={{ fontWeight: 900, fontSize: 22, color: '#333', marginBottom: 8 }}>{display.icon} {display.label} is unavailable</div>
      <div style={{ fontSize: 15, color: '#888', maxWidth: 360, lineHeight: 1.7 }}>
        This feature has been temporarily disabled. Please check back later or contact your administrator.
      </div>
    </div>
  )
}

function QuotaBar({ quota, featureConfig }) {
  const [showInfo, setShowInfo] = useState(false)
  const pct   = Math.min(quota.used / quota.limit, 1)
  const color = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : 'rgba(255,255,255,0.7)'
  return (
    <div id="tour-quota" style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.15)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Monthly AI credits</span>
          <button
            onClick={() => setShowInfo(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 12, padding: 0, lineHeight: 1 }}
            title="What counts?">ⓘ</button>
        </div>
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
      {showInfo && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 8, right: 8,
          background: '#1e2a3a', borderRadius: 12, padding: '12px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 999,
          fontSize: 11, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6, color: 'white' }}>🤖 How do AI credits work?</div>
          <div>Each feature uses a different number of credits. You get <strong style={{ color: '#6bcb77' }}>{quota.limit} credits per month</strong>, shared across all features.</div>
          {featureConfig.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {featureConfig.map(fc => {
                const meta = FEATURE_DISPLAY[fc.featureName]
                if (!meta) return null
                return (
                  <div key={fc.featureName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{meta.icon} {meta.label}</span>
                    <span style={{ fontWeight: 800, color: fc.creditCost >= 3 ? '#ffd93d' : fc.creditCost >= 2 ? '#74b9ff' : '#6bcb77' }}>
                      {fc.creditCost} cr
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.5)' }}>Resets on the 1st of each month.</div>
          <button onClick={() => setShowInfo(false)} style={{ marginTop: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>Close</button>
        </div>
      )}
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
  const [quota, setQuota]               = useState(null)   // { used, limit }
  const [featureConfig, setFeatureConfig] = useState([])    // [{ featureName, creditCost }]
  const [toasts, setToasts]       = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [offlineMode, setOfflineMode] = useState(() => localStorage.getItem('glm_offline') === '1')
  const [sidebarWotd, setSidebarWotd] = useState(null)

  function toggleOffline() {
    setOfflineMode(v => {
      const next = !v
      localStorage.setItem('glm_offline', next ? '1' : '0')
      return next
    })
  }
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

  // Fetch quota + feature credits when authenticated (not admin), refresh quota every 5 min
  useEffect(() => {
    if (!authed || role === 'ADMIN') return
    function fetchQuota() {
      userApi.quota().then(setQuota).catch(() => {})
    }
    function fetchFeatureConfig() {
      userApi.featureCredits().then(setFeatureConfig).catch(() => {})
    }
    fetchQuota()
    fetchFeatureConfig()
    const interval = setInterval(fetchQuota, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [authed, role])

  // Refresh feature config on every route change so admin toggles take effect without re-login
  useEffect(() => {
    if (!authed || role === 'ADMIN') return
    userApi.featureCredits().then(setFeatureConfig).catch(() => {})
  }, [location.pathname, authed, role])

  // Warn at 80% usage
  useEffect(() => {
    if (!quota) return
    const pct = quota.used / quota.limit
    if (pct >= 1) {
      addToast('🚫 Monthly limit reached — usage resets on the 1st', 'error')
    } else if (pct >= 0.8 && quota.used % 10 === 0) {
      addToast(`⚠️ ${quota.used}/${quota.limit} monthly AI credits used`, 'warning')
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

  // Prefetch Word of Day when a child is selected — only if memory is on globally AND for this child
  useEffect(() => {
    if (!child) { setSidebarWotd(null); return }
    // Global admin gate
    const globalFc = featureConfig.find(f => f.featureName === 'memory')
    if (globalFc && globalFc.enabled === false) { setSidebarWotd(null); return }
    // Parent gate — child must have 'memory' in their enabled features
    try {
      const enabled = child.enabledFeatures ? JSON.parse(child.enabledFeatures) : []
      if (!enabled.includes('memory')) { setSidebarWotd(null); return }
    } catch { return }
    memoryApi.getWordOfDay(child.id).then(setSidebarWotd).catch(() => {})
  }, [child?.id, featureConfig])

  // Expose addToast so quota refreshes after API calls
  useEffect(() => { window.__glumbiRefreshQuota = () => userApi.quota().then(setQuota).catch(() => {}) }, [])
  useEffect(() => {
    const handler = e => setMobileMenuOpen(e.detail)
    window.addEventListener('glumbi:mobile-menu', handler)
    return () => window.removeEventListener('glumbi:mobile-menu', handler)
  }, [])

  function handleAuth(userRole) {
    setRole(userRole)
    setAuthed(true)
    navigate(userRole === 'ADMIN' ? '/admin/users' : '/child')
  }

  function handleLogout() {
    localStorage.removeItem('glm_token')
    localStorage.removeItem('glm_role')
    navigate('/', { replace: true })
    setAuthed(false); setRole(null); setChild(null)
  }

  function handleThemeChange(key) { setChild(c => ({ ...c, theme: key })) }

  function handleChildSelected(c) {
    applyTheme(c.theme)
    setChild(c)
    navigate(`/child/${c.id}/stories`)
    if (!localStorage.getItem('glm_tour_done')) {
      localStorage.setItem('glm_tour_done', '1')
      const features = c.enabledFeatures ? JSON.parse(c.enabledFeatures) : null
      setTimeout(() => startTour(features, quota, featureConfig), 600)
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
        <Route path="/privacy" element={<><PublicHeader /><PrivacyPage /><Footer /></>} />
        <Route path="/terms"   element={<><PublicHeader /><TermsPage /><Footer /></>} />
        <Route path="/contact" element={<><PublicHeader /><ContactPage /><Footer /></>} />
        <Route path="/error/:code" element={<ErrorPageRoute />} />
        <Route path="/child/*"    element={<Navigate to="/login" replace />} />
        <Route path="/admin/*"    element={<Navigate to="/login" replace />} />
        <Route path="*"           element={<ErrorPage code={404} />} />
      </Routes>
    )
  }

  // ── Admin ──
  if (role === 'ADMIN') {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminPage onLogout={handleLogout} onBack={() => navigate('/child')} />} />
        <Route path="*"        element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    )
  }

  // ── Child edit/new — always full-page, even when a child is active ──
  const isChildManagementRoute = /^\/child(\/new|\/\d+\/edit)$/.test(location.pathname)
  if (restoring) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#fff9f0' }}>
        <span className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: '#ff6b6b' }}>Loading Glumbi…</span>
      </div>
    )
  }
  if (isChildManagementRoute || !child) {
    const isManage = isChildManagementRoute
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa', color: '#3d3d3d' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate('/profile')}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: '#999', cursor: 'pointer', padding: '6px 12px' }}>
              👤 Account
            </button>
            <button onClick={handleLogout}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: '#999', cursor: 'pointer', padding: '6px 12px' }}>
              Sign out
            </button>
          </div>
        </header>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/child"          element={<ChildList onChildSelected={handleChildSelected} onLogout={handleLogout} />} />
            <Route path="/child/new"      element={<ChildForm onChildCreated={handleChildSelected} enabledFeatureConfig={featureConfig} />} />
            <Route path="/child/:id/edit" element={<ChildForm onChildUpdated={c => { setChild(c); navigate('/child') }} enabledFeatureConfig={featureConfig} />} />
            <Route path="/profile"        element={<ProfilePage onLogout={handleLogout} parentOnly />} />
            <Route path="/privacy"        element={<PrivacyPage />} />
            <Route path="/terms"          element={<TermsPage />} />
            <Route path="/contact"        element={<ContactPage />} />
            <Route path="*"               element={<Navigate to="/child" replace />} />
          </Routes>
        </div>
        <AppFooter />
      </div>
    )
  }

  const theme = THEMES[child.theme] || THEMES.coral
  const SW = isTV ? 260 : collapsed ? 64 : 220
  const NAV = navForChild(child)
  const childAge = calcChildAge(child.birthYear)

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
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: isTV ? 24 : 18, color: 'white', lineHeight: 1 }}>Glumbi</div>
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

        {/* Word of Day widget */}
        {sidebarWotd && !collapsed && (() => {
          try {
            const enabled = child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null
            if (enabled && !enabled.includes('memory')) return null
          } catch {}
          return (
            <div style={{ margin: '0 12px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>🧠 Memory Play</div>
              <div onClick={() => navigate(`/child/${child.id}/memory?tab=wordofday`)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>{sidebarWotd.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Word of the Day</div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 900, color: 'white' }}>{sidebarWotd.word}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { tab: 'flashcards', label: '📇 Cards' },
                  { tab: 'match',      label: '🎴 Match' },
                ].map(({ tab, label }) => (
                  <button key={tab} onClick={() => navigate(`/child/${child.id}/memory?tab=${tab}`)}
                    style={{ flex: 1, padding: '5px 0', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Usage bar */}
        {quota && !collapsed && (
          <QuotaBar quota={quota} featureConfig={featureConfig} />
        )}

        {/* Utility links — Profile + Help */}
        <div style={{ padding: collapsed ? '8px' : '8px 12px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <button onClick={() => navigate('/profile')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 0' : '10px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 12, border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
            }}
            title={collapsed ? 'My Account' : undefined}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>👤</span>
            {!collapsed && <span>My Account</span>}
          </button>
          <button id="tour-help-btn" onClick={() => navigate('/help')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 0' : '10px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 12, border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
            }}
            title={collapsed ? 'Help' : undefined}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            {!collapsed && <span>Help</span>}
          </button>
        </div>

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
            <button id="tour-offline-toggle" onClick={toggleOffline} title={offlineMode ? 'AI is off — click to turn on' : 'Turn off AI (practice mode)'}
              style={{
                height: 38, padding: '0 12px', borderRadius: 10, cursor: 'pointer',
                fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6,
                background: offlineMode ? '#f5f5f5' : '#f0fff4',
                color:      offlineMode ? '#999'    : '#27ae60',
                border:     offlineMode ? '1.5px solid #e0e0e0' : '1.5px solid #a8e6b0',
                transition: 'all 0.2s',
              }}>
              <span style={{ fontSize: 15 }}>{offlineMode ? '✈️' : '🤖'}</span>
              {offlineMode ? 'Practice' : 'AI On'}
            </button>
            <button onClick={() => startTour(child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null, quota, featureConfig)} title="Tour"
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1.5px solid #eee', cursor: 'pointer',
                fontSize: 18, background: '#fafafa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>❓</button>
            <span id="tour-notifications"><NotificationBell /></span>
            <button id="tour-profile" onClick={() => navigate('/profile')} title="My Account"
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1.5px solid #eee', cursor: 'pointer',
                fontSize: 18, background: '#fafafa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>👤</button>
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
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 20, color: 'white' }}>Glumbi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span id="tour-child-name" style={{ fontSize: 24 }}>{child.avatarEmoji}</span>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{child.name}</div>
              {childAge !== null && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{childAge} yrs</div>}
            </div>
            <span id="tour-mobile-theme"><ThemePicker child={child} onThemeChange={handleThemeChange} /></span>
            <span id="tour-mobile-notifications"><NotificationBell isMobile /></span>
            <button id="tour-mobile-offline" onClick={toggleOffline} title={offlineMode ? 'Practice mode — tap to enable AI' : 'Tap to switch to practice mode'}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 18,
                background: offlineMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {offlineMode ? '✈️' : '🤖'}
            </button>
            <button id="tour-mobile-menu" onClick={() => setMobileMenuOpen(true)}
              style={{
                width: 36, height: 36, borderRadius: 10, padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 18, cursor: 'pointer',
              }}>☰</button>
          </div>
        </header>
        <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onLogout={handleLogout} child={child} quota={quota} featureConfig={featureConfig} theme={theme}
          onSwitchChild={() => { setChild(null); navigate('/child') }}
          onTour={() => startTour(child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null, quota, featureConfig)}
          offlineMode={offlineMode} onToggleOffline={toggleOffline} wotd={sidebarWotd} />

        {/* ── Offline banner ── */}
        {offlineMode && (
          <div style={{ background: '#f4f6ff', borderBottom: '1px solid #dce4f7', padding: '7px 24px', fontSize: 12, fontWeight: 700, color: '#5a72c9', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span>✈️ Practice mode — AI features are paused. Listening and browsing still work.</span>
            <button onClick={toggleOffline} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#5a72c9', fontWeight: 800, cursor: 'pointer', fontSize: 12, textDecoration: 'underline', padding: 0 }}>
              Turn AI on →
            </button>
          </div>
        )}

        {/* ── Page content ── */}
        <main className="main-scroll" style={{
          flex: 1,
          padding: isMobile ? '16px 12px' : isTV ? '32px 40px' : '24px',
          overflowY: 'auto',
        }}>
          <OfflineContext.Provider value={offlineMode}>
          <div className="page-content">
            <Routes>
              <Route path="/child/:childId/stories"    element={<FeatureGuard featureName="story"         featureConfig={featureConfig}><Stories    child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/activities" element={<FeatureGuard featureName="activity"      featureConfig={featureConfig}><Activities child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/curiosity"  element={<FeatureGuard featureName="curiosity"     featureConfig={featureConfig}><Curiosity  child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/draw"       element={<FeatureGuard featureName="draw"          featureConfig={featureConfig}><Draw       child={child} quota={quota} featureConfig={featureConfig} /></FeatureGuard>} />
              <Route path="/child/:childId/journal"    element={<Journal    child={child} featureConfig={featureConfig} />} />
              <Route path="/child/:childId/timeline"   element={<Timeline   child={child} />} />
              <Route path="/child/:childId/readquiz"   element={<FeatureGuard featureName="read-quiz"     featureConfig={featureConfig}><ReadQuiz   child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/learn"      element={<FeatureGuard featureName="learn-validate" featureConfig={featureConfig}><LearnPage  child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/mywriting"  element={<FeatureGuard featureName="writing-coach" featureConfig={featureConfig}><MyWriting  child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/memory"    element={<FeatureGuard featureName="memory-flashcards" featureConfig={featureConfig}><MemoryPlay child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/profile"             element={<ProfilePage onLogout={handleLogout} />} />
              <Route path="/privacy"             element={<PrivacyPage inApp />} />
              <Route path="/terms"               element={<TermsPage inApp />} />
              <Route path="/contact"             element={<ContactPage inApp />} />
              <Route path="/help"                element={<HelpPage />} />
              <Route path="/error/:code"         element={<ErrorPageRoute />} />
              <Route path="*"                    element={<Navigate to={`/child/${child.id}/stories`} replace />} />
            </Routes>
          </div>
          </OfflineContext.Provider>
        </main>
        <AppFooter />
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* ── Bottom nav (mobile only) — pinned favourites + menu ── */}
      <nav className="bottom-nav">
        {NAV.slice(0, 4).map(n => (
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
        <button onClick={() => setMobileMenuOpen(true)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            background: 'none', border: 'none', fontSize: 9, fontWeight: 700,
            color: '#bbb', borderTop: '3px solid transparent', paddingTop: 4, cursor: 'pointer',
          }}>
          <span style={{ fontSize: 22 }}>☰</span>
          <span>More</span>
        </button>
      </nav>
    </div>
  )
}
