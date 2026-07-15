import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyTheme } from '../themes'
import { childApi, memoryApi } from '../api/client'
import { startTour } from '../tour'

export function useChildSession({ authed, role, featureConfig, setRestoring, quota }) {
  const navigate = useNavigate()

  const [child, setChild]           = useState(null)
  const [offlineMode, setOfflineMode] = useState(false)
  const [sidebarWotd, setSidebarWotd] = useState(null)
  const wotdDateRef                 = useRef(null)
  const prevChildId                 = useRef(null)

  // Restore child from URL on hard refresh, or from locked-child localStorage
  useEffect(() => {
    if (!authed || role === 'ADMIN' || child) { setRestoring(false); return }
    const urlMatch = window.location.pathname.match(/^\/child\/(\d+)\//)
    const lockedId = localStorage.getItem('glm_locked_child_id')
    const idToRestore = urlMatch?.[1] || (localStorage.getItem('glm_child_locked') === '1' && lockedId)
    if (!idToRestore) { setRestoring(false); return }
    childApi.get(idToRestore)
      .then(c => {
        applyTheme(c.theme)
        setChild(c)
        setOfflineMode(localStorage.getItem(`glm_offline_${c.id}`) === '1')
        if (localStorage.getItem('glm_child_locked') === '1') {
          childApi.checkin(c.id)
            .then(s => setChild(prev => prev ? { ...prev, streakCount: s.streakCount } : prev))
            .catch(() => {})
        }
        if (!urlMatch && localStorage.getItem('glm_child_locked') === '1') {
          navigate(`/child/${c.id}/stories`, { replace: true })
        }
      })
      .catch(() => navigate('/child', { replace: true }))
      .finally(() => setRestoring(false))
  }, []) // intentionally run only on mount

  // Sync offline mode whenever the active child changes (covers lock path where setChild is called directly)
  useEffect(() => {
    if (!child?.id) return
    setOfflineMode(localStorage.getItem(`glm_offline_${child.id}`) === '1')
  }, [child?.id])

  // Prefetch Word of Day when child is selected (if memory feature is enabled)
  useEffect(() => {
    setSidebarWotd(null)
    wotdDateRef.current = null
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

    function onVisible() {
      if (document.hidden) return
      const today = new Date().toISOString().slice(0, 10)
      const fetched = Array.isArray(wotdDateRef.current)
        ? `${wotdDateRef.current[0]}-${String(wotdDateRef.current[1]).padStart(2, '0')}-${String(wotdDateRef.current[2]).padStart(2, '0')}`
        : wotdDateRef.current
      if (fetched !== today) fetchWotd()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id, featureConfig.map(f => `${f.featureName}:${f.enabled}`).join(',')])

  function handleChildSelected(c) {
    applyTheme(c.theme)
    setChild(c)
    setOfflineMode(localStorage.getItem(`glm_offline_${c.id}`) === '1')
    navigate(`/child/${c.id}/stories`)
    if (!localStorage.getItem('glm_tour_done')) {
      localStorage.setItem('glm_tour_done', '1')
      const features = c.enabledFeatures ? JSON.parse(c.enabledFeatures) : null
      setTimeout(() => startTour(features, quota, featureConfig), 600)
    }
  }

  function handleThemeChange(key) { setChild(c => ({ ...c, theme: key })) }

  function toggleOffline(childId) {
    const id = childId ?? child?.id
    if (!id) return
    setOfflineMode(v => {
      const next = !v
      localStorage.setItem(`glm_offline_${id}`, next ? '1' : '0')
      return next
    })
  }

  // Reset child state (called on logout or when returning to child list)
  function resetChild() {
    if (prevChildId.current !== null) {
      Object.keys(localStorage)
        .filter(k => k.startsWith('glm_session_start_') || k.startsWith('glm_snooze_count_'))
        .forEach(k => localStorage.removeItem(k))
    }
    prevChildId.current = null
    applyTheme('coral')
    setChild(null)
    setOfflineMode(false)
    setSidebarWotd(null)
  }

  return {
    child, setChild,
    offlineMode,
    sidebarWotd,
    prevChildId,
    handleChildSelected,
    handleThemeChange,
    toggleOffline,
    resetChild,
  }
}
