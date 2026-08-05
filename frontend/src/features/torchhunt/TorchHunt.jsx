import { useState, useEffect, useRef, useCallback } from 'react'
import { isCreditsBlocked } from '../../utils/quota'
import { torchHuntApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import QuotaBanner from '../../components/QuotaBanner'
import FeatureBanner from '../../components/FeatureBanner'
import ThemeLoader from '../../components/ThemeLoader'

// ── Age-adaptive config ───────────────────────────────────────────────────────
function gameConfig(age) {
  if (age <= 4)  return { objectCount: 8,  torchRadius: 120, dwellMs: 1000 }
  if (age <= 6)  return { objectCount: 12, torchRadius: 100, dwellMs: 800  }
  if (age <= 8)  return { objectCount: 18, torchRadius: 80,  dwellMs: 650  }
  return              { objectCount: 25, torchRadius: 65,  dwellMs: 500  }
}

function calcAge(child) {
  if (!child?.birthYear) return 6
  return new Date().getFullYear() - child.birthYear
}

function themeLabel(key) {
  if (!key) return 'Your World'
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
}

// ── Object placement — truly random with min-distance guarantee ───────────────
function placeObjects(objects, containerW, containerH) {
  const pad = Math.max(60, Math.min(containerW, containerH) * 0.1)
  const minDist = Math.min(containerW, containerH) * 0.28
  const placed = []
  return objects.map((obj, i) => {
    let x, y, attempts = 0
    do {
      x = pad + Math.random() * (containerW - pad * 2)
      y = pad + Math.random() * (containerH - pad * 2)
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
    @keyframes th-confetti-fall {
      0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
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
    @keyframes th-credit-pop {
      0%   { transform: translateY(0);     opacity: 1; }
      70%  { transform: translateY(-48px); opacity: 1; }
      100% { transform: translateY(-72px); opacity: 0; }
    }
    @keyframes th-tap-hint {
      0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.85; }
      50%       { transform: translate(-50%,-50%) scale(1.12); opacity: 1; }
    }
  `
  document.head.appendChild(el)
}

// ── Mini confetti burst ───────────────────────────────────────────────────────
function ConfettiBurst({ x, y }) {
  const pieces = Array.from({ length: 8 }, (_, i) => ({
    color: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff9ff3'][i % 5],
    angle: (i / 8) * 360,
    delay: i * 0.05,
  }))
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 40 }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 8, height: 8,
          borderRadius: 2,
          background: p.color,
          animation: `th-confetti-fall 0.8s ease-out ${p.delay}s both`,
          transform: `rotate(${p.angle}deg) translateX(${20 + i * 4}px)`,
        }} />
      ))}
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
        <div style={{ fontSize: 56, marginBottom: 8 }}>{obj.emoji}</div>
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

    // Cut out torch cone via destination-out
    ctx.globalCompositeOperation = 'destination-out'
    const grd = ctx.createRadialGradient(
      torchPos.x, torchPos.y, 0,
      torchPos.x, torchPos.y, torchRadius
    )
    grd.addColorStop(0,   'rgba(0,0,0,1)')
    grd.addColorStop(0.6, 'rgba(0,0,0,0.85)')
    grd.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(torchPos.x, torchPos.y, torchRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalCompositeOperation = 'source-over'

    // Warm torch glow ring
    const glowGrd = ctx.createRadialGradient(
      torchPos.x, torchPos.y, torchRadius * 0.7,
      torchPos.x, torchPos.y, torchRadius * 1.3
    )
    glowGrd.addColorStop(0,   'rgba(255,200,80,0)')
    glowGrd.addColorStop(0.5, 'rgba(255,200,80,0.06)')
    glowGrd.addColorStop(1,   'rgba(255,200,80,0)')
    ctx.fillStyle = glowGrd
    ctx.beginPath()
    ctx.arc(torchPos.x, torchPos.y, torchRadius * 1.3, 0, Math.PI * 2)
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
  const cfg = gameConfig(age)
  const childTheme = child.theme || 'coral'

  // ── State ──
  const [phase, setPhase] = useState('idle')  // idle | loading | playing | complete
  const [packReady, setPackReady] = useState(null)  // null=checking, true=ready, false=needs generation
  const [pack, setPack] = useState(null)
  const [placedObjects, setPlacedObjects] = useState([])
  const [foundCount, setFoundCount] = useState(0)
  const [torchPos, setTorchPos] = useState({ x: 200, y: 200 })
  const [confettiBursts, setConfettiBursts] = useState([])
  const [factCard, setFactCard] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [sessionObjects, setSessionObjects] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [torchOn, setTorchOn] = useState(true)
  const [torchIntensity, setTorchIntensity] = useState(2)
  const [dwellProgress, setDwellProgress] = useState(0)
  const [error, setError] = useState(null)
  const [creditPop, setCreditPop] = useState(false)
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
  const effectiveTorchRadiusRef = useRef(cfg.torchRadius)
  const dwellMsRef = useRef(cfg.dwellMs)
  const childThemeRef = useRef(childTheme)
  const trackRef = useRef(track)
  const [arenaSize, setArenaSize] = useState({ w: 700, h: 420 })

  const isEnabled = !featureConfig || !!featureConfig.find(f => f.featureName === 'torch-hunt' && f.enabled !== false)
  const blocked = isCreditsBlocked(quota)
  const effectiveTorchRadius = cfg.torchRadius * [0.55, 0.85, 1.2][torchIntensity - 1]

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

  // ── Arena sizing ──
  useEffect(() => {
    function measure() {
      if (!arenaRef.current) return
      const { width, height } = arenaRef.current.getBoundingClientRect()
      if (width > 0) setArenaSize({ w: width, h: height })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
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
    if (arenaSize.w < 50 || arenaSize.h < 50) return
    setPlacedObjects(prev => {
      const foundNames = new Set(prev.filter(o => o.found).map(o => o.name))
      return placeObjects(sessionObjects, arenaSize.w, arenaSize.h).map(o => ({
        ...o,
        found: foundNames.has(o.name),
      }))
    })
  }, [arenaSize, sessionObjects, phase])

  // ── Reset dwell when target changes ──
  useEffect(() => {
    dwellStartRef.current = null
    dwellFiredRef.current = false
    setDwellProgress(0)
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
        setCreditPop(true)
        setTimeout(() => setCreditPop(false), 2000)
        window.__glumbiRefreshQuota?.('torch-hunt')
      }

      const allObjs = data.objects || []
      const sessionObjs = [...allObjs].sort(() => Math.random() - 0.5).slice(0, cfg.objectCount)
      setSessionObjects(sessionObjs)   // re-placement effect handles actual positioning
      setFoundCount(0)
      setSelectedTarget(null)
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

  const handleRefresh = useCallback(async () => {
    setError(null)
    setPhase('loading')
    try {
      const data = await torchHuntApi.refresh(child.id, childTheme)
      setPack(data)
      setPackReady(true)
      setCreditPop(true)
      setTimeout(() => setCreditPop(false), 2000)
      window.__glumbiRefreshQuota?.('torch-hunt')

      const allObjs = data.objects || []
      const sessionObjs = [...allObjs].sort(() => Math.random() - 0.5).slice(0, cfg.objectCount)
      setSessionObjects(sessionObjs)
      setFoundCount(0)
      setSelectedTarget(null)
      setPhase('playing')
      setSessionStarted(false)
      markActive()
      track('torch-hunt', 'session_start', { metadata: { theme: childTheme, refreshed: true } })
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not refresh. Try again!')
      setPhase('idle')
    }
  }, [child.id, childTheme, cfg.objectCount, track, markActive])

  // ── Torch movement + dwell detection ──
  const handlePointerMove = useCallback((e) => {
    if (!arenaRef.current) return
    const rect = arenaRef.current.getBoundingClientRect()
    const touch = e.touches ? e.touches[0] : null
    const clientX = touch ? touch.clientX : e.clientX
    const clientY = touch ? touch.clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    setTorchPos({ x, y })
    setMouse({ x: x / rect.width, y: y / rect.height })

    if (!sessionStarted) {
      setSessionStarted(true)
      markActive()
    }

    // Dwell detection — all reads via refs so this callback never goes stale
    const targetName = selectedTargetRef.current?.name
    if (!targetName || !torchOnRef.current) {
      dwellStartRef.current = null
      setDwellProgress(0)
      return
    }

    const placedTarget = placedObjectsRef.current.find(o => o.name === targetName && !o.found)
    if (!placedTarget) {
      dwellStartRef.current = null
      setDwellProgress(0)
      return
    }

    const catchZone = effectiveTorchRadiusRef.current * 0.45
    const dist = Math.hypot(x - placedTarget.x, y - placedTarget.y)
    if (dist < catchZone) {
      if (!dwellStartRef.current) dwellStartRef.current = Date.now()
      const elapsed = Date.now() - dwellStartRef.current
      const progress = Math.min(1, elapsed / dwellMsRef.current)
      setDwellProgress(progress)
      if (progress >= 1 && !dwellFiredRef.current) {
        dwellFiredRef.current = true          // guard: prevent re-fire on same dwell
        dwellStartRef.current = null
        selectedTargetRef.current = null
        setDwellProgress(0)
        setSelectedTarget(null)
        setPlacedObjects(prev => prev.map(o => o.name === targetName ? { ...o, found: true } : o))
        setFoundCount(c => c + 1)
        setConfettiBursts(b => [...b, { id: Date.now(), x: placedTarget.x, y: placedTarget.y }])
        setFactCard({ ...placedTarget, found: true })
        trackRef.current('torch-hunt', 'found', { metadata: { object: targetName, theme: childThemeRef.current } })
      }
    } else {
      dwellStartRef.current = null
      setDwellProgress(0)
    }
  }, [sessionStarted, markActive])

  // ── Complete check ──
  useEffect(() => {
    if (phase !== 'playing') return
    const total = placedObjects.length
    if (total > 0 && foundCount >= total) {
      setPhase('complete')
      track('torch-hunt', 'complete', { metadata: { theme: childTheme, found: foundCount } })
    }
  }, [foundCount, placedObjects.length, phase, childTheme, track])

  // ── Cleanup old bursts ──
  useEffect(() => {
    if (!confettiBursts.length) return
    const t = setTimeout(() => setConfettiBursts([]), 1000)
    return () => clearTimeout(t)
  }, [confettiBursts])

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
        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#222', marginBottom: 8 }}>
          Amazing! You found everything!
        </div>
        <div style={{ fontSize: 15, color: '#666', marginBottom: 28, lineHeight: 1.6 }}>
          You discovered all {foundCount} hidden objects in the {themeLabel(childTheme)} world!
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {placedObjects.map((obj, i) => (
            <div key={i} style={{
              background: 'var(--primary-lt)', border: '1.5px solid var(--primary)', borderRadius: 50,
              padding: '6px 14px', fontSize: 14, fontWeight: 700, color: 'var(--primary)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{obj.emoji}</span><span>{obj.name}</span>
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
            background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: 50, padding: '12px 28px',
            color: '#444', fontWeight: 800, fontSize: 16, cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
          }}>
            🏠 Back
          </button>
        </div>
      </div>
    )
  }

  // ── Playing ──
  const totalObjects = placedObjects.length
  const progressPct = totalObjects > 0 ? (foundCount / totalObjects) * 100 : 0
  const notFoundObjects = placedObjects.filter(o => !o.found)

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

      {/* Object strip — pick your target */}
      <div style={{
        background: '#0a0a18', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 12px', flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
          {selectedTarget ? '🎯 Now find this →' : notFoundObjects.length > 0 ? '👇 Tap an object to hunt for it' : '🎉 All found!'}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {placedObjects.map((obj, i) => {
            const isActive = selectedTarget?.name === obj.name
            const isFound = obj.found
            const Tag = isFound ? 'div' : 'button'
            return (
              <Tag
                key={obj.name + i}
                onClick={isFound ? undefined : () => { setSelectedTarget(obj); setTorchPos({ x: -999, y: -999 }) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 50, border: 'none',
                  cursor: isFound ? 'default' : 'pointer',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13,
                  userSelect: 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  background: isFound
                    ? 'rgba(255,255,255,0.04)'
                    : isActive
                      ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                      : 'rgba(255,255,255,0.1)',
                  color: isFound ? 'rgba(255,255,255,0.25)' : isActive ? 'white' : 'rgba(255,255,255,0.85)',
                  boxShadow: isActive ? '0 0 16px color-mix(in srgb, var(--primary) 60%, transparent)' : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  textDecoration: isFound ? 'line-through' : 'none',
                  opacity: isFound ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: 18 }}>{obj.emoji}</span>
                <span>{isFound ? '✓' : obj.name}</span>
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
            <span style={{ fontSize: 22 }}>{selectedTarget.emoji}</span>
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
        onTouchStart={e => { e.preventDefault(); handlePointerMove(e) }}
        onTouchMove={e => { e.preventDefault(); handlePointerMove(e) }}
      >
        {/* Parallax depth layers */}
        {[0, 1, 2].map(layerIdx => (
          <div key={layerIdx} style={{ position: 'absolute', inset: 0, ...layerShift(layerIdx) }}>
            {placedObjects
              .filter(obj => obj.layer === layerIdx)
              .map((obj, i) => {
                const isTarget = selectedTarget?.name === obj.name && !obj.found
                const dist = isTarget ? Math.hypot(torchPos.x - obj.x, torchPos.y - obj.y) : Infinity
                const revealed = isTarget && torchOn && dist < effectiveTorchRadius
                return (
                  <div
                    key={obj.name + i}
                    style={{
                      position: 'absolute',
                      left: obj.x, top: obj.y,
                      zIndex: obj.found ? 35 : isTarget ? 15 : 10,
                      pointerEvents: 'none',
                      fontSize: age <= 5 ? 42 : age <= 8 ? 34 : 28,
                      animationName: obj.found ? 'th-pop' : revealed ? 'th-tap-me' : 'th-float',
                      animationDuration: obj.found ? '0.6s' : revealed ? '0.7s' : '3s',
                      animationTimingFunction: obj.found ? 'ease' : revealed ? 'ease-in-out' : 'ease-in-out',
                      animationIterationCount: obj.found ? 1 : 'infinite',
                      animationFillMode: obj.found ? 'both' : 'none',
                      animationDelay: obj.found || revealed ? '0s' : `${(i * 0.4) % 2}s`,
                      filter: obj.found ? 'drop-shadow(0 0 12px rgba(255,220,80,0.9))' : 'none',
                      opacity: obj.found ? 1 : 0.9,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {obj.emoji}
                    {revealed && dwellProgress > 0 && (
                      <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', overflow: 'visible', pointerEvents: 'none', zIndex: 5 }} width={64} height={64}>
                        <circle cx={32} cy={32} r={28} fill="none" stroke="rgba(255,220,80,0.25)" strokeWidth={4} />
                        <circle cx={32} cy={32} r={28} fill="none" stroke="rgba(255,220,80,0.9)" strokeWidth={4}
                          strokeDasharray={`${dwellProgress * 175.9} 175.9`}
                          strokeLinecap="round"
                          style={{ transformOrigin: '32px 32px', transform: 'rotate(-90deg)', transition: 'stroke-dasharray 0.05s linear' }}
                        />
                      </svg>
                    )}
                    {revealed && (
                      <div style={{
                        position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--primary)', color: 'white', borderRadius: 50,
                        padding: '2px 10px', fontSize: 11, fontWeight: 900,
                        whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        animation: 'th-fact-in 0.3s ease',
                      }}>
                        {dwellProgress > 0 ? '⏳ Hold…' : '✨ Found it!'}
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

        {/* Confetti bursts */}
        {confettiBursts.map(b => <ConfettiBurst key={b.id} x={b.x} y={b.y} />)}

        {/* Torch overlay — always dark, cone only when torch on + target selected */}
        <TorchCanvas
          torchPos={torchPos}
          torchRadius={effectiveTorchRadius}
          width={arenaSize.w}
          height={arenaSize.h}
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
            fontSize: age <= 5 ? 36 : 28,
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

      {/* -2 credits popup */}
      {creditPop && (
        <div style={{
          position: 'fixed', bottom: 80, right: 24,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          color: 'white', fontFamily: 'Nunito, sans-serif',
          fontWeight: 900, fontSize: 15,
          borderRadius: 50, padding: '8px 20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          animation: 'th-credit-pop 2s ease forwards',
          pointerEvents: 'none', zIndex: 200,
          whiteSpace: 'nowrap',
        }}>
          ✨ −2 credits
        </div>
      )}
    </div>
  )
}
