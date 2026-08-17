import { isCreditsBlocked } from '../../utils/quota'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Confetti from '../../components/Confetti'
import { traceApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'
import Maze3D from './Maze3D'

// ── Procedural Maze Generator (DFS / recursive backtracker) ──────────────────

function seededRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function generateMaze(cols, rows, seed) {
  const rand = seededRng(seed)
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      r, c,
      walls: { N: true, S: true, E: true, W: true },
      visited: false,
    }))
  )
  const DIRS = [[-1,0,'N','S'],[1,0,'S','N'],[0,-1,'W','E'],[0,1,'E','W']]

  function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const stack = [[0, 0]]
  grid[0][0].visited = true
  while (stack.length) {
    const [r, c] = stack[stack.length - 1]
    const neighbors = shuffle(DIRS)
      .map(([dr, dc, wall, opp]) => {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].visited)
          return [nr, nc, wall, opp]
        return null
      })
      .filter(Boolean)

    if (!neighbors.length) { stack.pop(); continue }
    const [nr, nc, wall, opp] = neighbors[0]
    grid[r][c].walls[wall] = false
    grid[nr][nc].walls[opp] = false
    grid[nr][nc].visited = true
    stack.push([nr, nc])
  }
  return grid
}

function gridSize(age) {
  if (age <= 4) return { cols: 4, rows: 3 }
  if (age <= 6) return { cols: 5, rows: 4 }
  if (age <= 8) return { cols: 7, rows: 5 }
  if (age <= 10) return { cols: 9, rows: 6 }
  return { cols: 11, rows: 7 }
}

// ── Layout helpers ───────────────────────────────────────────────────────────
const SVG_W = 600
const SVG_H = 420
const MARGIN = 28

function cellGeom(cols, rows) {
  return {
    cw: (SVG_W - MARGIN * 2) / cols,
    ch: (SVG_H - MARGIN * 2) / rows,
  }
}

function cellCenter(r, c, cols, rows) {
  const { cw, ch } = cellGeom(cols, rows)
  return [MARGIN + c * cw + cw / 2, MARGIN + r * ch + ch / 2]
}

function svgPoint(svg, clientX, clientY) {
  if (!svg) return [0, 0]
  try {
    const pt = svg.createSVGPoint()
    pt.x = clientX; pt.y = clientY
    const sp = pt.matrixTransform(svg.getScreenCTM().inverse())
    return [sp.x, sp.y]
  } catch {
    const r = svg.getBoundingClientRect()
    return [(clientX - r.left) * SVG_W / r.width, (clientY - r.top) * SVG_H / r.height]
  }
}

// ── Wall collision ───────────────────────────────────────────────────────────

function segIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const dxAB = bx - ax, dyAB = by - ay
  const dxCD = dx - cx, dyCD = dy - cy
  const denom = dxAB * dyCD - dyAB * dxCD
  if (Math.abs(denom) < 1e-10) return null
  const t = ((cx - ax) * dyCD - (cy - ay) * dxCD) / denom
  const u = ((cx - ax) * dyAB - (cy - ay) * dxAB) / denom
  if (t > 0.01 && t <= 1 && u >= 0 && u <= 1) return t
  return null
}

function firstWallHit(x1, y1, x2, y2, wallSegs) {
  let minT = null
  for (const [wx1, wy1, wx2, wy2] of wallSegs) {
    const t = segIntersect(x1, y1, x2, y2, wx1, wy1, wx2, wy2)
    if (t !== null && (minT === null || t < minT)) minT = t
  }
  return minT
}

