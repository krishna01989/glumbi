import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { THEMES, THEME_GROUPS, applyTheme } from './themes'
import { ThemeContext } from './contexts/ThemeContext'
import { childApi } from './api/client'
import { startTour } from './tour'
import { useAuth }         from './hooks/useAuth'
import { useChildSession } from './hooks/useChildSession'
import { useLockSession }  from './hooks/useLockSession'
import AdminPage        from './pages/AdminPage'
import AdminProfilePage from './pages/AdminProfilePage'
import ChildList        from './pages/ChildList'
import ChildForm        from './pages/ChildForm'
import MobileMenu       from './components/MobileMenu'
import LockModal        from './components/LockModal'
import ScreenTimeModal  from './components/ScreenTimeModal'
import AppSidebar       from './components/AppSidebar'
import ManagementLayout from './layouts/ManagementLayout'
import PublicRoutes     from './routes/PublicRoutes'
import ChildRoutes      from './routes/ChildRoutes'
import ProfilePage      from './pages/ProfilePage'
import ChildInsightsPage from './pages/ChildInsightsPage'
import HelpPage         from './pages/HelpPage'
import PrivacyPage      from './pages/legal/PrivacyPage'
import TermsPage        from './pages/legal/TermsPage'
import ContactPage      from './pages/legal/ContactPage'
import ErrorPage        from './pages/ErrorPage'
import './index.css'

// ─── NAV GROUPS ────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    id: 'stories', label: 'Stories', emoji: '📖',
    items: [
      { path: 'stories',   label: 'Stories',     emoji: '📖', id: 'tour-stories-tab'  },
      { path: 'readquiz',  label: 'Read & Quiz', emoji: '📚', id: 'tour-readquiz-tab' },
      { path: 'mywriting', label: 'My Writing',  emoji: '✍️', id: 'tour-writing-tab'  },
    ]
  },
  {
    id: 'play', label: 'Play', emoji: '🎮',
    items: [
      { path: 'memory',     label: 'Memory',     emoji: '🧠', id: 'tour-memory-tab'     },
      { path: 'activities', label: 'Activities', emoji: '🎯', id: 'tour-activities-tab' },
      { path: 'maze',       label: 'Maze',       emoji: '🌀', id: 'tour-maze-tab'       },
    ]
  },
  {
    id: 'curiosity', label: 'Curiosity', emoji: '🔍',
    items: [
      { path: 'curiosity', label: 'Ask Anything', emoji: '🔍', id: 'tour-curiosity-tab' },
      { path: 'riddle',    label: 'Riddle',       emoji: '🧩', id: 'tour-riddle-tab'    },
    ]
  },
  {
    id: 'create', label: 'Create', emoji: '🎨',
    items: [
      { path: 'draw',    label: 'Draw',           emoji: '🎨', id: 'tour-draw-tab'    },
      { path: 'learn',   label: 'Learn to Write', emoji: '✏️', id: 'tour-learn-tab'   },
      { path: 'journal', label: 'Journal',        emoji: '📝', id: 'tour-journal-tab' },
    ]
  },
]

function groupsForChild(child, locked = false) {
  const enabledKeys = child?.enabledFeatures
    ? (() => { try { return JSON.parse(child.enabledFeatures) } catch { return null } })()
    : null
  return NAV_GROUPS
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (enabledKeys && !enabledKeys.includes(item.path)) return false
        return true
      })
    }))
    .filter(group => group.items.length > 0)
}

function calcChildAge(birthYear) {
  if (!birthYear) return null
  return new Date().getFullYear() - parseInt(birthYear)
}

// ─── BREAKPOINT ────────────────────────────────────────────────────────────────
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

