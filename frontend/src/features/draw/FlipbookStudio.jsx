import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import { flipbookSaveApi } from '../../api/client'
import HistoryDrawer, { fmtDate } from '../../components/HistoryDrawer'
import { SHAPES, drawShape, ShapeIcon } from './shapeUtils'

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

// ── Shared with Draw.jsx ──────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#000000','#333333','#666666','#999999','#cccccc','#ffffff',
  '#ff0000','#ff4757','#ff6b81','#ff69b4','#e91e63','#c2185b',
  '#ff6600','#ffa502','#ff9800','#ffd32a','#ffeb3b','#fff176',
  '#00c853','#2ed573','#26de81','#4caf50','#8bc34a','#cddc39',
  '#1e90ff','#2196f3','#03a9f4','#70a1ff','#3f51b5','#1a237e',
  '#9c6ef8','#9c27b0','#673ab7','#7c4dff','#ce93d8','#f48fb1',
  '#4e342e','#6d4c41','#8d5524','#c68642','#f1c27d','#ffdbac',
]
const QUICK_COLORS = ['#000000','#ffffff','#ff4757','#ffa502','#2ed573','#1e90ff','#9c6ef8','#ff69b4']
const BRUSHES = [
  { size: 3,  title: 'Extra thin', dotSize: 4,  btnH: 24 },
  { size: 7,  title: 'Thin',       dotSize: 8,  btnH: 28 },
  { size: 14, title: 'Medium',     dotSize: 14, btnH: 32 },
  { size: 24, title: 'Thick',      dotSize: 20, btnH: 38 },
  { size: 40, title: 'Extra thick',dotSize: 26, btnH: 46 },
]
const W = 1200, H = 800
const MAX_FRAMES = 24
const untitledTitle = () => `Untitled – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
const SPEEDS = [
  { fps: 2,  emoji: '🐌', label: 'Slow' },
  { fps: 4,  emoji: '🚶', label: 'Normal' },
  { fps: 8,  emoji: '🐇', label: 'Fast' },
  { fps: 12, emoji: '🚀', label: 'Zoom' },
]

const PLAY_EFFECTS = [
  { key: null,     emoji: '▭',  label: 'None' },
  { key: 'shake',  emoji: '💥', label: 'Shake' },
  { key: 'zoom',   emoji: '🔍', label: 'Zoom' },
  { key: 'bounce', emoji: '⬆️', label: 'Bounce' },
  { key: 'wave',   emoji: '〰️', label: 'Wave' },
  { key: 'spin',   emoji: '🌀', label: 'Spin' },
]

const EFFECT_ANIM = {
  shake:  'fbShake  0.45s ease-in-out infinite',
  zoom:   'fbZoom   1.2s  ease-in-out infinite',
  bounce: 'fbBounce 0.7s  ease-in-out infinite',
  wave:   'fbWave   0.9s  ease-in-out infinite',
  spin:   'fbSpin   2.5s  linear      infinite',
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 9, fontWeight: 800, color: '#bbb', textTransform: 'uppercase',
    letterSpacing: 1, textAlign: 'center', width: '100%' }}>{children}</div>
}
function HDivider() {
  return <div style={{ width: '80%', height: 1, background: '#f0f0f0' }} />
}
function getPos(e, canvas) {
  const r = canvas.getBoundingClientRect()
  return {
    x: ((e.touches?.[0] ?? e).clientX - r.left) * (canvas.width  / r.width),
    y: ((e.touches?.[0] ?? e).clientY - r.top)  * (canvas.height / r.height),
  }
}
function fillWhite(canvas) {
  canvas.getContext('2d').fillStyle = '#ffffff'
  canvas.getContext('2d').fillRect(0, 0, W, H)
}

function useBreakpoint() {
  const get = () => window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const update = () => setTimeout(() => setBp(get()), 100)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => { window.removeEventListener('resize', update); window.removeEventListener('orientationchange', update) }
  }, [])
  return bp
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FlipbookStudio({ track = () => {}, child }) {
  const fbSessionTracked = useRef(false)
  useFeatureDuration('flipbook', track, { condition: fbSessionTracked })
  // Frame storage — ref is source of truth, state drives rendering
  const framesRef      = useRef([null])          // null = blank white
  const [frames, setFrames]         = useState([null])
  const [currentIdx, setCurrentIdx] = useState(0)
  const currentIdxRef  = useRef(0)

  // Fullscreen
  const fsRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])
  function toggleFullscreen() {
    if (!document.fullscreenElement) fsRef.current?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  // Playback
  const [isPlaying, setIsPlaying]     = useState(false)
  const [playbackSrc, setPlaybackSrc] = useState(null)
  const [showPlayback, setShowPlayback] = useState(false)
  const [fps, setFps]   = useState(4)
  const [loop, setLoop] = useState(true)
  const [playEffect, setPlayEffect] = useState(null)
  const fpsRef  = useRef(4)
  const loopRef = useRef(true)
  const playTimerRef = useRef(null)
  const playIdxRef   = useRef(0)

  // Tools — mirroring Draw.jsx state
  const [color, setColor]         = useState('#000000')
  const [brush, setBrush]         = useState(14)
  const [eraser, setEraser]       = useState(false)
  const [fillMode, setFillMode]   = useState(false)
  const [recentColors, setRecentColors] = useState([])
  const [showPalette, setShowPalette]   = useState(false)
  const [palettePos, setPalettePos]     = useState({ x: 0, y: 0 })
  const [showOnionSkin, setShowOnionSkin] = useState(true)
  const [canUndo, setCanUndo] = useState(false)

  // Canvas / undo
  const canvasRef  = useRef(null)
  const onionRef   = useRef(null)
  const stripRef   = useRef(null)
  const swatchRef  = useRef(null)
  const colorInput = useRef(null)
  const historyRef = useRef([])   // undo stack for current frame
  const drawing    = useRef(false)
  const lastPos    = useRef(null)

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
  const pendingShapeRef  = useRef(null)
  const pendingDragRef   = useRef(null)
  const selTmpRef      = useRef(null)   // cached canvas for the lifted pixels
  const selStateRef    = useRef({ phase: null, startX: 0, startY: 0,
    x: 0, y: 0, w: 0, h: 0, pixels: null, posX: 0, posY: 0,
    dragging: false, dragStartX: 0, dragStartY: 0, dragOrigX: 0, dragOrigY: 0 })
  const [selTick, setSelTick]             = useState(0)
  const [selPanelOpen, setSelPanelOpen]   = useState(false)
  const [stampCount, setStampCount]       = useState(1)
  const [slideEndFrame, setSlideEndFrame] = useState(null)
  const [slideStepX, setSlideStepX]       = useState(20)
  const [slideStepY, setSlideStepY]       = useState(0)
  const [isStamping, setIsStamping]       = useState(false)
  const isPlayingRef = useRef(false)

  // Keep fps/loop refs in sync
  useEffect(() => { fpsRef.current  = fps  }, [fps])
  useEffect(() => { loopRef.current = loop }, [loop])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  // Flipbook saves
  const [flipbookSaves, setFlipbookSaves] = useState([])
  const [currentSaveId, setCurrentSaveId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [flipbookTitle, setFlipbookTitle] = useState('')

  useEffect(() => {
    if (child?.id) flipbookSaveApi.getByChild(child.id).then(setFlipbookSaves).catch(() => {})
  }, [child?.id])

  // Autosave every 60s if there are frames to save
  const fbAutoSaveRef = useRef(null)
  fbAutoSaveRef.current = () => { if (total >= 1 && !isSaving && !isPlaying && child?.id) saveFlipbook() }
  useEffect(() => {
    const t = setInterval(() => fbAutoSaveRef.current?.(), 60_000)
    return () => clearInterval(t)
  }, [])

  // Emergency save — called by useLockSession when screen-time alert fires
  const fbEmergencyRef = useRef(null)
  fbEmergencyRef.current = () => { if (total > 1 && child?.id) saveFlipbook() }
  useEffect(() => {
    window.__glumbiEmergencySaves ??= new Set()
    const fn = () => fbEmergencyRef.current?.()
    window.__glumbiEmergencySaves.add(fn)
    return () => window.__glumbiEmergencySaves?.delete(fn)
  }, [])

  async function saveFlipbook() {
    if (!child?.id) return
    saveCurrentFrame()
    const allFrames = framesRef.current
    if (allFrames.length < 1) return
    setIsSaving(true)
    try {
      const framesJson = JSON.stringify(allFrames)
      const thumbnail = allFrames.find(f => f) || null
      const count = allFrames.length
      const title = flipbookTitle.trim() || untitledTitle()
      if (currentSaveId) {
        const updated = await flipbookSaveApi.update(currentSaveId, framesJson, thumbnail, fpsRef.current, count, title)
        setFlipbookSaves(prev => prev.map(s => s.id === currentSaveId ? updated : s))
      } else {
        const saved = await flipbookSaveApi.save(child.id, framesJson, thumbnail, fpsRef.current, count, title)
        setFlipbookSaves(prev => [saved, ...prev])
        setCurrentSaveId(saved.id)
      }
    } finally { setIsSaving(false) }
  }

  function loadFlipbookSave(save) {
    try {
      const loaded = JSON.parse(save.framesJson)
      framesRef.current = loaded
      setFrames([...loaded])
      setCurrentIdx(0)
      currentIdxRef.current = 0
      setCurrentSaveId(save.id)
      setFlipbookTitle(save.title || '')
      // Render first frame onto canvas
      const first = loaded[0]
      if (first && canvasRef.current) {
        const img = new Image()
        img.onload = () => {
          const ctx = canvasRef.current.getContext('2d')
          ctx.clearRect(0, 0, W, H)
          ctx.drawImage(img, 0, 0)
          saveSnapshot()
        }
        img.src = first
      }
    } catch { /* corrupted save — ignore */ }
  }

  async function deleteFlipbookSave(id) {
    await flipbookSaveApi.delete(id)
    setFlipbookSaves(prev => prev.filter(s => s.id !== id))
    if (currentSaveId === id) setCurrentSaveId(null)
  }

  // Init canvas white on mount
  useEffect(() => { fillWhite(canvasRef.current) }, [])

  // Non-passive touch
  useEffect(() => {
    const canvas = canvasRef.current
    const onTS = e => { e.preventDefault(); startDraw(e) }
    const onTM = e => { e.preventDefault(); doDraw(e) }
    canvas.addEventListener('touchstart', onTS, { passive: false })
    canvas.addEventListener('touchmove',  onTM, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', onTS)
      canvas.removeEventListener('touchmove',  onTM)
    }
  })

  // Close shape picker on outside click
  useEffect(() => {
    if (!showShapePicker) return
    const handler = e => {
      if (!e.target.closest?.('.fb-shape-picker-popup') && !e.target.closest?.('.fb-shape-picker-trigger'))
        setShowShapePicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showShapePicker])

  const bp = useBreakpoint()
  const isCompact = bp === 'mobile' || bp === 'tablet'

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
    ovCtx.clearRect(0, 0, W, H)
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
    shapeOverlayRef.current?.getContext('2d').clearRect(0, 0, W, H)
    const ctx = canvasRef.current.getContext('2d')
    drawShape(ctx, ps.type, ps.x1, ps.y1, ps.x2, ps.y2, ps.color, ps.lineWidth, ps.fill)
    setHasPendingShape(false)
    saveCurrentFrame()
  }
  function cancelPendingShape() {
    pendingShapeRef.current = null; pendingDragRef.current = null
    shapeOverlayRef.current?.getContext('2d').clearRect(0, 0, W, H)
    setHasPendingShape(false)
  }

  // Close palette on outside click
  useEffect(() => {
    if (!showPalette) return
    const handler = e => {
      if (!e.target.closest?.('.fb-palette-popup') && !e.target.closest?.('.fb-palette-trigger'))
        setShowPalette(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPalette])

  // Onion skin — redraw whenever frame changes
  useEffect(() => {
    const onion = onionRef.current
    if (!onion) return
    const ctx = onion.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    if (isPlaying || !showOnionSkin || currentIdx === 0) return
    const prevUrl = framesRef.current[currentIdx - 1]
    if (!prevUrl) return
    const img = new Image()
    img.onload = () => {
      ctx.save(); ctx.globalAlpha = 0.3; ctx.drawImage(img, 0, 0); ctx.restore()
    }
    img.src = prevUrl
  }, [currentIdx, frames, showOnionSkin, isPlaying])

  // Cleanup
  useEffect(() => () => clearInterval(playTimerRef.current), [])

  const canvasCursor = useMemo(() => {
    if (fillMode) return makeEmojiCursor('🪣', 24, 3, 21)
    if (eraser)   return makeEmojiCursor('🧽', 28, 4, 24)
    return 'crosshair'
  }, [eraser, fillMode, shapeTool])

  // ── Colour helpers (same as Draw.jsx) ──────────────────────────────────────
  function pickColor(c) {
    setColor(c)
    setEraser(false)
    setRecentColors(prev => [c, ...prev.filter(x => x !== c)].slice(0, 12))
  }

  // ── Undo ───────────────────────────────────────────────────────────────────
  function saveSnapshot() {
    const snap = canvasRef.current.toDataURL('image/png')
    historyRef.current = [...historyRef.current.slice(-29), snap]
    setCanUndo(true)
  }

  function handleUndo() {
    if (!historyRef.current.length) return
    const history = [...historyRef.current]
    const snap = history.pop()
    historyRef.current = history
    setCanUndo(history.length > 0)
    const img = new Image()
    img.onload = () => {
      fillWhite(canvasRef.current)
      canvasRef.current.getContext('2d').drawImage(img, 0, 0)
    }
    img.src = snap
  }

  // ── Frame operations ───────────────────────────────────────────────────────
  function saveCurrentFrame() {
    const url = canvasRef.current.toDataURL('image/png')
    const idx = currentIdxRef.current
    framesRef.current = [...framesRef.current]
    framesRef.current[idx] = url
    setFrames([...framesRef.current])
    return url
  }

  function loadFrameToCanvas(url) {
    fillWhite(canvasRef.current)
    if (!url) return
    const img = new Image()
    img.onload = () => canvasRef.current.getContext('2d').drawImage(img, 0, 0)
    img.src = url
  }

  function switchFrame(idx) {
    if (isPlaying) return
    if (selStateRef.current.phase === 'floating') commitSelection()
    saveCurrentFrame()
    historyRef.current = []
    setCanUndo(false)
    currentIdxRef.current = idx
    setCurrentIdx(idx)
    loadFrameToCanvas(framesRef.current[idx])
  }

  function addFrameAfter() {
    if (isPlaying) return
    saveCurrentFrame()
    const at = currentIdxRef.current + 1
    const next = [...framesRef.current.slice(0, at), null, ...framesRef.current.slice(at)]
    framesRef.current = next
    setFrames([...next])
    historyRef.current = []
    setCanUndo(false)
    currentIdxRef.current = at
    setCurrentIdx(at)
    fillWhite(canvasRef.current)
  }

  function duplicateFrame() {
    if (isPlaying) return
    const url = saveCurrentFrame()
    const at = currentIdxRef.current + 1
    const next = [...framesRef.current.slice(0, at), url, ...framesRef.current.slice(at)]
    framesRef.current = next
    setFrames([...next])
    currentIdxRef.current = at
    setCurrentIdx(at)
    // canvas already shows this frame content
  }

  function deleteFrame(idx) {
    if (isPlaying || framesRef.current.length === 1) return
    const next = framesRef.current.filter((_, i) => i !== idx)
    framesRef.current = next
    setFrames([...next])
    const newIdx = Math.min(idx, next.length - 1)
    historyRef.current = []
    setCanUndo(false)
    currentIdxRef.current = newIdx
    setCurrentIdx(newIdx)
    loadFrameToCanvas(next[newIdx])
  }

  function clearCurrentFrame() {
    if (selStateRef.current.phase === 'floating') {
      selStateRef.current.phase = null; selTmpRef.current = null
      setSelPanelOpen(false); setSelTick(t => t + 1)
      selOverlayRef.current?.getContext('2d').clearRect(0, 0, W, H)
    }
    saveSnapshot()
    fillWhite(canvasRef.current)
  }

  // ── Frame drag-to-reorder ──────────────────────────────────────────────────
  const [dropIdx, setDropIdx] = useState(null)
  const dragIdxRef = useRef(null)
  const touchDragRef = useRef({ active: false, startIdx: null, startX: 0, startY: 0, ghostEl: null, dropIdx: null })

  function reorderFrames(fromIdx, toIdx) {
    if (fromIdx === toIdx) { setDropIdx(null); return }
    saveCurrentFrame()
    const next = [...framesRef.current]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    framesRef.current = next
    setFrames([...next])
    // keep currentIdx pointing at the same logical frame
    let cur = currentIdxRef.current
    if (cur === fromIdx) cur = toIdx
    else if (cur > fromIdx && cur <= toIdx) cur -= 1
    else if (cur < fromIdx && cur >= toIdx) cur += 1
    currentIdxRef.current = cur
    setCurrentIdx(cur)
    setDropIdx(null)
  }

  function onDragStart(e, i) {
    dragIdxRef.current = i
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragOver(e, i) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIdx(i)
  }
  function onDrop(e, i) {
    e.preventDefault()
    reorderFrames(dragIdxRef.current, i)
    dragIdxRef.current = null
  }
  function onDragEnd() {
    dragIdxRef.current = null
    setDropIdx(null)
  }

  function onFrameTouchStart(e, i) {
    const t = e.touches[0]
    touchDragRef.current = { active: false, startIdx: i, startX: t.clientX, startY: t.clientY, ghostEl: null, dropIdx: null }
  }
  function onFrameTouchMove(e) {
    const td = touchDragRef.current
    if (td.startIdx === null) return
    const t = e.touches[0]
    const dist = Math.hypot(t.clientX - td.startX, t.clientY - td.startY)
    if (!td.active && dist > 8) {
      td.active = true
      const ghost = document.createElement('div')
      ghost.style.cssText = 'position:fixed;width:80px;height:54px;border-radius:8px;overflow:hidden;opacity:0.85;pointer-events:none;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.25);border:3px solid var(--primary)'
      const url = framesRef.current[td.startIdx]
      if (url) { const img = document.createElement('img'); img.src = url; img.style.cssText = 'width:100%;height:100%;object-fit:fill'; ghost.appendChild(img) }
      document.body.appendChild(ghost)
      td.ghostEl = ghost
    }
    if (!td.active) return
    e.preventDefault()
    if (td.ghostEl) { td.ghostEl.style.left = (t.clientX - 40) + 'px'; td.ghostEl.style.top = (t.clientY - 27) + 'px' }
    const el = document.elementFromPoint(t.clientX, t.clientY)
    const frameEl = el?.closest('[data-frame-idx]')
    if (frameEl) { const idx = parseInt(frameEl.dataset.frameIdx); setDropIdx(idx); td.dropIdx = idx }
  }
  function onFrameTouchEnd(e, i) {
    e.preventDefault() // suppress synthetic click
    const td = touchDragRef.current
    if (td.ghostEl) { document.body.removeChild(td.ghostEl); td.ghostEl = null }
    if (td.active) {
      if (td.dropIdx !== null) reorderFrames(td.startIdx, td.dropIdx)
      else setDropIdx(null)
    } else {
      switchFrame(i) // plain tap — select frame
    }
    touchDragRef.current = { active: false, startIdx: null, startX: 0, startY: 0, ghostEl: null, dropIdx: null }
  }

  // ── Pixel tweening ─────────────────────────────────────────────────────────
  const [isTweening, setIsTweening] = useState(false)
  const TWEEN_STEPS = 2

  async function tweenFrames() {
    const idx = currentIdxRef.current
    const all = framesRef.current
    if (idx >= all.length - 1 || !all[idx] || !all[idx + 1]) return
    if (all.length + TWEEN_STEPS > MAX_FRAMES) return
    setIsTweening(true)
    saveCurrentFrame()

    const [imgA, imgB] = await Promise.all([all[idx], all[idx + 1]].map(url => new Promise(res => {
      const img = new Image(); img.onload = () => res(img); img.src = url
    })))

    const off = document.createElement('canvas')
    off.width = W; off.height = H
    const ctx = off.getContext('2d')

    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H)
    ctx.drawImage(imgA, 0, 0)
    const dataA = new Uint8ClampedArray(ctx.getImageData(0, 0, W, H).data)

    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H)
    ctx.drawImage(imgB, 0, 0)
    const dataB = ctx.getImageData(0, 0, W, H).data

    const tweened = []
    for (let step = 1; step <= TWEEN_STEPS; step++) {
      const t = step / (TWEEN_STEPS + 1)
      const out = ctx.createImageData(W, H)
      for (let j = 0; j < dataA.length; j++) {
        out.data[j] = Math.round(dataA[j] + t * (dataB[j] - dataA[j]))
      }
      ctx.putImageData(out, 0, 0)
      tweened.push(off.toDataURL('image/png'))
    }

    const next = [...all.slice(0, idx + 1), ...tweened, ...all.slice(idx + 1)]
    framesRef.current = next
    setFrames([...next])
    setIsTweening(false)
    track('flipbook', 'smooth', { metadata: { insertedFrames: TWEEN_STEPS, totalFrames: next.length } })
  }

  // ── Playback ───────────────────────────────────────────────────────────────
  function startPlay() {
    if (framesRef.current.length < 2) return
    track('flipbook', 'play', { metadata: { frames: framesRef.current.length, fps: fpsRef.current } })
    saveCurrentFrame()                     // ensure latest frame is saved
    playIdxRef.current = 0
    setPlaybackSrc(framesRef.current[0])   // show first frame immediately
    setShowPlayback(true)
    setIsPlaying(true)

    playTimerRef.current = setInterval(() => {
      const total = framesRef.current.length
      let next = playIdxRef.current + 1
      if (next >= total) {
        if (loopRef.current) { next = 0 }
        else { stopPlay(); return }
      }
      playIdxRef.current = next
      setPlaybackSrc(framesRef.current[next] ?? null)
      setCurrentIdx(next)
    }, 1000 / fpsRef.current)
  }

  function stopPlay() {
    clearInterval(playTimerRef.current)
    const stoppedAt = playIdxRef.current
    currentIdxRef.current = stoppedAt
    setCurrentIdx(stoppedAt)
    setIsPlaying(false)
    setShowPlayback(false)
    setPlaybackSrc(null)
    loadFrameToCanvas(framesRef.current[stoppedAt])
  }

  // Auto-scroll the frame strip to keep the active frame visible
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const activeEl = strip.querySelector(`[data-frame-idx="${currentIdx}"]`)
    if (!activeEl) return
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [currentIdx])

  // ── Download as video ──────────────────────────────────────────────────────
  const [isDownloading, setIsDownloading] = useState(false)

  async function downloadAnimation() {
    const allFrames = framesRef.current
    if (allFrames.length < 2) return
    setIsDownloading(true)

    const off = document.createElement('canvas')
    off.width = W; off.height = H
    const ctx = off.getContext('2d')

    const stream = off.captureStream(fpsRef.current)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9' : 'video/webm'
    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks = []
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${flipbookTitle.trim() || 'my-flipbook'}.webm`; a.click()
      URL.revokeObjectURL(url)
      setIsDownloading(false)
    }

    // Load all frame images first
    const imgs = await Promise.all(allFrames.map(url => new Promise(res => {
      if (!url) { res(null); return }
      const img = new Image(); img.onload = () => res(img); img.src = url
    })))

    const msPerFrame = Math.round(1000 / fpsRef.current)
    recorder.start()

    for (let i = 0; i < imgs.length; i++) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)
      if (imgs[i]) ctx.drawImage(imgs[i], 0, 0)
      await new Promise(r => setTimeout(r, msPerFrame))
    }

    recorder.stop()
  }

  // ── Flood fill ─────────────────────────────────────────────────────────────
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

  // ── Drawing ────────────────────────────────────────────────────────────────
  function startDraw(e) {
    if (isPlaying || selectTool) return
    if (!fbSessionTracked.current) fbSessionTracked.current = true
    updateTouchIndicator(e)
    hasMovedRef.current = false
    const pos = getPos(e, canvasRef.current)

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
      saveCurrentFrame()
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

  function doDraw(e) {
    if (!drawing.current || isPlaying) return
    updateTouchIndicator(e)
    const pos = getPos(e, canvasRef.current)
    hasMovedRef.current = true

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
      const ov = shapeOverlayRef.current
      if (ov) {
        const ovCtx = ov.getContext('2d')
        ovCtx.clearRect(0, 0, W, H)
        ovCtx.globalAlpha = 0.75
        drawShape(ovCtx, shapeTool, shapeStartRef.current.x, shapeStartRef.current.y, pos.x, pos.y, eraser ? '#ffffff' : color, brush, shapeFill)
        ovCtx.globalAlpha = 1
      }
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = eraser ? '#ffffff' : color
    ctx.lineWidth   = eraser ? brush * 2 : brush
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDraw() {
    if (touchIndicatorRef.current) touchIndicatorRef.current.style.opacity = '0'
    if (pendingDragRef.current) {
      pendingDragRef.current = null
      drawing.current = false
      return
    }
    if (drawing.current) {
      if (shapeTool && shapeStartRef.current) {
        shapeOverlayRef.current?.getContext('2d').clearRect(0, 0, W, H)
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
        const ctx = canvasRef.current.getContext('2d')
        const r = eraser ? brush : Math.max(brush / 2, 1.5)
        ctx.beginPath()
        ctx.arc(lastPos.current.x, lastPos.current.y, r, 0, Math.PI * 2)
        ctx.fillStyle = eraser ? '#ffffff' : color
        ctx.fill()
        saveCurrentFrame()
      } else {
        saveCurrentFrame()
      }
    }
    drawing.current = false
    lastPos.current = null
  }

  // ── Selection tool ─────────────────────────────────────────────────────────
  function drawSelOverlay() {
    const ov = selOverlayRef.current
    if (!ov) return
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#9c6ef8'
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
      saveCurrentFrame()
    }
    sd.phase = null; sd.pixels = null; selTmpRef.current = null
    setSelPanelOpen(false); setSelTick(t => t + 1)
    selOverlayRef.current?.getContext('2d').clearRect(0, 0, W, H)
  }

  function deleteSelection() {
    const sd = selStateRef.current
    sd.phase = null; sd.pixels = null; selTmpRef.current = null
    setSelPanelOpen(false); setSelTick(t => t + 1)
    selOverlayRef.current?.getContext('2d').clearRect(0, 0, W, H)
    saveCurrentFrame()
  }

  function cancelSelection() {
    const sd = selStateRef.current
    if (sd.phase === 'floating' && selTmpRef.current) {
      // Restore pixels to original position
      canvasRef.current.getContext('2d').drawImage(selTmpRef.current, Math.round(sd.x), Math.round(sd.y))
      saveCurrentFrame()
    }
    sd.phase = null; sd.pixels = null; selTmpRef.current = null
    setSelPanelOpen(false); setSelTick(t => t + 1)
    selOverlayRef.current?.getContext('2d').clearRect(0, 0, W, H)
  }

  function onSelDown(e) {
    if (isPlayingRef.current) return
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
    if (isPlayingRef.current) return
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
      const xi = Math.max(0, Math.floor(sd.x)), yi = Math.max(0, Math.floor(sd.y))
      const wi = Math.min(W - xi, Math.ceil(sd.w)), hi = Math.min(H - yi, Math.ceil(sd.h))
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
      sd.pixels = ctx.getImageData(xi, yi, wi, hi)
      sd.w = wi; sd.h = hi; sd.x = xi; sd.y = yi
      // Cut from canvas
      ctx.fillStyle = '#ffffff'; ctx.fillRect(xi, yi, wi, hi)
      saveCurrentFrame()
      // Cache the lifted pixels in a reusable canvas
      selTmpRef.current = document.createElement('canvas')
      selTmpRef.current.width = wi; selTmpRef.current.height = hi
      selTmpRef.current.getContext('2d').putImageData(sd.pixels, 0, 0)
      sd.posX = xi; sd.posY = yi; sd.phase = 'floating'; sd.dragging = false
      setSlideEndFrame(Math.min(currentIdxRef.current + 1, framesRef.current.length - 1))
      setSlideStepX(0); setSlideStepY(0)
      setSelPanelOpen(true); setSelTick(t => t + 1)
      drawSelOverlay()
    } else if (sd.phase === 'floating') {
      sd.dragging = false
    }
  }

  // Overlay touch events — no deps array so handlers are always fresh
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

  async function stampSelectionToFrames(count) {
    if (!selTmpRef.current || selStateRef.current.phase !== 'floating') return
    setIsStamping(true)
    const sd = selStateRef.current
    const startFrame = currentIdxRef.current
    const next = [...framesRef.current]
    const off = document.createElement('canvas'); off.width = W; off.height = H
    const ctx = off.getContext('2d')
    let stamped = 0
    for (let i = 1; i <= count; i++) {
      const fi = startFrame + i
      if (fi >= next.length) break
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H)
      const url = next[fi]
      if (url) await new Promise(res => { const img = new Image(); img.onload = () => { ctx.drawImage(img, 0, 0); res() }; img.src = url })
      ctx.drawImage(selTmpRef.current, Math.round(sd.posX), Math.round(sd.posY))
      next[fi] = off.toDataURL('image/png'); stamped++
    }
    framesRef.current = next; setFrames([...next])
    setIsStamping(false)
    track('flipbook', 'stamp', { metadata: { stampedFrames: stamped } })
  }

  async function slideSelectionAcrossFrames() {
    if (!selTmpRef.current || selStateRef.current.phase !== 'floating') return
    const sd = selStateRef.current
    const startFrame = currentIdxRef.current
    const endFrame = slideEndFrame ?? startFrame + 1
    if (endFrame <= startFrame || endFrame >= framesRef.current.length) return
    setIsStamping(true)
    const next = [...framesRef.current]
    const off = document.createElement('canvas'); off.width = W; off.height = H
    const ctx = off.getContext('2d')
    const steps = endFrame - startFrame
    for (let i = 1; i <= steps; i++) {
      const fi = startFrame + i
      const px = Math.round(sd.posX + slideStepX * i)
      const py = Math.round(sd.posY + slideStepY * i)
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H)
      const url = next[fi]
      if (url) await new Promise(res => { const img = new Image(); img.onload = () => { ctx.drawImage(img, 0, 0); res() }; img.src = url })
      ctx.drawImage(selTmpRef.current, px, py)
      next[fi] = off.toDataURL('image/png')
    }
    framesRef.current = next; setFrames([...next])
    setIsStamping(false)
    track('flipbook', 'slide', { metadata: { frames: steps, stepX: slideStepX, stepY: slideStepY } })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const isMobile = bp === 'mobile'

  const total = frames.length

  const toolbarStyle = {
    width:     isFullscreen ? 80 : isCompact ? '100%' : 96,
    flexShrink: 0, alignSelf: 'stretch',
    display: 'flex',
    flexDirection: isFullscreen ? 'column' : 'column',
    flexWrap:  'nowrap',
    gap: isFullscreen ? 8 : isCompact ? 6 : 12,
    background: 'white',
    borderRadius: isFullscreen ? 0 : 20,
    padding: isFullscreen ? '14px 10px' : isCompact ? '10px 14px' : '16px 10px',
    boxShadow: isFullscreen ? '2px 0 8px rgba(0,0,0,0.06)' : 'var(--shadow)',
    alignItems: isCompact && !isFullscreen ? 'stretch' : 'center',
    justifyContent: 'flex-start',
    overflowY: isCompact ? undefined : 'auto',
  }

  return (
    <>
    <div ref={fsRef} style={{
      display: 'flex', flexDirection: 'column',
      height: isFullscreen ? '100dvh' : isCompact ? 'auto' : '100%',
      minHeight: isFullscreen ? undefined : isMobile ? undefined : isCompact ? '80vh' : undefined,
      width: isFullscreen ? '100dvw' : undefined,
      background: isFullscreen ? '#f5f5f5' : undefined,
      boxSizing: 'border-box', overflow: isFullscreen ? 'hidden' : undefined,
      fontFamily: 'Nunito, sans-serif',
    }}>

      {/* ── Frame counter ── */}
      {!isFullscreen && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 4px 8px', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>
            Frame {currentIdx + 1} / {total}
          </div>
        </div>
      )}

      {/* ── Main row: toolbar + canvas ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isCompact && !isFullscreen ? 'column' : 'row', gap: isFullscreen ? 0 : isCompact ? 12 : 20, minHeight: 0 }}>

        {/* ── Toolbar ── */}
        <div style={toolbarStyle}>

          {/* Shared popups (position:fixed) */}
          {showPalette && (
            <div className="fb-palette-popup" style={{ position: 'fixed', left: palettePos.x, top: palettePos.y,
              zIndex: 2000, background: 'white', borderRadius: 20, padding: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)', width: 240,
              border: '1px solid #f0f0f0', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 10, letterSpacing: 1 }}>PRESET COLOURS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 14 }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => { pickColor(c); setShowPalette(false) }}
                    style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', padding: 0,
                      border: color === c && !eraser ? '3px solid #333' : c === '#ffffff' ? '1px solid #ddd' : '2px solid transparent',
                      transform: color === c && !eraser ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.12s' }} />
                ))}
              </div>
              {recentColors.length > 0 && <>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 8, letterSpacing: 1 }}>RECENTLY USED</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {recentColors.map((c, i) => (
                    <button key={i} onClick={() => { pickColor(c); setShowPalette(false) }}
                      style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', padding: 0,
                        border: color === c ? '3px solid #333' : c === '#ffffff' ? '1px solid #ddd' : '2px solid transparent' }} />
                  ))}
                </div>
              </>}
              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 8, letterSpacing: 1 }}>CUSTOM COLOUR</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: color, border: '1px solid #eee', flexShrink: 0 }} />
                <input ref={colorInput} type="color" value={eraser ? '#000000' : color}
                  onChange={e => pickColor(e.target.value)}
                  style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid #eee', cursor: 'pointer', padding: 2 }} />
              </div>
            </div>
          )}
          {showShapePicker && (
            <div className="fb-shape-picker-popup" style={{
              position: 'fixed', left: shapePickerPos.x, top: shapePickerPos.y,
              zIndex: 2000, background: 'white', borderRadius: 18, padding: 18,
              boxShadow: '0 8px 40px rgba(0,0,0,0.22)', width: shapePickerPos.w,
              border: '1px solid #f0f0f0', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 10, letterSpacing: 1 }}>SHAPES</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))', gap: 8, marginBottom: 12 }}>
                {SHAPES.map(s => (
                  <button key={s.key} title={s.label}
                    onClick={() => { setShapeTool(s.key); setShowShapePicker(false); setEraser(false); setFillMode(false); if (selectTool) { commitSelection(); setSelectTool(false) } }}
                    style={{ padding: '10px 6px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: shapeTool === s.key ? 'var(--primary-lt)' : '#f5f5f5',
                      outline: shapeTool === s.key ? '2px solid var(--primary)' : 'none',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <ShapeIcon shape={s.key} size={26} color={shapeTool === s.key ? 'var(--primary)' : '#555'} strokeWidth={2} />
                    <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'Nunito, sans-serif', color: shapeTool === s.key ? 'var(--primary)' : '#888' }}>{s.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#888', fontFamily: 'Nunito, sans-serif' }}>Fill</span>
                <div onClick={() => setShapeFill(v => !v)} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                  background: shapeFill ? 'var(--primary)' : '#ddd', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: 2, left: shapeFill ? 18 : 2, width: 16, height: 16, borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', display: 'block' }} />
                </div>
                <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'Nunito, sans-serif' }}>{shapeFill ? 'Filled' : 'Outline'}</span>
              </div>
            </div>
          )}

          {isCompact && !isFullscreen ? (() => {
            const swatchSz = isMobile ? 26 : 30
            const palSz    = isMobile ? 26 : 30
            const colorSz  = isMobile ? 20 : 22
            const brushSz  = isMobile ? 36 : 30   // Row 2 is brushes-only so they get more room
            const btnSz    = isMobile ? 28 : 36
            const fontSize = isMobile ? 17 : 20

            const tabletRow = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }
            const mobileRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
            const rowStyle  = isMobile ? mobileRow : tabletRow

            const btnStyle = (active) => ({
              width: btnSz, height: btnSz, minWidth: btnSz, borderRadius: 9, border: 'none',
              cursor: 'pointer', flexShrink: 0,
              background: active ? 'var(--primary-lt)' : '#f0f0f0',
              outline: active ? '2px solid var(--primary)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize,
            })

            if (isMobile) {
              // ── MOBILE: 2-column layout ──
              // Col 1: colour swatch + 🎨 + 8-colour 4×2 grid
              // Col 2 Row 1: 3 brush sizes
              // Col 2 Row 2: ✏️ 🪣 🧽 ⬚ shapes
              // Col 2 Row 3: ↩️ 🗑️ 👁️
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
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: eraser ? '#e8e8e8' : color,
                      border: '2px solid rgba(0,0,0,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {eraser && <span style={{ fontSize: 13 }}>🧹</span>}
                    </div>
                    <button ref={swatchRef} className="fb-palette-trigger"
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 14px)', gap: 3 }}>
                      {QUICK_COLORS.map(c => (
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

                  {/* ── Column 2: 3 rows ── */}
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
                      <button ref={shapesBtnRef} onClick={openShapePicker} className="fb-shape-picker-trigger"
                        style={col2Btn(!!shapeTool, { gap: 2 })}>
                        <ShapeIcon shape={shapeTool || 'rect'} size={11} color={shapeTool ? 'var(--primary)' : '#888'} />
                        <span style={{ fontSize: 6, color: shapeTool ? 'var(--primary)' : '#aaa' }}>▾</span>
                      </button>
                    </div>

                    {/* Row 3: ↩️ 🗑️ 👁️ */}
                    <div style={col2Row}>
                      {[
                        { key: 'undo',  emoji: '↩️',  disabled: !canUndo, active: false,         onClick: handleUndo },
                        { key: 'clear', emoji: '🗑️', disabled: false,    active: false,         onClick: clearCurrentFrame },
                        { key: 'onion', emoji: '👁️',  disabled: false,    active: showOnionSkin, onClick: () => setShowOnionSkin(v => !v) },
                      ].map(({ key, emoji, active, disabled, onClick }) => (
                        <button key={key} onClick={onClick} disabled={disabled}
                          style={col2Btn(active, { opacity: disabled ? 0.32 : 1, cursor: disabled ? 'not-allowed' : 'pointer' })}>
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
                  <button ref={swatchRef} className="fb-palette-trigger"
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
                  {QUICK_COLORS.map(c => (
                    <button key={c} onClick={() => pickColor(c)}
                      style={{
                        width: colorSz, height: colorSz, minWidth: colorSz,
                        borderRadius: '50%', padding: 0, flexShrink: 0,
                        background: c, border: 'none', cursor: 'pointer',
                        boxShadow: color === c && !eraser ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : c === '#ffffff' ? '0 0 0 1px #ccc inset' : 'none',
                        transform: color === c && !eraser ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.1s',
                      }} />
                  ))}
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

                {/* Row 2: ✏️ 🪣 🧽 ⬚ shapes | ↩️ 🗑️ 👁️ */}
                <div style={rowStyle}>
                  {[
                    { key: 'pencil', emoji: '✏️', active: !eraser && !fillMode && !selectTool && !shapeTool, onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(false); setFillMode(false); setShapeTool(null) } },
                    { key: 'fill',   emoji: '🪣', active: fillMode,   onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setFillMode(f => !f); setEraser(false); setShapeTool(null) } },
                    { key: 'eraser', emoji: '🧽', active: eraser,     onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(e => !e); setFillMode(false); setShapeTool(null) } },
                    { key: 'select', emoji: '⬚',  active: selectTool, onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } else { setEraser(false); setFillMode(false); setShapeTool(null); setSelectTool(true) } } },
                  ].map(({ key, emoji, active, onClick }) => (
                    <button key={key} onClick={onClick} style={btnStyle(active)}>{emoji}</button>
                  ))}
                  <button ref={shapesBtnRef} onClick={openShapePicker} className="fb-shape-picker-trigger"
                    style={{ ...btnStyle(!!shapeTool), gap: 2 }}>
                    <ShapeIcon shape={shapeTool || 'rect'} size={16} color={shapeTool ? 'var(--primary)' : '#888'} />
                    <span style={{ fontSize: 7, color: shapeTool ? 'var(--primary)' : '#aaa' }}>▾</span>
                  </button>
                  <div style={{ width: 1, height: btnSz * 0.7, background: '#ccc', flexShrink: 0 }} />
                  {[
                    { key: 'undo',  emoji: '↩️',  disabled: !canUndo, active: false,         onClick: handleUndo },
                    { key: 'clear', emoji: '🗑️', disabled: false,    active: false,         onClick: clearCurrentFrame },
                    { key: 'onion', emoji: '👁️',  disabled: false,    active: showOnionSkin, onClick: () => setShowOnionSkin(v => !v) },
                  ].map(({ key, emoji, active, disabled, onClick }) => (
                    <button key={key} onClick={onClick} disabled={disabled}
                      style={{ ...btnStyle(active), opacity: disabled ? 0.32 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )
          })() : (
            /* ── DESKTOP + FULLSCREEN ── */
            <>
              {!isFullscreen && <SectionLabel>Colour</SectionLabel>}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: eraser ? '#f5f5f5' : color,
                  boxShadow: `0 0 0 3px white, 0 0 0 5px ${eraser ? '#ccc' : color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {eraser && <span style={{ fontSize: 20 }}>🧹</span>}
                </div>
                <button ref={swatchRef} className="fb-palette-trigger"
                  onClick={() => {
                    const rect = swatchRef.current.getBoundingClientRect()
                    setPalettePos({ x: rect.right + 10, y: rect.top })
                    setShowPalette(p => !p)
                  }}
                  style={{ width: 44, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', padding: '4px 0',
                    background: showPalette ? 'var(--primary-lt)' : '#f5f5f5',
                    outline: showPalette ? '2px solid var(--primary)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 16 }}>🎨</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: isFullscreen ? 52 : 76 }}>
                {QUICK_COLORS.map(c => (
                  <button key={c} onClick={() => pickColor(c)}
                    style={{ width: 22, height: 22, borderRadius: 6, background: c, border: 'none', cursor: 'pointer', padding: 0,
                      boxShadow: color === c && !eraser ? `0 0 0 2px white, 0 0 0 4px ${c}` : c === '#ffffff' ? '0 0 0 1px #ddd' : 'none',
                      transform: color === c && !eraser ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.12s' }} />
                ))}
              </div>

              {!isFullscreen && <HDivider />}
              {!isFullscreen && <SectionLabel>Size</SectionLabel>}
              {isFullscreen && <div style={{ width: '80%', height: 1, background: '#f0f0f0', margin: '2px 0' }} />}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
                {BRUSHES.map(b => (
                  <button key={b.size} onClick={() => setBrush(b.size)} title={b.title}
                    style={{ width: isFullscreen ? 44 : 72, height: isFullscreen ? b.btnH * 0.8 : b.btnH,
                      borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: brush === b.size ? 'var(--primary-lt)' : '#f5f5f5',
                      outline: brush === b.size ? '2px solid var(--primary)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 6px' }}>
                    <div style={{ width: b.dotSize, height: b.dotSize, borderRadius: '50%', flexShrink: 0,
                      background: brush === b.size ? 'var(--primary)' : '#aaa' }} />
                  </button>
                ))}
              </div>

              {!isFullscreen && <HDivider />}
              {!isFullscreen && <SectionLabel>Tools</SectionLabel>}
              {isFullscreen && <div style={{ width: '80%', height: 1, background: '#f0f0f0', margin: '2px 0' }} />}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
                {[
                  { key: 'pencil', emoji: '✏️', active: !eraser && !fillMode && !selectTool && !shapeTool, title: 'Pencil', onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(false); setFillMode(false); setShapeTool(null) } },
                  { key: 'fill',   emoji: '🪣', active: fillMode,   title: 'Fill',   onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setFillMode(f => !f); setEraser(false); setShapeTool(null) } },
                  { key: 'eraser', emoji: '🧽', active: eraser,     title: 'Eraser', onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } setEraser(e => !e); setFillMode(false); setShapeTool(null) } },
                  { key: 'select', emoji: '⬚',  active: selectTool, title: 'Select', onClick: () => { commitPendingShape(); if (selectTool) { commitSelection(); setSelectTool(false) } else { setEraser(false); setFillMode(false); setShapeTool(null); setSelectTool(true) } } },
                  { key: 'undo',   emoji: '↩️', active: false, disabled: !canUndo, title: 'Undo', onClick: handleUndo },
                  { key: 'clear',  emoji: '🗑️', active: false, title: 'Clear frame', onClick: clearCurrentFrame },
                  { key: 'onion',  emoji: '👁️', active: showOnionSkin, title: 'Onion skin', onClick: () => setShowOnionSkin(v => !v) },
                ].map(({ key, emoji, active, disabled, onClick, title }) => (
                  <button key={key} onClick={onClick} disabled={disabled} title={title}
                    style={{ width: isFullscreen ? 44 : 72, height: isFullscreen ? 40 : 32,
                      borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                      background: active ? 'var(--primary-lt)' : '#f5f5f5',
                      outline: active ? '2px solid var(--primary)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: disabled ? 0.35 : 1, fontSize: 18 }}>
                    {emoji}
                  </button>
                ))}

                <button ref={shapesBtnRef} onClick={openShapePicker} title="Draw shapes" className="fb-shape-picker-trigger"
                  style={{ width: isFullscreen ? 44 : 72, height: isFullscreen ? 40 : 32,
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: shapeTool ? 'var(--primary-lt)' : '#f5f5f5',
                    outline: shapeTool ? '2px solid var(--primary)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <ShapeIcon shape={shapeTool || 'rect'} size={20} color={shapeTool ? 'var(--primary)' : '#aaa'} />
                  <span style={{ fontSize: 9, color: shapeTool ? 'var(--primary)' : '#aaa', marginTop: 1 }}>▾</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Canvas column: title + canvas ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>

        {!isFullscreen && (
          <input
            value={flipbookTitle}
            onChange={e => setFlipbookTitle(e.target.value)}
            placeholder="Give your flipbook a name…"
            maxLength={60}
            style={{ padding: '6px 16px', borderRadius: 20, border: '2px solid var(--primary-lt)',
              outline: 'none', fontSize: 13, fontFamily: 'Nunito, sans-serif', fontWeight: 700,
              color: '#444', background: 'white', width: 240, maxWidth: '100%', flexShrink: 0 }}
          />
        )}

        {/* ── Canvas area ── */}
        {/* Centering wrapper — fills remaining space, centers canvas without stretching it */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        {/* Canvas container — fixed 1200×800 logical resolution, scales via CSS only */}
        <div style={{ aspectRatio: `${W} / ${H}`, width: '100%', maxHeight: '100%',
          borderRadius: isFullscreen ? 0 : 20, overflow: 'hidden',
          boxShadow: isFullscreen ? 'none' : 'var(--shadow)',
          position: 'relative', background: 'white' }}>

          {/* Draw canvas */}
          <canvas ref={canvasRef} width={W} height={H}
            style={{ width: '100%', height: '100%', display: 'block',
              touchAction: 'none', cursor: canvasCursor,
              visibility: showPlayback ? 'hidden' : 'visible' }}
            onMouseDown={startDraw} onMouseMove={doDraw}
            onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchEnd={stopDraw} />

          {/* Onion skin overlay */}
          <canvas ref={onionRef} width={W} height={H}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              pointerEvents: 'none', display: showPlayback ? 'none' : 'block' }} />

          {/* Selection overlay — captures pointer events when select tool is active */}
          <canvas ref={selOverlayRef} width={W} height={H}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              pointerEvents: selectTool && !showPlayback ? 'auto' : 'none',
              display: showPlayback ? 'none' : 'block',
              cursor: 'crosshair' }}
            onMouseDown={onSelDown} onMouseMove={onSelMove}
            onMouseUp={onSelUp} onMouseLeave={onSelUp} />
          {/* Shape preview overlay */}
          <canvas ref={shapeOverlayRef} width={W} height={H}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              pointerEvents: 'none', display: showPlayback ? 'none' : 'block' }} />
          {/* Touch indicator */}
          <div ref={touchIndicatorRef} style={{
            position: 'absolute', width: 18, height: 18, borderRadius: '50%',
            border: '2.5px solid #000', transform: 'translate(-50%, -50%)',
            pointerEvents: 'none', opacity: 0, zIndex: 10,
            transition: 'border-color 0.08s',
            left: 0, top: 0,
          }} />

          {/* Selection panel — floats inside canvas area when a region is lifted */}
          {selPanelOpen && selStateRef.current.phase === 'floating' && !isPlaying && (
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 20,
              background: 'white', borderRadius: 16, padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1.5px solid #e8e0ff',
              fontFamily: 'Nunito, sans-serif', fontSize: 13,
              display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260, maxWidth: '92%' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14 }}>✂️ Selection</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={commitSelection}
                    style={{ padding: '4px 10px', borderRadius: 8, border: 'none',
                      background: 'var(--primary)', color: 'white',
                      fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                    ✓ Place
                  </button>
                  <button onClick={deleteSelection}
                    style={{ padding: '4px 10px', borderRadius: 8, border: 'none',
                      background: '#ffe0e0', color: '#d00',
                      fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
                    title="Delete selection">
                    🗑️
                  </button>
                  <button onClick={cancelSelection}
                    style={{ padding: '4px 10px', borderRadius: 8, border: 'none',
                      background: 'var(--primary-lt)', color: 'var(--primary)',
                      fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                    ✕
                  </button>
                </div>
              </div>

              {/* Stamp */}
              <div style={{ background: 'var(--primary-lt)', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 5, fontSize: 11 }}>
                  📌 Copy to next frames at same spot
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--primary)' }}>Next</span>
                  {[1, 2, 3, 5].map(n => (
                    <button key={n} onClick={() => setStampCount(n)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: 'none',
                        background: stampCount === n ? 'var(--primary)' : 'white',
                        color: stampCount === n ? 'white' : 'var(--primary)',
                        fontWeight: 800, fontSize: 12, cursor: 'pointer', padding: 0,
                        outline: stampCount === n ? 'none' : '1.5px solid var(--primary)' }}>{n}</button>
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--primary)' }}>frames</span>
                  <button onClick={() => stampSelectionToFrames(stampCount)} disabled={isStamping}
                    style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: 'none',
                      background: isStamping ? 'var(--primary-lt)' : 'var(--primary)',
                      color: isStamping ? 'var(--primary)' : 'white',
                      fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                      cursor: isStamping ? 'not-allowed' : 'pointer', fontSize: 12 }}>
                    {isStamping ? '⏳' : 'Stamp!'}
                  </button>
                </div>
              </div>

              {/* Slide */}
              {total > 1 && currentIdxRef.current < total - 1 && (
                <div style={{ background: 'var(--primary-lt)', borderRadius: 10, padding: '8px 10px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6, fontSize: 11 }}>
                    🎬 Slide across frames
                  </div>
                  {/* End frame picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--primary)' }}>Until frame</span>
                    <input type="range"
                      min={currentIdxRef.current + 1} max={total - 1}
                      value={slideEndFrame ?? currentIdxRef.current + 1}
                      onChange={e => setSlideEndFrame(Number(e.target.value))}
                      style={{ width: 70 }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', minWidth: 16 }}>
                      {(slideEndFrame ?? currentIdxRef.current + 1) + 1}
                    </span>
                  </div>
                  {/* Direction presets */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 5 }}>Which way does it move?</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {[
                      { label: '→',  sx:  40, sy:   0 },
                      { label: '←',  sx: -40, sy:   0 },
                      { label: '↓',  sx:   0, sy:  40 },
                      { label: '↑',  sx:   0, sy: -40 },
                      { label: '↗',  sx:  40, sy: -40 },
                      { label: '↘',  sx:  40, sy:  40 },
                    ].map(({ label, sx, sy }) => {
                      const active = slideStepX === sx && slideStepY === sy
                      return (
                        <button key={label} onClick={() => { setSlideStepX(sx); setSlideStepY(sy) }}
                          style={{ width: 38, height: 38, borderRadius: 10, border: 'none',
                            background: active ? 'var(--primary)' : 'white',
                            color: active ? 'white' : 'var(--primary)',
                            outline: active ? 'none' : '1.5px solid var(--primary)',
                            fontSize: 18, cursor: 'pointer', padding: 0,
                            boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            transform: active ? 'scale(1.12)' : 'scale(1)',
                            transition: 'all 0.12s' }}>
                          {label}
                        </button>
                      )
                    })}
                  </div>
                  <button onClick={slideSelectionAcrossFrames}
                    disabled={isStamping || (slideStepX === 0 && slideStepY === 0)}
                    style={{ width: '100%', padding: '6px 0', borderRadius: 8, border: 'none',
                      background: (isStamping || (slideStepX === 0 && slideStepY === 0)) ? 'var(--primary-lt)' : 'var(--primary)',
                      color: (isStamping || (slideStepX === 0 && slideStepY === 0)) ? 'var(--primary)' : 'white',
                      fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13,
                      cursor: (isStamping || (slideStepX === 0 && slideStepY === 0)) ? 'not-allowed' : 'pointer' }}>
                    {isStamping ? '⏳ Sliding…' : '🎬 Slide!'}
                  </button>
                </div>
              )}
            </div>
          )}

          {hasPendingShape && !showPlayback && (
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
              background: 'white', borderRadius: 16, padding: '8px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1.5px solid var(--primary-lt)',
              fontFamily: 'Nunito, sans-serif', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13 }}>🔷 Drag · corners to resize</span>
              <button onClick={commitPendingShape}
                style={{ padding: '4px 12px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: 'white',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                ✓ Place
              </button>
              <button onClick={cancelPendingShape}
                style={{ padding: '4px 8px', borderRadius: 8, border: 'none',
                  background: 'var(--primary-lt)', color: 'var(--primary)',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                ✕
              </button>
            </div>
          )}

          {/* Playback overlay */}
          {showPlayback && (
            <div style={{
              position: 'absolute', inset: 0, background: 'white', display: 'block',
              animation: (isPlaying && playEffect) ? EFFECT_ANIM[playEffect] : undefined,
            }}>
              {playbackSrc
                ? <img src={playbackSrc} alt="" draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} />
                : null}
            </div>
          )}

          {/* Fullscreen toggle */}
          {!isFullscreen && (
            <button onClick={toggleFullscreen} title="Fullscreen"
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 10,
                width: 32, height: 32, minWidth: 32, minHeight: 32, borderRadius: 8,
                border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)',
                color: '#888', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
              </svg>
            </button>
          )}
          {isFullscreen && (
            <button onClick={toggleFullscreen} title="Exit fullscreen"
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 20,
                width: 36, height: 36, minWidth: 36, minHeight: 36, borderRadius: 10,
                border: 'none', background: 'rgba(255,255,255,0.95)', color: '#555',
                cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/>
              </svg>
            </button>
          )}

          {/* Frame counter in fullscreen */}
          {isFullscreen && (
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
              zIndex: 10, fontSize: 13, fontWeight: 700, color: '#555',
              background: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: '4px 12px' }}>
              Frame {currentIdx + 1} / {total}
            </div>
          )}
        </div>{/* end canvas container */}
        </div>{/* end centering wrapper */}
        </div>{/* end canvas column */}
      </div>

      {/* ── Bottom: playback + frames strip ── */}
      <div style={{ flexShrink: 0, background: 'white',
        borderRadius: isFullscreen ? 0 : 20,
        boxShadow: isFullscreen ? 'none' : 'var(--shadow)',
        marginTop: isFullscreen ? 0 : 16,
        borderTop: isFullscreen ? '1px solid #f0f0f0' : 'none',
        overflow: isFullscreen ? 'visible' : 'hidden' }}>

        {/* ── Playback controls ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          padding: '10px 14px',
          background: 'linear-gradient(135deg, #f0ebff 0%, #e8f4ff 100%)',
          borderBottom: '2px solid rgba(156,110,248,0.12)',
        }}>

          {/* Prev / Play / Next cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button onClick={() => switchFrame(Math.max(0, currentIdx - 1))}
              disabled={isPlaying || currentIdx === 0}
              title="Previous frame"
              style={{ width: 38, height: 38, minWidth: 38, borderRadius: 12, border: 'none',
                cursor: (isPlaying || currentIdx === 0) ? 'not-allowed' : 'pointer',
                background: 'white', fontSize: 18, fontWeight: 700,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                opacity: (isPlaying || currentIdx === 0) ? 0.35 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◀</button>

            <button onClick={isPlaying ? stopPlay : startPlay} disabled={total < 2}
              title={isPlaying ? 'Pause' : 'Play my flipbook!'}
              style={{ width: 54, height: 54, minWidth: 54, borderRadius: '50%', border: 'none',
                cursor: total < 2 ? 'not-allowed' : 'pointer', padding: 0, flexShrink: 0,
                background: 'var(--primary)',
                color: 'white', fontSize: 24,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: total < 2 ? 0.4 : 1,
                paddingLeft: isPlaying ? 0 : 3,
                transform: 'scale(1)', transition: 'transform 0.1s' }}>
              {isPlaying ? '⏸' : '▶'}
            </button>

            <button onClick={() => switchFrame(Math.min(total - 1, currentIdx + 1))}
              disabled={isPlaying || currentIdx === total - 1}
              title="Next frame"
              style={{ width: 38, height: 38, minWidth: 38, borderRadius: 12, border: 'none',
                cursor: (isPlaying || currentIdx === total - 1) ? 'not-allowed' : 'pointer',
                background: 'white', fontSize: 18, fontWeight: 700,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                opacity: (isPlaying || currentIdx === total - 1) ? 0.35 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
          </div>

          {/* Loop toggle */}
          <button onClick={() => setLoop(v => !v)} title={loop ? 'Loop on' : 'Loop off'}
            style={{ width: 38, height: 38, minWidth: 38, borderRadius: 12, border: 'none',
              cursor: 'pointer', flexShrink: 0, fontSize: 20,
              background: loop ? '#fff3e0' : 'white',
              outline: loop ? '2px solid #ffa502' : 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔁</button>

          {/* Speed presets */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#b0a0d0', letterSpacing: 0.5,
              textTransform: 'uppercase', marginRight: 2 }}>Speed</span>
            {SPEEDS.map(s => {
              const active = fps === s.fps
              return (
                <button key={s.fps} onClick={() => { setFps(s.fps); fpsRef.current = s.fps }}
                  disabled={isPlaying}
                  title={`${s.label} — ${s.fps} fps`}
                  style={{ padding: '4px 10px', borderRadius: 20, border: 'none',
                    cursor: isPlaying ? 'not-allowed' : 'pointer', flexShrink: 0,
                    background: active ? 'linear-gradient(135deg,#9c6ef8,#c084fc)' : 'white',
                    boxShadow: active ? '0 3px 10px rgba(156,110,248,0.4)' : '0 2px 6px rgba(0,0,0,0.08)',
                    fontFamily: 'Nunito, sans-serif', fontWeight: 800,
                    color: active ? 'white' : '#888',
                    opacity: isPlaying ? 0.45 : 1, transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <span style={{ fontSize: 18, lineHeight: 1.2 }}>{s.emoji}</span>
                  <span style={{ fontSize: 10 }}>{s.label}</span>
                </button>
              )
            })}
          </div>

          {/* Playback effect presets */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#b0a0d0', letterSpacing: 0.5,
              textTransform: 'uppercase', marginRight: 2 }}>FX</span>
            {PLAY_EFFECTS.map(fx => {
              const active = playEffect === fx.key
              return (
                <button key={String(fx.key)} onClick={() => setPlayEffect(fx.key)}
                  title={fx.label}
                  style={{ padding: '4px 10px', borderRadius: 20, border: 'none',
                    cursor: 'pointer', flexShrink: 0,
                    background: active ? 'var(--primary)' : '#f5f5f5',
                    boxShadow: active ? '0 3px 10px rgba(0,0,0,0.18)' : '0 2px 6px rgba(0,0,0,0.08)',
                    fontFamily: 'Nunito, sans-serif', fontWeight: 800,
                    color: active ? 'white' : '#888',
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <span style={{ fontSize: 18, lineHeight: 1.2 }}>{fx.emoji}</span>
                  <span style={{ fontSize: 10 }}>{fx.label}</span>
                </button>
              )
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Smooth it — pixel tween between current and next frame */}
          {(() => {
            const idx = currentIdx
            const canSmooth = !isPlaying && !isTweening
              && idx < total - 1
              && frames[idx] && frames[idx + 1]
              && total + TWEEN_STEPS <= MAX_FRAMES
            return (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button onClick={tweenFrames} disabled={!canSmooth}
                  style={{ padding: '8px 14px', borderRadius: 20, border: 'none',
                    fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13,
                    cursor: canSmooth ? 'pointer' : 'not-allowed',
                    background: canSmooth ? 'var(--primary)' : '#e0e0e0',
                    color: canSmooth ? 'white' : '#aaa',
                    boxShadow: canSmooth ? '0 3px 12px rgba(0,0,0,0.2)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: 15 }}>{isTweening ? '⏳' : '🎨'} {isTweening ? 'Blending…' : 'Blend Frames'}</span>
                  <span style={{ fontSize: 9, opacity: 0.85, fontWeight: 600 }}>
                    mixes this + next frame
                  </span>
                </button>
              </div>
            )
          })()}

          {/* Duplicate */}
          <button onClick={duplicateFrame} disabled={isPlaying || total >= MAX_FRAMES}
            title="Copy this frame"
            style={{ padding: '8px 14px', borderRadius: 20, border: 'none',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13,
              cursor: (isPlaying || total >= MAX_FRAMES) ? 'not-allowed' : 'pointer',
              background: 'white', color: '#9c6ef8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              opacity: (isPlaying || total >= MAX_FRAMES) ? 0.4 : 1,
              display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <span style={{ fontSize: 16 }}>⧉</span> Copy Frame
          </button>

          {/* Save to DB */}
          <button onClick={saveFlipbook} disabled={isSaving || isPlaying || total < 1 || !child?.id}
            title="Save flipbook to resume later"
            style={{ padding: '8px 14px', borderRadius: 20, border: 'none',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13,
              cursor: (isSaving || isPlaying || total < 1) ? 'not-allowed' : 'pointer',
              background: (isSaving || isPlaying || total < 1) ? '#e0e0e0' : 'var(--primary)',
              color: (isSaving || isPlaying || total < 1) ? '#aaa' : 'white',
              boxShadow: (isSaving || isPlaying || total < 1) ? 'none' : '0 3px 12px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{isSaving ? '⏳' : '💾'}</span>
            {isSaving ? 'Saving…' : 'Save'}
          </button>

          {/* Export video */}
          <button onClick={downloadAnimation} disabled={isDownloading || isPlaying || total < 2}
            title="Export as video file"
            style={{ padding: '8px 14px', borderRadius: 20, border: '2px solid var(--primary)',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13,
              cursor: (isDownloading || isPlaying || total < 2) ? 'not-allowed' : 'pointer',
              background: 'white',
              color: (isDownloading || isPlaying || total < 2) ? '#aaa' : 'var(--primary)',
              borderColor: (isDownloading || isPlaying || total < 2) ? '#e0e0e0' : 'var(--primary)',
              whiteSpace: 'nowrap', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{isDownloading ? '⏳' : '🎬'}</span>
            {isDownloading ? 'Exporting…' : 'Export'}
          </button>
        </div>

        {/* Frames strip */}
        <div ref={stripRef} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          overflowX: 'auto', minHeight: 86 }}>
          {frames.map((url, i) => (
            <div key={i}
              data-frame-idx={i}
              draggable={!isPlaying}
              onClick={() => switchFrame(i)}
              onDragStart={e => onDragStart(e, i)}
              onDragOver={e => onDragOver(e, i)}
              onDragLeave={() => setDropIdx(null)}
              onDrop={e => onDrop(e, i)}
              onDragEnd={onDragEnd}
              onTouchStart={e => onFrameTouchStart(e, i)}
              onTouchMove={onFrameTouchMove}
              onTouchEnd={e => onFrameTouchEnd(e, i)}
              style={{ position: 'relative', flexShrink: 0,
                cursor: isPlaying ? 'default' : 'grab',
                width: 80, height: 54, borderRadius: 8, overflow: 'hidden', background: 'white',
                outline: i === currentIdx ? '3px solid var(--primary)'
                  : dropIdx === i ? '3px dashed var(--primary)'
                  : '2px solid #e0e0e0',
                opacity: dragIdxRef.current === i ? 0.4 : 1,
                transition: 'outline 0.1s, opacity 0.1s',
                userSelect: 'none', WebkitUserSelect: 'none' }}>
              {url
                ? <img src={url} alt={`Frame ${i + 1}`} draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block', pointerEvents: 'none' }} />
                : <div style={{ width: '100%', height: '100%', background: '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ccc', fontSize: 10, fontWeight: 700 }}>empty</div>}
              <div style={{ position: 'absolute', bottom: 2, left: 4, fontSize: 9, fontWeight: 800,
                color: 'rgba(0,0,0,0.35)', background: 'rgba(255,255,255,0.75)',
                borderRadius: 3, padding: '0 3px', lineHeight: '14px' }}>{i + 1}</div>
              {frames.length > 1 && !isPlaying && (
                <button onClick={e => { e.stopPropagation(); deleteFrame(i) }}
                  style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16,
                    minWidth: 16, minHeight: 16, borderRadius: '50%', border: 'none', padding: 0,
                    background: 'rgba(0,0,0,0.35)', color: 'white', cursor: 'pointer',
                    fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', lineHeight: 1, flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}
          {!isPlaying && total < MAX_FRAMES && (
            <button onClick={addFrameAfter}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#ccc'}
              style={{ flexShrink: 0, width: 80, height: 54, borderRadius: 8,
                border: '2px dashed #ccc', background: '#fafafa', cursor: 'pointer',
                fontSize: 24, color: '#bbb', fontWeight: 800, transition: 'border-color 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          )}
          {!isPlaying && total >= MAX_FRAMES && (
            <div style={{ flexShrink: 0, width: 80, height: 54, borderRadius: 8,
              border: '2px solid #f0f0f0', background: '#fafafa',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2 }}>
              <span style={{ fontSize: 16 }}>🎬</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#bbb', textAlign: 'center' }}>MAX!</span>
            </div>
          )}
        </div>
      </div>
    </div>

    <HistoryDrawer title="My Flipbooks" count={flipbookSaves.length}>
      {close => flipbookSaves.map(save => (
        <div key={save.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
          {save.thumbnail && (
            <img src={save.thumbnail} alt="thumbnail"
              onClick={() => { loadFlipbookSave(save); close() }}
              style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6,
                border: currentSaveId === save.id ? '2px solid var(--primary)' : '2px solid var(--primary-lt)',
                flexShrink: 0, cursor: 'pointer' }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, fontFamily: 'Nunito, sans-serif',
              color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {save.title || `Flipbook (${save.frameCount} frames)`}
            </div>
            <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'Nunito, sans-serif' }}>
              {fmtDate(save.updatedAt)}
            </div>
          </div>
          <button onClick={() => { loadFlipbookSave(save); close() }}
            style={{ padding: '5px 10px', borderRadius: 14, border: 'none',
              background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: 12,
              fontFamily: 'Nunito, sans-serif', cursor: 'pointer', flexShrink: 0 }}>
            Resume
          </button>
          <button onClick={() => deleteFlipbookSave(save.id)}
            className="btn-danger" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', padding: 0, fontSize: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>
      ))}
    </HistoryDrawer>

    <style>{`
      @keyframes fbShake {
        0%,100% { transform: translate(0,0); }
        15%      { transform: translate(-9px, 2px); }
        30%      { transform: translate(9px, -2px); }
        45%      { transform: translate(-7px, 3px); }
        60%      { transform: translate(7px, -1px); }
        75%      { transform: translate(-4px, 2px); }
        90%      { transform: translate(4px, -1px); }
      }
      @keyframes fbZoom {
        0%,100% { transform: scale(1); }
        50%     { transform: scale(1.12); }
      }
      @keyframes fbBounce {
        0%,100% { transform: translateY(0) scale(1); }
        40%     { transform: translateY(-16px) scale(1.03); }
        65%     { transform: translateY(-10px) scale(1.01); }
      }
      @keyframes fbWave {
        0%,100% { transform: translateX(0); }
        25%     { transform: translateX(12px); }
        75%     { transform: translateX(-12px); }
      }
      @keyframes fbSpin {
        from { transform: rotate(0deg) scale(0.94); }
        to   { transform: rotate(360deg) scale(0.94); }
      }
    `}</style>
    </>
  )
}

function ctrlBtn(active, disabled = false) {
  return {
    width: 34, height: 34, minWidth: 34, minHeight: 34, borderRadius: 8,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', padding: 0, flexShrink: 0,
    background: active ? 'var(--primary-lt)' : '#f5f5f5',
    outline: active ? '2px solid var(--primary)' : 'none',
    fontSize: 15, opacity: disabled ? 0.35 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}
