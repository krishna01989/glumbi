import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { hasSeen, markSeen } from '../../utils/seen'
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
import { SHAPES, drawShape, ShapeIcon } from './shapeUtils'

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


const untitledTitle = () => `Untitled – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

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

export default function Draw({ child, quota, featureConfig }) {
  const { track } = useTracker()
  const offline = useOffline()
  const canvasRef  = useRef(null)
  const overlayRef = useRef(null)   // transparent canvas for animation
  const animRafRef = useRef(null)   // requestAnimationFrame id
  const colorInput = useRef(null)
  const drawing    = useRef(false)
  const lastPos    = useRef(null)
  const { markActive } = useFeatureDuration('draw', track)
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
  const [showDemo, setShowDemo]   = useState(() => !hasSeen('draw'))
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewport, setViewport]   = useState({ vw: window.innerWidth, vh: window.innerHeight })

  // ── Animation state ──
  const [animLoading, setAnimLoading] = useState(false)
  const [drawnAfterAnim, setDrawnAfterAnim] = useState(true)
  const [animCooldown, setAnimCooldown] = useState(0)
  const cooldownRef = useRef(null)
  const [animResult, setAnimResult]   = useState(null)   // resolved animation config
  const [animPlan, setAnimPlan]       = useState(null)   // Claude-dictated animation plan
  const [animBlocked, setAnimBlocked] = useState(false)
  const [animBlockMsg, setAnimBlockMsg] = useState('')
  const [animPlaying, setAnimPlaying] = useState(false)
  const [animLabel, setAnimLabel]     = useState('')

  // Draw saves
  const [drawSaves, setDrawSaves]       = useState([])
  const [drawSavesPage, setDrawSavesPage]         = useState(0)
  const [drawSavesTotalPages, setDrawSavesTotalPages] = useState(0)
  const [drawSavesLoading, setDrawSavesLoading]   = useState(false)
  const [currentSaveId, setCurrentSaveId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [drawingTitle, setDrawingTitle] = useState('')

  function fetchDrawSaves(page, replace = false) {
    if (!child?.id) return
    setDrawSavesLoading(true)
    drawSaveApi.getByChild(child.id, page)
      .then(data => {
        setDrawSaves(prev => replace ? data.content : [...prev, ...data.content])
        setDrawSavesTotalPages(data.totalPages)
        setDrawSavesPage(page)
      })
      .catch(() => {})
      .finally(() => setDrawSavesLoading(false))
  }

  useEffect(() => { fetchDrawSaves(0, true) }, [child?.id])

  // Autosave every 60s if there is unsaved canvas content
  const drawAutoSaveRef = useRef(null)
  drawAutoSaveRef.current = () => { if (!isEmpty && !isSaving && child?.id) saveDrawing() }
  useEffect(() => {
    const t = setInterval(() => drawAutoSaveRef.current?.(), 60_000)
    return () => clearInterval(t)
  }, [])

  // Emergency save — called by useLockSession when screen-time alert fires
  const drawEmergencyRef = useRef(null)
  drawEmergencyRef.current = () => { if (!isEmpty && child?.id) saveDrawing() }
  useEffect(() => {
    window.__glumbiEmergencySaves ??= new Set()
    const fn = () => drawEmergencyRef.current?.()
    window.__glumbiEmergencySaves.add(fn)
    return () => window.__glumbiEmergencySaves?.delete(fn)
  }, [])

  async function saveDrawing() {
    if (!canvasRef.current || isEmpty) return
    setIsSaving(true)
    try {
      const imageData = canvasRef.current.toDataURL('image/png').split(',')[1]
      const title = drawingTitle.trim() || untitledTitle()
      if (currentSaveId) {
        const updated = await drawSaveApi.update(currentSaveId, imageData, title)
        // updated has thumbnail from server; keep list entry in sync
        setDrawSaves(prev => prev.map(s => s.id === currentSaveId
          ? { id: updated.id, title: updated.title, thumbnail: updated.thumbnail, updatedAt: updated.updatedAt }
          : s))
      } else {
        const saved = await drawSaveApi.save(child.id, imageData, title)
        setDrawSaves(prev => [{ id: saved.id, title: saved.title, thumbnail: saved.thumbnail, updatedAt: saved.updatedAt }, ...prev])
        setCurrentSaveId(saved.id)
      }
    } finally { setIsSaving(false) }
  }

  async function loadDrawSave(save) {
    stopAnimation()
    setAiReply('')
    setGuide('')
    setGuideSubject('')
    setGuideInput('')
    setAnimResult(null)
    setAnimBlocked(false)
    setAnimLabel('')
    setAnimBlockMsg('')
    const full = await drawSaveApi.getFull(save.id).catch(() => null)
    if (!full) return
    const img = new Image()
    img.onload = () => {
      const ctx = getCtx()
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
      saveSnapshot()
      setIsEmpty(false)
      setCurrentSaveId(full.id)
      setDrawingTitle(full.title || '')
    }
    img.src = 'data:image/png;base64,' + full.imageData
  }

  async function deleteDrawSave(id) {
    await drawSaveApi.delete(id)
    setDrawSaves(prev => prev.filter(s => s.id !== id))
    if (currentSaveId === id) setCurrentSaveId(null)
  }

  // Selection tool
  const [selectTool, setSelectTool]       = useState(false)
  const selOverlayRef  = useRef(null)

  // Shape tool
  const [shapeTool, setShapeTool]         = useState(null)
  const [shapeFill, setShapeFill]         = useState(false)
  const [showShapePicker, setShowShapePicker] = useState(false)
  const [shapePickerPos, setShapePickerPos]   = useState({ x: 0, y: 0, w: 226 })
  const [hasPendingShape, setHasPendingShape] = useState(false)
  const shapeOverlayRef  = useRef(null)
  const shapeStartRef    = useRef(null)
  const hasMovedRef      = useRef(false)
  const touchIndicatorRef = useRef(null)
  const shapesBtnRef     = useRef(null)
  const pendingShapeRef  = useRef(null) // { type, x1, y1, x2, y2, fill, color, lineWidth }
  const pendingDragRef   = useRef(null) // { mode:'move'|'resize', handleId, startX, startY, orig }
  const selTmpRef      = useRef(null)
  const selStateRef    = useRef({ phase: null, startX: 0, startY: 0,
    x: 0, y: 0, w: 0, h: 0, pixels: null, posX: 0, posY: 0,
    dragging: false, dragStartX: 0, dragStartY: 0, dragOrigX: 0, dragOrigY: 0 })
  const selGestureRef  = useRef({ active: false, startDist: 1, startAngle: 0, liveDist: 1, liveAngle: 0, origCanvas: null, origW: 0, origH: 0 })
  const [selTick, setSelTick]             = useState(0)
  const [selPanelOpen, setSelPanelOpen]   = useState(false)
  const [selPanelPos, setSelPanelPos]     = useState({ x: 10, y: 10 })
  const [selPanelSize, setSelPanelSize]   = useState({ w: null, h: null })
  const selPanelDragRef   = useRef(null)
  const selPanelResizeRef = useRef(null)
  const selPanelElRef     = useRef(null)

  function onSelPanelResizeStart(corner, e) {
    e.stopPropagation(); e.preventDefault()
    const src = e.touches ? e.touches[0] : e
    const panel = selPanelElRef.current
    const pr = panel ? panel.getBoundingClientRect() : { width: 220, height: 300 }
    selPanelResizeRef.current = {
      corner, sx: src.clientX, sy: src.clientY,
      ow: pr.width, oh: pr.height,
      ox: selPanelPos.x, oy: selPanelPos.y,
    }
    function onMove(ev) {
      if (!selPanelResizeRef.current) return
      ev.preventDefault()
      const s = ev.touches ? ev.touches[0] : ev
      const cr = canvasRef.current ? canvasRef.current.getBoundingClientRect() : { width: 400, height: 300 }
      const r = selPanelResizeRef.current
      const dx = s.clientX - r.sx, dy = s.clientY - r.sy
      const minW = 180, minH = 64
      let nw = r.ow, nh = r.oh, nx = r.ox, ny = r.oy
      if (r.corner === 'br') { nw = r.ow + dx; nh = r.oh + dy }
      if (r.corner === 'bl') { nw = r.ow - dx; nx = r.ox + dx }
      if (r.corner === 'tr') { nw = r.ow + dx; nh = r.oh - dy; ny = r.oy + dy }
      if (r.corner === 'tl') { nw = r.ow - dx; nx = r.ox + dx; nh = r.oh - dy; ny = r.oy + dy }
      nw = Math.max(minW, Math.min(nw, cr.width - 8))
      nh = Math.max(minH, nh)
      nx = Math.max(0, Math.min(nx, cr.width - nw))
      ny = Math.max(0, Math.min(ny, cr.height - minH))
      setSelPanelSize({ w: nw, h: nh })
      if (r.corner === 'bl' || r.corner === 'tl' || r.corner === 'tr') setSelPanelPos({ x: nx, y: ny })
    }
    function onUp() {
      selPanelResizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }

  function onSelPanelDragStart(e) {
    e.stopPropagation()
    const src = e.touches ? e.touches[0] : e
    const panel = selPanelElRef.current
    const pw = panel ? panel.offsetWidth : 220
    const ph = panel ? panel.offsetHeight : 300
    selPanelDragRef.current = { sx: src.clientX, sy: src.clientY, ox: selPanelPos.x, oy: selPanelPos.y, pw, ph }
    function onMove(ev) {
      if (!selPanelDragRef.current) return
      ev.preventDefault()
      const s = ev.touches ? ev.touches[0] : ev
      const cr = canvasRef.current ? canvasRef.current.getBoundingClientRect() : { width: 400, height: 300 }
      const r = selPanelDragRef.current
      setSelPanelPos({
        x: Math.max(0, Math.min(r.ox + s.clientX - r.sx, cr.width - r.pw)),
        y: Math.max(0, Math.min(r.oy + s.clientY - r.sy, cr.height - r.ph)),
      })
    }
    function onUp() {
      selPanelDragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }

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
  const isPortrait = isFullscreen && viewport.vw < viewport.vh
  const canvasCursor = useMemo(() => {
    if (fillMode)   return makeEmojiCursor('🪣', 24, 3, 21)
    if (eraser)     return makeEmojiCursor('🧽', 28, 4, 24)
    if (shapeTool)  return 'crosshair'
    return 'crosshair'
  }, [eraser, fillMode, shapeTool])

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

  // Close shape picker on outside click
  useEffect(() => {
    if (!showShapePicker) return
    const handler = (e) => {
      if (!e.target.closest('.shape-picker-popup') && !e.target.closest('.shape-picker-trigger')) {
        setShowShapePicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showShapePicker])

  function updateTouchIndicator(e) {
    if (!e?.touches || !touchIndicatorRef.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const ind  = touchIndicatorRef.current
    ind.style.left        = (e.touches[0].clientX - rect.left) + 'px'
    ind.style.top         = (e.touches[0].clientY - rect.top) + 'px'
    ind.style.opacity     = '1'
    ind.style.borderColor = eraser ? '#aaa' : color
  }

  function openShapePicker() {
    if (!shapesBtnRef.current) return
    const rect = shapesBtnRef.current.getBoundingClientRect()
    const popW = Math.min(226, window.innerWidth - 16)
    const popH = 290
    let x = isCompact || isFullscreen ? rect.left : rect.right + 8
    let y = isCompact || isFullscreen ? rect.bottom + 6 : rect.top
    if (x + popW > window.innerWidth - 8)  x = window.innerWidth - popW - 8
    if (x < 8) x = 8
    if (y + popH > window.innerHeight - 8) y = window.innerHeight - popH - 8
    if (y < 8) y = 8
    setShapePickerPos({ x, y, w: popW })
    setShowShapePicker(v => !v)
  }

  function getCornerHandles({ x1, y1, x2, y2 }) {
    const pad = 12
    const mnX = Math.min(x1, x2) - pad, mnY = Math.min(y1, y2) - pad
    const mxX = Math.max(x1, x2) + pad, mxY = Math.max(y1, y2) + pad
    return [
      { id: 'nw', x: mnX, y: mnY }, { id: 'ne', x: mxX, y: mnY },
      { id: 'se', x: mxX, y: mxY }, { id: 'sw', x: mnX, y: mxY },
    ]
  }
  function hitSelCorner(pos) {
    const sd = selStateRef.current
    if (sd.phase !== 'floating') return null
    const px = Math.round(sd.posX), py = Math.round(sd.posY)
    const HIT = 18
    return [
      { id: 'nw', x: px,          y: py          },
      { id: 'ne', x: px + sd.w,   y: py          },
      { id: 'sw', x: px,          y: py + sd.h   },
      { id: 'se', x: px + sd.w,   y: py + sd.h   },
    ].find(h => Math.abs(pos.x - h.x) <= HIT && Math.abs(pos.y - h.y) <= HIT) || null
  }

  function hitCornerHandle(ps, pos) {
    const HIT = 22
    return getCornerHandles(ps).find(h => Math.abs(pos.x - h.x) <= HIT && Math.abs(pos.y - h.y) <= HIT) || null
  }
  function hitInsideShape({ x1, y1, x2, y2 }, pos) {
    const pad = 12
    return pos.x >= Math.min(x1, x2) - pad && pos.x <= Math.max(x1, x2) + pad
        && pos.y >= Math.min(y1, y2) - pad && pos.y <= Math.max(y1, y2) + pad
  }
  function drawPendingShapeOverlay() {
    const ov = shapeOverlayRef.current
    if (!ov) return
    const ovCtx = ov.getContext('2d')
    ovCtx.clearRect(0, 0, 1200, 800)
    const ps = pendingShapeRef.current
    if (!ps) return
    drawShape(ovCtx, ps.type, ps.x1, ps.y1, ps.x2, ps.y2, ps.color, ps.lineWidth, ps.fill)
    const pad = 12, hs = 16
    const mnX = Math.min(ps.x1, ps.x2) - pad, mnY = Math.min(ps.y1, ps.y2) - pad
    const mxX = Math.max(ps.x1, ps.x2) + pad, mxY = Math.max(ps.y1, ps.y2) + pad
    ovCtx.save()
    ovCtx.strokeStyle = '#1e90ff'; ovCtx.lineWidth = 2; ovCtx.setLineDash([8, 4])
    ovCtx.strokeRect(mnX, mnY, mxX - mnX, mxY - mnY)
    ovCtx.setLineDash([])
    getCornerHandles(ps).forEach(h => {
      ovCtx.fillStyle = 'white'; ovCtx.strokeStyle = '#1e90ff'; ovCtx.lineWidth = 2
      ovCtx.fillRect(h.x - hs / 2, h.y - hs / 2, hs, hs)
      ovCtx.strokeRect(h.x - hs / 2, h.y - hs / 2, hs, hs)
    })
    ovCtx.restore()
  }
  function commitPendingShape() {
    const ps = pendingShapeRef.current
    if (!ps) return
    pendingShapeRef.current = null; pendingDragRef.current = null
    shapeOverlayRef.current?.getContext('2d').clearRect(0, 0, 1200, 800)
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
    drawShape(ctx, ps.type, ps.x1, ps.y1, ps.x2, ps.y2, ps.color, ps.lineWidth, ps.fill)
    setIsEmpty(false); setHasPendingShape(false)
  }
  function cancelPendingShape() {
    pendingShapeRef.current = null; pendingDragRef.current = null
    shapeOverlayRef.current?.getContext('2d').clearRect(0, 0, 1200, 800)
    setHasPendingShape(false)
  }

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
    markActive()
    updateTouchIndicator(e)
    hasMovedRef.current = false
    const pos = getPos(e, canvasRef.current)

    // Pending shape: handle move/resize or commit before new action
    if (pendingShapeRef.current) {
      const handle = hitCornerHandle(pendingShapeRef.current, pos)
      if (handle) {
        pendingDragRef.current = { mode: 'resize', handleId: handle.id, startX: pos.x, startY: pos.y, orig: { ...pendingShapeRef.current } }
        drawing.current = true
        return
      }
      if (hitInsideShape(pendingShapeRef.current, pos)) {
        pendingDragRef.current = { mode: 'move', startX: pos.x, startY: pos.y, orig: { ...pendingShapeRef.current } }
        drawing.current = true
        return
      }
      commitPendingShape()
    }

    if (fillMode) {
      saveSnapshot()
      floodFill(canvasRef.current, pos.x, pos.y, color)
      setIsEmpty(false)
      setDrawnAfterAnim(true)
      return
    }
    if (shapeTool) {
      saveSnapshot()
      shapeStartRef.current = pos
      drawing.current = true
      return
    }
    saveSnapshot()
    drawing.current = true
    lastPos.current = pos
  }

  function draw(e) {
    e.preventDefault()
    updateTouchIndicator(e)
    if (!drawing.current) return
    const pos = getPos(e, canvasRef.current)
    hasMovedRef.current = true

    // Pending shape drag (move / resize)
    if (pendingDragRef.current) {
      const pd = pendingDragRef.current
      const dx = pos.x - pd.startX, dy = pos.y - pd.startY
      const ns = { ...pd.orig }
      if (pd.mode === 'move') {
        ns.x1 = pd.orig.x1 + dx; ns.y1 = pd.orig.y1 + dy
        ns.x2 = pd.orig.x2 + dx; ns.y2 = pd.orig.y2 + dy
      } else {
        switch (pd.handleId) {
          case 'nw': ns.x1 = pd.orig.x1 + dx; ns.y1 = pd.orig.y1 + dy; break
          case 'ne': ns.x2 = pd.orig.x2 + dx; ns.y1 = pd.orig.y1 + dy; break
          case 'se': ns.x2 = pd.orig.x2 + dx; ns.y2 = pd.orig.y2 + dy; break
          case 'sw': ns.x1 = pd.orig.x1 + dx; ns.y2 = pd.orig.y2 + dy; break
          default: break
        }
      }
      pendingShapeRef.current = ns
      drawPendingShapeOverlay()
      return
    }

    if (shapeTool && shapeStartRef.current) {
      lastPos.current = pos
      const ov  = shapeOverlayRef.current
      if (ov) {
        const ovCtx = ov.getContext('2d')
        ovCtx.clearRect(0, 0, 1200, 800)
        ovCtx.globalAlpha = 0.75
        drawShape(ovCtx, shapeTool, shapeStartRef.current.x, shapeStartRef.current.y, pos.x, pos.y, eraser ? '#ffffff' : color, brush, shapeFill)
        ovCtx.globalAlpha = 1
      }
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
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
    if (touchIndicatorRef.current) touchIndicatorRef.current.style.opacity = '0'
    // End pending shape drag — shape stays pending, user must Place or cancel
    if (pendingDragRef.current) {
      pendingDragRef.current = null
      drawing.current = false
      return
    }
    if (drawing.current) {
      if (shapeTool && shapeStartRef.current) {
        shapeOverlayRef.current?.getContext('2d').clearRect(0, 0, 1200, 800)
        if (hasMovedRef.current && lastPos.current) {
          pendingShapeRef.current = {
            type: shapeTool, x1: shapeStartRef.current.x, y1: shapeStartRef.current.y,
            x2: lastPos.current.x, y2: lastPos.current.y,
            fill: shapeFill, color: eraser ? '#ffffff' : color, lineWidth: brush,
          }
          drawPendingShapeOverlay()
          setHasPendingShape(true)
        }
        shapeStartRef.current = null
      } else if (!hasMovedRef.current && lastPos.current) {
        // Single-tap dot fix
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
        const r = eraser ? brush : Math.max(brush / 2, 1.5)
        ctx.beginPath()
        ctx.arc(lastPos.current.x, lastPos.current.y, r, 0, Math.PI * 2)
        ctx.fillStyle = eraser ? '#ffffff' : color
        ctx.fill()
        setIsEmpty(false)
      }
      setAnimResult(null)
      setAnimPlan(null)
      setAnimLabel('')
      setDrawnAfterAnim(true)
      stopAnimation()
    }
    drawing.current = false
    lastPos.current = null
  }

  async function newDrawing() {
    if (!isEmpty && child?.id) await saveDrawing()
    clearCanvas()
  }

  function clearCanvas() {
    cancelPendingShape()
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
      window.__glumbiRefreshQuota?.('draw')
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
      track('draw', 'animate'); markActive()
      window.__glumbiRefreshQuota?.('draw-animate')

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
      const g = selGestureRef.current
      if (g.active && g.origCanvas) {
        const scale = g.liveDist / g.startDist
        const rot   = g.liveAngle - g.startAngle
        const cx = px + g.origW / 2, cy = py + g.origH / 2
        ctx.save()
        ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(scale, scale)
        ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 8
        ctx.drawImage(g.origCanvas, -g.origW / 2, -g.origH / 2)
        ctx.restore()
        ctx.save()
        ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(scale, scale)
        ctx.strokeStyle = primary; ctx.lineWidth = 2 / scale; ctx.setLineDash([8 / scale, 4 / scale])
        ctx.strokeRect(-g.origW / 2, -g.origH / 2, g.origW, g.origH)
        ctx.restore()
      } else {
        if (selTmpRef.current) {
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 8
          ctx.drawImage(selTmpRef.current, px, py, sd.w, sd.h); ctx.restore()
        }
        const hs = 12
        ctx.save()
        ctx.strokeStyle = primary; ctx.lineWidth = 2; ctx.setLineDash([8, 4])
        ctx.strokeRect(px, py, sd.w, sd.h)
        ctx.setLineDash([])
        ;[[px, py], [px + sd.w, py], [px, py + sd.h], [px + sd.w, py + sd.h]].forEach(([cx, cy]) => {
          ctx.fillStyle = 'white'; ctx.fillRect(cx - hs/2, cy - hs/2, hs, hs)
          ctx.strokeStyle = primary; ctx.lineWidth = 1.5; ctx.strokeRect(cx - hs/2, cy - hs/2, hs, hs)
        })
        ctx.restore()
      }
    }
  }

  function commitSelection() {
    const sd = selStateRef.current
    if (sd.phase === 'floating' && selTmpRef.current) {
      // For move/resize: canvas was lazily erased (erased=true, pixels=ImageData) —
      // the snapshot was already saved at corner-grab or at the initial selection draw.
      // For copy-mode floating (erased=true, pixels=null): stamp is a fresh addition,
      // save snapshot so this commit is its own undoable step.
      if (!sd.erased || sd.pixels === null) saveSnapshot()
      canvasRef.current.getContext('2d').drawImage(selTmpRef.current, Math.round(sd.posX), Math.round(sd.posY))
      setIsEmpty(false)
    }
    sd.phase = null; sd.pixels = null; selTmpRef.current = null
    setSelPanelOpen(false); setSelTick(t => t + 1)
    selOverlayRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  function cancelSelection() {
    const sd = selStateRef.current
    if (sd.erased && sd.pixels && selTmpRef.current) {
      canvasRef.current.getContext('2d').putImageData(sd.pixels, Math.round(sd.x), Math.round(sd.y))
    }
    sd.phase = null; sd.pixels = null; selTmpRef.current = null
    setSelPanelOpen(false); setSelTick(t => t + 1)
    selOverlayRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  function deleteSelection() {
    const sd = selStateRef.current
    if (!sd.erased && sd.phase === 'floating') {
      // Never dragged — original still on canvas; erase it now
      saveSnapshot()
      const ctx = canvasRef.current.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(Math.round(sd.x), Math.round(sd.y), Math.round(sd.w), Math.round(sd.h))
    }
    sd.phase = null; sd.pixels = null; selTmpRef.current = null
    setSelPanelOpen(false); setSelTick(t => t + 1)
    selOverlayRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  function applySelTransform(fn) {
    const src = selTmpRef.current
    if (!src || selStateRef.current.phase !== 'floating') return
    const { canvas, nw, nh } = fn(src)
    selTmpRef.current = canvas
    selStateRef.current.w = nw
    selStateRef.current.h = nh
    drawSelOverlay()
  }

  function flipSelH() {
    applySelTransform(src => {
      const w = src.width, h = src.height
      const dst = document.createElement('canvas'); dst.width = w; dst.height = h
      const ctx = dst.getContext('2d'); ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(src, 0, 0)
      return { canvas: dst, nw: w, nh: h }
    })
  }

  function flipSelV() {
    applySelTransform(src => {
      const w = src.width, h = src.height
      const dst = document.createElement('canvas'); dst.width = w; dst.height = h
      const ctx = dst.getContext('2d'); ctx.translate(0, h); ctx.scale(1, -1); ctx.drawImage(src, 0, 0)
      return { canvas: dst, nw: w, nh: h }
    })
  }

  function rotateSel(deg) {
    applySelTransform(src => {
      const rad = deg * Math.PI / 180
      const sw = src.width, sh = src.height
      const nw = Math.round(Math.abs(sw * Math.cos(rad)) + Math.abs(sh * Math.sin(rad)))
      const nh = Math.round(Math.abs(sw * Math.sin(rad)) + Math.abs(sh * Math.cos(rad)))
      const dst = document.createElement('canvas'); dst.width = nw; dst.height = nh
      const ctx = dst.getContext('2d')
      ctx.translate(nw / 2, nh / 2); ctx.rotate(rad); ctx.drawImage(src, -sw / 2, -sh / 2)
      return { canvas: dst, nw, nh }
    })
  }

  function scaleSel(factor) {
    applySelTransform(src => {
      const nw = Math.max(10, Math.round(src.width * factor))
      const nh = Math.max(10, Math.round(src.height * factor))
      const dst = document.createElement('canvas'); dst.width = nw; dst.height = nh
      dst.getContext('2d').drawImage(src, 0, 0, nw, nh)
      return { canvas: dst, nw, nh }
    })
  }

  function duplicateSel() {
    const src = selTmpRef.current
    if (!src || selStateRef.current.phase !== 'floating') return
    const sd = selStateRef.current
    saveSnapshot()
    canvasRef.current.getContext('2d').drawImage(src, Math.round(sd.posX), Math.round(sd.posY))
    setIsEmpty(false); setDrawnAfterAnim(true)
    const dup = document.createElement('canvas'); dup.width = src.width; dup.height = src.height
    dup.getContext('2d').drawImage(src, 0, 0)
    selTmpRef.current = dup
    const cw = canvasRef.current.width, ch = canvasRef.current.height
    const offX = sd.posX + 20 + sd.w <= cw ? 20 : -20
    const offY = sd.posY + 20 + sd.h <= ch ? 20 : -20
    sd.posX = Math.max(0, Math.min(sd.posX + offX, cw - sd.w))
    sd.posY = Math.max(0, Math.min(sd.posY + offY, ch - sd.h))
    // Copy mode: original already committed, dragging the copy should erase nothing
    sd.x = Math.round(sd.posX); sd.y = Math.round(sd.posY)
    sd.erased = true; sd.pixels = null
    drawSelOverlay()
    setSelTick(t => t + 1)
  }

  function onSelDown(e) {
    const sd = selStateRef.current
    const pos = getPos(e, canvasRef.current)
    if (sd.phase === 'floating') {
      const corner = hitSelCorner(pos)
      if (corner) {
        saveSnapshot()
        sd.resizing = true; sd.resizeHandle = corner.id
        sd.resizeDragStartX = pos.x; sd.resizeDragStartY = pos.y
        sd.resizeOrigX = sd.posX; sd.resizeOrigY = sd.posY
        sd.resizeOrigW = sd.w;   sd.resizeOrigH = sd.h
        return
      }
      const inside = pos.x >= sd.posX && pos.x <= sd.posX + sd.w
                  && pos.y >= sd.posY && pos.y <= sd.posY + sd.h
      if (inside) {
        sd.dragging = true
        sd.dragStartX = pos.x; sd.dragStartY = pos.y
        sd.dragOrigX = sd.posX; sd.dragOrigY = sd.posY
        return
      }
      commitSelection()
      // commitSelection already saved a snapshot; start new selection without another
      sd.phase = 'drawing'; sd.startX = pos.x; sd.startY = pos.y
      sd.x = pos.x; sd.y = pos.y; sd.w = 0; sd.h = 0
      drawSelOverlay()
      return
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
    } else if (sd.phase === 'floating' && sd.resizing) {
      if (!sd.erased) {
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(Math.round(sd.x), Math.round(sd.y), Math.round(sd.resizeOrigW), Math.round(sd.resizeOrigH))
        sd.erased = true
      }
      const dx = pos.x - sd.resizeDragStartX, dy = pos.y - sd.resizeDragStartY
      let nx = sd.resizeOrigX, ny = sd.resizeOrigY, nw = sd.resizeOrigW, nh = sd.resizeOrigH
      switch (sd.resizeHandle) {
        case 'se': nw += dx; nh += dy; break
        case 'sw': nw -= dx; nx += dx; nh += dy; break
        case 'ne': nw += dx; nh -= dy; ny += dy; break
        case 'nw': nw -= dx; nx += dx; nh -= dy; ny += dy; break
      }
      nw = Math.max(10, nw); nh = Math.max(10, nh)
      sd.posX = nx; sd.posY = ny; sd.w = nw; sd.h = nh
      drawSelOverlay()
    } else if (sd.phase === 'floating' && sd.dragging) {
      if (!sd.erased) {
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(Math.round(sd.x), Math.round(sd.y), Math.round(sd.w), Math.round(sd.h))
        sd.erased = true
      }
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
      selTmpRef.current = document.createElement('canvas')
      selTmpRef.current.width = wi; selTmpRef.current.height = hi
      selTmpRef.current.getContext('2d').putImageData(sd.pixels, 0, 0)
      sd.posX = xi; sd.posY = yi; sd.phase = 'floating'; sd.dragging = false; sd.erased = false
      // Panel position is in CSS pixels (container space), canvas coords are logical pixels
      const cRect = canvas.getBoundingClientRect()
      const scaleX = cRect.width / canvas.width, scaleY = cRect.height / canvas.height
      const initW = cRect.width < 500 ? Math.max(160, Math.round(cRect.width * 0.42)) : null
      const initH = null // Draw panel has minimal content — let it shrink to fit
      const panelW = initW ?? 230
      const rightX = (xi + wi) * scaleX + 10
      const leftX  = xi * scaleX - panelW - 10
      const panelX = (rightX + panelW < cRect.width) ? rightX : Math.max(0, leftX)
      const panelY = Math.min(yi * scaleY, cRect.height - 80)
      setSelPanelOpen(true); setSelPanelPos({ x: panelX, y: panelY }); setSelPanelSize({ w: initW, h: initH }); setSelTick(t => t + 1)
      drawSelOverlay()
    } else if (sd.phase === 'floating') {
      if (sd.resizing) {
        const dst = document.createElement('canvas')
        dst.width = Math.round(sd.w); dst.height = Math.round(sd.h)
        dst.getContext('2d').drawImage(selTmpRef.current, 0, 0, dst.width, dst.height)
        selTmpRef.current = dst
        sd.resizing = false
      }
      sd.dragging = false
    }
  }

  // Overlay touch — no deps so handlers are always fresh
  useEffect(() => {
    if (!selectTool) return
    const ov = selOverlayRef.current
    if (!ov) return

    function pinchInfo(e) {
      const t0 = e.touches[0], t1 = e.touches[1]
      const dx = t1.clientX - t0.clientX, dy = t1.clientY - t0.clientY
      return { dist: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) }
    }

    const onTS = e => {
      e.preventDefault()
      if (e.touches.length === 2 && selStateRef.current.phase === 'floating') {
        const { dist, angle } = pinchInfo(e)
        const g = selGestureRef.current
        const sd = selStateRef.current
        g.active = true
        g.startDist = dist; g.startAngle = angle
        g.liveDist  = dist; g.liveAngle  = angle
        g.origCanvas = selTmpRef.current
        g.origW = sd.w; g.origH = sd.h
        return
      }
      onSelDown(e)
    }

    const onTM = e => {
      e.preventDefault()
      const g = selGestureRef.current
      if (g.active && e.touches.length === 2) {
        const { dist, angle } = pinchInfo(e)
        g.liveDist = dist; g.liveAngle = angle
        drawSelOverlay()
        return
      }
      onSelMove(e)
    }

    const onTE = e => {
      e.preventDefault()
      const g = selGestureRef.current
      if (g.active) {
        if (e.touches.length < 2) {
          const scale  = g.liveDist / g.startDist
          const rotDeg = (g.liveAngle - g.startAngle) * 180 / Math.PI
          g.active = false
          const src = g.origCanvas
          if (src) {
            const rad = rotDeg * Math.PI / 180
            const sw = src.width * scale, sh = src.height * scale
            const nw = Math.round(Math.abs(sw * Math.cos(rad)) + Math.abs(sh * Math.sin(rad)))
            const nh = Math.round(Math.abs(sw * Math.sin(rad)) + Math.abs(sh * Math.cos(rad)))
            const dst = document.createElement('canvas'); dst.width = nw; dst.height = nh
            const ctx = dst.getContext('2d')
            ctx.translate(nw / 2, nh / 2); ctx.rotate(rad); ctx.scale(scale, scale)
            ctx.drawImage(src, -src.width / 2, -src.height / 2)
            selTmpRef.current = dst
            selStateRef.current.w = nw
            selStateRef.current.h = nh
          }
          drawSelOverlay()
        }
        return
      }
      onSelUp()
    }

    ov.addEventListener('touchstart', onTS, { passive: false })
    ov.addEventListener('touchmove',  onTM, { passive: false })
    ov.addEventListener('touchend',   onTE, { passive: false })
    return () => {
      ov.removeEventListener('touchstart', onTS)
      ov.removeEventListener('touchmove',  onTM)
      ov.removeEventListener('touchend',   onTE)
    }
  })

  const toolbarStyle = {
    width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column',
    gap: isMobile ? 6 : 10,
    background: isFullscreen ? 'rgba(255,255,255,0.97)' : 'white',
    borderRadius: isFullscreen ? 0 : 20,
    padding: isMobile ? '8px 10px' : '10px 14px',
    boxShadow: isFullscreen ? '0 2px 8px rgba(0,0,0,0.08)' : 'var(--shadow)',
    alignItems: 'stretch', position: 'relative',
  }
  const VDivider = () => <div style={{ width: 1, height: 26, background: '#e8e8e8', flexShrink: 0 }} />

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      height: isCompact ? 'auto' : '100%',
      minHeight: isMobile ? undefined : isCompact ? '80vh' : undefined,
      fontFamily: 'Nunito, sans-serif',
    }}>
    {(loading || guideLoading || animLoading) && (
      <ThemeLoader theme={child.theme} label={loading ? 'Guessing your drawing…' : guideLoading ? 'Building your drawing guide…' : 'Bringing your drawing to life… 🎬'} />
    )}
    <FeatureBanner feature="draw" child={child} isMobile={isMobile} />
    <QuotaBanner quota={quota} />

    <>

      {/* ── Middle: toolbar + drawing area (fullscreen root) ── */}
      <div ref={fsRef} style={isFullscreen ? {
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        height: '100dvh', width: '100dvw',
        background: '#f0f0f0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      } : { flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

      {/* ── Toolbar ── */}
      <div style={toolbarStyle}>

        {/* Shared: palette popup (position:fixed, works anywhere in DOM) */}
        {showPalette && (
          <div className="palette-popup" style={{
            position: 'fixed', left: palettePos.x, top: palettePos.y,
            zIndex: 2000, background: 'white', borderRadius: 20, padding: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)', width: 240,
            border: '1px solid #f0f0f0', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 10, letterSpacing: 1 }}>PRESET COLOURS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 14 }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => { pickColor(c); setShowPalette(false) }}
                  style={{
                    width: 28, height: 28, borderRadius: 8, background: c,
                    border: color === c && !eraser ? '3px solid #333' : c === '#ffffff' ? '1px solid #ddd' : '2px solid transparent',
                    cursor: 'pointer', padding: 0,
                    transform: color === c && !eraser ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.12s',
                  }} />
              ))}
            </div>
            {recentColors.length > 0 && (<>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 8, letterSpacing: 1 }}>RECENTLY USED</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {recentColors.map((c, i) => (
                  <button key={i} onClick={() => { pickColor(c); setShowPalette(false) }}
                    style={{ width: 28, height: 28, borderRadius: 8, background: c,
                      border: color === c ? '3px solid #333' : c === '#ffffff' ? '1px solid #ddd' : '2px solid transparent',
                      cursor: 'pointer', padding: 0 }} />
                ))}
              </div>
            </>)}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 8, letterSpacing: 1 }}>CUSTOM COLOUR</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: color, border: '1px solid #eee', flexShrink: 0 }} />
              <input ref={colorInput} type="color" value={eraser ? '#000000' : color}
                onChange={e => pickColor(e.target.value)}
                style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid #eee', cursor: 'pointer', padding: 2 }} />
            </div>
          </div>
        )}

        {/* Shared: shape picker popup */}
        {showShapePicker && (
          <div className="shape-picker-popup" style={{
            position: 'fixed', left: shapePickerPos.x, top: shapePickerPos.y,
            zIndex: 2000, background: 'white', borderRadius: 18, padding: 18,
            boxShadow: '0 8px 40px rgba(0,0,0,0.22)', width: shapePickerPos.w,
            border: '1px solid #f0f0f0', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 10, letterSpacing: 1 }}>SHAPES</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))', gap: 8, marginBottom: 12 }}>
              {SHAPES.map(s => (
                <button key={s.key} title={s.label}
                  onClick={() => { setShapeTool(s.key); setShowShapePicker(false); setEraser(false); setFillMode(false); if (selectTool) { commitSelection(); setSelectTool(false) } }}
                  style={{
                    padding: '10px 6px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: shapeTool === s.key ? 'var(--primary-lt)' : '#f5f5f5',
                    outline: shapeTool === s.key ? '2px solid var(--primary)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  }}>
                  <ShapeIcon shape={s.key} size={26} color={shapeTool === s.key ? 'var(--primary)' : '#555'} strokeWidth={2} />
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'Nunito, sans-serif', color: shapeTool === s.key ? 'var(--primary)' : '#888' }}>{s.label}</span>
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#888', fontFamily: 'Nunito, sans-serif' }}>Fill</span>
              <div onClick={() => setShapeFill(v => !v)} style={{
                width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                background: shapeFill ? 'var(--primary)' : '#ddd', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <span style={{ position: 'absolute', top: 2, left: shapeFill ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%', background: 'white',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', display: 'block' }} />
              </div>
              <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'Nunito, sans-serif' }}>{shapeFill ? 'Filled' : 'Outline'}</span>
            </div>
          </div>
        )}

        {(() => {
          // Tablet: 2 rows with comfortable sizing
          // Mobile: 3 rows so nothing overflows even on 320px screens
          const tabletRow = {
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }
          const mobileRow = {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }
          const rowStyle   = isMobile ? mobileRow : tabletRow
          const swatchSz = isMobile ? 26 : 30
          const palSz    = isMobile ? 26 : 30
          const colorSz  = isMobile ? 20 : 22
          const brushSz  = isMobile ? 36 : 30   // Row 2 is brushes-only so they get more room
          const btnSz    = isMobile ? 28 : 36
          const fontSize = isMobile ? 17 : 20

          const btnStyle = (active) => ({
            width: btnSz, height: btnSz, minWidth: btnSz, borderRadius: 9, border: 'none',
            cursor: 'pointer', flexShrink: 0,
            background: active ? 'var(--primary-lt)' : '#f0f0f0',
            outline: active ? '2px solid var(--primary)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize,
          })

          if (isMobile) {
            // ── MOBILE: 2-column layout ──
            // Col 1 (fixed ~72px): color swatch + 🎨 + 8-colour 4×2 grid
            // Col 2 (flex:1):
            //   Row 1 — 3 brush sizes (flex:1 each)
            //   Row 2 — ✏️ 🪣 🧽 ⬚ shapes (flex:1 each)
            //   Row 3 — ↩️ 🗑️ 💾 ⬇️ (flex:1 each)
            const col2Btn = (active, extra) => ({
              width: 36, height: 26, minWidth: 36, borderRadius: 7, border: 'none',
              flexShrink: 0, cursor: 'pointer',
              background: active ? 'var(--primary-lt)' : '#f0f0f0',
              outline: active ? '2px solid var(--primary)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, ...extra,
            })
            const col2Row = { display: 'flex', gap: 4, justifyContent: 'space-around' }
            return (
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>

                {/* ── Column 1: colours ── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 68, flexShrink: 0 }}>
                  {/* active-colour circle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: eraser ? '#e8e8e8' : color,
                    border: '2px solid rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {eraser && <span style={{ fontSize: 13 }}>🧹</span>}
                  </div>
                  {/* 🎨 palette button */}
                  <button ref={swatchRef} className="palette-trigger"
                    onClick={() => {
                      const rect = swatchRef.current.getBoundingClientRect()
                      setPalettePos({ x: rect.right + 8, y: Math.min(rect.top, window.innerHeight - 320) })
                      setShowPalette(p => !p)
                    }}
                    style={{
                      width: 44, height: 26, borderRadius: 7, border: 'none', cursor: 'pointer',
                      fontSize: 15, background: showPalette ? 'var(--primary-lt)' : '#f0f0f0',
                      outline: showPalette ? '2px solid var(--primary)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>🎨</button>
                  {/* 16 quick colours — 4×4 grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 14px)', gap: 3 }}>
                    {['#000000','#ffffff','#808080','#ff4757','#ff6b35','#ffa502','#ffd32a','#2ed573','#1e90ff','#00bcd4','#9c6ef8','#ff69b4','#4e342e','#8d5524','#3d5a80','#26de81'].map(c => (
                      <button key={c} onClick={() => pickColor(c)}
                        style={{
                          width: 14, height: 14, borderRadius: '50%', padding: 0,
                          background: c, border: 'none', cursor: 'pointer',
                          boxShadow: color === c && !eraser ? `0 0 0 1.5px white, 0 0 0 3px ${c}` : c === '#ffffff' ? '0 0 0 1px #ccc inset' : 'none',
                          transform: color === c && !eraser ? 'scale(1.3)' : 'scale(1)', transition: 'transform 0.1s',
                        }} />
                    ))}
                  </div>
                </div>

                {/* ── Column 2: 3 rows of tools ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>

                  {/* Row 1: brush sizes — scaled dot */}
                  <div style={col2Row}>
                    {BRUSHES.map((b, i) => {
                      const dotSz = 6 + i * 4   // 6, 10, 14, 18, 22 px
                      return (
                        <button key={b.size} onClick={() => setBrush(b.size)} title={b.title}
                          style={{ ...col2Btn(brush === b.size), background: brush === b.size ? 'var(--primary-lt)' : '#fff' }}>
                          <div style={{ width: dotSz, height: dotSz, borderRadius: '50%', flexShrink: 0,
                            background: brush === b.size ? 'var(--primary)' : '#222' }} />
                        </button>
                      )
                    })}
                  </div>

                  {/* Row 2: ✏️ 🪣 🧽 ⬚ shapes */}
                  <div style={col2Row}>
                    {[
                      { key: 'pencil', emoji: '✏️', active: !eraser && !fillMode && !selectTool && !shapeTool, onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(false); setFillMode(false); setShapeTool(null) } },
                      { key: 'fill',   emoji: '🪣', active: fillMode,   onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setFillMode(f => !f); setEraser(false); setShapeTool(null) } },
                      { key: 'eraser', emoji: '🧽', active: eraser,     onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(e => !e); setFillMode(false); setShapeTool(null) } },
                      { key: 'select', emoji: '⬚',  active: selectTool, onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } else { setEraser(false); setFillMode(false); setShapeTool(null); setSelectTool(true) } } },
                    ].map(({ key, emoji, active, onClick }) => (
                      <button key={key} onClick={onClick} style={col2Btn(active)}>{emoji}</button>
                    ))}
                    <button ref={shapesBtnRef} onClick={openShapePicker} className="shape-picker-trigger"
                      style={col2Btn(!!shapeTool, { gap: 2 })}>
                      <ShapeIcon shape={shapeTool || 'rect'} size={11} color={shapeTool ? 'var(--primary)' : '#888'} />
                      <span style={{ fontSize: 6, color: shapeTool ? 'var(--primary)' : '#aaa' }}>▾</span>
                    </button>
                  </div>

                  {/* Row 3: ↩️ 🗑️ 🆕 💾 ⬇️ */}
                  <div style={col2Row}>
                    {[
                      { key: 'undo',     emoji: '↩️',  disabled: !canUndo,          onClick: handleUndo },
                      { key: 'clear',    emoji: '🗑️', disabled: false,              onClick: clearCanvas },
                      { key: 'save',     emoji: isSaving ? '⏳' : '💾', disabled: isEmpty || isSaving, onClick: saveDrawing },
                      { key: 'download', emoji: '⬇️',  disabled: isEmpty,            onClick: downloadDrawing },
                      { key: 'new',      emoji: '🆕',  disabled: isSaving,           onClick: newDrawing },
                    ].map(({ key, emoji, disabled, onClick }) => (
                      <button key={key} onClick={onClick} disabled={disabled}
                        style={col2Btn(false, { opacity: disabled ? 0.32 : 1, cursor: disabled ? 'not-allowed' : 'pointer' })}>
                        {emoji}
                      </button>
                    ))}
                  </div>

                </div>
              </div>
            )
          }

          // ── 2-ROW TABLET LAYOUT ──
          return (
            <>
              {/* Row 1: swatch · 🎨 · 8 colours · 3 brushes */}
              <div style={rowStyle}>
                <div style={{
                  width: swatchSz, height: swatchSz, minWidth: swatchSz,
                  borderRadius: '50%', flexShrink: 0,
                  background: eraser ? '#e8e8e8' : color,
                  border: '2px solid rgba(0,0,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {eraser && <span style={{ fontSize: 14 }}>🧹</span>}
                </div>
                <button ref={swatchRef} className="palette-trigger"
                  onClick={() => {
                    const rect = swatchRef.current.getBoundingClientRect()
                    setPalettePos({ x: Math.min(rect.left, window.innerWidth - 256), y: rect.bottom + 8 })
                    setShowPalette(p => !p)
                  }}
                  style={{
                    width: palSz, height: palSz, minWidth: palSz, borderRadius: 8, border: 'none',
                    cursor: 'pointer', flexShrink: 0, fontSize: 17,
                    background: showPalette ? 'var(--primary-lt)' : '#f0f0f0',
                    outline: showPalette ? '2px solid var(--primary)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>🎨</button>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxWidth: colorSz * 8 + 5 * 7 }}>
                  {['#000000','#ffffff','#808080','#ff4757','#ff6b35','#ffa502','#ffd32a','#2ed573','#1e90ff','#00bcd4','#9c6ef8','#ff69b4','#4e342e','#8d5524','#3d5a80','#26de81'].map(c => (
                    <button key={c} onClick={() => pickColor(c)}
                      style={{
                        width: colorSz, height: colorSz, minWidth: colorSz,
                        borderRadius: '50%', padding: 0, flexShrink: 0,
                        background: c, border: 'none', cursor: 'pointer',
                        boxShadow: color === c && !eraser ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : c === '#ffffff' ? '0 0 0 1px #ccc inset' : 'none',
                        transform: color === c && !eraser ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.1s',
                      }} />
                  ))}
                </div>
                {BRUSHES.map(b => (
                  <button key={b.size} onClick={() => setBrush(b.size)} title={b.title}
                    style={{
                      width: brushSz, height: brushSz, minWidth: brushSz,
                      borderRadius: 7, border: 'none', cursor: 'pointer', flexShrink: 0,
                      background: brush === b.size ? 'var(--primary-lt)' : '#f0f0f0',
                      outline: brush === b.size ? '2px solid var(--primary)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <div style={{ width: b.dotSize, height: b.dotSize, borderRadius: '50%', flexShrink: 0,
                      background: brush === b.size ? 'var(--primary)' : '#999' }} />
                  </button>
                ))}
              </div>

              {/* Row 2: ✏️ 🪣 🧽 ⬚ shapes | ↩️ 🗑️ 💾 ⬇️ */}
              <div style={rowStyle}>
                {[
                  { key: 'pencil', emoji: '✏️', active: !eraser && !fillMode && !selectTool && !shapeTool, onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(false); setFillMode(false); setShapeTool(null) } },
                  { key: 'fill',   emoji: '🪣', active: fillMode,   onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setFillMode(f => !f); setEraser(false); setShapeTool(null) } },
                  { key: 'eraser', emoji: '🧽', active: eraser,     onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(e => !e); setFillMode(false); setShapeTool(null) } },
                  { key: 'select', emoji: '⬚',  active: selectTool, onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } else { setEraser(false); setFillMode(false); setShapeTool(null); setSelectTool(true) } } },
                ].map(({ key, emoji, active, onClick }) => (
                  <button key={key} onClick={onClick} style={btnStyle(active)}>{emoji}</button>
                ))}
                <button ref={shapesBtnRef} onClick={openShapePicker} className="shape-picker-trigger"
                  style={{ ...btnStyle(!!shapeTool), gap: 2 }}>
                  <ShapeIcon shape={shapeTool || 'rect'} size={16} color={shapeTool ? 'var(--primary)' : '#888'} />
                  <span style={{ fontSize: 7, color: shapeTool ? 'var(--primary)' : '#aaa' }}>▾</span>
                </button>
                <div style={{ width: 1, height: btnSz * 0.7, background: '#ccc', flexShrink: 0 }} />
                {[
                  { key: 'undo',     emoji: '↩️',  disabled: !canUndo,          onClick: handleUndo },
                  { key: 'clear',    emoji: '🗑️', disabled: false,              onClick: clearCanvas },
                  { key: 'save',     emoji: isSaving ? '⏳' : '💾', disabled: isEmpty || isSaving, onClick: saveDrawing },
                  { key: 'download', emoji: '⬇️',  disabled: isEmpty,            onClick: downloadDrawing },
                  { key: 'new',      emoji: '🆕',  disabled: isSaving,           onClick: newDrawing },
                ].map(({ key, emoji, disabled, onClick }) => (
                  <button key={key} onClick={onClick} disabled={disabled}
                    style={{ ...btnStyle(false), opacity: disabled ? 0.32 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )
        })()}

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

        {/* Guide prompt — hidden in fullscreen */}
        {!isFullscreen && guideEnabled && (
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

        <div style={{ flex: 1, display: 'flex', flexDirection: guide && !isFullscreen ? 'column' : 'row',
          gap: 16, minHeight: 0 }}>

        {/* Guide panel — side panel in normal mode, floating overlay in fullscreen */}
        {guide && !isFullscreen && (
          <div style={{ width: '100%', flexShrink: 0, background: 'white',
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
        <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden',
          ...(isPortrait ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}) }}>
        {/* Outer wrapper: fixed 1200×800 aspect ratio */}
        <div style={{
          aspectRatio: '1200 / 800',
          maxWidth: '100%', maxHeight: '100%',
          width: isPortrait ? '100%' : 'auto', height: 'auto',
          margin: isPortrait ? undefined : 'auto',
          borderRadius: isFullscreen ? 0 : 20,
          boxShadow: isFullscreen ? 'none' : 'var(--shadow)',
          position: 'relative',
          cursor: canvasCursor,
        }}>
          {/* Inner clip: clips the drawing canvas to rounded corners without clipping the animation overlay */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: isFullscreen ? 0 : 20, overflow: 'hidden', background: 'white' }}>
          {isFullscreen && <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(0,0,0,0.3)', pointerEvents: 'none', zIndex: 10 }} />}
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none',
                opacity: animPlaying ? 0 : 1, transition: 'opacity 0.3s' }}
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
            {/* Shape preview overlay */}
            <canvas
              ref={shapeOverlayRef}
              width={1200}
              height={800}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none', display: 'block' }}
            />
            {/* Touch indicator — DOM-driven circle following touch point */}
            <div ref={touchIndicatorRef} style={{
              position: 'absolute', width: 18, height: 18, borderRadius: '50%',
              border: '2.5px solid #000', transform: 'translate(-50%, -50%)',
              pointerEvents: 'none', opacity: 0, zIndex: 10,
              transition: 'border-color 0.08s',
              left: 0, top: 0,
            }} />
          </div>
          {/* Animation overlay — outside the clip so animations can move freely near edges */}
          <canvas
            ref={overlayRef}
            width={1200}
            height={800}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              pointerEvents: 'none', display: 'block' }}
          />
          {/* Selection panel — draggable + resizable */}
          {selPanelOpen && selStateRef.current.phase === 'floating' && (() => {
            const ps = selPanelSize.w ? Math.max(0.65, Math.min(1.5, selPanelSize.w / 260)) : 1
            const pf = n => Math.round(n * ps)
            const pp = n => Math.round(n * ps)
            const btn = (label, title, onClick) => (
              <button key={title} onClick={onClick} title={title}
                style={{ padding: `${pp(5)}px ${pp(8)}px`, borderRadius: pp(7), border: '1.5px solid var(--primary-lt)',
                  background: 'white', color: 'var(--primary)', flexShrink: 0,
                  fontFamily: 'Nunito, sans-serif', fontWeight: 800, cursor: 'pointer', fontSize: pf(13) }}>
                {label}
              </button>
            )
            return (<>
            <div ref={selPanelElRef} style={{
              position: 'absolute', top: selPanelPos.y, left: selPanelPos.x, zIndex: 20,
              background: 'white', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1.5px solid var(--primary-lt)',
              fontFamily: 'Nunito, sans-serif',
              display: 'flex', flexDirection: 'column',
              ...(selPanelSize.w ? { width: selPanelSize.w } : { maxWidth: 'calc(100% - 20px)' }),
              ...(selPanelSize.h ? { height: selPanelSize.h } : {}),
              touchAction: 'none',
            }}>
              {/* Drag handle row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: pp(7),
                padding: `${pp(8)}px ${pp(10)}px ${pp(6)}px`, flexShrink: 0,
                position: 'relative', zIndex: 2 }}>
                <span
                  onMouseDown={onSelPanelDragStart}
                  onTouchStart={onSelPanelDragStart}
                  style={{ fontSize: pf(11), color: '#bbb', lineHeight: 1, cursor: 'grab', userSelect: 'none', touchAction: 'none' }}>⠿</span>
                <span
                  onMouseDown={onSelPanelDragStart}
                  onTouchStart={onSelPanelDragStart}
                  style={{ fontWeight: 800, color: 'var(--primary)', fontSize: pf(13), flex: 1, cursor: 'grab', userSelect: 'none', touchAction: 'none' }}>✂️ Selection</span>
                <button onClick={deleteSelection}
                  style={{ padding: `${pp(3)}px ${pp(7)}px`, borderRadius: pp(7), border: 'none',
                    background: '#ffe0e0', color: '#d00', fontWeight: 700, cursor: 'pointer', fontSize: pf(13) }}
                  title="Delete">🗑️</button>
                <button onClick={cancelSelection}
                  style={{ padding: `${pp(5)}px ${pp(9)}px`, borderRadius: pp(7), border: 'none',
                    background: 'var(--primary-lt)', color: 'var(--primary)',
                    fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: pf(13) }}>
                  ✕
                </button>
              </div>
              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: `0 ${pp(10)}px ${pp(10)}px` }}>
                <div style={{ display: 'flex', gap: pp(5), flexWrap: 'wrap', alignItems: 'center', paddingBottom: 2 }}>
                  {btn('↔️', 'Flip horizontal', flipSelH)}
                  {btn('↕️', 'Flip vertical', flipSelV)}
                  {btn('⊕', 'Scale up 25%', () => scaleSel(1.25))}
                  {btn('⊖', 'Scale down 25%', () => scaleSel(0.75))}
                  {btn('❐', 'Duplicate', duplicateSel)}
                </div>
                <div style={{ display: 'flex', gap: pp(4), flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { label: '↺90°', deg: -90 }, { label: '↺45°', deg: -45 },
                    { label: '↺15°', deg: -15 }, { label: '↺5°',  deg: -5  },
                    { label: '↻5°',  deg:  5  }, { label: '↻15°', deg:  15 },
                    { label: '↻45°', deg:  45 }, { label: '↻90°', deg:  90 },
                  ].map(({ label, deg }) => (
                    <button key={label} onClick={() => rotateSel(deg)}
                      style={{ padding: `${pp(4)}px ${pp(6)}px`, borderRadius: pp(7), border: '1.5px solid var(--primary-lt)',
                        background: 'white', color: 'var(--primary)', flexShrink: 0,
                        fontFamily: 'Nunito, sans-serif', fontWeight: 800, cursor: 'pointer', fontSize: pf(10) }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Corner resize handles */}
              {[
                { corner: 'bl', style: { bottom: 0, left: 0, cursor: 'nesw-resize' } },
                { corner: 'br', style: { bottom: 0, right: 0, cursor: 'nwse-resize' } },
              ].map(({ corner, style }) => (
                <div key={corner}
                  onMouseDown={e => onSelPanelResizeStart(corner, e)}
                  onTouchStart={e => onSelPanelResizeStart(corner, e)}
                  style={{ position: 'absolute', width: 24, height: 24,
                    userSelect: 'none', touchAction: 'none', zIndex: 3, ...style }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ position: 'absolute',
                      bottom: corner.startsWith('b') ? 3 : 'auto', top: corner.startsWith('t') ? 3 : 'auto',
                      right: corner.endsWith('r') ? 3 : 'auto', left: corner.endsWith('l') ? 3 : 'auto',
                      transform: corner === 'tl' ? 'rotate(180deg)' : corner === 'tr' ? 'rotate(90deg)' : corner === 'bl' ? 'rotate(-90deg)' : 'none' }}>
                    <path d="M9 1L1 9M9 5L5 9M9 9" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              ))}
            </div>
            </>)
          })()}
          {isEmpty && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 64, opacity: 0.1 }}>✏️</div>
              <div style={{ fontSize: 16, color: '#ccc', fontWeight: 700, marginTop: 8 }}>Start drawing!</div>
            </div>
          )}
          {/* Fullscreen toggle — desktop/tablet only; mobile layout breaks in fullscreen */}
          {!isFullscreen && !isMobile && (
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
        </div>
        </div>

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
                  background:'var(--primary)',
                  color:'white', opacity:(isEmpty||offline||!drawnAfterAnim||animCooldown>0)?0.45:1, flexShrink:0,
                  whiteSpace:'nowrap', boxShadow:'0 3px 12px rgba(0,0,0,0.18)' }}>
                {animLoading ? '✨ Animating…' : animCooldown > 0 ? `⏳ ${animCooldown}s` : offline ? '✈️ 🎬 Bring to Life!' : '🎬 Bring to Life!'}
              </button>
            )}
            {animResult && !animPlaying && !animLoading && (
              <button onClick={handleReplay}
                style={{ padding:'10px 16px', borderRadius:50, border:'none', fontWeight:800,
                  fontSize:14, cursor:'pointer', background:'var(--primary-lt)', color:'var(--primary)',
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
              background: 'var(--primary)',
              color: 'white', border: 'none',
              cursor: (isEmpty || offline || animLoading || !drawnAfterAnim || animCooldown > 0) ? 'not-allowed' : 'pointer',
              opacity: (isEmpty || offline || !drawnAfterAnim || animCooldown > 0) ? 0.5 : 1,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
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
              background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none', cursor: 'pointer',
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
            <button onClick={() => { markSeen('draw'); setShowDemo(false) }}
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
    </>

    <HistoryDrawer icon="🎨" title="My Drawings" count={drawSaves.length}>
      {close => <>
        {drawSaves.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 10, marginBottom: 2,
            border: currentSaveId === s.id ? '2px solid var(--primary)' : '2px solid transparent',
            background: currentSaveId === s.id ? 'var(--primary-lt)' : '#fafafa',
            cursor: 'pointer', transition: 'background 0.15s' }}
            onClick={() => { loadDrawSave(s); markActive(); close() }}>
            <img src={s.thumbnail ? 'data:image/png;base64,' + s.thumbnail : ''}
              alt={s.title || 'Drawing'}
              style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6, flexShrink: 0,
                background: '#e0e0e0', pointerEvents: 'none' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, fontFamily: 'Nunito, sans-serif',
                color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.title || 'Untitled drawing'}
              </div>
              <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'Nunito, sans-serif' }}>
                {fmtDate(s.updatedAt)}
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); deleteDrawSave(s.id) }}
              className="btn-danger" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28,
                borderRadius: '50%', padding: 0, fontSize: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        ))}
        {drawSavesPage + 1 < drawSavesTotalPages && (
          <button onClick={() => fetchDrawSaves(drawSavesPage + 1)}
            disabled={drawSavesLoading}
            style={{ width: '100%', marginTop: 10, padding: '10px 0', borderRadius: 14, border: 'none',
              background: 'var(--primary-lt)', color: 'var(--primary)', fontWeight: 800, fontSize: 13,
              fontFamily: 'Nunito, sans-serif', cursor: 'pointer' }}>
            {drawSavesLoading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </>}
    </HistoryDrawer>
  </div>
  )
}
