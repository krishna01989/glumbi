import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { drawApi, drawSaveApi } from '../../api/client'
import HistoryDrawer, { fmtDate } from '../../components/HistoryDrawer'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import QuotaBanner from '../../components/QuotaBanner'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import { safetyCheck } from './animationMatcher'
import { bringToLife } from './animationEngine'
import FlipbookStudio from './FlipbookStudio'

function useBreakpoint() {
  const get = () => window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const h = () => setBp(get())
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return bp
}

const PRESET_COLORS = [
  // Blacks & whites
  '#000000','#333333','#666666','#999999','#cccccc','#ffffff',
  // Reds & pinks
  '#ff0000','#ff4757','#ff6b81','#ff69b4','#e91e63','#c2185b',
  // Oranges & yellows
  '#ff6600','#ffa502','#ff9800','#ffd32a','#ffeb3b','#fff176',
  // Greens
  '#00c853','#2ed573','#26de81','#4caf50','#8bc34a','#cddc39',
  // Blues
  '#1e90ff','#2196f3','#03a9f4','#70a1ff','#3f51b5','#1a237e',
  // Purples & violets
  '#9c6ef8','#9c27b0','#673ab7','#7c4dff','#ce93d8','#f48fb1',
  // Browns & skin tones
  '#4e342e','#6d4c41','#8d5524','#c68642','#f1c27d','#ffdbac',
]


