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
import AdminProfilePage from './pages/AdminProfilePage'
import ErrorPage   from './pages/ErrorPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import TermsPage   from './pages/legal/TermsPage'
import ContactPage from './pages/legal/ContactPage'
import HelpPage    from './pages/HelpPage'
import MobileMenu  from './components/MobileMenu'
import NotificationBell from './components/NotificationBell'
import QuotaBadge from './components/QuotaBadge'
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
  { path: 'stories',    label: 'Stories',       mobileLabel: 'Stories',    emoji: '📖', id: 'tour-stories-tab' },
  { path: 'activities', label: 'Activities',    mobileLabel: 'Activities', emoji: '🎮', id: 'tour-activities-tab' },
  { path: 'learn',      label: 'Learn to Write',mobileLabel: 'Learn to Write', emoji: '✏️', id: 'tour-learn-tab' },
  { path: 'curiosity',  label: 'Curiosity',     mobileLabel: 'Curiosity',  emoji: '🔍', id: 'tour-curiosity-tab' },
  { path: 'draw',       label: 'Draw',          mobileLabel: 'Draw',       emoji: '🎨', id: 'tour-draw-tab' },
  { path: 'readquiz',   label: 'Read & Quiz',   mobileLabel: 'Read & Quiz',       emoji: '📚', id: 'tour-readquiz-tab' },
  { path: 'mywriting',  label: 'My Writing',    mobileLabel: 'My Writing',    emoji: '✍️', id: 'tour-writing-tab'  },
  { path: 'memory',     label: 'Memory Play',   mobileLabel: 'Memory Play',     emoji: '🧠', id: 'tour-memory-tab' },
  { path: 'journal',    label: 'Journal',       mobileLabel: 'Journal',    emoji: '📝', id: 'tour-journal-tab',  parentOnly: true },
  { path: 'timeline',   label: 'Timeline',      mobileLabel: 'Timeline',   emoji: '🗓️', id: 'tour-timeline-tab', parentOnly: true },
]

function calcChildAge(birthYear) {
  if (!birthYear) return null
  return new Date().getFullYear() - parseInt(birthYear)
}

