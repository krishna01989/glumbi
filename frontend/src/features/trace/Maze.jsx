import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { traceApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'

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

  // Iterative DFS to avoid stack overflow on large grids
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

function solveMaze(grid, rows, cols) {
  const DIR_VECS = { N: [-1,0], S: [1,0], E: [0,1], W: [0,-1] }
  const queue = [[[0, 0]]]
  const seen = new Set(['0,0'])
  while (queue.length) {
    const path = queue.shift()
    const [r, c] = path[path.length - 1]
    if (r === rows - 1 && c === cols - 1) return path
    for (const [dir, [dr, dc]] of Object.entries(DIR_VECS)) {
      if (!grid[r][c].walls[dir]) {
        const nr = r + dr, nc = c + dc
        const k = `${nr},${nc}`
        if (!seen.has(k) && nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          seen.add(k)
          queue.push([...path, [nr, nc]])
        }
      }
    }
  }
  return []
}

// Grid size by age — bigger grid = more complex maze
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

function cellGeom(r, c, cols, rows) {
  const cw = (SVG_W - MARGIN * 2) / cols
  const ch = (SVG_H - MARGIN * 2) / rows
  return { x: MARGIN + c * cw, y: MARGIN + r * ch, cw, ch }
}

function cellCenter(r, c, cols, rows) {
  const { x, y, cw, ch } = cellGeom(r, c, cols, rows)
  return [x + cw / 2, y + ch / 2]
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

function hitCell(sx, sy, cols, rows) {
  const cw = (SVG_W - MARGIN * 2) / cols
  const ch = (SVG_H - MARGIN * 2) / rows
  const c = Math.floor((sx - MARGIN) / cw)
  const r = Math.floor((sy - MARGIN) / ch)
  if (r < 0 || r >= rows || c < 0 || c >= cols) return null
  return [r, c]
}

// ── Built-in themes (AI skins these) ────────────────────────────────────────
const BASE_THEMES = [
  { bg: '#fef9e7', wall: '#795548', floor: '#fffde7', startEmoji: '🦊', endEmoji: '🏡', story: 'The clever fox found the right path home! 🌟' },
  { bg: '#e8f5e9', wall: '#388e3c', floor: '#f1f8e9', startEmoji: '🐝', endEmoji: '🌸', story: 'Buzz buzz! The bee found the sweetest flower! 🌸' },
  { bg: '#e8eaf6', wall: '#3949ab', floor: '#ede7f6', startEmoji: '🚀', endEmoji: '🌙', story: '3… 2… 1… Blast off to the moon! 🚀' },
  { bg: '#e0f7fa', wall: '#00838f', floor: '#e0f7fa', startEmoji: '🐟', endEmoji: '🏰', story: 'The little fish found the coral castle! 🐠' },
  { bg: '#fce4ec', wall: '#c2185b', floor: '#fff8f8', startEmoji: '🐱', endEmoji: '🧶', story: 'Meow! The curious cat found the yarn ball! 🐱' },
]

const DEAD_END_MSGS = ['Oops! Dead end! 🧱', 'Wrong way! Go back! 🔄', 'Dead end! Try again! ↩️']

export default function Maze({ child, quota, featureConfig }) {
  const offline = useOffline()
  const childAge = child?.birthYear ? new Date().getFullYear() - child.birthYear : 6
  const { cols, rows } = gridSize(childAge)

  const [seed, setSeed]       = useState(() => (Math.random() * 1e8) | 0)
  const [themeIdx, setThemeIdx] = useState(0)
  const [aiSkin, setAiSkin]   = useState(null)   // overrides theme emojis/story/bg
  const [cellTrail, setCellTrail] = useState([])
  const [phase, setPhase]     = useState('idle') // idle | drawing | deadend | success
  const [deadMsg, setDeadMsg] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const trailRef     = useRef([])
  const phaseRef     = useRef('idle')
  const drawingRef   = useRef(false)
  const deadCountRef = useRef(0)
  const timerRef     = useRef(null)

  const grid     = useMemo(() => generateMaze(cols, rows, seed), [cols, rows, seed])
  const solution = useMemo(() => solveMaze(grid, rows, cols),    [grid, rows, cols])
  const solSet   = useMemo(() => new Set(solution.map(([r,c]) => `${r},${c}`)), [solution])

  const baseTheme = BASE_THEMES[themeIdx % BASE_THEMES.length]
  const theme = aiSkin
    ? { ...baseTheme, startEmoji: aiSkin.startEmoji || baseTheme.startEmoji,
        endEmoji: aiSkin.endEmoji || baseTheme.endEmoji,
        story: aiSkin.completionStory || baseTheme.story,
        bg: aiSkin.bgColor || baseTheme.bg }
    : baseTheme

  const mazeEnabled = !featureConfig || (() => {
    const fc = featureConfig.find(f => f.featureName === 'maze')
    return !fc || fc.enabled !== false
  })()
  const canGenerate = mazeEnabled && !offline && quota && quota.used < quota.limit

  // ── Reset ──────────────────────────────────────────────────────────────────
  function resetDraw() {
    clearTimeout(timerRef.current)
    trailRef.current = []
    setCellTrail([])
    drawingRef.current = false
    phaseRef.current = 'idle'
    setPhase('idle')
    deadCountRef.current = 0
  }

  function newMaze() {
    setSeed((Math.random() * 1e8) | 0)
    setThemeIdx(i => (i + 1) % BASE_THEMES.length)
    setAiSkin(null)
    resetDraw()
  }

  // Reset when grid changes (age changes)
  useEffect(resetDraw, [grid])

  // ── Pointer logic ──────────────────────────────────────────────────────────
  function handleCell(r, c) {
    if (phaseRef.current === 'deadend' || phaseRef.current === 'success') return
    const trail = trailRef.current
    const lastKey = trail.length ? `${trail[trail.length-1][0]},${trail[trail.length-1][1]}` : null
    const key = `${r},${c}`
    if (key === lastKey) return

    // Must start at (0,0)
    if (!drawingRef.current) {
      if (r === 0 && c === 0) {
        drawingRef.current = true
        phaseRef.current = 'drawing'
        setPhase('drawing')
        trailRef.current = [[0, 0]]
        setCellTrail([[0, 0]])
      }
      return
    }

    // Allow backtracking
    if (trail.length >= 2) {
      const prev = trail[trail.length - 2]
      if (prev[0] === r && prev[1] === c) {
        const trimmed = trail.slice(0, -1)
        trailRef.current = trimmed
        setCellTrail([...trimmed])
        deadCountRef.current = Math.max(0, deadCountRef.current - 1)
        return
      }
    }

    // Check wall between last cell and new cell (only for adjacent moves)
    if (trail.length > 0) {
      const [lr, lc] = trail[trail.length - 1]
      const dr = r - lr, dc = c - lc
      if (Math.abs(dr) + Math.abs(dc) === 1) {
        const dir = dr === -1 ? 'N' : dr === 1 ? 'S' : dc === -1 ? 'W' : 'E'
        if (grid[lr][lc].walls[dir]) return // blocked by wall
      } else if (Math.abs(dr) + Math.abs(dc) > 2) {
        return // too far a jump, ignore
      }
    }

    const newTrail = [...trail, [r, c]]
    trailRef.current = newTrail
    setCellTrail([...newTrail])

    if (!solSet.has(key)) {
      deadCountRef.current++
      if (deadCountRef.current >= 3) {
        triggerDeadEnd(newTrail)
        return
      }
    } else {
      deadCountRef.current = 0
    }

    // Success
    if (r === rows - 1 && c === cols - 1) {
      phaseRef.current = 'success'
      setPhase('success')
      drawingRef.current = false
    }
  }

  function triggerDeadEnd(trail) {
    phaseRef.current = 'deadend'
    setPhase('deadend')
    setDeadMsg(DEAD_END_MSGS[Math.floor(Math.random() * DEAD_END_MSGS.length)])
    drawingRef.current = false
    deadCountRef.current = 0
    timerRef.current = setTimeout(() => {
      const trimmed = trail.filter(([r,c]) => solSet.has(`${r},${c}`))
      trailRef.current = trimmed
      setCellTrail([...trimmed])
      phaseRef.current = 'idle'
      setPhase('idle')
    }, 1500)
  }

  function handleAt(clientX, clientY) {
    const [sx, sy] = svgPoint(svgRef.current, clientX, clientY)
    const cell = hitCell(sx, sy, cols, rows)
    if (cell) handleCell(cell[0], cell[1])
  }

  const onMouseDown = useCallback(e => { e.preventDefault(); handleAt(e.clientX, e.clientY) }, [grid, solSet])
  const onMouseMove = useCallback(e => { if (drawingRef.current) handleAt(e.clientX, e.clientY) }, [grid, solSet])
  const onMouseUp   = useCallback(() => { drawingRef.current = false }, [])

  const onTouchStart = useCallback(e => { e.preventDefault(); const t = e.touches[0]; handleAt(t.clientX, t.clientY) }, [grid, solSet])
  const onTouchMove  = useCallback(e => { e.preventDefault(); const t = e.touches[0]; handleAt(t.clientX, t.clientY) }, [grid, solSet])
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
  }, [onTouchStart, onTouchMove, onTouchEnd])

  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  // ── AI Theme ───────────────────────────────────────────────────────────────
  async function handleAiTheme() {
    if (!canGenerate) return
    setLoading(true); setError('')
    try {
      const difficulty = childAge <= 4 ? 'easy' : childAge <= 7 ? 'medium' : 'hard'
      const result = await traceApi.generate(child.id, child.name, childAge, difficulty)
      setSeed((Math.random() * 1e8) | 0)
      setThemeIdx(i => (i + 1) % BASE_THEMES.length)
      setAiSkin(result)
      resetDraw()
    } catch (err) {
      setError(err.message || 'Could not load AI theme.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const isSuccess  = phase === 'success'
  const isDeadEnd  = phase === 'deadend'
  const trailSet   = new Set(cellTrail.map(([r,c]) => `${r},${c}`))
  const WALL_W     = 3
  const { cw, ch } = cellGeom(0, 0, cols, rows)
  const iconSize   = Math.min(cw, ch) * 0.55
  const [startX, startY] = cellCenter(0, 0, cols, rows)
  const [endX, endY]     = cellCenter(rows - 1, cols - 1, cols, rows)

  const fsStyle = fullscreen ? {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', flexDirection: 'column',
    background: theme.bg, height: '100dvh', width: '100dvw',
  } : {}

  return (
    <div ref={containerRef} style={{ padding: fullscreen ? 0 : '12px 12px 40px', fontFamily: 'Nunito, sans-serif', ...fsStyle }}>
      {!fullscreen && <FeatureBanner feature="maze" child={child} isMobile={false} />}
      {!fullscreen && <QuotaBanner quota={quota} isMobile={false} />}
      {loading && <ThemeLoader theme={child?.theme} label="Generating maze theme..." />}
      {error && (
        <div style={{ background:'#fff0f0', border:'1.5px solid #ffb3b3', borderRadius:12, padding:'10px 16px', color:'#c0392b', fontSize:14, marginBottom:12 }}>
          {error}
        </div>
      )}

      {/* Header */}
      {!fullscreen && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:12 }}>
          <span style={{ fontSize:28 }}>{theme.startEmoji}</span>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:900, fontSize:17, color:'var(--primary)' }}>
              Guide {theme.startEmoji} to {theme.endEmoji}!
            </div>
            <div style={{ fontSize:12, color:'#888', marginTop:2 }}>
              {cols}×{rows} maze · start top-left · new maze every time!
            </div>
          </div>
          <span style={{ fontSize:28 }}>{theme.endEmoji}</span>
        </div>
      )}

      {/* Canvas */}
      <div style={{ position:'relative', width:'100%' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{
            width: '100%',
            height: fullscreen ? 'calc(100dvh - 116px)' : 'auto',
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
          {/* Cell floors */}
          {grid.flat().map(({ r, c }) => {
            const { x, y } = cellGeom(r, c, cols, rows)
            const k = `${r},${c}`
            const inTrail = trailSet.has(k)
            const onSol   = solSet.has(k)
            return (
              <rect key={k} x={x + 1} y={y + 1} width={cw - 2} height={ch - 2}
                fill={inTrail
                  ? (isDeadEnd ? '#ff6b6b' : onSol ? 'var(--primary,#ff6b6b)' : '#ff9800')
                  : theme.floor}
                opacity={inTrail ? 0.55 : 1}
              />
            )
          })}

          {/* Walls */}
          {grid.flat().map(({ r, c, walls }) => {
            const { x, y } = cellGeom(r, c, cols, rows)
            return (
              <g key={`w-${r}-${c}`}>
                {walls.N && <line x1={x}    y1={y}    x2={x+cw} y2={y}    stroke={theme.wall} strokeWidth={WALL_W} strokeLinecap="square" />}
                {walls.S && <line x1={x}    y1={y+ch} x2={x+cw} y2={y+ch} stroke={theme.wall} strokeWidth={WALL_W} strokeLinecap="square" />}
                {walls.W && <line x1={x}    y1={y}    x2={x}    y2={y+ch} stroke={theme.wall} strokeWidth={WALL_W} strokeLinecap="square" />}
                {walls.E && <line x1={x+cw} y1={y}    x2={x+cw} y2={y+ch} stroke={theme.wall} strokeWidth={WALL_W} strokeLinecap="square" />}
              </g>
            )
          })}

          {/* Outer border */}
          <rect x={MARGIN} y={MARGIN} width={SVG_W - MARGIN * 2} height={SVG_H - MARGIN * 2}
            fill="none" stroke={theme.wall} strokeWidth={WALL_W + 1} />

          {/* Start cell highlight */}
          <circle cx={startX} cy={startY} r={Math.min(cw, ch) * 0.38}
            fill="var(--primary,#ff6b6b)" opacity={0.85} />
          <text x={startX} y={startY + iconSize * 0.38} textAnchor="middle" fontSize={iconSize}>
            {theme.startEmoji}
          </text>

          {/* End cell highlight */}
          <circle cx={endX} cy={endY} r={Math.min(cw, ch) * 0.38}
            fill={isSuccess ? '#6bcb77' : 'var(--accent,#ffa502)'} opacity={0.85} />
          <text x={endX} y={endY + iconSize * 0.38} textAnchor="middle" fontSize={iconSize}>
            {theme.endEmoji}
          </text>

          {/* Status messages */}
          {isSuccess && (
            <>
              <circle cx={endX} cy={endY} r={Math.min(cw, ch) * 0.6} fill="#6bcb77" opacity={0.2} />
              <text x={SVG_W / 2} y={MARGIN - 8} textAnchor="middle" fontSize={22} fontWeight="900" fill="#2d8a3e">
                🎉 You made it!
              </text>
            </>
          )}
          {isDeadEnd && (
            <text x={SVG_W / 2} y={MARGIN - 8} textAnchor="middle" fontSize={20} fontWeight="900" fill="#e53935">
              {deadMsg}
            </text>
          )}
        </svg>

        {/* Success story overlay (fullscreen only) */}
        {isSuccess && fullscreen && (
          <div style={{
            position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg,#6bcb77,#4caf50)',
            borderRadius: 16, padding: '14px 24px',
            color: 'white', textAlign: 'center', fontWeight: 800, fontSize: 15,
            pointerEvents: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            maxWidth: '90%',
          }}>
            {theme.story}
          </div>
        )}

        {/* Fullscreen buttons (same icons as Draw) */}
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

      {/* Success story (non-fullscreen) */}
      {isSuccess && !fullscreen && (
        <div style={{ background:'linear-gradient(135deg,#6bcb77,#4caf50)', borderRadius:16, padding:'16px 20px', margin:'16px 0', color:'white', textAlign:'center', fontWeight:800, fontSize:16 }}>
          {theme.story}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <button onClick={resetDraw}
          style={{ flex:1, padding:'10px 0', borderRadius:50, border:'none', background:'var(--primary-lt)', color:'var(--primary,#ff6b6b)', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
          🔄 Replay
        </button>
        <button onClick={newMaze}
          style={{ flex:1, padding:'10px 0', borderRadius:50, border:'none', background:'linear-gradient(135deg,var(--primary,#ff6b6b),var(--accent,#ffa502))', color:'white', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
          🆕 New Maze
        </button>
        {canGenerate && (
          <button onClick={handleAiTheme} disabled={loading}
            style={{ flex:1, padding:'10px 0', borderRadius:50, border:'2px solid var(--accent,#ffa502)', background: loading ? '#eee' : 'var(--accent,#ffa502)', color: loading ? '#aaa' : 'white', fontWeight:800, fontSize:13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily:'Nunito,sans-serif' }}>
            ✨ AI Theme
          </button>
        )}
      </div>
    </div>
  )
}
