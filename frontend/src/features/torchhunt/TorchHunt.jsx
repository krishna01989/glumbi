import { useState, useEffect, useRef, useCallback } from 'react'
import { isCreditsBlocked } from '../../utils/quota'
import { torchHuntApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import QuotaBanner from '../../components/QuotaBanner'
import FeatureBanner from '../../components/FeatureBanner'
import ThemeLoader from '../../components/ThemeLoader'
import EmojiImg from '../../components/EmojiImg'

const DECOY_COUNT = 4


// ── Age-adaptive config (radius is a fraction of the shorter arena dimension) ─
function gameConfig(age) {
  if (age <= 4)  return { objectCount: 4,  radiusFraction: 0.22, dwellMs: 1200, placementZone: 1.0, defaultIntensity: 3 }
  if (age <= 6)  return { objectCount: 8,  radiusFraction: 0.17, dwellMs: 950,  placementZone: 1.0, defaultIntensity: 2 }
  if (age <= 8)  return { objectCount: 14, radiusFraction: 0.13, dwellMs: 700,  placementZone: 1.0, defaultIntensity: 2 }
  return              { objectCount: 20, radiusFraction: 0.10, dwellMs: 500,  placementZone: 1.0, defaultIntensity: 2 }
}

function calcAge(child) {
  if (!child?.birthYear) return 6
  return new Date().getFullYear() - child.birthYear
}

function themeLabel(key) {
  if (!key) return 'Your World'
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
}

// ── Object placement — constrained to a central zone, min-distance guaranteed ─
function placeObjects(objects, containerW, containerH, torchRadius = 80, placementZone = 1.0, emojiSize = 40) {
  const zoneW = containerW * placementZone
  const zoneH = containerH * placementZone
  const offsetX = (containerW - zoneW) / 2
  const offsetY = (containerH - zoneH) / 2
  // pad = full emoji size so center is a full emoji-width from the border,
  // leaving half an emoji of breathing room even with float/parallax movement
  const pad = Math.max(emojiSize + 16, Math.min(zoneW, zoneH) * 0.12)
  const minDist = Math.max(torchRadius * 1.8, Math.min(zoneW, zoneH) * 0.22)
  const placed = []
  return objects.map((obj, i) => {
    let x, y, attempts = 0
    do {
      x = offsetX + pad + Math.random() * (zoneW - pad * 2)
      y = offsetY + pad + Math.random() * (zoneH - pad * 2)
      attempts++
    } while (attempts < 80 && placed.some(p => Math.hypot(p.x - x, p.y - y) < minDist))
    placed.push({ x, y })
    return { ...obj, x, y, found: false, layer: i % 3 }
  })
}

// ── CSS injected once ─────────────────────────────────────────────────────────
let styleInjected = false
function injectStyles() {
  if (styleInjected) return
  styleInjected = true
  const el = document.createElement('style')
  el.textContent = `
    @keyframes th-pop {
      0%   { transform: scale(1) rotateY(0deg); }
      30%  { transform: scale(1.8) rotateY(180deg); }
      60%  { transform: scale(1.4) rotateY(360deg); }
      100% { transform: scale(1) rotateY(360deg); }
    }
    @keyframes th-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-6px); }
    }
    @keyframes th-shimmer {
      0%   { opacity: 0.5; }
      50%  { opacity: 1; }
      100% { opacity: 0.5; }
    }
    @keyframes th-fact-in {
      0%   { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes th-glow-pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(255,220,80,0.4); }
      50%       { box-shadow: 0 0 40px rgba(255,220,80,0.8); }
    }
    @keyframes th-tap-me {
      0%, 100% { transform: translate(-50%,-50%) scale(1); filter: drop-shadow(0 0 6px var(--primary)); }
      50%       { transform: translate(-50%,-50%) scale(1.35); filter: drop-shadow(0 0 18px var(--primary)); }
    }
    @keyframes th-tap-hint {
      0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.85; }
      50%       { transform: translate(-50%,-50%) scale(1.12); opacity: 1; }
    }
  `
  document.head.appendChild(el)
}

// ── Common confetti (full-screen, fires on all-found) ─────────────────────────
function Confetti({ count = 32 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    key: i, left: Math.random() * 100,
    color: ['#ff6b6b','#ffd32a','#6bcb77','#4facfe','#f093fb','#ff9800'][i % 6],
    delay: Math.random() * 0.8, size: 8 + Math.random() * 10, dur: 1.5 + Math.random(),
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 999 }}>
      {pieces.map(p => (
        <div key={p.key} style={{
          position: 'absolute', left: `${p.left}%`, top: '-20px',
          width: p.size, height: p.size, background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : 2,
          animation: `cfFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
      <style>{`@keyframes cfFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  )
}

// ── Fun fact popup ────────────────────────────────────────────────────────────
function FactCard({ obj, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
      fontFamily: 'Nunito, sans-serif',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '2px solid rgba(255,220,80,0.6)',
        borderRadius: 20, padding: '28px 32px',
        maxWidth: 360, width: '90%',
        textAlign: 'center',
        animation: 'th-fact-in 0.3s ease',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(255,220,80,0.15)',
      }}>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><EmojiImg emoji={obj.emoji} size={56} /></div>
        <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--primary-lt)', marginBottom: 8 }}>
          You found {obj.name}!
        </div>
        {obj.funFact && (
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 16 }}>
            💡 {obj.funFact}
          </div>
        )}
        <button onClick={onClose} style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          border: 'none', borderRadius: 50, padding: '10px 28px',
          color: 'white', fontWeight: 800, fontSize: 15,
          cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
        }}>
          Keep hunting! 🔦
        </button>
      </div>
    </div>
  )
}

