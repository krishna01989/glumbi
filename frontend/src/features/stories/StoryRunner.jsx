import { useEffect, useRef, useState } from 'react'
import GameIntroScreen from './GameIntroScreen'

// ── Difficulty ──────────────────────────────────────────────────────────────
function mDiff(birthYear) {
  const age = birthYear ? new Date().getFullYear() - birthYear : 7
  if (age <= 4) return { scroll: 90,  jumpV: 920, gravity: 1500, fallMult: 1.3, dj: true,  airMult: 1.8, label: 'Easy'   }
  if (age <= 6) return { scroll: 120, jumpV: 950, gravity: 1600, fallMult: 1.3, dj: true,  airMult: 1.8, label: 'Easy'   }
  if (age <= 8) return { scroll: 155, jumpV: 980, gravity: 1700, fallMult: 1.4, dj: false, airMult: 1.7, label: 'Medium' }
  return             { scroll: 190, jumpV:1010, gravity: 1850, fallMult: 1.4, dj: false, airMult: 1.6, label: 'Hard'   }
}

// ── Color helper ────────────────────────────────────────────────────────────
function shadeColor(col, amt) {
  const m = (col || '#FF6B6B').match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return col
  const c = v => Math.min(255, Math.max(0, parseInt(v, 16) + amt))
  return `rgb(${c(m[1])},${c(m[2])},${c(m[3])})`
}

// ── Star shape ──────────────────────────────────────────────────────────────
function drawStar(ctx, cx, cy, r, col) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const d = i % 2 === 0 ? r : r * 0.42
    i === 0 ? ctx.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d)
            : ctx.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d)
  }
  ctx.closePath()
  ctx.fillStyle = col; ctx.fill()
}

