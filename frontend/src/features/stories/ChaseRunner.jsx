import { useRef, useEffect, useState } from 'react'
import GameIntroScreen from './GameIntroScreen'

// ── Age difficulty (platform brackets: ≤4, ≤6, ≤8, 9–10) ──────────────────
function difficulty(birthYear) {
  const age = birthYear ? new Date().getFullYear() - birthYear : 7
  if (age <= 4) return { speed: 2.0, ghostSpeed: 1.2, numGhosts: 1, dotDensity: 0.40, loopFactor: 0.70, label: 'Easy' }
  if (age <= 6) return { speed: 3.0, ghostSpeed: 1.8, numGhosts: 1, dotDensity: 0.55, loopFactor: 0.45, label: 'Easy' }
  if (age <= 8) return { speed: 4.5, ghostSpeed: 2.8, numGhosts: 2, dotDensity: 0.70, loopFactor: 0.22, label: 'Medium' }
  return             { speed: 5.5, ghostSpeed: 3.4, numGhosts: 3, dotDensity: 0.80, loopFactor: 0.08, label: 'Hard' }
}

// ── Maze generation (recursive backtracker + loop removal) ─────────────────
// loopFactor: 0=perfect maze (many dead ends), 1=fully open (no walls)
const COLS = 15, ROWS = 13, CELL = 36

function generateMaze(loopFactor) {
  // Grid: 1=wall, 0=open. Outer border is always wall.
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1))

  // Cell grid sits at odd indices: cell (cx,cy) → grid (cx*2+1, cy*2+1)
  const CX = Math.floor(COLS / 2), CY = Math.floor(ROWS / 2)
  const toG = (cx, cy) => [cx * 2 + 1, cy * 2 + 1]

  // Open all cell centres
  for (let cy = 0; cy < CY; cy++)
    for (let cx = 0; cx < CX; cx++) {
      const [gc, gr] = toG(cx, cy); grid[gr][gc] = 0
    }

  // Recursive backtracker to carve passages
  const visited = Array.from({ length: CY }, () => Array(CX).fill(false))
  const stack = [[0, 0]]; visited[0][0] = true
  const CDIRS = [[0,-1],[0,1],[-1,0],[1,0]]
  while (stack.length) {
    const [cc, cr] = stack[stack.length - 1]
    const nbrs = CDIRS.map(([dc,dr]) => [cc+dc, cr+dr])
      .filter(([nc,nr]) => nc >= 0 && nr >= 0 && nc < CX && nr < CY && !visited[nr][nc])
    if (nbrs.length) {
      const [nc, nr] = nbrs[Math.floor(Math.random() * nbrs.length)]
      const [gc, gr] = toG(cc, cr), [gnc, gnr] = toG(nc, nr)
      grid[(gr + gnr) / 2][(gc + gnc) / 2] = 0   // carve wall between cells
      visited[nr][nc] = true; stack.push([nc, nr])
    } else { stack.pop() }
  }

  // Punch extra holes to create loops — higher loopFactor = more open = easier
  for (let r = 1; r < ROWS - 1; r++)
    for (let c = 1; c < COLS - 1; c++)
      if (grid[r][c] === 1 && Math.random() < loopFactor) grid[r][c] = 0

  return grid
}

const DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] }
// openCells and isWall are per-game — created inside the game loop after maze generation
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Emoji rendering ────────────────────────────────────────────────────────
function drawEmoji(ctx, emoji, cx, cy, size) {
  ctx.save()
  ctx.font = `${Math.round(size)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, cx, cy)
  ctx.restore()
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ChaseRunner({ runnerLevelJson, characterEmoji, theme, birthYear, onClose }) {
  const diff = difficulty(birthYear)
  const col  = theme?.primary || '#FF6B6B'

  let level = {}
  try { level = JSON.parse(runnerLevelJson || '{}') } catch {}
  const collectEmojis = Array.isArray(level.collectibles) ? level.collectibles : ['⭐','💎','🍀','🌟']
  const ghostEmojis   = Array.isArray(level.obstacles)    ? level.obstacles    : ['👻','🐉','🌊']
  const narration     = level.glumbiNarration || 'Collect all the story items — dodge the obstacles!'
  const victoryMsg    = level.endLine         || 'Amazing! You collected everything!'

  const canvasRef = useRef(null)
  const dirRef    = useRef(null)
  const pausedRef = useRef(false)
  const [paused, setPaused]   = useState(false)
  const [phase, setPhase]     = useState('intro')
  const [result, setResult]   = useState(null)

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  useEffect(() => {
    window.addEventListener('glumbi-force-exit', onClose)
    return () => window.removeEventListener('glumbi-force-exit', onClose)
  }, [onClose])

  // ── Keyboard + swipe controls ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    const keyMap = { ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',
                     w:'up',s:'down',a:'left',d:'right' }
    const onKey = e => {
      if (e.key === 'Escape' || e.key === 'p') { togglePause(); return }
      if (pausedRef.current) return
      if (keyMap[e.key]) { e.preventDefault(); dirRef.current = keyMap[e.key] }
    }
    let sx = 0, sy = 0
    const onTS = e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY }
    const onTE = e => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
      dirRef.current = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTS, { passive: true })
    window.addEventListener('touchend', onTE, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTS)
      window.removeEventListener('touchend', onTE)
    }
  }, [phase])

  // ── Game loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const syncSize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(canvas)

    // Generate maze for this game session based on age difficulty
    const maze = generateMaze(diff.loopFactor)
    const isWall = (c, r) => r < 0 || r >= ROWS || c < 0 || c >= COLS || maze[r][c] === 1
    const openCells = () => {
      const out = []
      for (let r = 1; r < ROWS - 1; r++)
        for (let c = 1; c < COLS - 1; c++)
          if (!isWall(c, r)) out.push([c, r])
      return out
    }

    // Build dots + special emoji cells
    const cells = shuffle(openCells())
    const ghostStarts = [[1,1],[COLS-2,1],[COLS-2,ROWS-2],[1,ROWS-2]].filter(([c,r]) => !isWall(c,r))
    // Use nearest odd-indexed position so player always starts on an open cell
    const psC = Math.floor(COLS / 2) % 2 === 0 ? Math.floor(COLS / 2) - 1 : Math.floor(COLS / 2)
    const psR = Math.floor(ROWS / 2) % 2 === 0 ? Math.floor(ROWS / 2) - 1 : Math.floor(ROWS / 2)
    maze[psR][psC] = 0  // force open just in case
    const playerStart = [psC, psR]
    const occupied    = new Set([...ghostStarts.map(([c,r]) => `${c},${r}`), `${playerStart[0]},${playerStart[1]}`])
    const eligible    = cells.filter(([c,r]) => !occupied.has(`${c},${r}`) && Math.random() < diff.dotDensity)

    // Map: key → emoji for special cells (collectible emojis scattered every ~5 dots)
    const specialMap = new Map()
    eligible.forEach(([c,r], i) => {
      if (i % 5 === 0) specialMap.set(`${c},${r}`, collectEmojis[Math.floor(i / 5) % collectEmojis.length])
    })
    const allDots = new Set(eligible.map(([c,r]) => `${c},${r}`))

    const numGhosts = Math.min(ghostStarts.length, diff.numGhosts)
    const ghosts = ghostStarts.slice(0, numGhosts).map(([c,r], i) => ({
      x: c, y: r, dir: ['up','down','left','right'][i % 4],
      emoji: ghostEmojis[i % ghostEmojis.length], timer: 0,
    }))

    const st = {
      px: playerStart[0], py: playerStart[1],
      dir: 'right', pendingDir: null, moveTimer: 0,
      dots: new Set(allDots), total: allDots.size,
      score: 0, lives: 3, invincible: 0,
      alive: true, won: false, walkT: 0,
      started: false,  // ghosts don't move until player makes first move
    }

    let rafId, prev = null

    function ghostAI(g, dt) {
      g.timer -= dt
      if (g.timer > 0) return
      const canGo = d => { const [dx,dy] = DIRS[d]; return !isWall(Math.round(g.x)+dx, Math.round(g.y)+dy) }
      if (!canGo(g.dir)) {
        const opts = Object.keys(DIRS).filter(canGo)
        g.dir = opts.length ? opts[Math.floor(Math.random() * opts.length)] : g.dir
      } else if (Math.random() < 0.25) {
        const opts = Object.keys(DIRS).filter(canGo)
        if (opts.length) g.dir = opts[Math.floor(Math.random() * opts.length)]
      }
      const [dx,dy] = DIRS[g.dir]
      g.x = Math.round(g.x) + dx
      g.y = Math.round(g.y) + dy
      g.timer = 1 / diff.ghostSpeed
    }

    function frame(ts) {
      if (pausedRef.current) { prev = null; rafId = requestAnimationFrame(frame); return }
      if (!prev) prev = ts
      const dt = Math.min((ts - prev) / 1000, 0.05)
      prev = ts

      const W = canvas.width, H = canvas.height
      if (!W || !H) { rafId = requestAnimationFrame(frame); return }

      // Pills sit above the maze
      const PILL_H = 24, PILL_TOP = 6
      const hudH   = PILL_TOP + PILL_H + 6
      const scale  = Math.min(W / (COLS * CELL), (H - hudH) / (ROWS * CELL))
      const cs     = CELL * scale
      const offX   = (W - COLS * cs) / 2
      const offY   = hudH
      const toSX   = c => offX + c * cs + cs / 2
      const toSY   = r => offY + r * cs + cs / 2

      // ── Physics ──────────────────────────────────────────────────────
      if (st.alive && !st.won) {
        if (dirRef.current) { st.pendingDir = dirRef.current; dirRef.current = null }
        const tryMove = d => {
          const [dx,dy] = DIRS[d]
          const nx = Math.round(st.px)+dx, ny = Math.round(st.py)+dy
          if (!isWall(nx,ny)) { st.px=nx; st.py=ny; st.dir=d; return true }
          return false
        }
        if (st.pendingDir && !st.started) {
          // First move: unfreeze on success
          st.moveTimer -= dt
          if (st.moveTimer <= 0) {
            st.moveTimer = 1 / diff.speed
            if (tryMove(st.pendingDir)) { st.pendingDir = null; st.started = true }
          }
        } else if (st.started) {
          // Classic Pac-Man: try queued direction then auto-continue in current direction
          st.moveTimer -= dt
          if (st.moveTimer <= 0) {
            st.moveTimer = 1 / diff.speed
            if (!(st.pendingDir && tryMove(st.pendingDir))) tryMove(st.dir)
            else st.pendingDir = null
          }
        }
        const key = `${st.px},${st.py}`
        if (st.dots.has(key)) { st.dots.delete(key); st.score++; if (!st.dots.size) st.won = true }
        if (st.started) for (const g of ghosts) ghostAI(g, dt)
        if (st.invincible > 0) {
          st.invincible -= dt
        } else {
          for (const g of ghosts) {
            if (Math.round(g.x) === st.px && Math.round(g.y) === st.py) {
              st.lives--
              if (st.lives <= 0) { st.alive = false } else {
                // respawn at start with 2s invincibility
                st.px = playerStart[0]; st.py = playerStart[1]
                st.dir = 'right'; st.pendingDir = null
                st.invincible = 2; st.started = false
              }
              break
            }
          }
        }
        st.walkT += dt
      }

      // ── Draw background ───────────────────────────────────────────────
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      // Walls
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!isWall(c,r)) continue
        const wx = offX + c * cs, wy = offY + r * cs
        ctx.fillStyle = col
        ctx.fillRect(wx+1, wy+1, cs-2, cs-2)
        ctx.fillStyle = 'rgba(255,255,255,0.14)'
        ctx.fillRect(wx+3, wy+3, cs-6, 3)
        ctx.fillRect(wx+3, wy+3, 3, cs-6)
      }

      // Dots + special collectibles
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      for (const key of st.dots) {
        const [c,r] = key.split(',').map(Number)
        const sx = toSX(c), sy = toSY(r)
        if (specialMap.has(key)) {
          drawEmoji(ctx, specialMap.get(key), sx, sy, cs * 0.58)
        } else {
          ctx.beginPath(); ctx.arc(sx, sy, cs * 0.09, 0, Math.PI * 2); ctx.fill()
        }
      }

      // Ghosts
      for (const g of ghosts) drawEmoji(ctx, g.emoji, toSX(g.x), toSY(g.y), cs * 0.72)

      // Player (Pac-Man) — blink every 0.1s when invincible
      const showPlayer = st.alive && (st.invincible <= 0 || Math.floor(st.invincible / 0.1) % 2 === 0)
      if (showPlayer) {
        const px = toSX(st.px), py = toSY(st.py), pr = cs * 0.42
        const mouth = (0.5 + 0.5 * Math.sin(st.walkT * 12)) * 0.38
        const rot   = { right:0, down:Math.PI/2, left:Math.PI, up:-Math.PI/2 }[st.dir] || 0

        ctx.save(); ctx.translate(px, py); ctx.rotate(rot)
        ctx.fillStyle = col
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, pr, mouth, Math.PI*2-mouth); ctx.closePath(); ctx.fill()
        ctx.restore()

        // Eye in world space (never flips)
        const eOff = { right:[pr*.12,-pr*.46], left:[-pr*.12,-pr*.46], down:[-pr*.46,pr*.12], up:[-pr*.46,-pr*.12] }[st.dir] || [pr*.12,-pr*.46]
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px+eOff[0], py+eOff[1], pr*.13, 0, Math.PI*2); ctx.fill()
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(px+eOff[0]+pr*.03, py+eOff[1]+pr*.02, pr*.07, 0, Math.PI*2); ctx.fill()

        drawEmoji(ctx, characterEmoji || '🧒', px, py - pr * 0.08, pr * 1.05)
      }

      // ── HUD pills — above the maze ──────────────────────────────────────
      const pMid  = PILL_TOP + PILL_H / 2
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      // Score pill (left)
      const hearts = '❤️'.repeat(st.lives) + '🖤'.repeat(Math.max(0, 3 - st.lives))
      const scoreW = 148
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(offX, PILL_TOP, scoreW, PILL_H, PILL_H / 2)
      else ctx.rect(offX, PILL_TOP, scoreW, PILL_H)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px Nunito,sans-serif'
      ctx.fillText(`⭐ ${st.score}/${st.total}  ${hearts}`, offX + scoreW / 2, pMid)

      // Difficulty pill (right)
      const diffW = 56
      const diffX = W - offX - diffW
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(diffX, PILL_TOP, diffW, PILL_H, PILL_H / 2)
      else ctx.rect(diffX, PILL_TOP, diffW, PILL_H)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = 'bold 11px Nunito,sans-serif'
      ctx.fillText(diff.label, diffX + diffW / 2, pMid)

      // ── End overlay ───────────────────────────────────────────────────
      if (!st.alive || st.won) {
        ctx.fillStyle = 'rgba(0,0,0,0.62)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${Math.round(26*scale)}px Nunito,sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(st.won ? '🎉 ' + victoryMsg : '👻 No more lives!', W/2, H*.38)
        ctx.font = `${Math.round(17*scale)}px Nunito,sans-serif`
        ctx.fillText(`Collected: ${st.score} / ${st.total}`, W/2, H*.52)
        cancelAnimationFrame(rafId)
        setTimeout(() => { setPhase('result'); setResult({ won: st.won, score: st.score, total: st.total }) }, 1400)
        return
      }

      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [phase])  // eslint-disable-line

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#0a0a1a',
                  display:'flex', flexDirection:'column', fontFamily:'Nunito,sans-serif' }}>

      {/* Close — always exits to GamePicker */}
      <button onClick={onClose} style={{
        position:'absolute', top:14, right:14, zIndex:10001,
        display: (phase === 'result') ? 'none' : undefined,
        width:36, height:36, minWidth:36, minHeight:36, padding:0, flexShrink:0,
        borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.18)',
        color:'#fff', fontSize:16, cursor:'pointer', lineHeight:1,
      }}>✕</button>

      {/* Maze Chase intro screen */}
      {phase === 'intro' && (
        <GameIntroScreen
          emoji="👾"
          title="Maze Chase"
          description={narration}
          tips={[
            { icon: '⬆️⬇️⬅️➡️', text: 'Swipe or use arrow keys to move' },
            { icon: '⭐', text: 'Collect all glowing dots to win' },
            { icon: '👻', text: 'Dodge the moving ghosts' },
            { icon: '🚀', text: 'First move starts the ghosts — plan fast!' },
          ]}
          col={col}
          onPlay={() => setPhase('playing')}
          onBack={() => setPhase('narration')}
          playLabel="Start Maze Chase 👾"
        />
      )}

      {/* Canvas */}
      {phase === 'playing' && (
        <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
          <canvas ref={canvasRef} style={{ flex:1, width:'100%', display:'block', touchAction:'none' }} />
          <button onClick={togglePause} style={{
            position: 'absolute', top: 10, left: 10,
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.35)', color: '#fff',
            fontSize: 16, lineHeight: '36px', textAlign: 'center',
            padding: 0, cursor: 'pointer', zIndex: 10,
          }}>{paused ? '▶' : '⏸'}</button>
          {paused && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20,
            }}>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>Paused</div>
              <button onClick={togglePause} style={{
                background: '#fff', color: '#333', border: 'none',
                borderRadius: 50, padding: '12px 36px',
                fontSize: 18, fontWeight: 800, cursor: 'pointer',
              }}>▶ Resume</button>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {phase === 'result' && result && (
        <div style={{ flex:1, display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', padding:32, gap:20 }}>
          <div style={{ fontSize:56 }}>{result.won ? '🎉' : '💪'}</div>
          <div style={{ color:'#fff', fontSize:21, fontWeight:900, textAlign:'center' }}>
            {result.won ? victoryMsg : 'A ghost got you! Try again?'}
          </div>
          <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:16,
                        padding:'12px 32px', color:'#fff', fontSize:17, fontWeight:800 }}>
            ⭐ {result.score} / {result.total}
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => { setResult(null); setPhase('playing') }} style={{
              background:col, color:'#fff', border:'none', borderRadius:50,
              padding:'12px 28px', fontSize:16, fontWeight:800, cursor:'pointer' }}>
              Play Again 🔄
            </button>
            <button onClick={() => { setResult(null); onClose() }} style={{
              background:'transparent', color:'#fff', borderRadius:50,
              border:'2px solid rgba(255,255,255,0.35)',
              padding:'12px 28px', fontSize:16, fontWeight:800, cursor:'pointer' }}>
              Change Game
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