// ─── THEME PICKER ──────────────────────────────────────────────────────────────
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
        avatarEmoji: child.avatarEmoji, gender: child.gender, theme: key,
        enabledFeatures: child.enabledFeatures,
      })
    } catch (_) {}
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button id="tour-theme-btn" onClick={() => setOpen(o => !o)} title="Change theme"
        style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #eee', cursor: 'pointer', fontSize: 18, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        🎨
      </button>
      {open && (
        <div style={{ position: 'fixed', right: 16, top: 68, background: 'white', borderRadius: 18, padding: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', width: 'min(300px, calc(100vw - 32px))', zIndex: 1000, maxHeight: '70vh', overflowY: 'auto' }}>
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
                      style={{ padding: '8px 4px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: active ? t.primaryLt : '#f5f5f5', border: active ? `2px solid ${t.primary}` : '2px solid transparent', color: active ? t.primary : '#888', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
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

// ─── TOAST ─────────────────────────────────────────────────────────────────────
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

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const bp       = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isTV     = bp === 'tv'

  const [toasts, setToasts]               = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openGroupId, setOpenGroupId]     = useState(null)
  const [collapsed, setCollapsed]         = useState(false)

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
  }, [])
  function dismissToast(id) { setToasts(t => t.filter(x => x.id !== id)) }

  // ── Hooks ──
  const auth = useAuth({ addToast })
  const { authed, role, restoring, setRestoring, quota, featureConfig, handleAuth, logoutAuth } = auth

  const session = useChildSession({ authed, role, featureConfig, setRestoring, quota })
  const { child, setChild, offlineMode, sidebarWotd, prevChildId, handleChildSelected, handleThemeChange, toggleOffline, resetChild } = session

  const lock = useLockSession({ child, setChild, prevChildId })
  const {
    childLocked, setChildLocked,
    lockModal, setLockModal,
    lockPin, setLockPin,
    lockPinError, setLockPinError,
    showPin, setShowPin,
    lockTimeLimit, setLockTimeLimit,
    lockMaxSnooze, setLockMaxSnooze,
    lockModalForced,
    sessionStart, sessionMinutes,
    screenTimeAlert, setScreenTimeAlert,
    snoozeCount, originalLimitRef,
    applyLock, handleLockVerify, handleUnlock,
    handleScreenTimeSnooze, endSessionLocked, engageLock, resetLock, formatElapsed,
  } = lock

  function handleLogout() {
    resetLock()
    resetChild()
    logoutAuth()
  }

  // Auto-collapse sidebar on tablet
  useLayoutEffect(() => { setCollapsed(isTablet) }, [isTablet])

  // Auto-expand sidebar group matching current route
  const currentSegment = location.pathname.split('/').pop()
  const activeGroupId = useMemo(
    () => NAV_GROUPS.find(g => g.items.some(i => i.path === currentSegment))?.id ?? null,
    [currentSegment]
  )
  useEffect(() => { if (activeGroupId) setOpenGroupId(activeGroupId) }, [activeGroupId])

  // Reset to neutral theme on management pages
  useLayoutEffect(() => {
    const isManagement = /^\/child(\/new|\/\d+\/edit|\/\d+\/insights)?$|^\/(profile|help|privacy|terms|contact)/.test(location.pathname)
    if (isManagement && !child) applyTheme('coral')
  }, [location.pathname])

  // Mobile menu open/close via custom event
  useEffect(() => {
    const handler = e => setMobileMenuOpen(e.detail)
    window.addEventListener('glumbi:mobile-menu', handler)
    return () => window.removeEventListener('glumbi:mobile-menu', handler)
  }, [])

  function handleLockConfirmed(c, timeLimit, maxSnooze) {
    applyTheme(c.theme)
    applyLock(c, timeLimit, maxSnooze)
  }

  // ── Unauthenticated ──
  if (!authed) return <PublicRoutes onAuth={handleAuth} />

  // ── Admin ──
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return (
      <Routes>
        <Route path="/admin/profile" element={<AdminProfilePage onLogout={handleLogout} />} />
        <Route path="/admin/*"       element={<AdminPage onLogout={handleLogout} />} />
        <Route path="/error/:code"   element={<ErrorPage code={location.pathname.split('/').pop()} />} />
        <Route path="*"              element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    )
  }

  // ── Lock modal (appears in both layouts) ──
  const lockGrad = (child ? (THEMES[child.theme] || THEMES.coral) : THEMES.coral).headerGrad

  const lockModalEl = (
    <LockModal
      lockModal={lockModal}
      activeChild={child}
      lockGrad={lockGrad}
      lockPin={lockPin}           setLockPin={setLockPin}
      lockPinError={lockPinError} setLockPinError={setLockPinError}
      showPin={showPin}           setShowPin={setShowPin}
      lockTimeLimit={lockTimeLimit} setLockTimeLimit={setLockTimeLimit}
      lockMaxSnooze={lockMaxSnooze} setLockMaxSnooze={setLockMaxSnooze}
      lockModalForced={lockModalForced}
      onVerify={handleLockVerify}
      onUnlock={handleUnlock}
      onCancel={() => { setLockModal(null); setLockPin(''); setLockPinError(''); setShowPin(false) }}
    />
  )

  // ── Restoring ──
  if (/^\/error\//.test(location.pathname)) return <ErrorPage code={location.pathname.split('/').pop()} />
  if (restoring) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#fff9f0' }}>
        <span className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: '#ff6b6b' }}>Loading Glumbi…</span>
      </div>
    )
  }

  // ── Management layout (no child active, or child new/edit) ──
  const isChildManagementRoute = /^\/child(\/new|\/\d+\/edit|\/\d+\/insights)$/.test(location.pathname)

  if (childLocked && child && isChildManagementRoute) {
    return <Navigate to={`/child/${child.id}/stories`} replace />
  }

  if (isChildManagementRoute || !child) {
    return (
      <ManagementLayout lockModalEl={lockModalEl} quota={quota} handleLogout={handleLogout}>
        <Routes>
          <Route path="/child"          element={childLocked && child ? <Navigate to={`/child/${child.id}/stories`} replace /> : <ChildList onLockConfirmed={handleLockConfirmed} onLogout={handleLogout} onToggleOffline={toggleOffline} quota={quota} featureConfig={featureConfig} />} />
          <Route path="/child/new"      element={<ChildForm onChildCreated={handleChildSelected} enabledFeatureConfig={featureConfig} />} />
          <Route path="/child/:id/edit"     element={<ChildForm onChildUpdated={c => { applyTheme(c.theme); if (child) setChild(c); navigate(-1) }} enabledFeatureConfig={featureConfig} />} />
          <Route path="/child/:id/insights" element={<ChildInsightsPage />} />
          <Route path="/profile"        element={<ProfilePage onLogout={handleLogout} parentOnly />} />
          <Route path="/help"           element={<HelpPage />} />
          <Route path="/privacy"        element={<PrivacyPage />} />
          <Route path="/terms"          element={<TermsPage />} />
          <Route path="/contact"        element={<ContactPage />} />
          <Route path="*"               element={<Navigate to="/child" replace />} />
        </Routes>
      </ManagementLayout>
    )
  }

  // ── Child session layout ──
  const theme      = THEMES[child.theme] || THEMES.coral
  const GROUPS     = groupsForChild(child, childLocked)
  const childGroups = GROUPS.filter(g => !g.parentOnly)
  const childAge   = calcChildAge(child.birthYear)

  return (
    <ThemeContext.Provider value={theme}>
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {screenTimeAlert === true && (
        <ScreenTimeModal
          child={child}
          theme={theme}
          snoozeCount={snoozeCount}
          lockMaxSnooze={lockMaxSnooze}
          lockTimeLimit={lockTimeLimit}
          originalLimitRef={originalLimitRef}
          onSnooze={handleScreenTimeSnooze}
          onDone={() => {
            if (childLocked) {
              endSessionLocked()
            } else {
              setScreenTimeAlert(false)
              handleLogout()
            }
          }}
          childLocked={childLocked}
        />
      )}

      {lockModalEl}

      <AppSidebar
        child={child} isTV={isTV}
        collapsed={collapsed} setCollapsed={setCollapsed}
        GROUPS={GROUPS}
        openGroupId={openGroupId} setOpenGroupId={setOpenGroupId}
        currentSegment={currentSegment}
        sidebarWotd={sidebarWotd}
        childLocked={childLocked}
        navigate={navigate}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Desktop / TV / Tablet header */}
        <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${isTV ? 40 : 24}px`, height: isTV ? 72 : 60, flexShrink: 0, background: 'white', borderBottom: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div id="tour-child-name" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: isTV ? 36 : 28 }}>{child.avatarEmoji}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: isTV ? 18 : 14, color: '#333' }}>{child.name}</span>
                {childAge !== null && <span style={{ fontWeight: 400, fontSize: isTV ? 13 : 11, color: '#aaa' }}>{childAge} yrs</span>}
                {child?.streakCount > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #ff6b35, #f7a800)', borderRadius: 50, padding: '2px 7px', fontSize: 10, fontWeight: 800, color: 'white', boxShadow: '0 2px 6px rgba(247,168,0,0.35)', whiteSpace: 'nowrap' }}>
                    🔥 {child.streakCount} {child.streakCount === 1 ? 'day' : 'days'} streak
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {sessionStart && childLocked && (
                  <span style={{ fontSize: isTV ? 12 : 10, fontWeight: 700, color: lockTimeLimit > 0 && sessionMinutes >= lockTimeLimit ? '#cc0033' : '#aaa' }}>
                    ⏱️ {formatElapsed(sessionMinutes)}{lockTimeLimit > 0 ? ` / ${formatElapsed(lockTimeLimit)}` : ' used'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!childLocked && <ThemePicker child={child} onThemeChange={handleThemeChange} />}
            {!childLocked && (
              <button onClick={() => startTour(child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null, quota, featureConfig)} title="Tour"
                style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #eee', cursor: 'pointer', fontSize: 18, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❓</button>
            )}
            {!childLocked && (
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: '#fff0f0', color: '#cc0033', border: '1.5px solid #fcc', cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>🚪</span><span>Sign Out</span>
              </button>
            )}
            {childLocked && <ThemePicker child={child} onThemeChange={handleThemeChange} />}
            {childLocked && (
              <button onClick={() => startTour(child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null, quota, featureConfig)} title="Tour"
                style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #eee', cursor: 'pointer', fontSize: 18, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❓</button>
            )}
            {childLocked && (
              <button onClick={() => { setLockPin(''); setLockPinError(''); setLockModal('unlock') }} title="Parent access"
                style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #fcc', cursor: 'pointer', fontSize: 18, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🔒
              </button>
            )}
          </div>
        </header>

        {/* Mobile header */}
        <header className="mobile-header" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, flexShrink: 0, background: theme.headerGrad, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/icon.svg" alt="Glumbi" style={{ width: 30, height: 30 }} />
            {!childLocked && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 20, color: 'white' }}>Glumbi</span>}
            {childLocked && (
              <>
                <span id="tour-child-name"
                  onClick={() => { setLockPin(''); setLockPinError(''); setLockModal('unlock') }}
                  style={{ fontSize: 22, cursor: 'pointer', position: 'relative' }}>
                  {child.avatarEmoji}
                  <span style={{ position: 'absolute', bottom: -2, right: -4, fontSize: 10 }}>🔒</span>
                </span>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{child.name}</span>
                    {child?.streakCount > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg, #ff6b35, #f7a800)', borderRadius: 50, padding: '2px 7px', fontSize: 10, fontWeight: 800, color: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
                        🔥 {child.streakCount}d
                      </span>
                    )}
                  </div>
                  {sessionStart
                    ? <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>⏱️ {formatElapsed(sessionMinutes)}{lockTimeLimit > 0 ? ` / ${formatElapsed(lockTimeLimit)}` : ' used'}</div>
                    : childAge !== null && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{childAge} yrs</div>
                  }
                </div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!childLocked && (
              <>
                <span id="tour-child-name" style={{ fontSize: 24 }}>{child.avatarEmoji}</span>
                <div style={{ lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{child.name}</span>
                  {childAge !== null && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{childAge} yrs</div>}
                </div>
              </>
            )}
            <span id="tour-mobile-theme"><ThemePicker child={child} onThemeChange={handleThemeChange} /></span>
            <button id="tour-mobile-menu" onClick={() => setMobileMenuOpen(true)}
              style={{ width: 36, height: 36, borderRadius: 10, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 18, cursor: 'pointer' }}>☰</button>
          </div>
        </header>

        <MobileMenu
          open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}
          onLogout={handleLogout} child={child}
          onTour={() => startTour(child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null, quota, featureConfig)}
          wotd={sidebarWotd}
          childLocked={childLocked}
          onUnlock={() => { setLockPin(''); setLockPinError(''); setLockModal('unlock') }}
        />

        {offlineMode && (
          <div style={{ background: '#f4f6ff', borderBottom: '1px solid #dce4f7', padding: '7px 24px', fontSize: 12, fontWeight: 700, color: '#5a72c9', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span>✈️ Taking a break from AI — {childLocked ? "you're" : "your child is"} in practice mode</span>
            {!childLocked && (
              <button onClick={() => toggleOffline()} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#5a72c9', fontWeight: 800, cursor: 'pointer', fontSize: 12, textDecoration: 'underline', padding: 0 }}>
                Turn AI on →
              </button>
            )}
          </div>
        )}

        <main className="main-scroll" style={{ flex: 1, padding: isMobile ? '16px 12px' : isTV ? '32px 40px' : '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <ChildRoutes
            child={child}
            childLocked={childLocked}
            offlineMode={offlineMode}
            quota={quota}
            featureConfig={featureConfig}
            onChildUpdated={c => { applyTheme(c.theme); setChild(c); navigate(-1) }}
            onLogout={handleLogout}
          />
        </main>
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Bottom nav (mobile only) */}
      <nav className="bottom-nav">
        {childGroups.slice(0, 4).map(group => {
          const groupActive = group.items.some(i => i.path === currentSegment)
          const firstItem   = group.items[0]
          return (
            <button key={group.id} onClick={() => navigate(`/child/${child.id}/${firstItem.path}`)}
              style={{ flex: '0 0 auto', width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: 'none', border: 'none', fontSize: 9, fontWeight: 700, color: groupActive ? theme.primary : '#bbb', borderTop: groupActive ? `3px solid ${theme.primary}` : '3px solid transparent', paddingTop: 4, cursor: 'pointer', transition: 'color 0.15s' }}>
              <span style={{ fontSize: 22 }}>{group.emoji}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{group.label}</span>
            </button>
          )
        })}
        <button onClick={() => setMobileMenuOpen(true)}
          style={{ flex: '0 0 auto', width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: 'none', border: 'none', fontSize: 9, fontWeight: 700, color: '#bbb', borderTop: '3px solid transparent', paddingTop: 4, cursor: 'pointer' }}>
          <span style={{ fontSize: 22 }}>☰</span>
          <span>More</span>
        </button>
      </nav>
    </div>
    </ThemeContext.Provider>
  )
}