function makeEmojiCursor(emoji, size = 32, hotspotX, hotspotY) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.font = `${size - 2}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, size / 2, size / 2)
    const hx = hotspotX ?? size / 2
    const hy = hotspotY ?? size / 2
    return `url(${canvas.toDataURL()}) ${hx} ${hy}, auto`
  } catch { return 'crosshair' }
}

const BRUSHES = [
  { size: 3,  title: 'Extra thin', dotSize: 4,  btnH: 24 },
  { size: 7,  title: 'Thin',       dotSize: 8,  btnH: 28 },
  { size: 14, title: 'Medium',     dotSize: 14, btnH: 32 },
  { size: 24, title: 'Thick',      dotSize: 20, btnH: 38 },
  { size: 40, title: 'Extra thick',dotSize: 26, btnH: 46 },
]


function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', width: '100%' }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ width: '80%', height: 1, background: '#f0f0f0' }} />
}

const DRAW_TABS = [
  { key: 'draw',     label: '✏️ Draw' },
  { key: 'flipbook', label: '🎬 Flipbook' },
]

export default function Draw({ child, quota, featureConfig }) {
  const { track } = useTracker()
  const offline = useOffline()
  const canvasRef  = useRef(null)
  const overlayRef = useRef(null)   // transparent canvas for animation
  const animRafRef = useRef(null)   // requestAnimationFrame id
  const colorInput = useRef(null)
  const drawing    = useRef(false)
  const lastPos    = useRef(null)
  const sessionTracked = useRef(false)
  useFeatureDuration('draw', track, { condition: sessionTracked })
  const fsRef      = useRef(null)

  const historyRef = useRef([])
  const [canUndo, setCanUndo]     = useState(false)
  const [color, setColor]         = useState('#000000')
  const [brush, setBrush]         = useState(14)
  const [eraser, setEraser]       = useState(false)
  const [fillMode, setFillMode]       = useState(false)
  const [aiReply, setAiReply]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [isEmpty, setIsEmpty]     = useState(true)
  const [guide, setGuide]         = useState('')
  const [guideSubject, setGuideSubject] = useState('')
  const [guideInput, setGuideInput]     = useState('')
  const [guideLoading, setGuideLoading] = useState(false)
  const [showDemo, setShowDemo]   = useState(() => !localStorage.getItem('glm_draw_seen'))
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewport, setViewport]   = useState({ vw: window.innerWidth, vh: window.innerHeight })

  // ── Animation state ──
  const [animLoading, setAnimLoading] = useState(false)
  const [drawnAfterAnim, setDrawnAfterAnim] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const drawTab = searchParams.get('tab') === 'flipbook' ? 'flipbook' : 'draw'
  const [animCooldown, setAnimCooldown] = useState(0)
  const cooldownRef = useRef(null)
  const [animResult, setAnimResult]   = useState(null)   // resolved animation config
  const [animPlan, setAnimPlan]       = useState(null)   // Claude-dictated animation plan
  const [animBlocked, setAnimBlocked] = useState(false)
  const [animBlockMsg, setAnimBlockMsg] = useState('')
  const [animPlaying, setAnimPlaying] = useState(false)
  const [animLabel, setAnimLabel]     = useState('')

  // Draw saves
  const [drawSaves, setDrawSaves] = useState([])
  const [currentSaveId, setCurrentSaveId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [drawingTitle, setDrawingTitle] = useState('')

  useEffect(() => {
    if (child?.id) drawSaveApi.getByChild(child.id).then(setDrawSaves).catch(() => {})
  }, [child?.id])

  async function saveDrawing() {
    if (!canvasRef.current || isEmpty) return
    setIsSaving(true)
    try {
      const imageData = canvasRef.current.toDataURL()
      const title = drawingTitle.trim() || null
      if (currentSaveId) {
        const updated = await drawSaveApi.update(currentSaveId, imageData, title)
        setDrawSaves(prev => prev.map(s => s.id === currentSaveId ? updated : s))
      } else {
        const saved = await drawSaveApi.save(child.id, imageData, title)
        setDrawSaves(prev => [saved, ...prev])
        setCurrentSaveId(saved.id)
      }
    } finally { setIsSaving(false) }
  }

  function loadDrawSave(save) {
    const img = new Image()
    img.onload = () => {
      const ctx = getCtx()
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
      saveSnapshot()
      setIsEmpty(false)
      setCurrentSaveId(save.id)
      setDrawingTitle(save.title || '')
    }
    img.src = save.imageData
  }

  async function deleteDrawSave(id) {
    await drawSaveApi.delete(id)
    setDrawSaves(prev => prev.filter(s => s.id !== id))
    if (currentSaveId === id) setCurrentSaveId(null)
  }

  // Selection tool
  const [selectTool, setSelectTool]       = useState(false)
  const selOverlayRef  = useRef(null)
  const selTmpRef      = useRef(null)
  const selStateRef    = useRef({ phase: null, startX: 0, startY: 0,
    x: 0, y: 0, w: 0, h: 0, pixels: null, posX: 0, posY: 0,
    dragging: false, dragStartX: 0, dragStartY: 0, dragOrigX: 0, dragOrigY: 0 })
  const [selTick, setSelTick]             = useState(0)
  const [selPanelOpen, setSelPanelOpen]   = useState(false)

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => () => clearInterval(cooldownRef.current), [])


  useEffect(() => {
    const update = () => {
      setTimeout(() => setViewport({ vw: window.innerWidth, vh: window.innerHeight }), 100)
    }
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => { window.removeEventListener('resize', update); window.removeEventListener('orientationchange', update) }
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      fsRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const drawAiEnabled = (() => {
    if (!featureConfig) return true
    const fc = featureConfig.find(f => f.featureName === 'draw')
    return !fc || fc.enabled !== false
  })()
  const guideEnabled = (() => {
    if (!drawAiEnabled) return false
    if (!featureConfig) return true
    const fc = featureConfig.find(f => f.featureName === 'draw-guide')
    return !fc || fc.enabled !== false
  })()
  const animateEnabled = (() => {
    if (!drawAiEnabled) return false
    if (!featureConfig) return true
    const fc = featureConfig.find(f => f.featureName === 'draw-animate')
    return !fc || fc.enabled !== false
  })()
  const [showPalette, setShowPalette] = useState(false)
  const [palettePos, setPalettePos]   = useState({ x: 0, y: 0 })
  const [recentColors, setRecentColors] = useState([])
  const swatchRef = useRef(null)
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isCompact = bp === 'mobile' || bp === 'tablet'
  const canvasCursor = useMemo(() => {
    // ✏️ tip is bottom-left: hotspot near bottom-left corner
    // 🪣 tip is bottom-left of the bucket: same treatment, smaller size
    // 🧽 no sharp tip: center hotspot is fine
    if (fillMode) return makeEmojiCursor('🪣', 24, 3, 21)
    if (eraser)   return makeEmojiCursor('🧽', 28, 4, 24)
    return 'crosshair'
  }, [eraser, fillMode])

  const getCtx = () => canvasRef.current.getContext('2d', { willReadFrequently: true })

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = getCtx()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }, [])

  // Attach touch listeners as non-passive so preventDefault() works on mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onTouchStart = e => startDraw(e)
    const onTouchMove  = e => draw(e)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
    }
  })

  // Close palette on outside click
  useEffect(() => {
    if (!showPalette) return
    const handler = (e) => {
      if (!e.target.closest('.palette-popup') && !e.target.closest('.palette-trigger')) {
        setShowPalette(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPalette])

  function pickColor(c) {
    setColor(c)
    setEraser(false)
    setRecentColors(prev => [c, ...prev.filter(x => x !== c)].slice(0, 8))
  }

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    }
  }

  function saveSnapshot() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyRef.current = [...historyRef.current.slice(-29), snapshot]
    setCanUndo(true)
  }

  function handleUndo() {
    if (historyRef.current.length === 0) return
    const newHistory = [...historyRef.current]
    const snapshot = newHistory.pop()
    historyRef.current = newHistory
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.putImageData(snapshot, 0, 0)
    setCanUndo(newHistory.length > 0)
    if (newHistory.length === 0) setIsEmpty(true)
  }

  function floodFill(canvas, startX, startY, fillHex) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const w = canvas.width, h = canvas.height
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const fillR = parseInt(fillHex.slice(1,3), 16)
    const fillG = parseInt(fillHex.slice(3,5), 16)
    const fillB = parseInt(fillHex.slice(5,7), 16)
    const sx = Math.floor(startX), sy = Math.floor(startY)
    const si = (sy * w + sx) * 4
    const tR = data[si], tG = data[si+1], tB = data[si+2]
    if (tR === fillR && tG === fillG && tB === fillB) return
    const tol = 32
    const matches = i => Math.abs(data[i]-tR) <= tol && Math.abs(data[i+1]-tG) <= tol && Math.abs(data[i+2]-tB) <= tol
    const visited = new Uint8Array(w * h)
    const stack = [sx + sy * w]
    while (stack.length) {
      const pos = stack.pop()
      const x = pos % w, y = (pos / w) | 0
      if (x < 0 || x >= w || y < 0 || y >= h || visited[pos]) continue
      const i = pos * 4
      if (!matches(i)) continue
      visited[pos] = 1
      data[i] = fillR; data[i+1] = fillG; data[i+2] = fillB; data[i+3] = 255
      stack.push(pos+1, pos-1, pos+w, pos-w)
    }
    ctx.putImageData(imageData, 0, 0)
  }

  function startDraw(e) {
    e.preventDefault()
    if (selectTool) return
    if (!sessionTracked.current) {
      sessionTracked.current = true
    }
    if (fillMode) {
      saveSnapshot()
      const canvas = canvasRef.current
      const pos = getPos(e, canvas)
      floodFill(canvas, pos.x, pos.y, color)
      setIsEmpty(false)
      return
    }
    saveSnapshot()
    drawing.current = true
    lastPos.current = getPos(e, canvasRef.current)
  }

  function draw(e) {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = eraser ? '#ffffff' : color
    ctx.lineWidth   = eraser ? brush * 2 : brush
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    lastPos.current = pos
    setIsEmpty(false)
  }

  function stopDraw() {
    if (drawing.current) {
      setAnimResult(null)
      setAnimPlan(null)
      setAnimLabel('')
      setDrawnAfterAnim(true)
      stopAnimation()
    }
    drawing.current = false
    lastPos.current = null
  }

  function clearCanvas() {
    if (selStateRef.current.phase === 'floating') {
      selStateRef.current.phase = null; selTmpRef.current = null
      setSelPanelOpen(false); setSelTick(t => t + 1)
      selOverlayRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setAiReply('')
    setIsEmpty(true)
    setAnimResult(null)
    setAnimPlan(null)
    setAnimLabel('')
    stopAnimation()
    setCurrentSaveId(null)
    setDrawingTitle('')
  }

  async function handleIdentify() {
    const imageData = canvasRef.current.toDataURL('image/png').split(',')[1]
    const age = child?.birthYear ? new Date().getFullYear() - child.birthYear : 4
    setLoading(true)
    setAiReply('')
    try {
      const { response } = await drawApi.identify(imageData, child?.name || 'you', age, guideSubject)
      track('draw', 'ai_praise')
      setAiReply(response)
    } catch {
      setAiReply('Wow, what an amazing drawing! 🌟')
    } finally {
      setLoading(false)
    }
  }

  async function handleGuide(e) {
    e.preventDefault()
    if (!guideInput.trim() || offline || !guideEnabled) return
    setGuideLoading(true); setGuide('')
    const age = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
    try {
      const { guide: text } = await drawApi.guide(guideInput.trim(), child?.name || 'you', age)
      track('draw', 'ai_guide', { metadata: { subject: guideInput.trim() } })
      setGuide(text)
      setGuideSubject(guideInput.trim())
      setGuideInput('')
      window.__glumbiRefreshQuota?.('draw-guide')
    } catch { setGuide('') }
    finally { setGuideLoading(false) }
  }

  function stopAnimation() {
    animRafRef.current?.()
    animRafRef.current = null
    setAnimPlaying(false)
  }

  function playAnimation(detectedObjects, animationPlan) {
    const overlay = overlayRef.current
    if (!overlay) return
    setAnimPlaying(true)
    animRafRef.current = bringToLife(
      overlay,
      canvasRef.current,
      detectedObjects,
      child?.birthYear ? new Date().getFullYear() - child.birthYear : 5,
      () => setAnimPlaying(false),
      animationPlan
    )
  }

  async function handleAnimate() {
    if (isEmpty || offline || !animateEnabled) return
    stopAnimation()
    setAnimLoading(true)
    setAnimBlocked(false)
    setAnimResult(null)
    setAnimLabel('')

    try {
      const imageData = canvasRef.current.toDataURL('image/png').split(',')[1]
      const age = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
      const { objects: rawJson } = await drawApi.animate(
        imageData, child?.name || 'you', age, guideSubject, child?.id
      )
      track('draw', 'animate')
      window.__glumbiRefreshQuota?.('draw')

      let parsed
      try { parsed = JSON.parse(rawJson) } catch { parsed = null }

      if (!parsed || parsed.blocked) {
        setAnimBlocked(true)
        setAnimBlockMsg("Let's draw something else — try animals, space, food, or sports! 🌟")
        return
      }

      const objects = parsed.objects ?? []
      if (!objects.length) {
        setAnimBlocked(true)
        setAnimBlockMsg("I couldn't find anything to animate. Try drawing something!")
        return
      }

      // safety check on the primary detected object
      const primary = objects[0]
      const safety = safetyCheck(primary.label, primary.tags ?? [])
      if (safety.hardBlock) {
        setAnimBlocked(true)
        setAnimBlockMsg("Let's draw something else — animals, space, food, or sports are great! 🌟")
        return
      }

      setAnimResult(objects)
      setAnimPlan(parsed.animation_plan ?? null)
      setDrawnAfterAnim(false)
      // start cooldown
      clearInterval(cooldownRef.current)
      setAnimCooldown(45)
      cooldownRef.current = setInterval(() => {
        setAnimCooldown(prev => {
          if (prev <= 1) { clearInterval(cooldownRef.current); return 0 }
          return prev - 1
        })
      }, 1000)
      const label = objects[0]?.label || 'drawing'
      setAnimLabel(`✨ Your ${label} is coming to life!`)
      playAnimation(objects, parsed.animation_plan)
    } catch {
      setAnimBlocked(true)
      setAnimBlockMsg('Could not animate. Try again! 🎨')
    } finally {
      setAnimLoading(false)
    }
  }

  function handleReplay() {
    if (!animResult) return
    stopAnimation()
    playAnimation(animResult, animPlan)
    track('draw', 'animate_replay')
  }

  function downloadDrawing() {
    const link = document.createElement('a')
    link.download = `${drawingTitle.trim() || child?.name || 'glumbi'}-drawing.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  // ── Selection tool ─────────────────────────────────────────────────────────
  function drawSelOverlay() {
    const ov = selOverlayRef.current
    if (!ov) return
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#9c6ef8'
    const W = canvasRef.current.width, H = canvasRef.current.height
    const ctx = ov.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    const sd = selStateRef.current
    if (!sd.phase) return
    if (sd.phase === 'drawing') {
      ctx.save()
      ctx.strokeStyle = primary; ctx.lineWidth = 2; ctx.setLineDash([8, 4])
      ctx.strokeRect(sd.x, sd.y, sd.w, sd.h)
      ctx.fillStyle = primary + '18'; ctx.fillRect(sd.x, sd.y, sd.w, sd.h)
      ctx.restore()
    } else if (sd.phase === 'floating') {
      const px = Math.round(sd.posX), py = Math.round(sd.posY)
      if (selTmpRef.current) {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 8
        ctx.drawImage(selTmpRef.current, px, py); ctx.restore()
      }
      ctx.save()
      ctx.strokeStyle = primary; ctx.lineWidth = 2; ctx.setLineDash([8, 4])
      ctx.strokeRect(px, py, sd.w, sd.h)
      ctx.setLineDash([])
      ;[[px, py], [px + sd.w, py], [px, py + sd.h], [px + sd.w, py + sd.h]].forEach(([cx, cy]) => {
        ctx.fillStyle = 'white'; ctx.fillRect(cx - 4, cy - 4, 8, 8)
        ctx.strokeStyle = primary; ctx.lineWidth = 1.5; ctx.strokeRect(cx - 4, cy - 4, 8, 8)
      })
      ctx.restore()
    }
  }

  function commitSelection() {
    const sd = selStateRef.current
    if (sd.phase === 'floating' && selTmpRef.current) {
      canvasRef.current.getContext('2d').drawImage(selTmpRef.current, Math.round(sd.posX), Math.round(sd.posY))
      setIsEmpty(false)
    }
    sd.phase = null; sd.pixels = null; selTmpRef.current = null
    setSelPanelOpen(false); setSelTick(t => t + 1)
    selOverlayRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  function cancelSelection() {
    const sd = selStateRef.current
    if (sd.phase === 'floating' && selTmpRef.current) {
      canvasRef.current.getContext('2d').drawImage(selTmpRef.current, Math.round(sd.x), Math.round(sd.y))
    }
    sd.phase = null; sd.pixels = null; selTmpRef.current = null
    setSelPanelOpen(false); setSelTick(t => t + 1)
    selOverlayRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  function onSelDown(e) {
    const sd = selStateRef.current
    const pos = getPos(e, canvasRef.current)
    if (sd.phase === 'floating') {
      const inside = pos.x >= sd.posX && pos.x <= sd.posX + sd.w
                  && pos.y >= sd.posY && pos.y <= sd.posY + sd.h
      if (inside) {
        sd.dragging = true
        sd.dragStartX = pos.x; sd.dragStartY = pos.y
        sd.dragOrigX = sd.posX; sd.dragOrigY = sd.posY
        return
      }
      commitSelection()
    }
    saveSnapshot()
    sd.phase = 'drawing'; sd.startX = pos.x; sd.startY = pos.y
    sd.x = pos.x; sd.y = pos.y; sd.w = 0; sd.h = 0
    drawSelOverlay()
  }

  function onSelMove(e) {
    const sd = selStateRef.current
    const pos = getPos(e, canvasRef.current)
    if (sd.phase === 'drawing') {
      sd.x = Math.min(pos.x, sd.startX); sd.y = Math.min(pos.y, sd.startY)
      sd.w = Math.abs(pos.x - sd.startX); sd.h = Math.abs(pos.y - sd.startY)
      drawSelOverlay()
    } else if (sd.phase === 'floating' && sd.dragging) {
      sd.posX = sd.dragOrigX + (pos.x - sd.dragStartX)
      sd.posY = sd.dragOrigY + (pos.y - sd.dragStartY)
      drawSelOverlay()
    }
  }

  function onSelUp() {
    const sd = selStateRef.current
    if (sd.phase === 'drawing') {
      if (sd.w < 5 || sd.h < 5) { sd.phase = null; drawSelOverlay(); return }
      const canvas = canvasRef.current
      const xi = Math.max(0, Math.floor(sd.x)), yi = Math.max(0, Math.floor(sd.y))
      const wi = Math.min(canvas.width - xi, Math.ceil(sd.w))
      const hi = Math.min(canvas.height - yi, Math.ceil(sd.h))
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      sd.pixels = ctx.getImageData(xi, yi, wi, hi)
      sd.w = wi; sd.h = hi; sd.x = xi; sd.y = yi
      ctx.fillStyle = '#ffffff'; ctx.fillRect(xi, yi, wi, hi)
      selTmpRef.current = document.createElement('canvas')
      selTmpRef.current.width = wi; selTmpRef.current.height = hi
      selTmpRef.current.getContext('2d').putImageData(sd.pixels, 0, 0)
      sd.posX = xi; sd.posY = yi; sd.phase = 'floating'; sd.dragging = false
      setSelPanelOpen(true); setSelTick(t => t + 1)
      drawSelOverlay()
    } else if (sd.phase === 'floating') {
      sd.dragging = false
    }
  }

  // Overlay touch — no deps so handlers are always fresh
  useEffect(() => {
    if (!selectTool) return
    const ov = selOverlayRef.current
    if (!ov) return
    const onTS = e => { e.preventDefault(); onSelDown(e) }
    const onTM = e => { e.preventDefault(); onSelMove(e) }
    const onTE = e => { e.preventDefault(); onSelUp() }
    ov.addEventListener('touchstart', onTS, { passive: false })
    ov.addEventListener('touchmove',  onTM, { passive: false })
    ov.addEventListener('touchend',   onTE, { passive: false })
    return () => {
      ov.removeEventListener('touchstart', onTS)
      ov.removeEventListener('touchmove',  onTM)
      ov.removeEventListener('touchend',   onTE)
    }
  })

  const toolbarStyle = isFullscreen ? {
    // Fullscreen: narrow vertical strip on the left, full height
    width: 64,
    flexShrink: 0,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: 'white',
    borderRadius: 0,
    padding: '12px 8px',
    boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflowY: 'auto',
  } : {
    width: isCompact ? '100%' : 96,
    flexShrink: 0,
    display: 'flex',
    flexDirection: isCompact ? 'row' : 'column',
    flexWrap: isCompact ? 'wrap' : undefined,
    gap: isCompact ? 8 : 12,
    background: 'white',
    borderRadius: 20,
    padding: isCompact ? '12px 16px' : '16px 10px',
    boxShadow: 'var(--shadow)',
    alignItems: 'center',
    justifyContent: isCompact ? 'space-between' : 'flex-start',
    overflowY: isCompact ? undefined : 'auto',
    position: 'relative',
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      height: isCompact ? 'auto' : '100%',
      minHeight: isMobile ? undefined : isCompact ? '80vh' : undefined,
      fontFamily: 'Nunito, sans-serif',
    }}>
    {drawTab === 'draw' && (loading || guideLoading || animLoading) && (
      <ThemeLoader theme={child.theme} label={loading ? 'Guessing your drawing…' : guideLoading ? 'Building your drawing guide…' : 'Bringing your drawing to life… 🎬'} />
    )}
    <FeatureBanner feature="draw" child={child} isMobile={isMobile} />
    <QuotaBanner quota={quota} />

    {/* ── Tabs: Draw / Flipbook ── */}
    <div style={{ display: 'flex', gap: isMobile ? 6 : 10, background: '#f5f5f5',
      padding: isMobile ? 6 : 8, borderRadius: 16, flexShrink: 0 }}>
      {DRAW_TABS.map(t => (
        <button key={t.key} onClick={() => { setSearchParams({ tab: t.key }, { replace: true }); if (t.key !== drawTab) track('draw', 'tab_switch', { metadata: { tab: t.key } }) }}
          style={{ flex: 1, padding: isMobile ? '10px 6px' : '12px 16px', borderRadius: 12,
            border: 'none', fontFamily: 'Nunito, sans-serif', fontSize: isMobile ? 12 : 14,
            fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            background: drawTab === t.key ? 'white' : 'transparent',
            color: drawTab === t.key ? 'var(--primary)' : '#888',
            boxShadow: drawTab === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s' }}>
          {t.label}
        </button>
      ))}
    </div>

    {/* Flipbook — always mounted, hidden when not active so frames are never lost */}
    <div style={{ display: drawTab === 'flipbook' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>
      <FlipbookStudio track={track} child={child} />
    </div>

    {/* Draw — always mounted, hidden when not active so canvas content is never lost */}
    <div style={{ display: drawTab === 'draw' ? 'contents' : 'none' }}><>

      {/* ── Guide prompt (top, full width) ── */}
      {!isCompact && guideEnabled && (
        <form onSubmit={handleGuide} style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'white',
            borderRadius: 50, padding: '0 16px', boxShadow: 'var(--shadow)', minHeight: 46 }}>
            <span style={{ fontSize: 18 }}>🎨</span>
            <input
              value={guideInput}
              onChange={e => setGuideInput(e.target.value)}
              placeholder={`Hey ${child?.name || 'there'}, what do you want to draw today?`}
              disabled={offline || quota?.used >= quota?.limit}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14,
                fontFamily: 'Nunito, sans-serif', fontWeight: 600, background: 'transparent',
                color: '#333' }}
            />
          </div>
          <button type="submit" disabled={!guideInput.trim() || guideLoading || offline || quota?.used >= quota?.limit}
            style={{ padding: '0 20px', borderRadius: 50, border: 'none', fontWeight: 700,
              fontSize: 13, cursor: guideInput.trim() && !offline ? 'pointer' : 'not-allowed',
              background: guideInput.trim() && !offline ? 'linear-gradient(135deg,var(--primary),var(--accent))' : '#eee',
              color: guideInput.trim() && !offline ? 'white' : '#aaa', whiteSpace: 'nowrap' }}>
            {guideLoading ? <><span className="spinner" /> Thinking…</> : offline ? '✈️ ✨ Show me how!' : '✨ Show me how!'}
          </button>
        </form>
      )}

      {/* ── Middle: toolbar + drawing area (fullscreen root) ── */}
      <div ref={fsRef} style={isFullscreen ? {
        position: 'relative',
        display: 'flex', flexDirection: 'row',
        height: '100dvh', width: '100dvw',
        background: '#f0f0f0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      } : { flex: 1, display: 'flex', flexDirection: isCompact ? 'column' : 'row', gap: isCompact ? 12 : 20, minHeight: 0 }}>

      {/* ── Toolbar ── */}
      <div style={toolbarStyle}>

        {/* ── COLOUR section ── */}
        {!isCompact && !isFullscreen && <SectionLabel>Colour</SectionLabel>}

        {/* Active color swatch + palette trigger */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* Color swatch — shows active color */}
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: eraser ? '#f5f5f5' : color,
              boxShadow: `0 0 0 3px white, 0 0 0 5px ${eraser ? '#ccc' : color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
            {eraser && <span style={{ fontSize: 20 }}>🧹</span>}
          </div>
          {/* Palette icon button */}
          <button ref={swatchRef} className="palette-trigger"
            onClick={() => {
              const rect = swatchRef.current.getBoundingClientRect()
              setPalettePos(isCompact || isFullscreen
                ? { x: rect.left, y: rect.bottom + 8 }
                : { x: rect.right + 10, y: rect.top }
              )
              setShowPalette(p => !p)
            }}
            title="Open colour palette"
            style={{
              width: 44, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', padding: '4px 0',
              background: showPalette ? 'var(--primary-lt)' : '#f5f5f5',
              outline: showPalette ? '2px solid var(--primary)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              transition: 'all 0.15s',
            }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>🎨</span>
          </button>

          {/* Palette popup — rendered fixed so toolbar overflow doesn't clip it */}
          {showPalette && (
            <div className="palette-popup" style={{
              position: 'fixed',
              left: palettePos.x,
              top: palettePos.y,
              zIndex: 2000,
              background: 'white',
              borderRadius: 20,
              padding: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              width: 240,
              border: '1px solid #f0f0f0',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 10, letterSpacing: 1 }}>PRESET COLOURS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 14 }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => { pickColor(c); setShowPalette(false) }}
                    style={{
                      width: 28, height: 28, borderRadius: 8, background: c,
                      border: color === c && !eraser ? `3px solid #333` : c === '#ffffff' ? '1px solid #ddd' : '2px solid transparent',
                      cursor: 'pointer', padding: 0,
                      transform: color === c && !eraser ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.12s',
                    }} />
                ))}
              </div>

              {recentColors.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 8, letterSpacing: 1 }}>RECENTLY USED</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {recentColors.map((c, i) => (
                      <button key={i} onClick={() => { pickColor(c); setShowPalette(false) }}
                        style={{
                          width: 28, height: 28, borderRadius: 8, background: c,
                          border: color === c ? '3px solid #333' : c === '#ffffff' ? '1px solid #ddd' : '2px solid transparent',
                          cursor: 'pointer', padding: 0,
                        }} />
                    ))}
                  </div>
                </>
              )}

              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 8, letterSpacing: 1 }}>CUSTOM COLOUR</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: color, border: '1px solid #eee', flexShrink: 0 }} />
                <input
                  ref={colorInput}
                  type="color"
                  value={eraser ? '#000000' : color}
                  onChange={e => pickColor(e.target.value)}
                  style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid #eee', cursor: 'pointer', padding: 2 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick colours */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: isFullscreen ? 52 : 76 }}>
          {['#000000','#ffffff','#ff4757','#ffa502','#2ed573','#1e90ff','#9c6ef8','#ff69b4'].map(c => (
            <button key={c} onClick={() => pickColor(c)}
              style={{
                width: 22, height: 22, borderRadius: 6, background: c, border: 'none',
                cursor: 'pointer', padding: 0,
                boxShadow: color === c && !eraser ? `0 0 0 2px white, 0 0 0 4px ${c}` : c === '#ffffff' ? '0 0 0 1px #ddd' : 'none',
                transform: color === c && !eraser ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.12s',
              }} />
          ))}
        </div>

        {!isCompact && !isFullscreen && <Divider />}
        {!isCompact && !isFullscreen && <SectionLabel>Size</SectionLabel>}

        <div style={{ display: 'flex', flexDirection: isFullscreen ? 'column' : isCompact ? 'row' : 'column', gap: 5, alignItems: 'center' }}>
          {BRUSHES.map(b => (
            <button key={b.size} onClick={() => setBrush(b.size)} title={b.title}
              style={{
                width: isFullscreen ? 44 : isCompact ? 34 : 72,
                height: isFullscreen ? b.btnH * 0.8 : isCompact ? b.btnH * 0.75 : b.btnH,
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: brush === b.size ? 'var(--primary-lt)' : '#f5f5f5',
                outline: brush === b.size ? '2px solid var(--primary)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '0 6px',
              }}>
              <div style={{
                width: b.dotSize, height: b.dotSize,
                borderRadius: '50%',
                background: brush === b.size ? 'var(--primary)' : '#aaa',
                flexShrink: 0,
              }} />
            </button>
          ))}
        </div>

        {!isCompact && !isFullscreen && <Divider />}
        {!isCompact && !isFullscreen && <SectionLabel>Tools</SectionLabel>}

        {isFullscreen && <div style={{ width: '80%', height: 1, background: '#f0f0f0', margin: '2px 0' }} />}

        <div style={{ display: 'flex', flexDirection: isFullscreen ? 'column' : isCompact ? 'row' : 'column', gap: 5, alignItems: 'center' }}>
          {[
            { key: 'pencil', title: 'Pencil',        emoji: '✏️',  active: !eraser && !fillMode && !selectTool, onClick: () => { if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(false); setFillMode(false) } },
            { key: 'fill',   title: 'Fill',          emoji: '🪣',  active: fillMode,   onClick: () => { if (selectTool) { commitSelection(); setSelectTool(false) } setFillMode(f => !f); setEraser(false) } },
            { key: 'eraser', title: 'Eraser',        emoji: '🧽',  active: eraser,     onClick: () => { if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(e => !e); setFillMode(false) } },
            { key: 'select', title: 'Select & Move', emoji: '⬚',   active: selectTool, onClick: () => { if (selectTool) { commitSelection(); setSelectTool(false) } else { setEraser(false); setFillMode(false); setSelectTool(true) } } },
            { key: 'undo',   title: 'Undo',          emoji: '↩️',  active: false, disabled: !canUndo, onClick: handleUndo },
            { key: 'clear',  title: 'Clear',         emoji: '🗑️', active: false, onClick: clearCanvas },
            { key: 'save',     title: isSaving ? 'Saving…' : 'Save',  emoji: isSaving ? '⏳' : '💾', active: false, disabled: isEmpty || isSaving, onClick: saveDrawing },
            { key: 'download', title: 'Download PNG', emoji: '⬇️',  active: false, disabled: isEmpty, onClick: downloadDrawing },
          ].map(({ key, title, emoji, active, disabled, onClick }) => (
            <button key={key} onClick={onClick} title={title} disabled={disabled}
              style={{
                width: isFullscreen ? 44 : isCompact ? 40 : 72,
                height: isFullscreen ? 40 : isCompact ? 38 : 32,
                borderRadius: 8, border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: active ? 'var(--primary-lt)' : '#f5f5f5',
                outline: active ? '2px solid var(--primary)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: disabled ? 0.35 : 1,
                fontSize: 18,
              }}>
              {emoji}
            </button>
          ))}
        </div>

      </div>{/* end toolbar */}

      {/* ── Canvas area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isFullscreen ? 0 : 16, minHeight: 0 }}>

        {/* Title input */}
        {!isFullscreen && (
          <input
            value={drawingTitle}
            onChange={e => setDrawingTitle(e.target.value)}
            placeholder="Give your drawing a name…"
            maxLength={60}
            style={{ padding: '6px 16px', borderRadius: 20, border: '2px solid var(--primary-lt)',
              outline: 'none', fontSize: 13, fontFamily: 'Nunito, sans-serif', fontWeight: 700,
              color: '#444', background: 'white', width: 240, maxWidth: '100%', flexShrink: 0 }}
          />
        )}

        {/* Guide prompt — mobile only, hidden in fullscreen */}
        {isCompact && !isFullscreen && guideEnabled && (
          <form onSubmit={handleGuide} style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'white',
              borderRadius: 50, padding: '0 16px', boxShadow: 'var(--shadow)', minHeight: 46 }}>
              <span style={{ fontSize: 18 }}>🎨</span>
              <input
                value={guideInput}
                onChange={e => setGuideInput(e.target.value)}
                placeholder={`Hey ${child?.name || 'there'}, what do you want to draw today?`}
                disabled={offline || quota?.used >= quota?.limit}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14,
                  fontFamily: 'Nunito, sans-serif', fontWeight: 600, background: 'transparent',
                  color: '#333' }}
              />
            </div>
            <button type="submit" disabled={!guideInput.trim() || guideLoading || offline || quota?.used >= quota?.limit}
              style={{ padding: '0 20px', borderRadius: 50, border: 'none', fontWeight: 700,
                fontSize: 13, cursor: guideInput.trim() && !offline ? 'pointer' : 'not-allowed',
                background: guideInput.trim() && !offline ? 'linear-gradient(135deg,var(--primary),var(--accent))' : '#eee',
                color: guideInput.trim() && !offline ? 'white' : '#aaa', whiteSpace: 'nowrap' }}>
              {guideLoading ? <><span className="spinner" /> Thinking…</> : offline ? '✈️ ✨ Show me how!' : '✨ Show me how!'}
            </button>
          </form>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: isCompact && guide && !isFullscreen ? 'column' : 'row',
          gap: 16, minHeight: isCompact && !isFullscreen ? (isMobile ? 340 : 480) : 0 }}>

        {/* Guide panel — side panel in normal mode, floating overlay in fullscreen */}
        {guide && !isFullscreen && (
          <div style={{ width: isCompact ? '100%' : 220, flexShrink: 0, background: 'white',
            borderRadius: 20, boxShadow: 'var(--shadow)', padding: '16px', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 14,
                color: 'var(--primary)' }}>🖼️ Draw a {guideSubject}</div>
              <button onClick={() => setGuide('')}
                style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', border: 'none',
                  background: '#f0f0f0', color: '#888', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: '#444', whiteSpace: 'pre-wrap' }}>{guide}</div>
          </div>
        )}

        {/* Centering wrapper — fills remaining space, never stretches the canvas */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, overflow: 'hidden' }}>
        {/* Outer wrapper: fixed 1200×800 aspect ratio; position:relative so overlay can escape inner clip */}
        <div style={{
          aspectRatio: '1200 / 800', width: '100%', maxHeight: '100%',
          borderRadius: isFullscreen ? 0 : 20,
          boxShadow: isFullscreen ? 'none' : 'var(--shadow)', position: 'relative',
          cursor: canvasCursor,
        }}>
          {/* Inner clip: clips the drawing canvas to rounded corners without clipping the animation overlay */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: isFullscreen ? 0 : 20, overflow: 'hidden', background: 'white' }}>
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchEnd={stopDraw}
            />
            {/* Selection overlay — captures pointer events when select tool is active */}
            <canvas
              ref={selOverlayRef}
              width={1200}
              height={800}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: selectTool ? 'auto' : 'none',
                display: 'block', cursor: 'crosshair' }}
              onMouseDown={onSelDown}
              onMouseMove={onSelMove}
              onMouseUp={onSelUp}
              onMouseLeave={onSelUp}
            />
          </div>
          {/* Animation overlay — outside the clip so animations can move freely near edges */}
          <canvas
            ref={overlayRef}
            width={1200}
            height={800}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              pointerEvents: 'none', display: 'block' }}
          />
          {/* Selection panel */}
          {selPanelOpen && selStateRef.current.phase === 'floating' && (
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 20,
              background: 'white', borderRadius: 16, padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1.5px solid var(--primary-lt)',
              fontFamily: 'Nunito, sans-serif', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14 }}>✂️ Selection</span>
              <button onClick={commitSelection}
                style={{ padding: '5px 14px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: 'white',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                ✓ Place
              </button>
              <button onClick={cancelSelection}
                style={{ padding: '5px 10px', borderRadius: 8, border: 'none',
                  background: 'var(--primary-lt)', color: 'var(--primary)',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                ✕
              </button>
            </div>
          )}
          {isEmpty && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 64, opacity: 0.1 }}>✏️</div>
              <div style={{ fontSize: 16, color: '#ccc', fontWeight: 700, marginTop: 8 }}>Start drawing!</div>
            </div>
          )}
          {/* Fullscreen toggle button — canvas overlay in normal mode */}
          {!isFullscreen && (
            <button onClick={toggleFullscreen} title="Fullscreen"
              style={{ position:'absolute', top:10, right:10, zIndex:10,
                width:32, height:32, borderRadius:8, border:'1.5px solid rgba(0,0,0,0.1)',
                background:'rgba(255,255,255,0.9)', color:'#888', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
              </svg>
            </button>
          )}
          {/* Guide floating panel in fullscreen */}
          {isFullscreen && guide && (
            <div style={{ position:'absolute', top:10, left:10, zIndex:10, maxWidth:220,
              background:'rgba(255,255,255,0.97)', borderRadius:16,
              boxShadow:'0 4px 20px rgba(0,0,0,0.15)', padding:'12px 14px',
              display:'flex', flexDirection:'column', gap:8, maxHeight:'60vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontWeight:900, fontSize:13, color:'var(--primary)' }}>🖼️ {guideSubject}</div>
                <button onClick={() => setGuide('')}
                  style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', border: 'none',
                    background: '#f0f0f0', color: '#888', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ fontSize:12, lineHeight:1.7, color:'#444', whiteSpace:'pre-wrap' }}>{guide}</div>
            </div>
          )}
          {/* Exit fullscreen button — absolute top-right of canvas in fullscreen */}
          {isFullscreen && (
            <button onClick={toggleFullscreen} title="Exit fullscreen"
              style={{ position:'absolute', top:10, right:10, zIndex:20,
                width:36, height:36, borderRadius:10, border:'none',
                background:'rgba(255,255,255,0.95)', color:'#555', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', padding:0,
                boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/>
              </svg>
            </button>
          )}
        </div>
        </div>{/* end outer wrapper */}
        </div>{/* end centering wrapper */}

        {/* ── Fullscreen bottom action bar ── */}
        {isFullscreen && (
          <div style={{ flexShrink:0, display:'flex', flexWrap:'wrap', alignItems:'center', gap:10,
            padding:'10px 16px', background:'white', borderTop:'1px solid #f0f0f0',
            boxSizing:'border-box', minHeight:60 }}>
            {drawAiEnabled && (
              <button onClick={handleIdentify}
                disabled={loading || isEmpty || quota?.used >= quota?.limit || offline}
                style={{ padding:'10px 20px', borderRadius:50, border:'none', fontWeight:800,
                  fontSize:14, cursor:(isEmpty||offline)?'not-allowed':'pointer',
                  background:'linear-gradient(135deg,var(--primary),var(--accent))',
                  color:'white', opacity:(isEmpty||offline)?0.45:1, flexShrink:0,
                  whiteSpace:'nowrap', boxShadow:'0 3px 12px rgba(0,0,0,0.15)' }}>
                {loading ? '🤔 Thinking…' : offline ? (guideSubject ? '✈️ 🎉 How did I do?' : '✈️ ✨ What did I draw?') : guideSubject ? '🎉 How did I do?' : '✨ What did I draw?'}
              </button>
            )}
            {animateEnabled && (
              <button onClick={handleAnimate}
                disabled={animLoading || isEmpty || !drawnAfterAnim || animCooldown > 0 || quota?.used >= quota?.limit || offline}
                style={{ padding:'10px 20px', borderRadius:50, border:'none', fontWeight:800,
                  fontSize:14, cursor:(isEmpty||offline||animLoading||!drawnAfterAnim||animCooldown>0)?'not-allowed':'pointer',
                  background:'linear-gradient(135deg,#9c6ef8,#ff69b4)',
                  color:'white', opacity:(isEmpty||offline||!drawnAfterAnim||animCooldown>0)?0.45:1, flexShrink:0,
                  whiteSpace:'nowrap', boxShadow:'0 3px 12px rgba(156,110,248,0.35)' }}>
                {animLoading ? '✨ Animating…' : animCooldown > 0 ? `⏳ ${animCooldown}s` : offline ? '✈️ 🎬 Bring to Life!' : '🎬 Bring to Life!'}
              </button>
            )}
            {animResult && !animPlaying && !animLoading && (
              <button onClick={handleReplay}
                style={{ padding:'10px 16px', borderRadius:50, border:'none', fontWeight:800,
                  fontSize:14, cursor:'pointer', background:'#f0f0f0', color:'#666',
                  flexShrink:0, whiteSpace:'nowrap' }}>
                🔁 Replay
              </button>
            )}
            {(animLabel || animBlocked) && (
              <div style={{ flex:1, minWidth:120, fontSize:13, fontWeight:600,
                color: animBlocked ? '#856404' : '#555',
                background: animBlocked ? '#fff3cd' : 'linear-gradient(135deg,rgba(156,110,248,0.12),rgba(255,105,180,0.12))',
                borderRadius:12, padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ flex:1 }}>{animBlocked ? animBlockMsg : animLabel}</span>
                <button onClick={() => { setAnimLabel(''); setAnimBlocked(false); stopAnimation() }}
                  style={{ width:28, height:28, minWidth:28, minHeight:28, borderRadius:'50%', border:'none',
                    background:'#f0f0f0', color:'#888', cursor:'pointer', fontSize:13, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center', padding:0, flexShrink:0 }}>✕</button>
              </div>
            )}
            {aiReply && (
              <div style={{ flex:1, minWidth:120, fontSize:13, fontWeight:600, color:'#444',
                background:'var(--primary-lt)', borderRadius:12,
                padding:'8px 14px', lineHeight:1.5, display:'flex', alignItems:'flex-start', gap:8 }}>
                <span style={{ flex:1 }}>{aiReply}</span>
                <button onClick={() => setAiReply('')}
                  style={{ width:28, height:28, minWidth:28, minHeight:28, borderRadius:'50%', border:'none',
                    background:'#f0f0f0', color:'#888', cursor:'pointer', fontSize:13, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center', padding:0, flexShrink:0 }}>✕</button>
              </div>
            )}
          </div>
        )}

      </div>{/* end canvas area */}

      </div>{/* end fsRef / middle row */}

      {/* ── AI section — hidden in fullscreen ── */}
      <div style={{ display: isFullscreen ? 'none' : 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'stretch', flexShrink: 0 }}>
        {!drawAiEnabled && (
          <div style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>
            ✈️ AI drawing features are currently off
          </div>
        )}
        <button onClick={handleIdentify} disabled={!drawAiEnabled || loading || isEmpty || quota?.used >= quota?.limit || offline}
          style={{
            display: drawAiEnabled ? undefined : 'none',
            padding: '14px 28px', borderRadius: 50, fontSize: 15, fontWeight: 800,
            background: 'linear-gradient(135deg,var(--primary),var(--accent))',
            color: 'white', border: 'none', cursor: (isEmpty || offline) ? 'not-allowed' : 'pointer',
            opacity: (isEmpty || offline) ? 0.5 : 1,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap', alignSelf: 'center',
          }}>
          {loading ? '🤔 Thinking…' : offline ? (guideSubject ? '✈️ 🎉 How did I do?' : '✈️ ✨ What did I draw?') : guideSubject ? '🎉 How did I do?' : '✨ What did I draw?'}
        </button>

        {/* ── Bring to Life button ── */}
        {animateEnabled && (
          <button
            onClick={handleAnimate}
            disabled={animLoading || isEmpty || !drawnAfterAnim || animCooldown > 0 || quota?.used >= quota?.limit || offline}
            style={{
              padding: '14px 28px', borderRadius: 50, fontSize: 15, fontWeight: 800,
              background: 'linear-gradient(135deg,#9c6ef8,#ff69b4)',
              color: 'white', border: 'none',
              cursor: (isEmpty || offline || animLoading || !drawnAfterAnim || animCooldown > 0) ? 'not-allowed' : 'pointer',
              opacity: (isEmpty || offline || !drawnAfterAnim || animCooldown > 0) ? 0.5 : 1,
              boxShadow: '0 4px 16px rgba(156,110,248,0.35)',
              whiteSpace: 'nowrap', alignSelf: 'center',
              transition: 'transform 0.15s',
            }}>
            {animLoading ? '✨ Animating…' : animCooldown > 0 ? `⏳ ${animCooldown}s` : offline ? '✈️ 🎬 Bring to Life!' : '🎬 Bring to Life!'}
          </button>
        )}

        {/* Replay button */}
        {animResult && !animPlaying && !animLoading && (
          <button onClick={handleReplay}
            style={{ padding: '14px 20px', borderRadius: 50, fontSize: 15, fontWeight: 800,
              background: '#f0f0f0', color: '#666', border: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap', alignSelf: 'center' }}>
            🔁 Replay
          </button>
        )}


        {aiReply && (
          <div style={{
            flex: 1, background: 'var(--primary-lt)',
            borderRadius: 16, padding: '14px 20px',
            border: '2px solid var(--primary-lt)', fontSize: 15, fontWeight: 600, color: '#444',
            animation: 'fadeIn 0.4s ease', display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ flex: 1 }}>{aiReply}</span>
            <button onClick={() => setAiReply('')}
              style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', border: 'none',
                background: '#f0f0f0', color: '#888', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
          </div>
        )}

        {/* Animation label / blocked message */}
        {(animLabel || animBlocked) && (
          <div style={{
            flex: 1, background: animBlocked ? '#fff3cd' : 'linear-gradient(135deg,rgba(156,110,248,0.12),rgba(255,105,180,0.12))',
            borderRadius: 16, padding: '14px 20px',
            fontSize: 15, fontWeight: 600, color: animBlocked ? '#856404' : '#555',
            animation: 'fadeIn 0.4s ease', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ flex: 1 }}>{animBlocked ? animBlockMsg : animLabel}</span>
            <button onClick={() => { setAnimLabel(''); setAnimBlocked(false); stopAnimation() }}
              style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', border: 'none',
                background: '#f0f0f0', color: '#888', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
          </div>
        )}
      </div>

      {/* ── First-visit demo popup ── */}
      {showDemo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            background: 'white', borderRadius: 28, padding: '40px 44px',
            maxWidth: 480, width: '90%', textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: 56 }}>🎨</div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 26, margin: '12px 0 6px', color: 'var(--primary)' }}>
              Drawing Studio
            </h2>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
              Your very own digital art canvas! Here's how it works:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', marginBottom: 30 }}>
              {[
                { icon: '🖌️', step: '1. Pick a color', desc: 'Tap the colour swatch to open the full palette — or pick any custom colour!' },
                { icon: '✏️', step: '2. Draw anything!', desc: 'Use your mouse or finger to draw on the big white canvas' },
                { icon: '✨', step: '3. Ask the AI!', desc: 'Hit "What did I draw?" — AI will guess with excitement!' },
              ].map(({ icon, step, desc }) => (
                <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#333' }}>{step}</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { localStorage.setItem('glm_draw_seen', '1'); setShowDemo(false) }}
              style={{
                padding: '14px 40px', borderRadius: 50, fontSize: 16, fontWeight: 800,
                background: 'linear-gradient(135deg,var(--primary),var(--accent))',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
              Let's Draw! 🚀
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>
    </></div>

    {drawTab === 'draw' && <HistoryDrawer title="My Drawings" count={drawSaves.length}>
      {close => drawSaves.map(s => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
          <img src={s.imageData} alt={s.title || 'Drawing'}
            onClick={() => { loadDrawSave(s); close() }}
            style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6, flexShrink: 0,
              border: currentSaveId === s.id ? '2px solid var(--primary)' : '2px solid var(--primary-lt)',
              cursor: 'pointer', background: '#fafafa' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, fontFamily: 'Nunito, sans-serif',
              color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.title || 'Untitled drawing'}
            </div>
            <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'Nunito, sans-serif' }}>
              {fmtDate(s.updatedAt || s.createdAt)}
            </div>
          </div>
          <button onClick={() => { loadDrawSave(s); close() }}
            style={{ padding: '5px 10px', borderRadius: 14, border: 'none',
              background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: 12,
              fontFamily: 'Nunito, sans-serif', cursor: 'pointer', flexShrink: 0 }}>
            Resume
          </button>
          <button onClick={() => deleteDrawSave(s.id)}
            className="btn-danger" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28,
              borderRadius: '50%', padding: 0, fontSize: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>
      ))}
    </HistoryDrawer>}
  </div>
  )
}