// ── Canvas torch overlay ──────────────────────────────────────────────────────
function TorchCanvas({ torchPos, torchRadius, width, height, showLight }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, width, height)

    // Dark overlay — always drawn
    ctx.fillStyle = 'rgba(4,4,14,0.96)'
    ctx.fillRect(0, 0, width, height)

    if (!showLight) return

    const dir = -Math.PI / 2  // fixed upward — nozzle always points to ceiling
    const halfAngle = Math.PI / 5  // 36° half-angle → 72° total cone
    const coneLen = torchRadius * 1.7

    // Cut cone via destination-out — narrow at cursor, fans outward
    ctx.globalCompositeOperation = 'destination-out'
    const grd = ctx.createRadialGradient(
      torchPos.x, torchPos.y, 0,
      torchPos.x, torchPos.y, coneLen
    )
    grd.addColorStop(0,    'rgba(0,0,0,1)')
    grd.addColorStop(0.45, 'rgba(0,0,0,0.95)')
    grd.addColorStop(0.8,  'rgba(0,0,0,0.5)')
    grd.addColorStop(1,    'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.moveTo(torchPos.x, torchPos.y)
    ctx.arc(torchPos.x, torchPos.y, coneLen, dir - halfAngle, dir + halfAngle)
    ctx.closePath()
    ctx.fill()

    ctx.globalCompositeOperation = 'source-over'

    // Warm glow at the torch source
    const glowGrd = ctx.createRadialGradient(
      torchPos.x, torchPos.y, 0,
      torchPos.x, torchPos.y, torchRadius * 0.45
    )
    glowGrd.addColorStop(0, 'rgba(255,200,80,0.18)')
    glowGrd.addColorStop(1, 'rgba(255,200,80,0)')
    ctx.fillStyle = glowGrd
    ctx.beginPath()
    ctx.arc(torchPos.x, torchPos.y, torchRadius * 0.45, 0, Math.PI * 2)
    ctx.fill()
  }, [torchPos, torchRadius, width, height, showLight])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TorchHunt({ child, quota, featureConfig }) {
  const { track } = useTracker()
  const { markActive } = useFeatureDuration('torch-hunt', track)
  const isOffline = useOffline()

  injectStyles()

  const age = calcAge(child)
  const cfgBase = gameConfig(age)
  const childTheme = child.theme || 'coral'

  // ── State ──
  const [phase, setPhase] = useState('idle')  // idle | loading | playing | complete
  const [packReady, setPackReady] = useState(null)  // null=checking, true=ready, false=needs generation
  const [pack, setPack] = useState(null)
  const [placedObjects, setPlacedObjects] = useState([])
  const [foundCount, setFoundCount] = useState(0)
  const [torchPos, setTorchPos] = useState({ x: 200, y: 200 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [factCard, setFactCard] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [sessionObjects, setSessionObjects] = useState([])
  const [decoyObjects, setDecoyObjects] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [torchOn, setTorchOn] = useState(true)
  const [torchIntensity, setTorchIntensity] = useState(cfgBase.defaultIntensity)
  const [isDwelling, setIsDwelling] = useState(false)
  const dwellCircleRef = useRef(null)  // direct DOM ref — bypasses React batching for animation
  const [error, setError] = useState(null)
  const [narrativeIdx, setNarrativeIdx] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })

  const arenaRef = useRef(null)
  const containerRef = useRef(null)
  const dwellStartRef = useRef(null)
  const dwellFiredRef = useRef(false)
  const selectedTargetRef = useRef(null)
  const placedObjectsRef = useRef([])
  const torchOnRef = useRef(true)
  const effectiveTorchRadiusRef = useRef(100)
  const dwellMsRef = useRef(cfgBase.dwellMs)
  const childThemeRef = useRef(childTheme)
  const trackRef = useRef(track)
  const [arenaSize, setArenaSize] = useState(null)

  // Compute pixel values once arenaSize is measured — fully device + age adaptive
  const shortSide = arenaSize ? Math.max(200, Math.min(arenaSize.w, arenaSize.h)) : 400
  const cfg = {
    objectCount:    cfgBase.objectCount,
    torchRadius:    Math.round(shortSide * cfgBase.radiusFraction),
    dwellMs:        cfgBase.dwellMs,
    placementZone:  cfgBase.placementZone,
  }

  const isEnabled = !featureConfig || !!featureConfig.find(f => f.featureName === 'torch-hunt' && f.enabled !== false)
  const blocked = isCreditsBlocked(quota)
  const effectiveTorchRadius = cfg.torchRadius * [0.7, 1.0, 1.55][torchIntensity - 1]

  // Keep refs in sync so the stable handlePointerMove can always read fresh values
  selectedTargetRef.current = selectedTarget
  placedObjectsRef.current = placedObjects
  torchOnRef.current = torchOn
  effectiveTorchRadiusRef.current = effectiveTorchRadius
  dwellMsRef.current = cfg.dwellMs
  childThemeRef.current = childTheme
  trackRef.current = track

  // ── Check if pack already exists on mount / when theme changes ──
  useEffect(() => {
    setPackReady(null)
    torchHuntApi.getPackReady(child.id, childTheme)
      .then(data => setPackReady(!!data.ready))
      .catch(() => setPackReady(false))
  }, [child.id, childTheme])

  // ── Arena sizing — ResizeObserver fires on first layout, no default guess needed ──
  useEffect(() => {
    if (!arenaRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setArenaSize({ w: width, h: height })
    })
    ro.observe(arenaRef.current)
    return () => ro.disconnect()
  }, [phase])

  // ── Fullscreen listener ──
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  // ── Re-place objects whenever arena is resized (fixes initial wrong-size placement) ──
  useEffect(() => {
    if (phase !== 'playing' || !sessionObjects.length) return
    if (!arenaSize || arenaSize.w < 50 || arenaSize.h < 50) return
    setPlacedObjects(prev => {
      const foundNames = new Set(prev.filter(o => o.found && !o.isDecoy).map(o => o.name))
      const allForPlacement = [
        ...sessionObjects,
        ...decoyObjects.map(o => ({ ...o, isDecoy: true })),
      ]
      const emojiSize = age <= 4 ? 56 : age <= 6 ? 46 : age <= 8 ? 34 : 28
      return placeObjects(allForPlacement, arenaSize.w, arenaSize.h, cfg.torchRadius, cfg.placementZone, emojiSize).map(o => ({
        ...o,
        found: !o.isDecoy && foundNames.has(o.name),
      }))
    })
  }, [arenaSize, sessionObjects, decoyObjects, phase])

  // ── Reset dwell when target changes ──
  useEffect(() => {
    dwellStartRef.current = null
    dwellFiredRef.current = false
    setIsDwelling(false)
  }, [selectedTarget])

  // ── Narrative rotation ──
  useEffect(() => {
    if (phase !== 'playing') return
    if (!pack?.narratives?.length) return
    const interval = setInterval(() => {
      setNarrativeIdx(i => (i + 1) % pack.narratives.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [phase, pack])

  // ── Load pack ──
  const loadPack = useCallback(async () => {
    const wasNew = !packReady
    setError(null)
    setPhase('loading')
    try {
      const data = await torchHuntApi.getPack(child.id, childTheme)
      setPack(data)
      setPackReady(true)

      if (wasNew) {
        window.__glumbiRefreshQuota?.('torch-hunt')
      }

      const allObjs = data.objects || []
      const shuffled = [...allObjs].sort(() => Math.random() - 0.5)
      const sessionObjs = shuffled.slice(0, cfg.objectCount)
      const decoyObjs = shuffled.slice(cfg.objectCount, cfg.objectCount + DECOY_COUNT)
      setPlacedObjects([])
      setSessionObjects(sessionObjs)
      setDecoyObjects(decoyObjs)
      setFoundCount(0)
      setSelectedTarget(null)
      setFactCard(null)
      setPhase('playing')
      setSessionStarted(false)
      track('torch-hunt', 'session_start', { metadata: { theme: childTheme } })
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not load the adventure. Try again!')
      setPhase('idle')
    }
  }, [child.id, childTheme, cfg.objectCount, track, packReady])


  const handlePlay = useCallback(() => {
    markActive()
    loadPack()
  }, [loadPack, markActive])

  const handleReplay = useCallback(() => {
    dwellStartRef.current = null
    dwellFiredRef.current = false
    setFoundCount(0)
    setSelectedTarget(null)
    selectedTargetRef.current = null
    setFactCard(null)
    setIsDwelling(false)
    setTorchPos({ x: 200, y: 200 })
    setPlacedObjects(prev => prev.map(o => ({ ...o, found: false })))
    setPhase('playing')
    setSessionStarted(false)
    markActive()
  }, [markActive])

  const handleRefresh = useCallback(async () => {
    setError(null)
    setPhase('loading')
    try {
      const data = await torchHuntApi.refresh(child.id, childTheme)
      setPack(data)
      setPackReady(true)
      window.__glumbiRefreshQuota?.('torch-hunt')

      const allObjs = data.objects || []
      const shuffled = [...allObjs].sort(() => Math.random() - 0.5)
      const sessionObjs = shuffled.slice(0, cfg.objectCount)
      const decoyObjs = shuffled.slice(cfg.objectCount, cfg.objectCount + DECOY_COUNT)
      setPlacedObjects([])
      setSessionObjects(sessionObjs)
      setDecoyObjects(decoyObjs)
      setFoundCount(0)
      setSelectedTarget(null)
      setFactCard(null)
      setPhase('playing')
      setSessionStarted(false)
      markActive()
      track('torch-hunt', 'session_start', { metadata: { theme: childTheme, refreshed: true } })
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not refresh. Try again!')
      setPhase('idle')
    }
  }, [child.id, childTheme, cfg.objectCount, track, markActive])

  // ── Torch position ref (for rAF loop to read without stale closure) ──
  const torchPosRef = useRef({ x: 200, y: 200 })

  // ── Torch movement — updates position only ──
  const handlePointerMove = useCallback((e) => {
    if (!arenaRef.current) return
    const rect = arenaRef.current.getBoundingClientRect()
    const touch = e.touches ? e.touches[0] : null
    const clientX = touch ? touch.clientX : e.clientX
    const clientY = touch ? touch.clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    torchPosRef.current = { x, y }
    setTorchPos({ x, y })
    if (!sessionStarted) {
      setSessionStarted(true)
      markActive()
    }
  }, [sessionStarted, markActive])

  // ── Dwell detection — rAF loop; writes stroke-dasharray directly to DOM to avoid React batching ──
  const dwellRafRef = useRef(null)
  useEffect(() => {
    const CIRCUMFERENCE = 175.9
    const setCircle = (progress) => {
      if (dwellCircleRef.current) {
        dwellCircleRef.current.setAttribute('stroke-dasharray', `${progress * CIRCUMFERENCE} ${CIRCUMFERENCE}`)
      }
    }
    const tick = () => {
      dwellRafRef.current = requestAnimationFrame(tick)
      const targetName = selectedTargetRef.current?.name
      if (!targetName || !torchOnRef.current) {
        if (dwellStartRef.current) { dwellStartRef.current = null; setIsDwelling(false); setCircle(0) }
        return
      }
      const placedTarget = placedObjectsRef.current.find(o => o.name === targetName && !o.found)
      if (!placedTarget) {
        if (dwellStartRef.current) { dwellStartRef.current = null; setIsDwelling(false); setCircle(0) }
        return
      }
      const { x, y } = torchPosRef.current
      const catchZone = effectiveTorchRadiusRef.current * 0.28
      const beamCenterY = y - effectiveTorchRadiusRef.current * 0.8
      const dist = Math.hypot(x - placedTarget.x, beamCenterY - placedTarget.y)
      if (dist < catchZone) {
        if (!dwellStartRef.current) { dwellStartRef.current = Date.now(); setIsDwelling(true) }
        const elapsed = Date.now() - dwellStartRef.current
        const progress = Math.min(1, elapsed / dwellMsRef.current)
        setCircle(progress)
        if (progress >= 1 && !dwellFiredRef.current) {
          dwellFiredRef.current = true
          dwellStartRef.current = null
          selectedTargetRef.current = null
          setIsDwelling(false)
          setCircle(0)
          setSelectedTarget(null)
          setPlacedObjects(prev => prev.map(o => o.name === targetName ? { ...o, found: true } : o))
          setFoundCount(c => c + 1)
          setFactCard({ ...placedTarget, found: true })
          trackRef.current('torch-hunt', 'found', { metadata: { object: targetName, theme: childThemeRef.current } })
        }
      } else {
        if (dwellStartRef.current) { dwellStartRef.current = null; setIsDwelling(false); setCircle(0) }
      }
    }
    dwellRafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(dwellRafRef.current)
  }, [])

  // ── Complete check ──
  useEffect(() => {
    if (phase !== 'playing') return
    const total = sessionObjects.length
    if (total > 0 && foundCount >= total) {
      setPhase('complete')
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2500)
      track('torch-hunt', 'complete', { metadata: { theme: childTheme, found: foundCount } })
    }
  }, [foundCount, placedObjects.length, phase, childTheme, track])

  // ── Touch listeners (non-passive so preventDefault works) ──
  useEffect(() => {
    const el = arenaRef.current
    if (!el) return
    const onTouch = e => { e.preventDefault(); handlePointerMove(e) }
    el.addEventListener('touchstart', onTouch, { passive: false })
    el.addEventListener('touchmove',  onTouch, { passive: false })
    return () => {
      el.removeEventListener('touchstart', onTouch)
      el.removeEventListener('touchmove',  onTouch)
    }
  }, [handlePointerMove])

  useEffect(() => {
    const handler = () => {
      setPhase('idle')
      if (document.fullscreenElement) document.exitFullscreen?.()
    }
    window.addEventListener('glumbi-force-exit', handler)
    return () => window.removeEventListener('glumbi-force-exit', handler)
  }, [])

  // ── Parallax layers ──
  const layerShift = (layerIdx) => {
    const strength = [8, 14, 20][layerIdx] || 8
    return {
      transform: `translate(${(mouse.x - 0.5) * strength}px, ${(mouse.y - 0.5) * strength}px)`,
      transition: 'transform 0.12s linear',
    }
  }

  // ── Render ──

  if (!isEnabled) {
    return (
      <div style={{ padding: 32, fontFamily: 'Nunito, sans-serif', textAlign: 'center', color: '#888' }}>
        <div style={{ fontSize: 48 }}>🔦</div>
        <div style={{ fontWeight: 700, marginTop: 12 }}>Torch Hunt isn't enabled for this child yet.</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>Go to child settings to enable it.</div>
      </div>
    )
  }

  // ── Idle screen ──
  if (phase === 'idle') {
    const canGenerate = !blocked && !isOffline
    const canPlay = packReady || canGenerate
    const btnDisabled = !canPlay || packReady === null
    return (
      <div style={{ fontFamily: 'Nunito, sans-serif', padding: '16px 24px 40px' }}>
        <FeatureBanner feature="torch-hunt" child={child} />
        <QuotaBanner quota={quota} feature="torch-hunt" featureConfig={featureConfig} />

        <div style={{ textAlign: 'center', padding: '20px 0 16px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 14, color: '#777', lineHeight: 1.65 }}>
            Explore the <strong style={{ color: 'var(--primary)' }}>{themeLabel(childTheme)}</strong> world in the dark!
            Move your torch to uncover {cfg.objectCount} hidden objects.
          </div>
        </div>

        {error && (
          <div style={{ background: '#fff3f3', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '10px 14px', marginBottom: 16, color: '#cc0033', fontSize: 14, fontWeight: 700 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={handlePlay}
            disabled={btnDisabled}
            style={{
              background: btnDisabled ? '#e5e7eb' : 'linear-gradient(135deg, var(--primary), var(--accent))',
              border: 'none', borderRadius: 50, padding: '14px 44px',
              color: btnDisabled ? '#9ca3af' : 'white',
              fontWeight: 900, fontSize: 17, cursor: btnDisabled ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito, sans-serif', transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { if (!btnDisabled) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
          >
            🔦 {packReady ? 'Play!' : packReady === null ? 'Checking…' : 'Generate Adventure'}
          </button>

          {packReady && (
            <button
              onClick={handleRefresh}
              disabled={blocked || isOffline}
              style={{
                background: (blocked || isOffline) ? '#e5e7eb' : 'rgba(0,0,0,0.07)',
                border: '2px solid ' + ((blocked || isOffline) ? '#e5e7eb' : 'var(--primary)'),
                borderRadius: 50, padding: '14px 24px',
                color: (blocked || isOffline) ? '#9ca3af' : 'var(--primary)',
                fontWeight: 800, fontSize: 15, cursor: (blocked || isOffline) ? 'not-allowed' : 'pointer',
                fontFamily: 'Nunito, sans-serif', transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { if (!blocked && !isOffline) e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = '' }}
              title="Load a brand new set of 50 objects (2 credits)"
            >
              🔄 New Objects
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#bbb' }}>
          50 hidden objects · {cfg.objectCount} each session
          {packReady && <span style={{ color: '#aaa' }}> · change your Glumbi theme to explore new worlds</span>}
        </div>
      </div>
    )
  }

  // ── Loading ──
  if (phase === 'loading') {
    return <ThemeLoader theme={childTheme} label="Preparing your adventure…" />
  }

  // ── Complete screen ──
  if (phase === 'complete') {
    return (
      <div style={{ fontFamily: 'Nunito, sans-serif', textAlign: 'center', padding: '32px 16px' }}>
        {showConfetti && <Confetti />}
        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#222', marginBottom: 8 }}>
          Amazing! You found everything!
        </div>
        <div style={{ fontSize: 15, color: '#666', marginBottom: 28, lineHeight: 1.6 }}>
          You discovered all {foundCount} hidden objects in the {themeLabel(childTheme)} world!
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {placedObjects.filter(o => !o.isDecoy).map((obj, i) => (
            <div key={i} style={{
              background: 'var(--primary-lt)', border: '1.5px solid var(--primary)', borderRadius: 50,
              padding: '6px 14px', fontSize: 14, fontWeight: 700, color: 'var(--primary)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <EmojiImg emoji={obj.emoji} size={20} /><span>{obj.name}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handlePlay} style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            border: 'none', borderRadius: 50, padding: '12px 28px',
            color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
          }}>
            🔦 Play Again!
          </button>
          <button onClick={() => { setPhase('idle'); setPack(null) }} style={{
            background: 'var(--primary-lt)', border: '1.5px solid var(--primary)', borderRadius: 50, padding: '12px 28px',
            color: 'var(--primary)', fontWeight: 800, fontSize: 16, cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
          }}>
            🏠 Back
          </button>
        </div>
      </div>
    )
  }

  // ── Playing ──
  const totalObjects = placedObjects.filter(o => !o.isDecoy).length
  const progressPct = totalObjects > 0 ? (foundCount / totalObjects) * 100 : 0
  const notFoundObjects = placedObjects.filter(o => !o.found && !o.isDecoy)

  return (
    <div ref={containerRef} style={{ fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', height: isFullscreen ? '100vh' : '100%', minHeight: 0, background: '#04040e', borderRadius: isFullscreen ? 0 : 16, overflow: 'hidden' }}>

      {/* HUD */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px', background: '#0d0d1a', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Theme label */}
        <span style={{ fontWeight: 800, fontSize: 13, color: 'rgba(255,255,255,0.65)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          🔦 {themeLabel(childTheme)}
        </span>

        {/* Score */}
        <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 900, flexShrink: 0, minWidth: 36, textAlign: 'center' }}>
          {foundCount}/{totalObjects}
        </span>

        {/* Torch cycle — large tap target */}
        <button
          onClick={() => {
            if (!torchOn) { setTorchOn(true); setTorchIntensity(1) }
            else if (torchIntensity < 3) setTorchIntensity(v => v + 1)
            else setTorchOn(false)
          }}
          title={torchOn ? `Brightness ${torchIntensity}/3` : 'Torch off'}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: 12, cursor: 'pointer', flexShrink: 0,
            width: 52, height: 44, minWidth: 52, minHeight: 44,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
          }}
        >
          <span style={{
            fontSize: 22, lineHeight: 1,
            filter: torchOn
              ? `drop-shadow(0 0 ${4 + torchIntensity * 4}px var(--accent))`
              : 'grayscale(1) opacity(0.35)',
            transition: 'filter 0.25s',
          }}>🔦</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1,2,3].map(l => (
              <div key={l} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: torchOn && torchIntensity >= l ? 'var(--accent)' : 'rgba(255,255,255,0.18)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        </button>

        {/* Replay — same objects, reset found state */}
        <button
          onClick={handleReplay}
          title="Replay"
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: 12, cursor: 'pointer', flexShrink: 0,
            width: 44, height: 44, minWidth: 44, minHeight: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)', fontSize: 18,
          }}
        >
          🔄
        </button>

        {/* Fullscreen — large tap target */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: 12, cursor: 'pointer', flexShrink: 0,
            width: 44, height: 44, minWidth: 44, minHeight: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)', fontSize: 18,
          }}
        >
          {isFullscreen ? '⊡' : '⊞'}
        </button>

        {/* Exit — large tap target, separated visually */}
        <button
          onClick={() => { setPhase('idle'); setPack(null); setSelectedTarget(null); if (document.fullscreenElement) document.exitFullscreen() }}
          style={{
            background: 'rgba(200,60,60,0.18)', border: '1.5px solid rgba(200,60,60,0.35)',
            borderRadius: 12, cursor: 'pointer', flexShrink: 0,
            width: 44, height: 44, minWidth: 44, minHeight: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,120,120,0.9)', fontWeight: 900, fontSize: 16,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          ✕
        </button>
      </div>

      {/* Object strip — large icon cards, easy tap targets */}
      <div style={{
        background: '#0a0a18', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 12px', flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
          {selectedTarget ? '🎯 Now find this →' : notFoundObjects.length > 0 ? '👇 Pick one to hunt' : '🎉 All found!'}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {placedObjects.filter(o => !o.isDecoy).map((obj, i) => {
            const isActive = selectedTarget?.name === obj.name
            const isFound = obj.found
            const Tag = isFound ? 'div' : 'button'
            const cardSize = age <= 4 ? 72 : age <= 6 ? 62 : 52
            const emojiSize = age <= 4 ? 36 : age <= 6 ? 30 : 24
            const labelSize = age <= 4 ? 12 : age <= 6 ? 11 : 10
            return (
              <Tag
                key={obj.name + i}
                onClick={isFound ? undefined : () => { setSelectedTarget(obj); setTorchPos({ x: -999, y: -999 }) }}
                style={{
                  flexShrink: 0,
                  width: cardSize, minWidth: cardSize,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, padding: '8px 4px', borderRadius: 14, border: 'none',
                  cursor: isFound ? 'default' : 'pointer',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 800,
                  userSelect: 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  background: isFound
                    ? 'rgba(255,255,255,0.04)'
                    : isActive
                      ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                      : 'rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 18px color-mix(in srgb, var(--primary) 60%, transparent)' : 'none',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  opacity: isFound ? 0.4 : 1,
                }}
              >
                <div style={{ fontSize: emojiSize, lineHeight: 1, filter: isFound ? 'grayscale(1)' : 'none' }}>
                  {isFound ? '✓' : <EmojiImg emoji={obj.emoji} size={emojiSize} />}
                </div>
                <span style={{
                  fontSize: labelSize, color: isFound ? 'rgba(255,255,255,0.3)' : isActive ? 'white' : 'rgba(255,255,255,0.8)',
                  textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word',
                  maxWidth: cardSize - 8, overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {obj.name}
                </span>
              </Tag>
            )
          })}
        </div>
      </div>

      {/* Looking-for bar */}
      <div style={{
        background: selectedTarget ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
        borderBottom: '1px solid rgba(255,220,80,0.15)',
        padding: '6px 16px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10, minHeight: 36,
      }}>
        {selectedTarget ? (
          <>
            <EmojiImg emoji={selectedTarget.emoji} size={22} />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-lt)' }}>
              Find the <span style={{ color: 'white' }}>{selectedTarget.name}</span>!
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,220,80,0.6)', marginLeft: 4 }}>
              💡 {selectedTarget.hint}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
            🌙 {pack?.narratives?.[narrativeIdx] || 'Pick an object above to start hunting!'}
          </span>
        )}
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          background: '#04040e',
          borderRadius: '0 0 16px 16px',
          cursor: 'none',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onMouseMove={handlePointerMove}
      >
        {/* Parallax depth layers */}
        {[0, 1, 2].map(layerIdx => (
          <div key={layerIdx} style={{ position: 'absolute', inset: 0, ...layerShift(layerIdx) }}>
            {placedObjects
              .filter(obj => obj.layer === layerIdx)
              .map((obj, i) => {
                const isTarget = selectedTarget?.name === obj.name && !obj.found
                const distToTorch = Math.hypot(torchPos.x - obj.x, torchPos.y - obj.y)
                const revealedAsTarget = isTarget && torchOn && distToTorch < effectiveTorchRadius
                const revealedAsDecoy = !!obj.isDecoy && torchOn && distToTorch < effectiveTorchRadius
                const revealed = revealedAsTarget || revealedAsDecoy
                const imgSize = age <= 4 ? 56 : age <= 6 ? 46 : age <= 8 ? 34 : 28
                return (
                  <div
                    key={obj.name + i}
                    style={{
                      position: 'absolute',
                      left: obj.x, top: obj.y,
                      zIndex: obj.found ? 35 : isTarget ? 15 : 10,
                      pointerEvents: 'none',
                      animationName: obj.found ? 'th-pop' : revealed ? 'th-tap-me' : 'th-float',
                      animationDuration: obj.found ? '0.6s' : revealed ? '0.7s' : '3s',
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: obj.found ? 1 : 'infinite',
                      animationFillMode: obj.found ? 'both' : 'none',
                      animationDelay: obj.found || revealed ? '0s' : `${(i * 0.4) % 2}s`,
                      filter: obj.found ? 'drop-shadow(0 0 12px rgba(255,220,80,0.9))' : revealedAsDecoy ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
                      opacity: obj.found ? 1 : revealedAsDecoy ? 0.7 : 0.9,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <EmojiImg emoji={obj.emoji} size={imgSize} />
                    {revealedAsTarget && isDwelling && (
                      <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', overflow: 'visible', pointerEvents: 'none', zIndex: 5 }} width={64} height={64}>
                        <circle cx={32} cy={32} r={28} fill="none" stroke="rgba(255,220,80,0.25)" strokeWidth={4} />
                        <circle ref={dwellCircleRef} cx={32} cy={32} r={28} fill="none" stroke="rgba(255,220,80,0.9)" strokeWidth={4}
                          strokeDasharray="0 175.9"
                          strokeLinecap="round"
                          style={{ transformOrigin: '32px 32px', transform: 'rotate(-90deg)' }}
                        />
                      </svg>
                    )}
                    {revealedAsTarget && isDwelling && (
                      <div style={{
                        position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--primary)', color: 'white', borderRadius: 50,
                        padding: '2px 10px', fontSize: 11, fontWeight: 900,
                        whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        animation: 'th-fact-in 0.3s ease',
                      }}>
                        ⏳ Hold…
                      </div>
                    )}
                    {obj.found && (
                      <div style={{
                        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--primary)', color: 'white', borderRadius: 50,
                        padding: '2px 8px', fontSize: 10, fontWeight: 800,
                        whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}>
                        ✓ {obj.name}
                      </div>
                    )}
                  </div>
                )
              })
            }
          </div>
        ))}

        {showConfetti && <Confetti />}

        {/* Torch overlay — always dark, cone only when torch on + target selected */}
        <TorchCanvas
          torchPos={torchPos}
          torchRadius={effectiveTorchRadius}
          width={arenaSize?.w ?? 0}
          height={arenaSize?.h ?? 0}
          showLight={torchOn && !!selectedTarget}
        />

        {/* "Tap to search" hint — shown on touch before first pointer move */}
        {selectedTarget && torchPos.x < 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 50, pointerEvents: 'none', textAlign: 'center',
            animation: 'th-tap-hint 1.2s ease-in-out infinite',
          }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>👆</div>
            <div style={{
              fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.85)',
              fontFamily: 'Nunito, sans-serif',
              background: 'rgba(0,0,0,0.55)', borderRadius: 50,
              padding: '4px 14px',
            }}>
              Tap the dark area to search!
            </div>
          </div>
        )}

        {/* 🔦 torch cursor — follows pointer */}
        {selectedTarget && torchPos.x >= 0 && (
          <div style={{
            position: 'absolute',
            left: torchPos.x, top: torchPos.y,
            transform: 'translate(-50%, -50%) rotate(135deg)',
            fontSize: age <= 4 ? 48 : age <= 6 ? 38 : 28,
            zIndex: 30, pointerEvents: 'none',
            filter: torchOn
              ? `drop-shadow(0 0 ${6 + torchIntensity * 4}px rgba(255,220,80,${0.5 + torchIntensity * 0.15}))`
              : 'grayscale(1) opacity(0.4)',
            transition: 'filter 0.2s',
          }}>
            🔦
          </div>
        )}

      </div>

      {/* Fun fact card */}
      {factCard && <FactCard obj={factCard} onClose={() => setFactCard(null)} />}

    </div>
  )
}
