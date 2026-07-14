import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useLockSession({ child, setChild, prevChildId }) {
  const navigate = useNavigate()

  const [childLocked, setChildLocked]         = useState(() => localStorage.getItem('glm_child_locked') === '1')
  const [lockModal, setLockModal]             = useState(null)
  const [lockPin, setLockPin]                 = useState('')
  const [lockPinError, setLockPinError]       = useState('')
  const [showPin, setShowPin]                 = useState(false)
  const [pendingLockedChild, setPendingLockedChild] = useState(null)
  const [lockTimeLimit, setLockTimeLimit]     = useState(30)
  const [lockMaxSnooze, setLockMaxSnooze]     = useState(1)
  const [lockModalForced, setLockModalForced] = useState(false)
  const [sessionStart, setSessionStart]       = useState(null)
  const [sessionMinutes, setSessionMinutes]   = useState(0)
  const [screenTimeAlert, setScreenTimeAlert] = useState(false)
  const [snoozeCount, setSnoozeCount]         = useState(0)

  const sessionStartRef     = useRef(null)
  const lastTickRef         = useRef(null)
  const sessionEndedRef     = useRef(false)
  const originalLimitRef    = useRef(0)
  const alertOpenedAtRef    = useRef(null)
  const screenTimeAlertRef  = useRef(false)
  const lockMaxSnoozeRef    = useRef(1)

  // Keep refs in sync
  useEffect(() => { sessionStartRef.current = sessionStart }, [sessionStart])
  useEffect(() => { lockMaxSnoozeRef.current = lockMaxSnooze }, [lockMaxSnooze])
  useEffect(() => { screenTimeAlertRef.current = !!screenTimeAlert }, [screenTimeAlert])

  // Start/restore session timer when child changes
  useEffect(() => {
    if (!child) {
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
    const startKey      = `glm_session_start_${child.id}`
    const snoozeKey     = `glm_snooze_count_${child.id}`
    const limitKey      = `glm_session_limit_${child.id}`
    const maxSnoozeKey  = `glm_session_max_snooze_${child.id}`
    const originalKey   = `glm_session_original_limit_${child.id}`

    const stored   = localStorage.getItem(startKey)
    const storedMs = stored ? parseInt(stored) : null
    const isToday  = storedMs && new Date(storedMs).toDateString() === new Date().toDateString()
    const start    = isToday ? storedMs : Date.now()
    if (!stored || !isToday) {
      localStorage.setItem(startKey, String(start))
      localStorage.removeItem(snoozeKey)
      setSnoozeCount(0)
    } else {
      const saved = localStorage.getItem(snoozeKey)
      setSnoozeCount(saved ? parseInt(saved) : 0)
    }

    const storedLimit      = localStorage.getItem(limitKey)
    const storedMaxSnooze  = localStorage.getItem(maxSnoozeKey)
    const storedOriginal   = localStorage.getItem(originalKey)
    const restoredLimit    = storedLimit    ? parseInt(storedLimit)    : 0
    const restoredMaxSnooze = storedMaxSnooze ? parseInt(storedMaxSnooze) : 1
    const restoredOriginal = storedOriginal ? parseInt(storedOriginal) : restoredLimit
    setLockTimeLimit(restoredLimit)
    setLockMaxSnooze(restoredMaxSnooze)
    originalLimitRef.current = restoredOriginal

    const elapsed = Math.max(0, Math.floor((Date.now() - start) / 60000))
    setSessionStart(start)
    setSessionMinutes(restoredLimit > 0 ? Math.min(elapsed, restoredLimit) : elapsed)
    setScreenTimeAlert(false)

    if (restoredLimit > 0 && elapsed >= restoredLimit) {
      const savedSnooze = localStorage.getItem(snoozeKey)
      const currentSnooze = savedSnooze ? parseInt(savedSnooze) : 0
      alertOpenedAtRef.current = Date.now()
      setScreenTimeAlert(restoredMaxSnooze > 0 && currentSnooze >= restoredMaxSnooze ? 'force-end' : true)
    }
  }, [child?.id])

  // Tick every 30s — update elapsed and check limit
  useEffect(() => {
    if (!sessionStart || !childLocked) return
    lastTickRef.current = Date.now()
    const interval = setInterval(() => {
      const now   = Date.now()
      const delta = lastTickRef.current ? now - lastTickRef.current : 60000
      lastTickRef.current = now

      if (delta > 45000) {
        // Device woke from sleep — advance session start to exclude sleep time
        const sleepMs  = delta - 30000
        const adjusted = Math.min(sessionStartRef.current + sleepMs, Date.now())
        sessionStartRef.current = adjusted
        setSessionStart(adjusted)
        if (child?.id) localStorage.setItem(`glm_session_start_${child.id}`, String(adjusted))
      }

      if (document.hidden || screenTimeAlertRef.current) return
      const elapsed = Math.max(0, Math.floor((Date.now() - sessionStartRef.current) / 60000))
      setSessionMinutes(lockTimeLimit > 0 ? Math.min(elapsed, lockTimeLimit) : elapsed)
      if (!lockTimeLimit || sessionEndedRef.current) return
      if (elapsed >= lockTimeLimit) {
        setSnoozeCount(current => {
          alertOpenedAtRef.current = Date.now()
          if (lockMaxSnoozeRef.current > 0 && current >= lockMaxSnoozeRef.current) {
            setTimeout(() => setScreenTimeAlert('force-end'), 0)
          } else {
            setScreenTimeAlert(true)
          }
          return current
        })
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [sessionStart, lockTimeLimit, childLocked])

  // Pause timer while page is hidden (device sleep / tab switch)
  useEffect(() => {
    let hiddenAt = null
    function onVisibility() {
      if (document.hidden) {
        hiddenAt = Date.now()
      } else if (hiddenAt !== null && sessionStartRef.current) {
        const idle     = Date.now() - hiddenAt
        const newStart = sessionStartRef.current + idle
        sessionStartRef.current = newStart
        setSessionStart(newStart)
        if (child?.id) localStorage.setItem(`glm_session_start_${child.id}`, String(newStart))
        lastTickRef.current = Date.now()
        hiddenAt = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [child?.id])

  // Exit fullscreen when screen-time alert fires
  useEffect(() => {
    if (!screenTimeAlert) return
    if (document.fullscreenElement) document.exitFullscreen?.()
  }, [screenTimeAlert])

  // Auto-end session when all snoozes exhausted
  useEffect(() => {
    if (screenTimeAlert !== 'force-end') return
    sessionEndedRef.current = true
    setScreenTimeAlert(false)
    if (childLocked) {
      setLockModalForced(true)
      setLockPin(''); setLockPinError(''); setLockModal('unlock')
    } else {
      setChild(null); navigate('/child')
    }
  }, [screenTimeAlert])

  function handleScreenTimeSnooze(extraMinutes) {
    const newStart = alertOpenedAtRef.current ?? Date.now()
    alertOpenedAtRef.current = null
    if (child?.id) {
      localStorage.setItem(`glm_session_start_${child.id}`, String(newStart))
      localStorage.setItem(`glm_session_limit_${child.id}`, String(extraMinutes))
    }
    sessionEndedRef.current = false
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
    setChildLocked(true); setLockModal(null); setLockPin(''); setShowPin(false)
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
    setChildLocked(true); setLockModal(null); setLockPin(''); setShowPin(false)
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
    setChildLocked(false); setLockModal(null); setLockPin(''); setLockPinError('')
    setLockModalForced(false); setShowPin(false)
    setChild(null); navigate('/child')
  }

  function endSessionLocked() {
    sessionEndedRef.current = true
    setLockPin(''); setLockPinError(''); setLockModalForced(true); setLockModal('unlock')
    setScreenTimeAlert(false)
  }

  function resetLock() {
    setChildLocked(false)
    setLockModal(null); setLockPin(''); setLockPinError(''); setShowPin(false)
    setLockModalForced(false)
  }

  function formatElapsed(minutes) {
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  return {
    childLocked, setChildLocked,
    lockModal, setLockModal,
    lockPin, setLockPin,
    lockPinError, setLockPinError,
    showPin, setShowPin,
    pendingLockedChild, setPendingLockedChild,
    lockTimeLimit, setLockTimeLimit,
    lockMaxSnooze, setLockMaxSnooze,
    lockModalForced, setLockModalForced,
    sessionStart, sessionMinutes,
    screenTimeAlert, setScreenTimeAlert,
    snoozeCount,
    originalLimitRef,
    handleLockSetup, handleLockVerify, handleUnlock,
    handleScreenTimeSnooze, endSessionLocked,
    engageLock,
    resetLock,
    formatElapsed,
  }
}