// ── Glumbi character ────────────────────────────────────────────────────────
// cx = centre x, feet = bottom of character (ground contact), PH = total height
// Side-facing character — always drawn facing RIGHT, mirrored when dir = -1
function drawGlumbi(ctx, cx, feet, PH, isJumping, walkPhase, col, vy, dir = 1) {
  const bodyRX = PH * 0.34
  const bodyRY = PH * 0.30
  const legW   = PH * 0.115
  const legH   = PH * 0.22
  const shoeRX = legW * 1.25
  const shoeRY = legW * 0.48
  const armW   = PH * 0.10
  const armH   = PH * 0.20
  const handR  = armW * 0.82

  const swingP = isJumping ? 0 : Math.sin(walkPhase * Math.PI * 2)

  // Jump stretch
  let bRX = bodyRX, bRY = bodyRY
  if (isJumping && vy < -80) {
    const s = Math.min(1.18, 1 + Math.abs(vy) / 1200 * 0.18)
    bRY = bodyRY * s; bRX = bodyRX / s
  }

  const bob    = isJumping ? 0 : Math.abs(swingP) * 3
  const bodyCY = feet - shoeRY * 2 - legH - bRY + bob
  const legPivY = bodyCY + bRY * 0.90   // hip pivot at body base

  const legCol  = shadeColor(col, -28)
  const shoeCol = '#1A0A00'

  // Everything drawn in local space, mirrored by dir around cx
  ctx.save()
  ctx.translate(cx, 0)
  ctx.scale(dir, 1)   // mirror when going left
  ctx.translate(-cx, 0)

  // ── Leg helpers (side-view alternating stride) ──────────────────────────
  const maxSwing = 0.52
  const frontLegAngle = isJumping ? -0.42 :  swingP * maxSwing
  const backLegAngle  = isJumping ?  0.28 : -swingP * maxSwing

  const drawLeg = (angle, darker) => {
    ctx.save()
    ctx.translate(cx, legPivY)
    ctx.rotate(angle)
    ctx.fillStyle = darker ? shadeColor(legCol, -18) : legCol
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(-legW / 2, 0, legW, legH, legW * 0.42)
    else ctx.rect(-legW / 2, 0, legW, legH)
    ctx.fill()
    // shoe at tip
    const tx = Math.sin(angle) * legH
    const ty = Math.cos(angle) * legH
    ctx.restore()
    ctx.fillStyle = shoeCol
    ctx.beginPath()
    ctx.ellipse(cx + tx + Math.cos(angle) * shoeRX * 0.35,
                legPivY + ty + shoeRY * 0.7,
                shoeRX, shoeRY, angle * 0.35, 0, Math.PI * 2)
    ctx.fill()
  }

  drawLeg(backLegAngle,  true)   // back leg (darker, behind body)
  drawLeg(frontLegAngle, false)  // front leg

  // ── Body ────────────────────────────────────────────────────────────────
  ctx.fillStyle = col
  ctx.beginPath(); ctx.ellipse(cx, bodyCY, bRX, bRY, 0, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = shadeColor(col, -22); ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.ellipse(cx, bodyCY, bRX, bRY, 0, 0, Math.PI * 2); ctx.stroke()
  // Belly highlight
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.beginPath(); ctx.ellipse(cx - bRX * 0.08, bodyCY + bRY * 0.15, bRX * 0.42, bRY * 0.42, 0, 0, Math.PI * 2); ctx.fill()

  // ── Star badge (chest, front side) ──────────────────────────────────────
  drawStar(ctx, cx + bRX * 0.22, bodyCY + bRY * 0.32, bRX * 0.15, '#FFD700')
  drawStar(ctx, cx + bRX * 0.22, bodyCY + bRY * 0.32, bRX * 0.08, 'rgba(255,255,255,0.46)')

  // ── Back arm ─────────────────────────────────────────────────────────────
  const backArmAngle  = isJumping ? -0.65 :  swingP * 0.40
  ctx.save()
  ctx.translate(cx - bRX * 0.10, bodyCY - bRY * 0.05)
  ctx.rotate(backArmAngle)
  ctx.fillStyle = shadeColor(col, -22)
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-armW / 2, 0, armW, armH, armW / 2)
  else ctx.rect(-armW / 2, 0, armW, armH)
  ctx.fill()
  ctx.beginPath(); ctx.arc(0, armH + handR, handR, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  // ── Front arm ────────────────────────────────────────────────────────────
  const frontArmAngle = isJumping ?  0.65 : -swingP * 0.40
  ctx.save()
  ctx.translate(cx + bRX * 0.55, bodyCY - bRY * 0.05)
  ctx.rotate(frontArmAngle)
  ctx.fillStyle = col
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-armW / 2, 0, armW, armH, armW / 2)
  else ctx.rect(-armW / 2, 0, armW, armH)
  ctx.fill()
  ctx.strokeStyle = shadeColor(col, -20); ctx.lineWidth = 1
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-armW / 2, 0, armW, armH, armW / 2)
  else ctx.rect(-armW / 2, 0, armW, armH)
  ctx.stroke()
  ctx.fillStyle = col
  ctx.beginPath(); ctx.arc(0, armH + handR, handR, 0, Math.PI * 2); ctx.fill()
  ctx.stroke()
  ctx.restore()

  // ── Eye (side view — one eye on the right/front of the face) ────────────
  const eyeX = cx + bRX * 0.52
  const eyeY = bodyCY - bRY * 0.22
  const eyeR = bRY * 0.30

  ctx.fillStyle = '#FFF'
  ctx.beginPath(); ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2); ctx.fill()
  const pupR = eyeR * 0.56
  ctx.fillStyle = '#111'
  ctx.beginPath(); ctx.arc(eyeX + eyeR * 0.22, eyeY + eyeR * 0.08, pupR, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(eyeX + eyeR * 0.04, eyeY - eyeR * 0.22, eyeR * 0.22, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(eyeX + eyeR * 0.36, eyeY + eyeR * 0.14, eyeR * 0.10, 0, Math.PI * 2); ctx.fill()

  // Eyebrow
  ctx.strokeStyle = shadeColor(col, -55); ctx.lineWidth = eyeR * 0.26; ctx.lineCap = 'round'
  const browR = eyeR * 0.80
  const browCY = isJumping ? eyeY - eyeR * 1.40 : eyeY - eyeR * 1.20
  ctx.beginPath(); ctx.arc(eyeX, browCY, browR, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke()

  // Mouth (side profile — small curved line at the front of the face)
  ctx.strokeStyle = '#333'; ctx.lineWidth = eyeR * 0.18; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.arc(cx + bRX * 0.75, bodyCY + bRY * 0.18, bRX * 0.13, 0.25, Math.PI - 0.25); ctx.stroke()

  // Blush (front cheek)
  ctx.fillStyle = 'rgba(255,110,110,0.28)'
  ctx.beginPath(); ctx.ellipse(cx + bRX * 0.62, bodyCY + bRY * 0.08, bRX * 0.14, bRY * 0.10, 0, 0, Math.PI * 2); ctx.fill()

  ctx.restore()  // end mirror transform
}

// ── Emoji helper ────────────────────────────────────────────────────────────
function drawEmoji(ctx, emoji, cx, cy, size) {
  ctx.save()
  ctx.font = `${Math.round(size)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(emoji, cx, cy)
  ctx.restore()
}

// ── Level generation ────────────────────────────────────────────────────────
function genLevel(W, H, diff, collectEmojis, obstacleEmojis) {
  const GY     = Math.floor(H * 0.74)
  const LEVEL_W = W * 5.5
  const jumpH  = (diff.jumpV * diff.jumpV) / (2 * diff.gravity)

  const obstacles = [], collectibles = []
  let x = W * 0.55

  while (x < LEVEL_W - W * 0.75) {
    if (Math.random() < 0.42) {
      obstacles.push({ x, y: GY, emoji: obstacleEmojis[obstacles.length % obstacleEmojis.length] })
      x += W * (0.18 + Math.random() * 0.20)
    } else {
      collectibles.push({
        x, collected: false,
        y: GY - Math.round(jumpH * 0.72),
        emoji: collectEmojis[collectibles.length % collectEmojis.length],
      })
      x += W * (0.10 + Math.random() * 0.13)
    }
  }

  return { GY, LEVEL_W, obstacles, collectibles, total: collectibles.length }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function StoryRunner({ runnerLevelJson, characterEmoji, theme, birthYear, onClose }) {
  const diff = mDiff(birthYear)
  const col  = theme?.primary || '#FF6B6B'

  let lvl = {}
  try { lvl = JSON.parse(runnerLevelJson || '{}') } catch {}
  const collectEmojis  = Array.isArray(lvl.collectibles) ? lvl.collectibles : ['⭐', '💎', '🍀', '🌟']
  const obstacleEmojis = Array.isArray(lvl.obstacles)    ? lvl.obstacles    : ['👻', '🐉', '🌊']
  const narration      = lvl.glumbiNarration || 'Run and jump through the story world!'
  const victoryMsg     = lvl.endLine         || 'Amazing! You made it!'

  const canvasRef    = useRef(null)
  const jumpRef      = useRef(false)
  const jumpHeldRef  = useRef(false)
  const jumpBufRef   = useRef(0)
  const dirRef       = useRef(1)
  const pausedRef    = useRef(false)
  const [paused, setPaused]   = useState(false)
  const [phase, setPhase]     = useState('narration')
  const [result, setResult]   = useState(null)

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  // Keyboard
  useEffect(() => {
    if (phase !== 'playing') return
    const onDown = e => {
      if (e.key === 'Escape' || e.key === 'p') { togglePause(); return }
      if (pausedRef.current) return
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && !e.repeat) {
        jumpRef.current = true; jumpHeldRef.current = true; e.preventDefault()
      }
      if (e.key === 'ArrowRight' || e.key === 'd') { dirRef.current =  1; e.preventDefault() }
      if (e.key === 'ArrowLeft'  || e.key === 'a') { dirRef.current = -1; e.preventDefault() }
    }
    const onUp = e => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') jumpHeldRef.current = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [phase])

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const syncSize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(canvas)

    const PH = 60   // character height in px
    let levelData = null
    let camX = 0

    const st = {
      x: 80,
      y: 0, vy: 0,
      vx: 0,
      onGround: true,
      jumpsLeft: diff.dj ? 2 : 1,
      lives: 3, invincible: 0,
      score: 0,
      alive: true, won: false,
      started: false,
      walkPhase: 0,
      squash: 1,
    }

    function respawn() {
      if (levelData) st.y = levelData.GY - PH
      st.vy = 0; st.vx = 0; st.onGround = true
      st.jumpsLeft = diff.dj ? 2 : 1
      st.invincible = 2.0; st.started = false
    }

    let rafId, prev = null

    function frame(ts) {
      if (pausedRef.current) { prev = null; rafId = requestAnimationFrame(frame); return }
      if (!prev) prev = ts
      const dt = Math.min((ts - prev) / 1000, 0.05)
      prev = ts

      const W = canvas.width, H = canvas.height
      if (!W || !H) { rafId = requestAnimationFrame(frame); return }

      if (!levelData) {
        levelData = genLevel(W, H, diff, collectEmojis, obstacleEmojis)
        st.y = levelData.GY - PH
      }

      const { GY, LEVEL_W, obstacles, collectibles, total } = levelData
      // ── Jump buffer tick ─────────────────────────────────────────────────
      if (jumpBufRef.current > 0) jumpBufRef.current -= dt

      // ── Input ────────────────────────────────────────────────────────────
      if (jumpRef.current) {
        if (!st.started) st.started = true
        jumpBufRef.current = 0.12
        jumpRef.current = false
      }

      // ── Physics ──────────────────────────────────────────────────────────
      if (st.started && st.alive && !st.won) {
        // Always move in current direction (Pac-Man style)
        st.vx = diff.scroll * dirRef.current
        st.x = Math.max(0, Math.min(st.x + st.vx * dt, LEVEL_W - PH))

        // Camera: smoothly follow player, keep them ~30% from left edge
        const targetCam = st.x - W * 0.30
        camX += (targetCam - camX) * Math.min(1, dt * 8)
        camX = Math.max(0, Math.min(camX, LEVEL_W - W))

        // Jump from buffer
        if (jumpBufRef.current > 0 && st.jumpsLeft > 0) {
          st.vy = -diff.jumpV
          st.jumpsLeft--
          st.squash = 0.80
          jumpBufRef.current = 0
        }

        // Variable jump height
        if (!jumpHeldRef.current && st.vy < -diff.jumpV * 0.38) {
          st.vy = -diff.jumpV * 0.38
        }

        // Gravity
        const grav = st.vy > 0 ? diff.gravity * diff.fallMult : diff.gravity
        st.vy += grav * dt
        if (st.vy > 1100) st.vy = 1100
        st.y  += st.vy * dt

        // Land
        const wasAir = !st.onGround
        if (st.y + PH >= GY) {
          st.y = GY - PH
          if (wasAir && st.vy > 250) st.squash = 0.68
          st.vy = 0; st.onGround = true
          st.jumpsLeft = diff.dj ? 2 : 1
        } else {
          st.onGround = false
        }

        // Squash recovery
        if (st.squash !== 1) {
          st.squash += (1 - st.squash) * Math.min(1, dt * 14)
          if (Math.abs(st.squash - 1) < 0.01) st.squash = 1
        }

        // Walk phase — advance when moving, direction-aware
        if (st.onGround) st.walkPhase = (st.walkPhase + dt * 5) % 1

        if (st.invincible > 0) st.invincible -= dt

        // Collect
        for (const c of collectibles) {
          if (!c.collected &&
              st.x + PH > c.x - 16 && st.x < c.x + 16 &&
              st.y + PH > c.y - 16 && st.y < c.y + 16) {
            c.collected = true; st.score++
            // collecting all stars doesn't end the game — reach the flag to win
          }
        }

        // Obstacle collision
        if (st.invincible <= 0) {
          for (const o of obstacles) {
            const ox = o.x - (st.x + PH * 0.5)
            if (Math.abs(ox) < 20 && st.y + PH > o.y - 32 && st.y + PH < o.y + 4) {
              st.lives--
              if (st.lives <= 0) st.alive = false; else respawn()
              break
            }
          }
        }

        // Win: player reaches end
        if (st.x >= LEVEL_W - W * 0.35) st.won = true
      }

      // ── Draw ─────────────────────────────────────────────────────────────

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, GY)
      sky.addColorStop(0, '#1a1a3e'); sky.addColorStop(1, '#2d1b69')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GY)

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      for (let i = 0; i < 28; i++) {
        const sx = ((i * 173 + camX * 0.12) % (W + 20) + W + 20) % (W + 20) - 10
        const sy = (i * 61) % (GY * 0.85)
        ctx.fillRect(sx, sy, 2, 2)
      }

      // Ground
      ctx.fillStyle = col
      ctx.fillRect(0, GY, W, H - GY)
      ctx.fillStyle = 'rgba(255,255,255,0.24)'
      ctx.fillRect(0, GY, W, 5)
      ctx.fillStyle = 'rgba(0,0,0,0.09)'
      const tileOff = (-camX % 40 + 40) % 40
      for (let tx = tileOff; tx < W; tx += 40) ctx.fillRect(tx, GY, 1, H - GY)
      for (let ty = GY + 22; ty < H; ty += 22) ctx.fillRect(0, ty, W, 1)

      const t = ts / 1000

      // ── Collectibles: floating gold sparkle ───────────────────────────────
      for (const c of collectibles) {
        if (c.collected) continue
        const sx = c.x - camX
        if (sx < -30 || sx > W + 30) continue
        const bob = Math.sin(t * 3 + c.x * 0.05) * 5
        const cy  = c.y + bob

        const grad = ctx.createRadialGradient(sx, cy, 4, sx, cy, 22)
        grad.addColorStop(0, 'rgba(255,220,0,0.55)'); grad.addColorStop(1, 'rgba(255,220,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(sx, cy, 22, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = '#FFE566'
        for (let s = 0; s < 4; s++) {
          const a = t * 2.5 + s * Math.PI / 2
          ctx.beginPath(); ctx.arc(sx + Math.cos(a) * 16, cy + Math.sin(a) * 10, 2.5, 0, Math.PI * 2); ctx.fill()
        }
        drawEmoji(ctx, c.emoji, sx, cy, 24)
      }

      // ── Obstacles: red pulsing danger ────────────────────────────────────
      for (const o of obstacles) {
        const sx = o.x - camX
        if (sx < -30 || sx > W + 30) continue
        const oy = o.y - 18

        const pulse = 0.45 + 0.2 * Math.sin(t * 4 + o.x)
        const rgrad = ctx.createRadialGradient(sx, oy, 5, sx, oy, 26)
        rgrad.addColorStop(0, `rgba(255,50,50,${pulse})`); rgrad.addColorStop(1, 'rgba(255,50,50,0)')
        ctx.fillStyle = rgrad
        ctx.beginPath(); ctx.arc(sx, oy, 26, 0, Math.PI * 2); ctx.fill()

        drawEmoji(ctx, o.emoji, sx, oy, 32)
        ctx.fillStyle = '#FF4444'; ctx.font = 'bold 13px Nunito,sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('!', sx, oy - 28)
      }

      // ── Glumbi character ─────────────────────────────────────────────────
      const showPlayer = st.alive && (st.invincible <= 0 || Math.floor(st.invincible / 0.1) % 2 === 0)
      if (showPlayer) {
        const pSX  = st.x - camX          // player screen x (left edge)
        const pCX  = pSX + PH * 0.5       // player centre x
        const feet = st.y + PH

        ctx.save()
        if (Math.abs(st.squash - 1) > 0.01) {
          const scX = st.squash < 1 ? 2 - st.squash : 1 / st.squash
          ctx.translate(pCX, feet)
          ctx.scale(scX, st.squash)
          ctx.translate(-pCX, -feet)
        }
        drawGlumbi(ctx, pCX, feet, PH, !st.onGround, st.walkPhase, col, st.vy, dirRef.current)
        ctx.restore()
      }

      // ── Goal flag ────────────────────────────────────────────────────────
      if (levelData) {
        const fsx = LEVEL_W - W * 0.35 - camX
        if (fsx > -40 && fsx < W + 40) {
          ctx.fillStyle = '#FFD700'; ctx.fillRect(fsx, GY - 85, 4, 85)
          ctx.fillStyle = '#00DD44'
          ctx.beginPath()
          ctx.moveTo(fsx + 4, GY - 85); ctx.lineTo(fsx + 4, GY - 58); ctx.lineTo(fsx + 32, GY - 72)
          ctx.closePath(); ctx.fill()
          ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '11px Nunito,sans-serif'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('FINISH', fsx + 18, GY - 96)
        }
      }

      // ── HUD ──────────────────────────────────────────────────────────────
      const PILL_H = 24, PILL_TOP = 6, pMid = PILL_TOP + PILL_H / 2
      const hearts = '❤️'.repeat(st.lives) + '🖤'.repeat(Math.max(0, 3 - st.lives))

      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(8, PILL_TOP, 152, PILL_H, PILL_H / 2)
      else ctx.rect(8, PILL_TOP, 152, PILL_H)
      ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Nunito,sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`⭐ ${st.score}/${total}  ${hearts}`, 84, pMid)

      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(W - 64, PILL_TOP, 56, PILL_H, PILL_H / 2)
      else ctx.rect(W - 64, PILL_TOP, 56, PILL_H)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fillText(diff.label, W - 36, pMid)

      // ── Start hint ───────────────────────────────────────────────────────
      if (!st.started && st.alive) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)'
        ctx.fillRect(0, GY - 70, W, 44)
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 13px Nunito,sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('← → to change direction  ·  Space/Tap top to jump  ·  Grab ✨  Avoid ❗', W / 2, GY - 48)
      }

      // ── End overlay ──────────────────────────────────────────────────────
      if (!st.alive || st.won) {
        ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Nunito,sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(st.won ? '🎉 ' + victoryMsg : '💔 No more lives!', W / 2, H * 0.38)
        ctx.font = '17px Nunito,sans-serif'
        ctx.fillText(`Collected: ${st.score} / ${total}`, W / 2, H * 0.52)
        cancelAnimationFrame(rafId)
        setTimeout(() => setResult({ won: st.won, score: st.score, total }), 1400)
        return
      }

      rafId = requestAnimationFrame(frame)
    }

    // Canvas touch = jump only; direction buttons are HTML elements
    const onTS = () => { jumpRef.current = true; jumpHeldRef.current = true }
    const onTE = () => { jumpHeldRef.current = false }
    canvas.addEventListener('touchstart', onTS, { passive: true })
    canvas.addEventListener('touchend',   onTE, { passive: true })
    canvas.addEventListener('touchcancel',onTE, { passive: true })

    rafId = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      canvas.removeEventListener('touchstart', onTS)
      canvas.removeEventListener('touchend',   onTE)
    }
  }, [phase])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#0a0a1a',
                  display: 'flex', flexDirection: 'column', fontFamily: 'Nunito,sans-serif' }}>

      {/* ✕ shown only during playing/result — GameIntroScreen renders its own */}
      {phase !== 'narration' && (
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, zIndex: 10002,
          width: 36, height: 36, minWidth: 36, minHeight: 36,
          padding: 0, margin: 0, boxSizing: 'border-box',
          borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.18)', color: '#fff',
          fontSize: 16, lineHeight: '36px', textAlign: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>✕</button>
      )}

      {phase === 'narration' && (
        <GameIntroScreen
          emoji="🏃"
          title="Story Run"
          description={narration}
          tips={[
            { icon: '👆', text: 'Tap or press Space / ↑ to jump' },
            { icon: '✨', text: 'Grab glowing floating items to score' },
            { icon: '❗', text: 'Dodge red danger enemies on the ground' },
            { icon: '🏁', text: 'Reach the finish flag to win!' },
          ]}
          col={col}
          onPlay={() => setPhase('playing')}
          onBack={onClose}
          playLabel="Start Story Run 🏃"
        />
      )}

      {phase === 'playing' && (
        <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
          <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block', touchAction: 'none' }} />
          {/* On-screen direction buttons */}
          {!paused && (
            <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0,
                          display: 'flex', justifyContent: 'space-between', padding: '0 18px',
                          pointerEvents: 'none' }}>
              {[['◀', -1], ['▶', 1]].map(([label, d]) => (
                <button key={d}
                  onTouchStart={e => { e.preventDefault(); dirRef.current = d }}
                  onMouseDown={() => dirRef.current = d}
                  style={{
                    width: 58, height: 58, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)',
                    background: 'rgba(0,0,0,0.30)', color: '#fff',
                    fontSize: 22, fontWeight: 900, cursor: 'pointer',
                    pointerEvents: 'all', touchAction: 'none', userSelect: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{label}</button>
              ))}
            </div>
          )}
          {/* Pause button — top-left so it doesn't clash with the close ✕ top-right */}
          <button onClick={togglePause} style={{
            position: 'absolute', top: 10, left: 10,
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.35)', color: '#fff',
            fontSize: 16, lineHeight: '36px', textAlign: 'center',
            padding: 0, cursor: 'pointer', zIndex: 10,
          }}>{paused ? '▶' : '⏸'}</button>
          {/* Pause overlay */}
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

      {result && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
          <div style={{ fontSize: 56 }}>{result.won ? '🎉' : '💪'}</div>
          <div style={{ color: '#fff', fontSize: 21, fontWeight: 900, textAlign: 'center' }}>
            {result.won ? victoryMsg : 'Better luck next time!'}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16,
                        padding: '12px 32px', color: '#fff', fontSize: 17, fontWeight: 800 }}>
            ⭐ {result.score} / {result.total}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => { setPhase('narration'); setResult(null) }} style={{
              background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none',
              borderRadius: 50, padding: '12px 28px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              Play Again
            </button>
            <button onClick={onClose} style={{
              background: col, color: '#fff', border: 'none',
              borderRadius: 50, padding: '12px 28px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              Done ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
