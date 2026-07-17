import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import useFeatureDuration from '../../hooks/useFeatureDuration'

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
const SPEEDS = [
  { fps: 2,  emoji: '🐌', label: 'Slow' },
  { fps: 4,  emoji: '🚶', label: 'Normal' },
  { fps: 8,  emoji: '🐇', label: 'Fast' },
  { fps: 12, emoji: '🚀', label: 'Zoom' },
]

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
export default function FlipbookStudio({ track = () => {} }) {
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

  // Keep fps/loop refs in sync
  useEffect(() => { fpsRef.current  = fps  }, [fps])
  useEffect(() => { loopRef.current = loop }, [loop])

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
  }, [eraser, fillMode])

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

    track('flipbook', 'save', { metadata: { frames: allFrames.length, fps: fpsRef.current } })
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'my-flipbook.webm'; a.click()
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
    if (isPlaying) return
    if (!fbSessionTracked.current) {
      fbSessionTracked.current = true
    }
    if (fillMode) {
      saveSnapshot()
      floodFill(canvasRef.current, ...Object.values(getPos(e, canvasRef.current)), color)
      saveCurrentFrame()
      return
    }
    saveSnapshot()
    drawing.current = true
    lastPos.current = getPos(e, canvasRef.current)
  }

  function doDraw(e) {
    if (!drawing.current || isPlaying) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
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
  }

  function stopDraw() {
    if (drawing.current) saveCurrentFrame()   // auto-save every stroke
    drawing.current = false
    lastPos.current = null
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const bp = useBreakpoint()
  const isMobile  = bp === 'mobile'
  const isCompact = bp === 'mobile' || bp === 'tablet'

  const total = frames.length

  const toolbarStyle = {
    // compact: full-width top bar (row). desktop/fullscreen: left column
    width:     isFullscreen ? 80 : isCompact ? '100%' : 96,
    flexShrink: 0, alignSelf: 'stretch',
    display: 'flex',
    flexDirection: isFullscreen ? 'column' : isCompact ? 'row' : 'column',
    flexWrap:  isCompact && !isFullscreen ? 'wrap' : undefined,
    gap: isFullscreen ? 8 : isCompact ? 8 : 12,
    background: 'white',
    borderRadius: isFullscreen ? 0 : 20,
    padding: isFullscreen ? '14px 10px' : isCompact ? '10px 14px' : '16px 10px',
    boxShadow: isFullscreen ? '2px 0 8px rgba(0,0,0,0.06)' : 'var(--shadow)',
    alignItems: 'center',
    justifyContent: isCompact && !isFullscreen ? 'space-between' : 'flex-start',
    overflowY: isCompact ? undefined : 'auto',
    overflowX: isCompact && !isFullscreen ? 'auto' : undefined,
  }

  return (
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

          {!isCompact && !isFullscreen && <SectionLabel>Colour</SectionLabel>}

          {/* Active swatch + palette trigger */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isCompact ? 6 : 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12,
              background: eraser ? '#f5f5f5' : color,
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
              style={{ width: 44, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                padding: '4px 0', background: showPalette ? 'var(--primary-lt)' : '#f5f5f5',
                outline: showPalette ? '2px solid var(--primary)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s' }}>
              <span style={{ fontSize: 16 }}>🎨</span>
            </button>

            {/* Palette popup */}
            {showPalette && (
              <div className="fb-palette-popup" style={{ position: 'fixed', left: palettePos.x,
                top: palettePos.y, zIndex: 2000, background: 'white', borderRadius: 20,
                padding: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', width: 240,
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
          </div>

          {/* Quick colours */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: isCompact ? undefined : 76 }}>
            {QUICK_COLORS.map(c => (
              <button key={c} onClick={() => pickColor(c)}
                style={{ width: isCompact ? 20 : 22, height: isCompact ? 20 : 22, borderRadius: 6, background: c, border: 'none',
                  cursor: 'pointer', padding: 0,
                  boxShadow: color === c && !eraser ? `0 0 0 2px white, 0 0 0 4px ${c}` : c === '#ffffff' ? '0 0 0 1px #ddd' : 'none',
                  transform: color === c && !eraser ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.12s' }} />
            ))}
          </div>

          {!isCompact && !isFullscreen && <HDivider />}
          {!isCompact && !isFullscreen && <SectionLabel>Size</SectionLabel>}

          {/* Brush sizes */}
          <div style={{ display: 'flex', flexDirection: isFullscreen ? 'column' : isCompact ? 'row' : 'column', gap: 5, alignItems: 'center' }}>
            {BRUSHES.map(b => (
              <button key={b.size} onClick={() => setBrush(b.size)} title={b.title}
                style={{ width: isFullscreen ? 44 : isCompact ? 34 : 72,
                  height: isFullscreen ? b.btnH * 0.8 : isCompact ? b.btnH * 0.75 : b.btnH,
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: brush === b.size ? 'var(--primary-lt)' : '#f5f5f5',
                  outline: brush === b.size ? '2px solid var(--primary)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 6px' }}>
                <div style={{ width: b.dotSize, height: b.dotSize, borderRadius: '50%', flexShrink: 0,
                  background: brush === b.size ? 'var(--primary)' : '#aaa' }} />
              </button>
            ))}
          </div>

          {!isCompact && !isFullscreen && <HDivider />}
          {!isCompact && !isFullscreen && <SectionLabel>Tools</SectionLabel>}

          {/* Tool buttons */}
          <div style={{ display: 'flex', flexDirection: isFullscreen ? 'column' : isCompact ? 'row' : 'column', gap: 5, alignItems: 'center' }}>
            {[
              { key: 'pencil', emoji: '✏️', active: !eraser && !fillMode, title: 'Pencil', onClick: () => { setEraser(false); setFillMode(false) } },
              { key: 'fill',   emoji: '🪣', active: fillMode, title: 'Fill',   onClick: () => { setFillMode(f => !f); setEraser(false) } },
              { key: 'eraser', emoji: '🧽', active: eraser,  title: 'Eraser', onClick: () => { setEraser(e => !e); setFillMode(false) } },
              { key: 'undo',   emoji: '↩️', active: false, disabled: !canUndo, title: 'Undo', onClick: handleUndo },
              { key: 'clear',  emoji: '🗑️', active: false,  title: 'Clear frame', onClick: clearCurrentFrame },
              { key: 'onion',  emoji: '👁️', active: showOnionSkin, title: 'Onion skin', onClick: () => setShowOnionSkin(v => !v) },
            ].map(({ key, emoji, active, disabled, onClick, title }) => (
              <button key={key} onClick={onClick} disabled={disabled} title={title ?? key}
                style={{ width: isFullscreen ? 44 : isCompact ? 40 : 72,
                  height: isFullscreen ? 40 : isCompact ? 38 : 32,
                  borderRadius: 8, border: 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  background: active ? 'var(--primary-lt)' : '#f5f5f5',
                  outline: active ? '2px solid var(--primary)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: disabled ? 0.35 : 1, fontSize: 18 }}>
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* ── Canvas area ── */}
        <div style={{ flex: 1, borderRadius: isFullscreen ? 0 : 20, overflow: 'hidden',
          boxShadow: isFullscreen ? 'none' : 'var(--shadow)',
          position: 'relative', background: 'white', minHeight: 0 }}>

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

          {/* Playback overlay */}
          {showPlayback && (
            <div style={{ position: 'absolute', inset: 0, background: 'white', display: 'block' }}>
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
        </div>
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
                background: isPlaying
                  ? 'linear-gradient(135deg,#ff6b81,#ff4757)'
                  : 'linear-gradient(135deg,#9c6ef8,#1e90ff)',
                color: 'white', fontSize: 24,
                boxShadow: isPlaying
                  ? '0 4px 16px rgba(255,71,87,0.4)'
                  : '0 4px 16px rgba(156,110,248,0.45)',
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

          {/* Save / Download */}
          <button onClick={downloadAnimation} disabled={isDownloading || isPlaying || total < 2}
            title="Download your animation!"
            style={{ padding: '8px 16px', borderRadius: 20, border: 'none',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13,
              cursor: (isDownloading || isPlaying || total < 2) ? 'not-allowed' : 'pointer',
              background: (isDownloading || isPlaying || total < 2) ? '#e0e0e0' : 'var(--primary)',
              color: (isDownloading || isPlaying || total < 2) ? '#aaa' : 'white',
              boxShadow: (isDownloading || isPlaying || total < 2) ? 'none' : '0 3px 12px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{isDownloading ? '⏳' : '🎬'}</span>
            {isDownloading ? 'Saving…' : 'Save My Movie!'}
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