function navForChild(child, locked = false) {
  let nav = ALL_NAV
  if (child?.enabledFeatures) {
    try {
      const enabled = JSON.parse(child.enabledFeatures)
      nav = nav.filter(n => enabled.includes(n.path))
    } catch {}
  }
  if (locked) nav = nav.filter(n => !n.parentOnly)
  return nav
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
        avatarEmoji: child.avatarEmoji, gender: child.gender, theme: key,
        enabledFeatures: child.enabledFeatures,
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


export default function App() {
  const [authed, setAuthed]       = useState(!!getStoredToken())
  const [role, setRole]           = useState(getStoredRole())
  const [child, setChild]         = useState(null)
  const [restoring, setRestoring] = useState(
    () => !!getStoredToken() && (
      /^\/child\/\d+\//.test(window.location.pathname) ||
      (localStorage.getItem('glm_child_locked') === '1' && !!localStorage.getItem('glm_locked_child_id'))
    )
  )
  const [collapsed, setCollapsed] = useState(false)
  const [quota, setQuota]               = useState(null)   // { used, limit }
  const [featureConfig, setFeatureConfig] = useState([])    // [{ featureName, creditCost }]
  const [toasts, setToasts]       = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mgmtMenuOpen, setMgmtMenuOpen]     = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [sidebarWotd, setSidebarWotd] = useState(null)
  const [sessionStart, setSessionStart]         = useState(null)
  const sessionStartRef = useRef(null)
  const lastTickRef = useRef(null)    // shared between interval and visibility handler to avoid double-counting sleep
  const wotdDateRef = useRef(null)    // tracks the date of the last fetched WOTD to detect day rollover
  const sessionEndedRef = useRef(false)   // set true after force-end so the interval never re-triggers the alert
  const originalLimitRef = useRef(0)      // the limit set at lock time — never changes on snooze
  const [sessionMinutes, setSessionMinutes]     = useState(0)
  const [screenTimeAlert, setScreenTimeAlert]   = useState(false)
  const [snoozeCount, setSnoozeCount]           = useState(0)
  // Session limits chosen at lock time (not stored on child profile)
  const [lockTimeLimit, setLockTimeLimit]       = useState(30)  // minutes
  const [lockMaxSnooze, setLockMaxSnooze]       = useState(1)   // 0 = unlimited
  const lockMaxSnoozeRef = useRef(1) // ref copy so the tick interval always reads the latest value
  const [lockModalForced, setLockModalForced]   = useState(false)
  const prevChildId = useRef(null) // track whether child→null was a deliberate navigation or initial mount
  const [childLocked, setChildLocked]           = useState(() => localStorage.getItem('glm_child_locked') === '1')
  const [lockModal, setLockModal]               = useState(null)  // 'setup' | 'confirm' | 'unlock'
  const [lockPin, setLockPin]                   = useState('')
  const [lockPinError, setLockPinError]         = useState('')
  const [pendingLockedChild, setPendingLockedChild] = useState(null)

  function toggleOffline(childId) {
    const id = childId ?? child?.id
    if (!id) return
    setOfflineMode(v => {
      const next = !v
      localStorage.setItem(`glm_offline_${id}`, next ? '1' : '0')
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

  // Restore child from URL on hard refresh, or from locked-child sessionStorage
  useEffect(() => {
    if (!authed || role === 'ADMIN' || child) { setRestoring(false); return }
    // Prefer URL-based restore, fall back to locked child ID
    const urlMatch = window.location.pathname.match(/^\/child\/(\d+)\//)
    const lockedId = localStorage.getItem('glm_locked_child_id')
    const idToRestore = urlMatch?.[1] || (localStorage.getItem('glm_child_locked') === '1' && lockedId)
    if (!idToRestore) { setRestoring(false); return }
    childApi.get(idToRestore)
      .then(c => {
        applyTheme(c.theme); setChild(c)
        setOfflineMode(localStorage.getItem(`glm_offline_${c.id}`) === '1')
        childApi.checkin(c.id).then(s => setChild(prev => prev ? { ...prev, streakCount: s.streakCount } : prev)).catch(() => {})
        // If restoring a locked session and not already on child route, navigate there
        if (!urlMatch && localStorage.getItem('glm_child_locked') === '1') {
          navigate(`/child/${c.id}/stories`, { replace: true })
        }
      })
      .catch(() => navigate('/child', { replace: true }))
      .finally(() => setRestoring(false))
  }, []) // intentionally run only on mount

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
  }, [])

  function dismissToast(id) { setToasts(t => t.filter(x => x.id !== id)) }

  // Reset to neutral theme on management routes (child list, edit, new, help, profile)
  useEffect(() => {
    const managementRoute = /^\/child(\/new|\/\d+\/edit)?$|^\/(profile|help|privacy|terms|contact)/.test(location.pathname)
    if (managementRoute && !child) applyTheme('coral')
  }, [location.pathname])

  // Prefetch Word of Day when a child is selected — only if memory is on globally AND for this child
  useEffect(() => {
    setSidebarWotd(null); wotdDateRef.current = null
    if (!child) return
    const globalFc = featureConfig.find(f => f.featureName === 'memory')
    if (globalFc && globalFc.enabled === false) return
    try {
      const enabled = child.enabledFeatures ? JSON.parse(child.enabledFeatures) : []
      if (!enabled.includes('memory')) return
    } catch { return }

    function fetchWotd() {
      memoryApi.getWordOfDay(child.id)
        .then(w => { wotdDateRef.current = w.date; setSidebarWotd(w) })
        .catch(() => {})
    }

    fetchWotd()

    // Re-fetch on tab focus — catches day rollover when app stays open overnight
    function onVisible() {
      if (document.hidden) return
      const today = new Date().toISOString().slice(0, 10)
      // wotdDateRef.current may be array [y,m,d] or string; normalize to string for comparison
      const fetched = Array.isArray(wotdDateRef.current)
        ? `${wotdDateRef.current[0]}-${String(wotdDateRef.current[1]).padStart(2,'0')}-${String(wotdDateRef.current[2]).padStart(2,'0')}`
        : wotdDateRef.current
      if (fetched !== today) fetchWotd()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id, featureConfig.map(f => `${f.featureName}:${f.enabled}`).join(',')])

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
    localStorage.removeItem('glm_child_locked')
    localStorage.removeItem('glm_locked_child_id')
    Object.keys(localStorage)
      .filter(k =>
        k.startsWith('glm_session_start_') ||
        k.startsWith('glm_snooze_count_') ||
        k.startsWith('glm_session_limit_') ||
        k.startsWith('glm_session_original_limit_') ||
        k.startsWith('glm_session_max_snooze_') ||
        k.startsWith('glm_lock_pin_') ||
        k.startsWith('glm_offline_')
      )
      .forEach(k => localStorage.removeItem(k))
    setChildLocked(false)
    navigate('/', { replace: true })
    setAuthed(false); setRole(null); setChild(null)
  }

  // Start session timer when child is selected — persists across refreshes, resets when returning to child list
  useEffect(() => {
    if (!child) {
      applyTheme('coral')
      // Only clear timer keys if we had a child before (deliberate navigation back to child list)
      // On initial page load prevChildId.current is null — don't clear so refresh preserves the timer
      if (prevChildId.current !== null) {
        Object.keys(localStorage)
          .filter(k => k.startsWith('glm_session_start_') || k.startsWith('glm_snooze_count_'))
          .forEach(k => localStorage.removeItem(k))
      }
      prevChildId.current = null
      sessionEndedRef.current = false
      setSessionStart(null); setSessionMinutes(0); setScreenTimeAlert(false); setSnoozeCount(0)
      return
    }
    prevChildId.current = child.id
    sessionEndedRef.current = false
    const startKey   = `glm_session_start_${child.id}`
    const snoozeKey  = `glm_snooze_count_${child.id}`
    const limitKey   = `glm_session_limit_${child.id}`
    const maxSnoozeKey = `glm_session_max_snooze_${child.id}`

    const stored = localStorage.getItem(startKey)
    const start  = stored ? parseInt(stored) : Date.now()
    if (!stored) {
      localStorage.setItem(startKey, String(start))
      localStorage.removeItem(snoozeKey)
      setSnoozeCount(0)
    } else {
      const saved = localStorage.getItem(snoozeKey)
      setSnoozeCount(saved ? parseInt(saved) : 0)
    }

    // Restore lock-time limit settings from localStorage
    const storedLimit       = localStorage.getItem(limitKey)
    const storedMaxSnooze   = localStorage.getItem(maxSnoozeKey)
    const storedOriginal    = localStorage.getItem(`glm_session_original_limit_${child.id}`)
    const restoredLimit     = storedLimit    ? parseInt(storedLimit)    : 0
    const restoredMaxSnooze = storedMaxSnooze ? parseInt(storedMaxSnooze) : 1
    const restoredOriginal  = storedOriginal ? parseInt(storedOriginal) : restoredLimit
    setLockTimeLimit(restoredLimit)
    setLockMaxSnooze(restoredMaxSnooze)
    originalLimitRef.current = restoredOriginal

    const elapsed = Math.max(0, Math.floor((Date.now() - start) / 60000))
    setSessionStart(start)
    setSessionMinutes(elapsed)
    setScreenTimeAlert(false)

    // Check immediately if already over limit on restore
    if (restoredLimit > 0 && elapsed >= restoredLimit) {
      const savedSnooze = localStorage.getItem(snoozeKey)
      const currentSnooze = savedSnooze ? parseInt(savedSnooze) : 0
      if (restoredMaxSnooze > 0 && currentSnooze >= restoredMaxSnooze) {
        setScreenTimeAlert('force-end')
      } else {
        setScreenTimeAlert(true)
      }
    }
  }, [child?.id])

  // Tick every minute — check against limit
  useEffect(() => {
    if (!sessionStart || !childLocked) return
    lastTickRef.current = Date.now()
    const interval = setInterval(() => {
      const now = Date.now()
      const delta = lastTickRef.current ? now - lastTickRef.current : 60000
      lastTickRef.current = now

      // Device was locked/asleep if the tick fired much later than expected.
      // Only correct here if the visibilitychange handler didn't already handle it
      // (the visibility handler resets lastTickRef.current so delta stays ~60s).
      if (delta > 90000) {
        const sleepMs = delta - 60000
        const adjusted = Math.min(sessionStartRef.current + sleepMs, Date.now())
        sessionStartRef.current = adjusted
        setSessionStart(adjusted)
        if (child?.id) localStorage.setItem(`glm_session_start_${child.id}`, String(adjusted))
      }

      if (document.hidden) return
      const elapsed = Math.max(0, Math.floor((Date.now() - sessionStartRef.current) / 60000))
      setSessionMinutes(elapsed)
      if (!lockTimeLimit || lockTimeLimit === 0) return
      if (sessionEndedRef.current) return
      if (elapsed >= lockTimeLimit) {
        setSnoozeCount(current => {
          if (lockMaxSnoozeRef.current > 0 && current >= lockMaxSnoozeRef.current) {
            setTimeout(() => setScreenTimeAlert('force-end'), 0)
            return current
          }
          setScreenTimeAlert(true)
          return current
        })
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [sessionStart, lockTimeLimit, childLocked])

  // Keep refs in sync so interval/visibility handlers always read latest values
  useEffect(() => { sessionStartRef.current = sessionStart }, [sessionStart])
  useEffect(() => { lockMaxSnoozeRef.current = lockMaxSnooze }, [lockMaxSnooze])

  // Pause timer while page is hidden (child walks away / device sleeps)
  useEffect(() => {
    let hiddenAt = null
    function onVisibility() {
      if (document.hidden) {
        hiddenAt = Date.now()
      } else if (hiddenAt !== null && sessionStartRef.current) {
        const idle = Date.now() - hiddenAt
        const newStart = sessionStartRef.current + idle
        sessionStartRef.current = newStart
        setSessionStart(newStart)
        if (child?.id) localStorage.setItem(`glm_session_start_${child.id}`, String(newStart))
        lastTickRef.current = Date.now() // reset so interval doesn't also correct for this same sleep
        hiddenAt = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [child?.id])

  // Exit browser fullscreen when screen-time alert fires so the modal is visible
  useEffect(() => {
    if (!screenTimeAlert) return
    if (document.fullscreenElement) document.exitFullscreen?.()
  }, [screenTimeAlert])

  // Auto-end when snoozes exhausted
  useEffect(() => {
    if (screenTimeAlert !== 'force-end') return
    sessionEndedRef.current = true // stop the interval from re-firing
    setScreenTimeAlert(false)
    if (childLocked) {
      setLockModalForced(true)
      setLockPin(''); setLockPinError(''); setLockModal('unlock')
    } else {
      setChild(null); navigate('/child')
    }
  }, [screenTimeAlert])

  function handleScreenTimeSnooze(extraMinutes) {
    const newStart = Date.now()
    if (child?.id) {
      localStorage.setItem(`glm_session_start_${child.id}`, String(newStart))
      localStorage.setItem(`glm_session_limit_${child.id}`, String(extraMinutes)) // fix #1: persist new limit
    }
    sessionEndedRef.current = false  // allow interval to fire again for the new window
    setSessionStart(newStart)
    setSessionMinutes(0)
    setLockTimeLimit(extraMinutes)
    setSnoozeCount(n => {
      const next = n + 1
      if (child?.id) localStorage.setItem(`glm_snooze_count_${child.id}`, String(next))
      return next
    })
    setScreenTimeAlert(false)
  }

  function formatElapsed(minutes) {
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  function engageLock() {
    const hasPin = !!localStorage.getItem(`glm_lock_pin_${child?.id}`)
    setLockPin(''); setLockPinError('')
    setLockModal(hasPin ? 'lock-verify' : 'setup')
  }

  function handleLockSetup() {
    if (lockPin.length !== 4 || !/^\d{4}$/.test(lockPin)) { setLockPinError('Enter a 4-digit PIN'); return }
    const activeChild = pendingLockedChild || child
    const childId = activeChild?.id
    if (childId) localStorage.setItem(`glm_lock_pin_${childId}`, lockPin)
    localStorage.setItem('glm_child_locked', '1')
    if (childId) localStorage.setItem('glm_locked_child_id', String(childId))
    if (childId) {
      localStorage.setItem(`glm_session_limit_${childId}`, String(lockTimeLimit))
      localStorage.setItem(`glm_session_original_limit_${childId}`, String(lockTimeLimit))
      localStorage.setItem(`glm_session_max_snooze_${childId}`, String(lockMaxSnooze))
    }
    originalLimitRef.current = lockTimeLimit
    setChildLocked(true); setLockModal(null); setLockPin('')
    if (pendingLockedChild) {
      setChild(pendingLockedChild)
      navigate(`/child/${pendingLockedChild.id}/stories`)
      setPendingLockedChild(null)
    }
  }

  function handleLockVerify() {
    const activeChild = pendingLockedChild || child
    const childId = activeChild?.id
    const saved = localStorage.getItem(`glm_lock_pin_${childId}`)
    if (lockPin !== saved) { setLockPinError('Wrong PIN, try again'); return }
    localStorage.setItem('glm_child_locked', '1')
    if (childId) localStorage.setItem('glm_locked_child_id', String(childId))
    if (childId) {
      localStorage.setItem(`glm_session_limit_${childId}`, String(lockTimeLimit))
      localStorage.setItem(`glm_session_original_limit_${childId}`, String(lockTimeLimit))
      localStorage.setItem(`glm_session_max_snooze_${childId}`, String(lockMaxSnooze))
    }
    originalLimitRef.current = lockTimeLimit
    setChildLocked(true); setLockModal(null); setLockPin('')
    if (pendingLockedChild) {
      setChild(pendingLockedChild)
      navigate(`/child/${pendingLockedChild.id}/stories`)
      setPendingLockedChild(null)
    }
  }

  function handleUnlock() {
    const saved = localStorage.getItem(`glm_lock_pin_${child?.id}`)
    if (lockPin !== saved) { setLockPinError('Wrong PIN, try again'); return }
    localStorage.removeItem('glm_child_locked')
    localStorage.removeItem('glm_locked_child_id')
    if (child?.id) {
      localStorage.removeItem(`glm_session_limit_${child.id}`)
      localStorage.removeItem(`glm_session_original_limit_${child.id}`)
      localStorage.removeItem(`glm_session_max_snooze_${child.id}`)
    }
    originalLimitRef.current = 0
    setLockTimeLimit(0); setLockMaxSnooze(1)
    setChildLocked(false); setLockModal(null); setLockPin(''); setLockPinError(''); setLockModalForced(false)
    setChild(null); navigate('/child')
  }

  function handleThemeChange(key) { setChild(c => ({ ...c, theme: key })) }

  function handleChildSelectedLocked(c) {
    applyTheme(c.theme)
    setPendingLockedChild(c)
    setLockPin(''); setLockPinError('')
    const hasPin = !!localStorage.getItem(`glm_lock_pin_${c.id}`)
    setLockModal(hasPin ? 'lock-verify' : 'setup')
  }

  function handleChildSelected(c) {
    applyTheme(c.theme)
    setChild(c)
    setOfflineMode(localStorage.getItem(`glm_offline_${c.id}`) === '1')
    childApi.checkin(c.id).then(s => setChild(prev => prev ? { ...prev, streakCount: s.streakCount } : prev)).catch(() => {})
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
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return (
      <Routes>
        <Route path="/admin/profile"   element={<AdminProfilePage onLogout={handleLogout} />} />
        <Route path="/admin/*"         element={<AdminPage onLogout={handleLogout} />} />
        <Route path="/error/:code"     element={<ErrorPageRoute />} />
        <Route path="*"                element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    )
  }

  // ── Lock modal — rendered in any layout ──
  const activeChild = pendingLockedChild || child
  const lockTheme = activeChild ? (THEMES[activeChild.theme] || THEMES.coral) : THEMES.coral
  const lockGrad  = lockTheme.headerGrad
  const lockPrimary = lockTheme.primary
  const lockModalEl = lockModal ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 28, padding: '36px 32px', maxWidth: 340, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
        {(lockModal === 'setup' || lockModal === 'lock-verify') && (() => {
          const isSetup = lockModal === 'setup'
          const TIME_OPTS = [
            { label: '15m', value: 15 },
            { label: '30m', value: 30 },
            { label: '45m', value: 45 },
            { label: '1h', value: 60 },
            { label: '90m', value: 90 },
            { label: 'Custom', value: -1 },
          ]
          const isCustom = !TIME_OPTS.slice(0, -1).some(o => o.value === lockTimeLimit)
          const EXT_OPTS = [
            { label: 'None', value: 0 },
            { label: '1', value: 1 },
            { label: '2', value: 2 },
            { label: '3', value: 3 },
          ]
          const chipStyle = (active) => ({
            padding: '6px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: active ? '2px solid var(--primary)' : '2px solid #eee',
            background: active ? 'var(--primary)' : 'white',
            color: active ? 'white' : '#aaa',
          })
          return <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#333', marginBottom: 4 }}>
              {isSetup ? 'Set a Parent PIN' : `Lock for ${(pendingLockedChild || child)?.name}`}
            </div>
            <div style={{ fontSize: 13, color: '#777', marginBottom: 20, lineHeight: 1.5 }}>
              {isSetup
                ? `Choose a PIN and session settings for ${(pendingLockedChild || child)?.name}.`
                : `Enter your PIN to hand the device to ${(pendingLockedChild || child)?.name}.`}
            </div>

            {/* Session time */}
            <div style={{ textAlign: 'left', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 8 }}>SESSION TIME</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TIME_OPTS.map(o => (
                  <button key={o.value}
                    style={chipStyle(o.value === -1 ? isCustom : lockTimeLimit === o.value)}
                    onClick={() => {
                      if (o.value === -1) setLockTimeLimit(0)
                      else setLockTimeLimit(o.value)
                    }}>
                    {o.label}
                  </button>
                ))}
              </div>
              {isCustom && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number" inputMode="numeric" min={1} max={480}
                    placeholder="Minutes"
                    value={lockTimeLimit > 0 ? lockTimeLimit : ''}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v) && v > 0) setLockTimeLimit(Math.min(v, 480))
                      else setLockTimeLimit(0)
                    }}
                    style={{ width: 90, padding: '6px 10px', borderRadius: 10, border: '2px solid var(--primary)', fontSize: 14, fontWeight: 700, textAlign: 'center', outline: 'none' }}
                  />
                  <span style={{ fontSize: 13, color: '#888' }}>minutes</span>
                </div>
              )}
            </div>

            {/* Extensions — only if a time limit is set */}
            {lockTimeLimit > 0 && (
              <div style={{ textAlign: 'left', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 8 }}>EXTENSIONS ALLOWED</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {EXT_OPTS.map(o => (
                    <button key={o.value} style={chipStyle(lockMaxSnooze === o.value)} onClick={() => setLockMaxSnooze(o.value)}>{o.label}</button>
                  ))}
                </div>
              </div>
            )}

            <input type="number" inputMode="numeric" maxLength={4}
              placeholder={isSetup ? 'Enter 4 digits' : 'Enter your PIN'}
              className="pin-input"
              value={lockPin} onChange={e => { setLockPin(e.target.value.slice(0,4)); setLockPinError('') }}
              autoFocus
              style={{ width: '100%', textAlign: 'center', fontSize: 28, fontWeight: 900, letterSpacing: 12,
                border: `2px solid ${lockPinError ? '#cc0033' : '#eee'}`, borderRadius: 12, padding: '12px', marginBottom: 8, boxSizing: 'border-box' }} />
            {lockPinError && <div style={{ color: '#cc0033', fontSize: 12, marginBottom: 8 }}>{lockPinError}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => { setLockModal(null); setLockPin(''); if (pendingLockedChild) { applyTheme('coral'); setPendingLockedChild(null) } }}
                style={{ flex: 1, padding: '12px', borderRadius: 50, border: '1.5px solid #eee', background: 'white', color: '#aaa', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
              <button onClick={isSetup ? handleLockSetup : handleLockVerify}
                disabled={lockTimeLimit <= 0}
                style={{ flex: 1, padding: '12px', borderRadius: 50, border: 'none', background: lockGrad, color: 'white', fontWeight: 800, cursor: lockTimeLimit <= 0 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: lockTimeLimit <= 0 ? 0.5 : 1 }}>
                Lock App 🔒
              </button>
            </div>
          </>
        })()}
        {lockModal === 'unlock' && <>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{lockModalForced ? '⏰' : '🔓'}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#333', marginBottom: 8 }}>
            {lockModalForced ? "Time's up!" : 'Parent unlock'}
          </div>
          <div style={{ fontSize: 14, color: '#777', marginBottom: 24, lineHeight: 1.5 }}>
            {lockModalForced
              ? `Great session, ${child?.name}! 🌟 Ask a parent to enter the PIN to continue.`
              : 'Enter your 4-digit PIN to unlock'}
          </div>
          <input type="number" inputMode="numeric" maxLength={4} placeholder="PIN"
            value={lockPin} onChange={e => { setLockPin(e.target.value.slice(0,4)); setLockPinError('') }}
            autoFocus
            style={{ width: '100%', textAlign: 'center', fontSize: 28, fontWeight: 900, letterSpacing: 12,
              border: `2px solid ${lockPinError ? '#cc0033' : '#eee'}`, borderRadius: 12, padding: '12px', marginBottom: 8, boxSizing: 'border-box' }} />
          {lockPinError && <div style={{ color: '#cc0033', fontSize: 12, marginBottom: 8 }}>{lockPinError}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {!lockModalForced && (
              <button onClick={() => { setLockModal(null); setLockPin(''); setLockPinError('') }}
                style={{ flex: 1, padding: '12px', borderRadius: 50, border: '1.5px solid #eee', background: 'white', color: '#aaa', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
            )}
            <button onClick={handleUnlock}
              style={{ flex: 1, padding: '12px', borderRadius: 50, border: 'none', background: lockGrad, color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
              Unlock 🔓
            </button>
          </div>
        </>}
      </div>
    </div>
  ) : null

  // ── Child new/edit — full-page when no child active; edit stays in child layout when child is active ──
  const isChildManagementRoute = child
    ? /^\/child\/new$/.test(location.pathname)
    : /^\/child(\/new|\/\d+\/edit)$/.test(location.pathname)
  if (/^\/error\//.test(location.pathname)) {
    return <ErrorPageRoute />
  }
  if (restoring) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#fff9f0' }}>
        <span className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: '#ff6b6b' }}>Loading Glumbi…</span>
      </div>
    )
  }
  // When locked with a child active, block management routes — bounce back to child session
  if (childLocked && child && isChildManagementRoute) {
    return <Navigate to={`/child/${child.id}/stories`} replace />
  }
  if (isChildManagementRoute || !child) {
    const isManage = isChildManagementRoute
    const isChildPage = location.pathname === '/child'
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa', color: '#3d3d3d' }}>
        {lockModalEl}
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
            <button onClick={handleLogout}
              title="Sign out"
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

        {/* Mobile slide-out drawer */}
        {mgmtMenuOpen && (
          <div onClick={() => setMgmtMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
        )}
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
                { emoji: '📬', label: 'Contact Us',      path: '/contact' },
                { emoji: '🔒', label: 'Privacy Policy',  path: '/privacy' },
                { emoji: '⚖️', label: 'Terms of Service', path: '/terms' },
              ]},
            ].map(section => (
              <div key={section.heading}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, padding: '16px 20px 6px' }}>
                  {section.heading}
                </div>
                {section.items.map(item => (
                  <button key={item.path} onClick={() => { navigate(item.path); setMgmtMenuOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 20px', background: 'none', border: 'none', fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
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
          @media (max-width: 767px) {
            .mgmt-desktop-btns  { display: none !important; }
            .mgmt-mobile-btn    { display: flex !important; }
            .app-footer         { display: none !important; }
            .quota-pill-desktop { display: none !important; }
          }
        `}</style>

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/child"          element={childLocked && child ? <Navigate to={`/child/${child.id}/stories`} replace /> : <ChildList onChildSelected={handleChildSelected} onChildSelectedLocked={handleChildSelectedLocked} onLogout={handleLogout} onToggleOffline={toggleOffline} quota={quota} featureConfig={featureConfig} />} />
            <Route path="/child/new"      element={<ChildForm onChildCreated={handleChildSelected} enabledFeatureConfig={featureConfig} />} />
            <Route path="/child/:id/edit" element={<ChildForm onChildUpdated={c => { applyTheme(c.theme); if (child) setChild(c); navigate(-1) }} enabledFeatureConfig={featureConfig} />} />
            <Route path="/profile"        element={<ProfilePage onLogout={handleLogout} parentOnly />} />
            <Route path="/help"           element={<HelpPage />} />
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
  const NAV = navForChild(child, childLocked)
  const childAge = calcChildAge(child.birthYear)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Screen time alert modal ── */}
      {screenTimeAlert === true && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 28, padding: '36px 32px', maxWidth: 380, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center', fontFamily: 'Nunito, sans-serif',
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>⏰</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#333', marginBottom: 8 }}>
              Screen time check!
            </div>
            <div style={{ fontSize: 15, color: '#777', lineHeight: 1.6, marginBottom: 28 }}>
              Hey {child.name}! You've been learning for{' '}
              <strong style={{ color: theme.primary }}>{formatElapsed(sessionMinutes)}</strong>.
              {' '}Want to keep going or take a break?
            </div>
            {(() => {
              const maxSnooze = lockMaxSnooze
              const snoozesLeft = maxSnooze === 0 ? Infinity : Math.max(0, maxSnooze - snoozeCount)
              const original = originalLimitRef.current || lockTimeLimit
              // Only offer extensions strictly less than the original lock time.
              // Include small options (5, 10) so short custom sessions still get choices.
              // Show the two largest valid options so extensions feel meaningful.
              const allOptions = [5, 10, 15, 30, 45, 60].filter(m => m < original)
              const opt1 = allOptions[allOptions.length - 2] ?? allOptions[0]
              const opt2 = allOptions[allOptions.length - 1]
              const showTwo = !!opt1 && opt2 !== opt1
              return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {snoozesLeft > 0 && opt1 ? (<>
              <button onClick={() => handleScreenTimeSnooze(opt1)}
                style={{
                  padding: '14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: theme.headerGrad, color: 'white',
                  fontSize: 15, fontWeight: 800, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}>
                ✅ {opt1} more minutes!
              </button>
              {showTwo && <button onClick={() => handleScreenTimeSnooze(opt2)}
                style={{
                  padding: '14px', borderRadius: 50, border: `2px solid ${theme.primary}`,
                  background: 'white', color: theme.primary, cursor: 'pointer',
                  fontSize: 15, fontWeight: 800,
                }}>
                🕐 {opt2} more minutes
              </button>}
              {maxSnooze > 0 && <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center' }}>
                {snoozesLeft} snooze{snoozesLeft !== 1 ? 's' : ''} left
              </div>}
              </>) : (
              <div style={{ padding: '14px', borderRadius: 16, background: '#fff3cd', color: '#856404', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
                No more snoozes — time to wrap up! 🌙
              </div>
              )}
              <button onClick={() => {
                  setScreenTimeAlert(false)
                  if (childLocked) {
                    // Locked session: don't log out — show the unlock PIN modal for parent to take back
                    setLockPin(''); setLockPinError(''); setLockModal('unlock')
                  } else {
                    handleLogout()
                  }
                }}
                style={{
                  padding: '14px', borderRadius: 50, border: 'none',
                  background: '#f5f5f5', color: '#aaa', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700,
                }}>
                {childLocked ? "I'm done — lock 🔒" : "I'm done for now 👋"}
              </button>
            </div>
              )
            })()}
          </div>
        </div>
      )}

      {lockModalEl}

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

        {/* Word of Day widget — child locked mode only, top of sidebar */}
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

        {/* Utility links — Profile removed from child context (parent-only feature) */}

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
                {!childLocked && (
                  <button onClick={() => navigate(`/child/${child.id}/edit`)}
                    title="Edit child"
                    style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: '#888', cursor: 'pointer', lineHeight: '18px' }}>
                    ✏️ Edit
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!childLocked && (
                  <button onClick={() => { setChild(null); navigate('/child') }}
                    style={{ fontSize: isTV ? 13 : 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700 }}>
                    Switch child →
                  </button>
                )}
                {sessionStart && childLocked && (
                  <span style={{ fontSize: isTV ? 12 : 10, fontWeight: 700,
                    color: lockTimeLimit > 0 && sessionMinutes >= lockTimeLimit ? '#cc0033' : '#aaa' }}>
                    ⏱️ {formatElapsed(sessionMinutes)}{lockTimeLimit > 0 ? ` / ${formatElapsed(lockTimeLimit)}` : ' used'}
                  </span>
                )}
                {child?.streakCount > 0 && (
                  <span title={`${child.streakCount}-day streak!`} style={{ fontSize: isTV ? 13 : 11, fontWeight: 800, color: '#f7a800', display: 'flex', alignItems: 'center', gap: 2 }}>
                    🔥 {child.streakCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!childLocked && <ThemePicker child={child} onThemeChange={handleThemeChange} />}
            {!childLocked && <button onClick={() => startTour(child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null, quota, featureConfig)} title="Tour"
              style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #eee', cursor: 'pointer', fontSize: 18, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❓</button>}
            {!childLocked && <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: '#fff0f0', color: '#cc0033', border: '1.5px solid #fcc', cursor: 'pointer' }}>
              <span style={{ fontSize: 16 }}>🚪</span>
              <span>Sign Out</span>
            </button>}
            {childLocked && <ThemePicker child={child} onThemeChange={handleThemeChange} />}
            {childLocked && (
              <button onClick={() => { setLockPin(''); setLockPinError(''); setLockModal('unlock') }}
                title="Parent access"
                style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #fcc', cursor: 'pointer', fontSize: 18, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🔒
              </button>
            )}
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
            <span id="tour-child-name"
              onClick={childLocked ? () => { setLockPin(''); setLockPinError(''); setLockModal('unlock') } : undefined}
              style={{ fontSize: 24, cursor: childLocked ? 'pointer' : 'default', position: 'relative' }}>
              {child.avatarEmoji}
              {childLocked && <span style={{ position: 'absolute', bottom: -2, right: -4, fontSize: 10 }}>🔒</span>}
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>
                {child.name}
              </div>
              {sessionStart && childLocked
                ? <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>
                    ⏱️ {formatElapsed(sessionMinutes)}{lockTimeLimit > 0 ? ` / ${formatElapsed(lockTimeLimit)}` : ' used'}
                  </div>
                : childAge !== null && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{childAge} yrs</div>
              }
            </div>
            <span id="tour-mobile-theme"><ThemePicker child={child} onThemeChange={handleThemeChange} /></span>
            <button id="tour-mobile-menu" onClick={() => setMobileMenuOpen(true)}
              style={{
                width: 36, height: 36, borderRadius: 10, padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: 18, cursor: 'pointer',
              }}>☰</button>
          </div>
        </header>
        <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onLogout={handleLogout} child={child} theme={theme}
          onSwitchChild={() => { setChild(null); navigate('/child') }}
          onTour={() => startTour(child?.enabledFeatures ? JSON.parse(child.enabledFeatures) : null, quota, featureConfig)}
          wotd={sidebarWotd}
          childLocked={childLocked}
          onUnlock={() => { setLockPin(''); setLockPinError(''); setLockModal('unlock') }} />

        {/* ── Offline banner ── */}
        {offlineMode && (
          <div style={{ background: '#f4f6ff', borderBottom: '1px solid #dce4f7', padding: '7px 24px', fontSize: 12, fontWeight: 700, color: '#5a72c9', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span>✈️ Practice mode — AI features are paused. Listening and browsing still work.</span>
            {!childLocked && (
              <button onClick={() => toggleOffline()} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#5a72c9', fontWeight: 800, cursor: 'pointer', fontSize: 12, textDecoration: 'underline', padding: 0 }}>
                Turn AI on →
              </button>
            )}
          </div>
        )}

        {/* ── Page content ── */}
        <main className="main-scroll" style={{
          flex: 1,
          padding: isMobile ? '16px 12px' : isTV ? '32px 40px' : '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <OfflineContext.Provider value={offlineMode}>
          <div className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/child/:childId/stories"    element={<FeatureGuard featureName="story"         featureConfig={featureConfig}><Stories    child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/activities" element={<FeatureGuard featureName="activity"      featureConfig={featureConfig}><Activities child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/curiosity"  element={<FeatureGuard featureName="curiosity"     featureConfig={featureConfig}><Curiosity  child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/draw"       element={<FeatureGuard featureName="draw"          featureConfig={featureConfig}><Draw       child={child} quota={quota} featureConfig={featureConfig} /></FeatureGuard>} />
              <Route path="/child/:childId/journal"    element={childLocked ? <Navigate to={`/child/${child.id}/stories`} replace /> : <Journal    child={child} featureConfig={featureConfig} />} />
              <Route path="/child/:childId/timeline"   element={childLocked ? <Navigate to={`/child/${child.id}/stories`} replace /> : <Timeline   child={child} />} />
              <Route path="/child/:childId/readquiz"   element={<FeatureGuard featureName="read-quiz"     featureConfig={featureConfig}><ReadQuiz   child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/learn"      element={<FeatureGuard featureName="learn-validate" featureConfig={featureConfig}><LearnPage  child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/mywriting"  element={<FeatureGuard featureName="writing-coach" featureConfig={featureConfig}><MyWriting  child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:childId/memory"    element={<FeatureGuard featureName="memory-flashcards" featureConfig={featureConfig}><MemoryPlay child={child} quota={quota} /></FeatureGuard>} />
              <Route path="/child/:id/edit"      element={childLocked ? <Navigate to={`/child/${child.id}/stories`} replace /> : <ChildForm onChildUpdated={c => { applyTheme(c.theme); setChild(c); navigate(-1) }} enabledFeatureConfig={featureConfig} inChildContext />} />
              <Route path="/child/:childId/profile" element={childLocked ? <Navigate to={`/child/${child.id}/stories`} replace /> : <ProfilePage onLogout={handleLogout} />} />
              <Route path="/profile"             element={childLocked ? <Navigate to={`/child/${child.id}/stories`} replace /> : <ProfilePage onLogout={handleLogout} />} />
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
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* ── Bottom nav (mobile only) — pinned favourites + menu ── */}
      <nav className="bottom-nav">
        {NAV.slice(0, 4).map(n => (
          <NavLink key={n.path} to={`/child/${child.id}/${n.path}`}
            style={({ isActive }) => ({
              flex: '0 0 auto', width: '20%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              textDecoration: 'none', fontSize: 9, fontWeight: 700,
              color: isActive ? theme.primary : '#bbb',
              borderTop: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
              paddingTop: 4,
              transition: 'color 0.15s',
            })}>
            <span style={{ fontSize: 22 }}>{n.emoji}</span>
            <span style={{ whiteSpace: 'nowrap' }}>{n.mobileLabel}</span>
          </NavLink>
        ))}
        <button onClick={() => setMobileMenuOpen(true)}
          style={{
            flex: '0 0 auto', width: '20%', display: 'flex', flexDirection: 'column',
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