// ── Built-in themes ──────────────────────────────────────────────────────────
const BASE_THEMES = [
  { bg: '#fef9e7', wall: '#795548', floor: '#fffde7', startEmoji: '🦊', endEmoji: '🏡', story: 'The clever fox found the right path home! 🌟' },
  { bg: '#e8f5e9', wall: '#388e3c', floor: '#f1f8e9', startEmoji: '🐝', endEmoji: '🌸', story: 'Buzz buzz! The bee found the sweetest flower! 🌸' },
  { bg: '#e8eaf6', wall: '#3949ab', floor: '#ede7f6', startEmoji: '🚀', endEmoji: '🌙', story: '3… 2… 1… Blast off to the moon! 🚀' },
  { bg: '#e0f7fa', wall: '#00838f', floor: '#e0f7fa', startEmoji: '🐟', endEmoji: '🏰', story: 'The little fish found the coral castle! 🐠' },
  { bg: '#fce4ec', wall: '#c2185b', floor: '#fff8f8', startEmoji: '🐱', endEmoji: '🧶', story: 'Meow! The curious cat found the yarn ball! 🐱' },
]

const WALL_MSGS = ['Oops! That\'s a wall! 🧱', 'Blocked! Try another way! 🔄', 'Hit a wall! Go back! ↩️']

