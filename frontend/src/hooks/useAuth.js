import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { userApi } from '../api/client'

export function getStoredToken() { return localStorage.getItem('glm_token') }
export function getStoredRole()  { return localStorage.getItem('glm_role')  }

export function useAuth({ addToast }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [authed, setAuthed]               = useState(!!getStoredToken())
  const [role, setRole]                   = useState(getStoredRole())
  const [quota, setQuota]                 = useState(null)
  const [featureConfig, setFeatureConfig] = useState([])
  const [consentGiven, setConsentGiven]   = useState(false)
  const [consentLoaded, setConsentLoaded] = useState(false) // stays false until first profile fetch resolves
  const [restoring, setRestoring]         = useState(
    () => !!getStoredToken() && (
      /^\/child\/\d+\//.test(window.location.pathname) ||
      (localStorage.getItem('glm_child_locked') === '1' && !!localStorage.getItem('glm_locked_child_id'))
    )
  )

  // Quota + feature config + consent on login; poll quota every 5 min
  useEffect(() => {
    if (!authed || role !== 'USER') return
    function fetchQuota() { userApi.quota().then(setQuota).catch(() => {}) }
    userApi.featureCredits().then(setFeatureConfig).catch(() => {})
    userApi.getProfile().then(p => { setConsentGiven(p.consentGiven === true); setConsentLoaded(true) }).catch(() => { setConsentLoaded(true) })
    fetchQuota()
    const interval = setInterval(fetchQuota, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [authed, role])

  // Refresh feature config on every route change (admin toggles take effect without re-login)
  useEffect(() => {
    if (!authed || role !== 'USER') return
    userApi.featureCredits().then(setFeatureConfig).catch(() => {})
  }, [location.pathname, authed, role])

  // Warn when approaching/hitting quota
  useEffect(() => {
    if (!quota) return
    const pct = quota.used / quota.limit
    if (pct >= 1) addToast('🚫 Monthly limit reached — usage resets on the 1st', 'error')
    else if (pct >= 0.8 && quota.used % 10 === 0) addToast(`⚠️ ${quota.used}/${quota.limit} monthly AI credits used`, 'warning')
  }, [quota])

  // Expose quota refresh globally so AI feature pages can trigger it after usage
  useEffect(() => {
    window.__glumbiRefreshQuota = (featureName) => {
      if (featureName) {
        const fc = featureConfig.find(f => f.featureName === featureName)
        if (fc?.creditCost > 0) {
          window.dispatchEvent(new CustomEvent('glumbi:credit-used', { detail: { cost: fc.creditCost } }))
        }
      }
      userApi.quota().then(setQuota).catch(() => {})
    }
  }, [featureConfig])

  async function handleAuth(userRole) {
    setRole(userRole)
    if (userRole === 'USER') {
      try {
        const p = await userApi.getProfile()
        setConsentGiven(p.consentGiven === true)
      } catch (_) {}
      setConsentLoaded(true)
    }
    setAuthed(true)
    navigate(userRole === 'ADMIN' ? '/admin/users' : '/child')
  }

  // Returns the partial auth-only logout. App.jsx composes it with child/lock resets.
  function logoutAuth() {
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
        k.startsWith('glm_offline_')
      )
      .forEach(k => localStorage.removeItem(k))
    setAuthed(false)
    setRole(null)
    navigate('/', { replace: true })
  }

  return {
    authed, role,
    restoring, setRestoring,
    quota, setQuota,
    featureConfig,
    consentGiven, setConsentGiven, consentLoaded,
    handleAuth,
    logoutAuth,
  }
}