export default function Maze({ child, quota, featureConfig }) {
  const { track } = useTracker()
  const offline = useOffline()
  const childAge = child?.birthYear ? new Date().getFullYear() - child.birthYear : 6
  const defaultSize = gridSize(childAge)

  const [seed, setSeed]         = useState(() => (Math.random() * 1e8) | 0)
  const [themeIdx, setThemeIdx] = useState(0)
  const [aiSkin, setAiSkin]     = useState(null)
  const [use3D, setUse3D]       = useState(false)
  const [maze3DKey, setMaze3DKey] = useState(0)
  const [pathPts, setPathPts]   = useState([])
  const [phase, setPhase]       = useState('idle')
  const [showConfetti, setShowConfetti] = useState(false)
  const [wallMsg, setWallMsg]   = useState('')
  const [wallMsg3D, setWallMsg3D] = useState('')
  const wallMsg3DTimer = useRef(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Riddle state
  const [riddlePhase, setRiddlePhase] = useState(null) // null | 'pending' | 'correct' | 'wrong'
  const [riddleChosen, setRiddleChosen] = useState(null)

  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const pathRef      = useRef([])
  const phaseRef     = useRef('idle')
  const drawingRef   = useRef(false)
  const timerRef     = useRef(null)
  const mazeStartTime  = useRef(Date.now())
  const wallHitsRef    = useRef(0)
  const completedRef   = useRef(false)
  const { markActive } = useFeatureDuration('maze', track)

  useEffect(() => {
    return () => {
      if (!completedRef.current) {
        const secs = Math.round((Date.now() - mazeStartTime.current) / 1000)
        if (secs >= 5) track('maze', 'gave_up', { metadata: { cols, rows, wallHits: wallHitsRef.current }, durationSeconds: secs })
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Adaptive cols/rows: use AI recommendation when available
  const cols = (aiSkin?.recommendedCols > 0 && riddlePhase === null) ? aiSkin.recommendedCols : defaultSize.cols
  const rows = (aiSkin?.recommendedRows > 0 && riddlePhase === null) ? aiSkin.recommendedRows : defaultSize.rows

  const grid = useMemo(() => generateMaze(cols, rows, seed), [cols, rows, seed])

  const wallSegs = useMemo(() => {
    const { cw, ch } = cellGeom(cols, rows)
    const segs = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = MARGIN + c * cw
        const y = MARGIN + r * ch
        const w = grid[r][c].walls
        if (w.N) segs.push([x, y, x + cw, y])
        if (w.S) segs.push([x, y + ch, x + cw, y + ch])
        if (w.W) segs.push([x, y, x, y + ch])
        if (w.E) segs.push([x + cw, y, x + cw, y + ch])
      }
    }
    return segs
  }, [grid, cols, rows])

  const baseTheme = BASE_THEMES[themeIdx % BASE_THEMES.length]
  const theme = aiSkin
    ? { ...baseTheme,
        startEmoji: aiSkin.startEmoji || baseTheme.startEmoji,
        endEmoji:   aiSkin.endEmoji   || baseTheme.endEmoji,
        bg:         aiSkin.bgColor    || baseTheme.bg,
        wall:       aiSkin.wallColor  || baseTheme.wall,
      }
    : baseTheme

  // Pick story variant based on actual wall hits at completion time
  function completionStory() {
    if (!aiSkin) return baseTheme.story
    const hits = wallHitsRef.current
    if (hits <= 2) return aiSkin.storyGreat
    if (hits <= 6) return aiSkin.storyOkay
    return aiSkin.storyStruggled
  }

  const mazeEnabled = !featureConfig || (() => {
    const fc = featureConfig.find(f => f.featureName === 'maze')
    return !fc || fc.enabled !== false
  })()
  const canGenerate = mazeEnabled && !offline && !isCreditsBlocked(quota)

  // ── Reset ──────────────────────────────────────────────────────────────────
  function resetDraw() {
    clearTimeout(timerRef.current)
    pathRef.current = []
    setPathPts([])
    drawingRef.current = false
    phaseRef.current = 'idle'
    setPhase('idle')
    mazeStartTime.current = Date.now()
    wallHitsRef.current = 0
    completedRef.current = false
  }

  function newMaze() {
    setSeed((Math.random() * 1e8) | 0)
    setThemeIdx(i => (i + 1) % BASE_THEMES.length)
    setAiSkin(null)
    setRiddlePhase(null)
    setRiddleChosen(null)
    setMaze3DKey(k => k + 1)
    resetDraw()
  }

  useEffect(resetDraw, [grid])

  // ── Freehand drawing logic ─────────────────────────────────────────────────
  const { cw, ch } = cellGeom(cols, rows)
  const resumeRadius = Math.min(cw, ch) * 0.7
  const startRadius  = Math.min(cw, ch) * 0.85
  const endRadius    = Math.min(cw, ch) * 0.42
  const strokeW      = Math.min(cw, ch) * 0.13

  function handleAt(clientX, clientY) {
    if (phaseRef.current === 'success') return
    if (phaseRef.current === 'wall') return
    const [sx, sy] = svgPoint(svgRef.current, clientX, clientY)
    const pts = pathRef.current

    if (!drawingRef.current) {
      if (pts.length > 0) {
        const [lx, ly] = pts[pts.length - 1]
        if (Math.hypot(sx - lx, sy - ly) < resumeRadius) {
          drawingRef.current = true
          return
        }
      }
      const [sx0, sy0] = cellCenter(0, 0, cols, rows)
      if (Math.hypot(sx - sx0, sy - sy0) < startRadius) {
        drawingRef.current = true
        phaseRef.current = 'drawing'
        setPhase('drawing')
        pathRef.current = [[sx0, sy0]]
        setPathPts([[sx0, sy0]])
      }
      return
    }

    if (pts.length === 0) return
    const [lx, ly] = pts[pts.length - 1]
    if (Math.hypot(sx - lx, sy - ly) < 3) return

    if (sx < MARGIN || sy < MARGIN || sx > SVG_W - MARGIN || sy > SVG_H - MARGIN) {
      const moveDist = Math.hypot(sx - lx, sy - ly)
      const tipT = moveDist > 0 ? Math.max(0, (Math.min(
        sx < MARGIN ? (lx - MARGIN) / (lx - sx) : 1,
        sy < MARGIN ? (ly - MARGIN) / (ly - sy) : 1,
        sx > SVG_W - MARGIN ? (SVG_W - MARGIN - lx) / (sx - lx) : 1,
        sy > SVG_H - MARGIN ? (SVG_H - MARGIN - ly) / (sy - ly) : 1,
      ) - 5 / moveDist)) : 0
      const ix = lx + (sx - lx) * tipT
      const iy = ly + (sy - ly) * tipT
      const newPts = [...pts, [ix, iy]]
      pathRef.current = newPts
      setPathPts([...newPts])
      wallHitsRef.current += 1
      drawingRef.current = false
      phaseRef.current = 'wall'
      setPhase('wall')
      setWallMsg(WALL_MSGS[Math.floor(Math.random() * WALL_MSGS.length)])
      timerRef.current = setTimeout(() => {
        if (phaseRef.current === 'wall') { phaseRef.current = 'idle'; setPhase('idle') }
      }, 1500)
      return
    }

    const t = firstWallHit(lx, ly, sx, sy, wallSegs)
    if (t !== null) {
      const moveDist = Math.hypot(sx - lx, sy - ly)
      const tipT = Math.max(0, t - 5 / moveDist)
      const ix = lx + (sx - lx) * tipT
      const iy = ly + (sy - ly) * tipT
      const newPts = [...pts, [ix, iy]]
      pathRef.current = newPts
      setPathPts([...newPts])
      wallHitsRef.current += 1
      drawingRef.current = false
      phaseRef.current = 'wall'
      setPhase('wall')
      setWallMsg(WALL_MSGS[Math.floor(Math.random() * WALL_MSGS.length)])
      timerRef.current = setTimeout(() => {
        if (phaseRef.current === 'wall') {
          phaseRef.current = 'idle'
          setPhase('idle')
        }
      }, 1500)
      return
    }

    const newPts = [...pts, [sx, sy]]
    pathRef.current = newPts
    setPathPts([...newPts])

    const [ex, ey] = cellCenter(rows - 1, cols - 1, cols, rows)
    const inBounds = sx > MARGIN && sy > MARGIN && sx < SVG_W - MARGIN && sy < SVG_H - MARGIN
    if (inBounds && Math.hypot(sx - ex, sy - ey) < endRadius) {
      phaseRef.current = 'success'
      setPhase('success')
      completedRef.current = true
      track('maze', 'complete', { metadata: { cols, rows, wallHits: wallHitsRef.current }, durationSeconds: Math.round((Date.now() - mazeStartTime.current) / 1000) })
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000)
      drawingRef.current = false
    }
  }

  const onMouseDown = useCallback(e => { e.preventDefault(); markActive(); handleAt(e.clientX, e.clientY) }, [grid, wallSegs, cols, rows])
  const onMouseMove = useCallback(e => { if (drawingRef.current) handleAt(e.clientX, e.clientY) }, [grid, wallSegs, cols, rows])
  const onMouseUp   = useCallback(() => { drawingRef.current = false }, [])

  const onTouchStart = useCallback(e => { e.preventDefault(); markActive(); const t = e.touches[0]; handleAt(t.clientX, t.clientY) }, [grid, wallSegs, cols, rows])
  const onTouchMove  = useCallback(e => { e.preventDefault(); const t = e.touches[0]; handleAt(t.clientX, t.clientY) }, [grid, wallSegs, cols, rows])
  const onTouchEnd   = useCallback(() => { drawingRef.current = false }, [])

  useEffect(() => {
    const svg = svgRef.current; if (!svg) return
    svg.addEventListener('touchstart', onTouchStart, { passive: false })
    svg.addEventListener('touchmove',  onTouchMove,  { passive: false })
    svg.addEventListener('touchend',   onTouchEnd,   { passive: false })
    return () => {
      svg.removeEventListener('touchstart', onTouchStart)
      svg.removeEventListener('touchmove',  onTouchMove)
      svg.removeEventListener('touchend',   onTouchEnd)
    }
  }, [onTouchStart, onTouchMove, onTouchEnd, riddlePhase, use3D])

  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  // ── AI Theme + Riddle ──────────────────────────────────────────────────────
  async function handleAiTheme() {
    if (!canGenerate) return
    setLoading(true); setError('')
    try {
      const difficulty = childAge <= 4 ? 'easy' : childAge <= 7 ? 'medium' : 'hard'
      const result = await traceApi.generate(child.id, child.name, childAge, difficulty)
      track('maze', 'ai_theme', { metadata: { difficulty } }); markActive()
      window.__glumbiRefreshQuota?.('maze')
      setSeed((Math.random() * 1e8) | 0)
      setThemeIdx(i => (i + 1) % BASE_THEMES.length)
      setAiSkin(result)
      setRiddlePhase('pending')
      setRiddleChosen(null)
      resetDraw()
    } catch (err) {
      setError(err.message || 'Could not load AI maze.')
    } finally {
      setLoading(false)
    }
  }

  function handleRiddleAnswer(choiceIdx) {
    if (riddlePhase !== 'pending') return
    const correct = choiceIdx === aiSkin.riddleAnswer
    setRiddleChosen(choiceIdx)
    setRiddlePhase(correct ? 'correct' : 'wrong')
    track('maze', correct ? 'riddle_correct' : 'riddle_wrong', {
      metadata: { theme: aiSkin.theme, riddleAnswer: choiceIdx }
    })
    setTimeout(() => {
      setRiddlePhase(null)
    }, 1800)
  }

  function handleRiddleSkip() {
    track('maze', 'riddle_skipped', { metadata: { theme: aiSkin?.theme } })
    setRiddlePhase(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const isSuccess = phase === 'success'

  const handle3DComplete = useCallback(() => {
    if (phaseRef.current === 'success') return
    phaseRef.current = 'success'
    setPhase('success')
    completedRef.current = true
    track('maze', 'complete', { metadata: { cols, rows, wallHits: wallHitsRef.current, mode: '3d' }, durationSeconds: Math.round((Date.now() - mazeStartTime.current) / 1000) })
    setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000)
  }, [cols, rows, track])
  const isWall    = phase === 'wall'
  const WALL_W    = 3
  const iconSize  = Math.min(cw, ch) * 0.55
  const [startX, startY] = cellCenter(0, 0, cols, rows)
  const [endX, endY]     = cellCenter(rows - 1, cols - 1, cols, rows)
  const pathStr = pathPts.map(([x, y]) => `${x},${y}`).join(' ')

  const fsStyle = fullscreen ? {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', flexDirection: 'column',
    background: theme.bg,
    height: '100dvh', width: '100dvw',
    // honour notch / home-indicator on iOS
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
    boxSizing: 'border-box',
  } : {}

  return (
    <div ref={containerRef} style={{ padding: fullscreen ? 0 : '12px 12px 40px', fontFamily: 'Nunito, sans-serif', ...fsStyle }}>
      {showConfetti && <Confetti />}
      {!fullscreen && <FeatureBanner feature="maze" child={child} isMobile={false} />}
      {!fullscreen && <QuotaBanner quota={quota} isMobile={false} />}
      {loading && <ThemeLoader theme={child?.theme} label="Cooking up your maze adventure..." />}
      {error && (
        <div style={{ background:'#fff0f0', border:'1.5px solid #ffb3b3', borderRadius:12, padding:'10px 16px', color:'#c0392b', fontSize:14, marginBottom:12 }}>
          {error}
        </div>
      )}

      {/* ── Riddle screen ───────────────────────────────────────────────── */}
      {riddlePhase && aiSkin && (
        <div style={{
          background: aiSkin.bgColor || '#f3e5f5',
          borderRadius: 20, padding: '24px 20px', marginBottom: 12,
          border: `2px solid ${aiSkin.wallColor || '#7b1fa2'}30`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🤔</div>
          <div style={{ fontWeight: 900, fontSize: 17, color: '#333', marginBottom: 6 }}>
            Unlock your maze!
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#555', marginBottom: 20, lineHeight: 1.5 }}>
            {aiSkin.riddle}
          </div>

          {(riddlePhase === 'pending') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiSkin.riddleChoices?.map((choice, i) => (
                <button key={i} onClick={() => handleRiddleAnswer(i)}
                  style={{
                    padding: '12px 20px', borderRadius: 50, border: `2px solid ${aiSkin.wallColor || '#7b1fa2'}60`,
                    background: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif', color: '#333',
                    transition: 'transform 0.1s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {choice}
                </button>
              ))}
              <button onClick={handleRiddleSkip}
                style={{ marginTop: 4, padding: '8px', border: 'none', background: 'transparent', color: '#999', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                Skip riddle →
              </button>
            </div>
          )}

          {(riddlePhase === 'correct') && (
            <div style={{ fontSize: 48, animation: 'none' }}>
              🎉
              <div style={{ fontSize: 16, fontWeight: 900, color: '#2d8a3e', marginTop: 8 }}>
                Correct! Let's go! 🚀
              </div>
            </div>
          )}

          {(riddlePhase === 'wrong') && (
            <div>
              <div style={{ fontSize: 48 }}>😅</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e53935', marginTop: 8 }}>
                Almost! The answer was: {aiSkin.riddleChoices?.[aiSkin.riddleAnswer]}
              </div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4, fontWeight: 700 }}>
                You can still do the maze! 💪
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Maze ────────────────────────────────────────────────────────── */}
      {!riddlePhase && (
        <>
          {/* 3D mode */}
          {use3D && (
            <div style={fullscreen ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
              {/* Title row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom: fullscreen ? 6 : 8 }}>
                <div style={{ fontWeight:900, fontSize: fullscreen ? 18 : 15, color: fullscreen ? '#fff' : 'var(--primary)',
                              textShadow: fullscreen ? '0 1px 4px rgba(0,0,0,0.4)' : 'none' }}>
                  Walk {theme.startEmoji} to {theme.endEmoji}! · {cols}×{rows} maze
                </div>
                <button onClick={() => { setUse3D(v => !v); setPhase('idle'); phaseRef.current = 'idle'; setPathPts([]); pathRef.current = [] }}
                  style={{ padding:'8px 20px', borderRadius:50, border:'2px solid var(--primary,#ff6b6b)', background:'white', color:'var(--primary,#ff6b6b)', fontWeight:900, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif', flexShrink:0, boxShadow:'0 2px 12px rgba(0,0,0,0.15)', letterSpacing:0.5 }}>
                  🗺️ Back to 2D
                </button>
              </div>

              {/* Canvas block — flex:1 in fullscreen so it takes all remaining space */}
              <div style={{
                position: 'relative',
                width: '100%',
                ...(fullscreen
                  ? { flex: 1, minHeight: 0 }
                  : { height: 'clamp(320px, calc(100dvh - 200px), 960px)' }),
                borderRadius: fullscreen ? 0 : 16,
                overflow: 'hidden',
                boxShadow: fullscreen ? 'none' : '0 6px 32px rgba(0,0,0,0.18)',
              }}>
                  <Maze3D key={maze3DKey} grid={grid} cols={cols} rows={rows} theme={theme} aiSkin={aiSkin} onComplete={handle3DComplete} onWallHit={() => {
                    wallHitsRef.current += 1
                    const msg = WALL_MSGS[Math.floor(Math.random() * WALL_MSGS.length)]
                    setWallMsg3D(msg)
                    clearTimeout(wallMsg3DTimer.current)
                    wallMsg3DTimer.current = setTimeout(() => setWallMsg3D(''), 1200)
                  }} />
                  {wallMsg3D && (
                    <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', background:'rgba(229,57,53,0.92)', color:'white', fontWeight:900, fontSize:16, borderRadius:50, padding:'8px 20px', pointerEvents:'none', whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(0,0,0,0.25)', zIndex:10 }}>
                      {wallMsg3D}
                    </div>
                  )}

                  {/* Fullscreen toggle */}
                  {!fullscreen && (
                    <button onClick={() => containerRef.current?.requestFullscreen()} title="Fullscreen"
                      style={{ position:'absolute', top:10, right:10, zIndex:10, width:32, height:32, minWidth:32, minHeight:32, borderRadius:8, border:'1.5px solid rgba(0,0,0,0.1)', background:'rgba(255,255,255,0.9)', color:'#888', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
                      </svg>
                    </button>
                  )}
                  {fullscreen && (
                    <button onClick={() => document.exitFullscreen()} title="Exit fullscreen"
                      style={{ position:'absolute', top:10, right:10, zIndex:20, width:36, height:36, minWidth:36, minHeight:36, borderRadius:10, border:'none', background:'rgba(255,255,255,0.95)', color:'#555', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0, boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/>
                      </svg>
                    </button>
                  )}
                </div>

              {isSuccess && (
                <div style={{ background:'linear-gradient(135deg,#6bcb77,#4caf50)', borderRadius:16, padding:'16px 20px', margin:'12px 0', color:'white', textAlign:'center', fontWeight:800, fontSize:16 }}>
                  {completionStory()}
                </div>
              )}
            </div>
          )}

          {/* 2D mode */}
          {!use3D && <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom: fullscreen ? 6 : 12, padding: fullscreen ? '10px 16px 0' : 0 }}>
            <span style={{ fontSize: fullscreen ? 36 : 28 }}>{theme.startEmoji}</span>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:900, fontSize: fullscreen ? 20 : 17, color: fullscreen ? '#333' : 'var(--primary)' }}>
                Guide {theme.startEmoji} to {theme.endEmoji}!
              </div>
              <div style={{ fontSize:12, color:'#888', marginTop:2 }}>
                {cols}×{rows} maze · draw from {theme.startEmoji} to {theme.endEmoji}
              </div>
              <button onClick={() => { setUse3D(v => !v); setPhase('idle'); phaseRef.current = 'idle'; setPathPts([]); pathRef.current = [] }}
                style={{ marginTop:8, padding:'8px 22px', borderRadius:50, border:'none', background:'var(--primary,#ff6b6b)', color:'white', fontWeight:900, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif', boxShadow:'0 4px 14px rgba(0,0,0,0.2)', letterSpacing:0.5 }}>
                🕹️ Try 3D Mode!
              </button>
            </div>
            <span style={{ fontSize: fullscreen ? 36 : 28 }}>{theme.endEmoji}</span>
          </div>

          <div style={{ position:'relative', width:'100%' }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              style={{
                width: '100%',
                height: fullscreen ? 'calc(100dvh - 164px)' : 'auto',
                display: 'block', cursor: 'crosshair',
                background: theme.bg,
                borderRadius: fullscreen ? 0 : 16,
                touchAction: 'none', userSelect: 'none',
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {pathPts.length > 1 && (
                <polyline
                  points={pathStr}
                  fill="none"
                  stroke={isWall ? '#ff6b6b' : isSuccess ? '#6bcb77' : 'var(--primary,#ff6b6b)'}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.8}
                />
              )}

              {grid.flat().map(({ r, c, walls }) => {
                const x = MARGIN + c * cw
                const y = MARGIN + r * ch
                return (
                  <g key={`w-${r}-${c}`}>
                    {walls.N && <line x1={x}    y1={y}    x2={x+cw} y2={y}    stroke={theme.wall} strokeWidth={WALL_W} strokeLinecap="square" />}
                    {walls.S && <line x1={x}    y1={y+ch} x2={x+cw} y2={y+ch} stroke={theme.wall} strokeWidth={WALL_W} strokeLinecap="square" />}
                    {walls.W && <line x1={x}    y1={y}    x2={x}    y2={y+ch} stroke={theme.wall} strokeWidth={WALL_W} strokeLinecap="square" />}
                    {walls.E && <line x1={x+cw} y1={y}    x2={x+cw} y2={y+ch} stroke={theme.wall} strokeWidth={WALL_W} strokeLinecap="square" />}
                  </g>
                )
              })}

              <rect x={MARGIN} y={MARGIN} width={SVG_W - MARGIN * 2} height={SVG_H - MARGIN * 2}
                fill="none" stroke={theme.wall} strokeWidth={WALL_W + 1} />

              <circle cx={startX} cy={startY} r={Math.min(cw, ch) * 0.38}
                fill="var(--primary,#ff6b6b)" opacity={0.85} />
              <text x={startX} y={startY + iconSize * 0.38} textAnchor="middle" fontSize={iconSize}>
                {theme.startEmoji}
              </text>

              <circle cx={endX} cy={endY} r={Math.min(cw, ch) * 0.38}
                fill={isSuccess ? '#6bcb77' : 'var(--accent,#ffa502)'} opacity={0.85} />
              <text x={endX} y={endY + iconSize * 0.38} textAnchor="middle" fontSize={iconSize}>
                {theme.endEmoji}
              </text>

              {isSuccess && (
                <>
                  <circle cx={endX} cy={endY} r={Math.min(cw, ch) * 0.6} fill="#6bcb77" opacity={0.2} />
                  <text x={SVG_W / 2} y={MARGIN - 8} textAnchor="middle" fontSize={22} fontWeight="900" fill="#2d8a3e">
                    🎉 You made it!
                  </text>
                </>
              )}
              {isWall && (
                <text x={SVG_W / 2} y={MARGIN - 8} textAnchor="middle" fontSize={20} fontWeight="900" fill="#e53935">
                  {wallMsg}
                </text>
              )}
            </svg>

            {/* Success story overlay (fullscreen) */}
            {isSuccess && fullscreen && (
              <div style={{
                position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg,#6bcb77,#4caf50)',
                borderRadius: 16, padding: '14px 24px',
                color: 'white', textAlign: 'center', fontWeight: 800, fontSize: 15,
                pointerEvents: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                maxWidth: '90%',
              }}>
                {completionStory()}
              </div>
            )}

            {!fullscreen && (
              <button onClick={() => containerRef.current?.requestFullscreen()} title="Fullscreen"
                style={{ position:'absolute', top:10, right:10, zIndex:10, width:32, height:32, minWidth:32, minHeight:32, borderRadius:8, border:'1.5px solid rgba(0,0,0,0.1)', background:'rgba(255,255,255,0.9)', color:'#888', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
                </svg>
              </button>
            )}
            {fullscreen && (
              <button onClick={() => document.exitFullscreen()} title="Exit fullscreen"
                style={{ position:'absolute', top:10, right:10, zIndex:20, width:36, height:36, minWidth:36, minHeight:36, borderRadius:10, border:'none', background:'rgba(255,255,255,0.95)', color:'#555', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0, boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/>
                </svg>
              </button>
            )}
          </div>

          {/* Success story (normal mode) */}
          {isSuccess && !fullscreen && (
            <div style={{ background:'linear-gradient(135deg,#6bcb77,#4caf50)', borderRadius:16, padding:'16px 20px', margin:'16px 0', color:'white', textAlign:'center', fontWeight:800, fontSize:16 }}>
              {completionStory()}
            </div>
          )}
          </>}

          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={() => { resetDraw(); if (use3D) setMaze3DKey(k => k + 1) }}
              style={{ flex:1, padding:'10px 0', borderRadius:50, border:'none', background:'var(--primary-lt)', color:'var(--primary,#ff6b6b)', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
              🔄 Replay
            </button>
            <button onClick={newMaze}
              style={{ flex:1, padding:'10px 0', borderRadius:50, border:'none', background:'linear-gradient(135deg,var(--primary,#ff6b6b),var(--accent,#ffa502))', color:'white', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
              🆕 New Maze
            </button>
            {canGenerate && (
              <button onClick={handleAiTheme} disabled={loading}
                style={{ flex:1, padding:'10px 0', borderRadius:50, border:'none', background: loading ? '#eee' : 'linear-gradient(135deg,var(--primary,#ff6b6b),var(--accent,#ffa502))', color: loading ? '#aaa' : 'white', fontWeight:800, fontSize:13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily:'Nunito,sans-serif', boxShadow: loading ? 'none' : '0 2px 10px rgba(0,0,0,0.18)' }}>
                ✨ AI Adventure
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
