import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildCharacter } from '../character/characterBuilder'

const CELL   = 2.4
const WALL_H = 1.6
const WALL_T = 0.18

function c2w(r, c) { return new THREE.Vector3(c * CELL, 0, r * CELL) }

export default function Maze3D({ grid, cols, rows, theme, aiSkin, onComplete, onWallHit }) {
  const mountRef    = useRef(null)
  const moveRef     = useRef(null)        // always-current move fn
  const touchRef    = useRef(null)        // 1-finger swipe tracking
  const panRef      = useRef({ x: 0, z: 0 })   // camera pan offset (world units)
  const pan2Ref     = useRef(null)        // 2-finger gesture tracking
  const azimuthRef  = useRef(0)           // camera orbit angle around maze center

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !grid?.length) return

    panRef.current  = { x: 0, z: 0 }
    pan2Ref.current = null

    // ── Maze geometry constants ────────────────────────────────────────────
    const mazeCX  = (cols - 1) * CELL / 2
    const mazeCZ  = (rows - 1) * CELL / 2
    // Camera sits SOUTH (+Z) of the maze and looks north (−Z).
    // camBack must exceed (rows-1)*CELL so every row stays in front of the lens.
    const isLargeScreen = window.innerWidth >= 1024
    const camH    = isLargeScreen ? Math.max(cols, rows) * CELL * 0.65 + 1.5 : Math.max(cols, rows) * CELL * 1.15 + 4
    const camBack = isLargeScreen ? (rows - 1) * CELL * 0.45 + 2.5          : (rows - 1) * CELL + 6

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb)
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.022)

    const W = mount.clientWidth, H = mount.clientHeight
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 80)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    mount.appendChild(renderer.domElement)

    // ── Lights ─────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const sun = new THREE.DirectionalLight(0xfffbe0, 1.0)
    sun.position.set(mazeCX, 16, mazeCZ - 4)
    sun.castShadow = true
    sun.shadow.mapSize.width = 1024; sun.shadow.mapSize.height = 1024
    sun.shadow.camera.left = -cols * CELL; sun.shadow.camera.right = cols * CELL
    sun.shadow.camera.top  =  rows * CELL; sun.shadow.camera.bottom = -rows * CELL
    sun.shadow.camera.far  = 50
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0xb0d0ff, 0.3)
    fill.position.set(-4, 5, 8); scene.add(fill)

    // ── Colors ─────────────────────────────────────────────────────────────
    const wallCol  = new THREE.Color(aiSkin?.wallColor  || theme?.wall    || '#5577bb')
    const floorCol = new THREE.Color(aiSkin?.bgColor    || '#d4edda')
    const doorCol  = new THREE.Color(aiSkin?.pathColor  || '#f5c842')
    const primCol  = new THREE.Color(theme?.primary     || '#ff6b6b')

    // ── Floor ──────────────────────────────────────────────────────────────
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(cols * CELL + 2, rows * CELL + 2),
      new THREE.MeshLambertMaterial({ color: floorCol })
    )
    floorMesh.rotation.x = -Math.PI / 2
    floorMesh.position.set((cols - 1) * CELL / 2, -0.01, (rows - 1) * CELL / 2)
    floorMesh.receiveShadow = true
    scene.add(floorMesh)

    // ── Materials ──────────────────────────────────────────────────────────
    const wallMat  = new THREE.MeshPhongMaterial({ color: wallCol, shininess: 20 })
    // Door colour: aiSkin path colour when available, else tint wall colour toward warm wood
    const oakColor   = new THREE.Color(0xc8813a)
    const doorBase   = aiSkin?.pathColor
      ? new THREE.Color(aiSkin.pathColor)
      : new THREE.Color(wallCol).lerp(oakColor, 0.55)
    const doorInsetC = doorBase.clone().multiplyScalar(0.60)
    const doorWood = new THREE.MeshPhongMaterial({ color: doorBase,  shininess: 30, side: THREE.DoubleSide })
    const doorInset= new THREE.MeshPhongMaterial({ color: doorInsetC, shininess: 12, side: THREE.DoubleSide })
    const knobMat  = new THREE.MeshPhongMaterial({ color: 0xD4A017, shininess: 150 })

    // ── Emoji canvas texture helper ────────────────────────────────────────
    function emojiTex(emoji, size = 128) {
      const cv = document.createElement('canvas')
      cv.width = cv.height = size
      const ctx = cv.getContext('2d')
      ctx.font = `${size * 0.78}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(emoji, size / 2, size / 2 + 4)
      return new THREE.CanvasTexture(cv)
    }

    function solidWall(cx, cz, horiz) {
      const geo = horiz
        ? new THREE.BoxGeometry(CELL + WALL_T, WALL_H, WALL_T)
        : new THREE.BoxGeometry(WALL_T, WALL_H, CELL + WALL_T)
      const m = new THREE.Mesh(geo, wallMat)
      m.position.set(cx, WALL_H / 2, cz)
      m.castShadow = true; m.receiveShadow = true
      scene.add(m)
    }

    // ── Doors ──────────────────────────────────────────────────────────────
    const doors = []  // { group, state, curA, openedAt, r, c, dir }
    const DW = CELL - 0.14   // door width
    const DH = WALL_H * 0.9  // door height
    const DT = 0.10           // door thickness
    const DB = 0.04           // floor gap

    function addDoor(cx, cz, horiz, r, c, dir) {
      const g = new THREE.Group()
      const cy = DB + DH / 2  // panel centre Y

      // ── Main panel ──
      const panelGeo = horiz
        ? new THREE.BoxGeometry(DW, DH, DT)
        : new THREE.BoxGeometry(DT, DH, DW)
      const panel = new THREE.Mesh(panelGeo, doorWood)
      panel.position.set(horiz ? DW / 2 : 0, cy, horiz ? 0 : DW / 2)
      panel.castShadow = true; panel.receiveShadow = true
      g.add(panel)

      // ── Two decorative inset panels (upper + lower) ──
      for (const yFrac of [0.68, 0.32]) {
        const iW = DW * 0.62, iH = DH * 0.28
        const iT = 0.035   // how far they protrude from panel face
        const iGeo = horiz
          ? new THREE.BoxGeometry(iW, iH, iT)
          : new THREE.BoxGeometry(iT, iH, iW)
        // Place on the front face of the panel (+T/2 offset)
        const inset = new THREE.Mesh(iGeo, doorInset)
        inset.position.set(
          horiz ? DW / 2          : DT / 2 + iT / 2,
          DB + DH * yFrac,
          horiz ? DT / 2 + iT / 2 : DW / 2
        )
        g.add(inset)
        // Mirror on back face
        const inset2 = inset.clone()
        inset2.position.set(
          horiz ? DW / 2          : -(DT / 2 + iT / 2),
          DB + DH * yFrac,
          horiz ? -(DT / 2 + iT / 2) : DW / 2
        )
        g.add(inset2)
      }

      // ── Doorknob: brass rod + ball, near latch end ──
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 8), knobMat)
      const rod  = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, DT + 0.06, 8), knobMat)
      const kx = horiz ? DW * 0.82 : DT / 2 + 0.025
      const kz = horiz ? DT / 2 + 0.025 : DW * 0.82
      const ky = DB + DH * 0.42
      ball.position.set(kx, ky, kz)
      rod.position.set(horiz ? DW * 0.82 : 0, ky, horiz ? 0 : DW * 0.82)
      if (horiz) rod.rotation.x = Math.PI / 2; else rod.rotation.z = Math.PI / 2
      g.add(ball, rod)

      // ── Hinge at low-coordinate corner of the passage ──
      g.position.set(
        horiz ? cx - CELL / 2 : cx,
        0,
        horiz ? cz : cz - CELL / 2
      )
      scene.add(g)
      doors.push({ group: g, state: 'closed', curA: 0, openedAt: null, r, c, dir })
    }

    // ── Build maze ─────────────────────────────────────────────────────────
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c]
        const cx = c * CELL, cz = r * CELL

        // North boundary
        if (r === 0 || cell.walls.N) solidWall(cx, cz - CELL / 2, true)
        else                          addDoor(cx, cz - CELL / 2, true, r, c, 'N')

        // West boundary
        if (c === 0 || cell.walls.W) solidWall(cx - CELL / 2, cz, false)
        else                          addDoor(cx - CELL / 2, cz, false, r, c, 'W')

        // South border (last row)
        if (r === rows - 1) solidWall(cx, cz + CELL / 2, true)
        // East border (last col)
        if (c === cols - 1) solidWall(cx + CELL / 2, cz, false)
      }
    }

    // Corner posts
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(WALL_T, WALL_H, WALL_T), wallMat)
        post.position.set(c * CELL - CELL / 2, WALL_H / 2, r * CELL - CELL / 2)
        scene.add(post)
      }
    }

    // ── Emoji markers (start + end) ────────────────────────────────────────
    const ex = (cols - 1) * CELL, ez = (rows - 1) * CELL
    const startEmoji = theme?.startEmoji || '🏠'
    const endEmoji   = theme?.endEmoji   || '⭐'

    function addEmojiMarker(emoji, wx, wz, bobAmp = 0.18, glowColor = 0xffee22) {
      const tex = emojiTex(emoji, 128)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
      sprite.scale.set(1.1, 1.1, 1)
      sprite.position.set(wx, 1.55, wz)
      scene.add(sprite)

      // Small glow platform on the floor
      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(0.45, 24),
        new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.35 })
      )
      glow.rotation.x = -Math.PI / 2
      glow.position.set(wx, 0.01, wz)
      scene.add(glow)

      const light = new THREE.PointLight(glowColor, 1.2, 3.5)
      light.position.set(wx, 1.4, wz)
      scene.add(light)

      return { sprite, light, bobAmp }
    }

    const startMarker = addEmojiMarker(startEmoji, 0, 0, 0.1, 0x88ccff)
    const endMarker   = addEmojiMarker(endEmoji,   ex, ez, 0.22, 0xffee22)

    // ── Kid character ──────────────────────────────────────────────────────
    // ── Build theme character ──────────────────────────────────────────────
    const charEmoji = aiSkin?.startEmoji || theme?.startEmoji || '🦊'
    const char = buildCharacter(charEmoji, primCol, emojiTex)
    const kid  = char.group
    kid.position.set(0, 0, 0)
    scene.add(kid)

    // ── Cartoon daze stars (appear above head on wall hit) ─────────────────
    const dazeGroup = new THREE.Group()
    dazeGroup.visible = false
    scene.add(dazeGroup)
    const dazeEmojis = ['⭐', '💫', '⭐']
    const dazeSprites = dazeEmojis.map((em, i) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: emojiTex(em, 64), transparent: true, depthTest: false,
      }))
      sprite.scale.set(0.28, 0.28, 1)
      const a = (i / dazeEmojis.length) * Math.PI * 2
      sprite.position.set(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32)
      dazeGroup.add(sprite)
      return sprite
    })

    // ── Player state ───────────────────────────────────────────────────────
    const P = {
      cell: { r: 0, c: 0 },
      target: new THREE.Vector3(0, 0, 0),
      moving: false,
      done: false,
      walkT: 0,
    }
    // Camera sits south (+Z) of the maze, looks north (−Z) over the grid
    const camDesired = new THREE.Vector3(mazeCX, camH, mazeCZ + camBack)
    const camLook    = new THREE.Vector3(mazeCX, 0.5, mazeCZ)

    function openDoorsFor(r, c, dir) {
      let tr = r, tc = c, td = dir
      if (dir === 'S') { tr = r + 1; td = 'N' }
      if (dir === 'E') { tc = c + 1; td = 'W' }
      doors.forEach(d => {
        if (d.r === tr && d.c === tc && d.dir === td) {
          d.state = 'opening'
          d.openedAt = null
        }
      })
    }

    const shake = { t: -1, dr: 0, dc: 0 }  // t<0 = idle

    function triggerShake(dr, dc) {
      shake.t = 0; shake.dr = dr; shake.dc = dc
    }

    function move(dr, dc) {
      if (P.moving || P.done) return
      const { r, c } = P.cell
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) { onWallHit?.(); triggerShake(dr, dc); return }

      const cell = grid[r][c]
      if (dr === -1 && cell.walls.N) { onWallHit?.(); triggerShake(dr, dc); return }
      if (dr ===  1 && cell.walls.S) { onWallHit?.(); triggerShake(dr, dc); return }
      if (dc === -1 && cell.walls.W) { onWallHit?.(); triggerShake(dr, dc); return }
      if (dc ===  1 && cell.walls.E) { onWallHit?.(); triggerShake(dr, dc); return }

      const dirMap = { '-10': 'N', '10': 'S', '0-1': 'W', '01': 'E' }
      openDoorsFor(r, c, dirMap[`${dr}${dc}`])

      P.cell = { r: nr, c: nc }
      P.target.set(nc * CELL, 0, nr * CELL)
      P.moving = true
      P.walkT = 0

      // Face direction of movement (atan2 of dc,dr gives Y rotation in our coord system)
      kid.rotation.y = Math.atan2(dc, dr)

      if (nr === rows - 1 && nc === cols - 1) {
        P.done = true
        setTimeout(() => onComplete?.(), 650)
      }
    }

    moveRef.current = move

    // ── Animation loop ─────────────────────────────────────────────────────
    let rafId
    const clock = new THREE.Timer()

    function tick() {
      rafId = requestAnimationFrame(tick)
      clock.update()
      const dt = Math.min(clock.getDelta(), 0.05)

      // Player movement + walk animation
      if (P.moving) {
        P.walkT += dt * 7
        const flatTarget = P.target.clone()
        kid.position.lerp(flatTarget, 0.17)
        char.animate(dt, true, P.walkT)
        const dxz = Math.hypot(kid.position.x - flatTarget.x, kid.position.z - flatTarget.z)
        if (dxz < 0.05) {
          kid.position.x = flatTarget.x
          kid.position.z = flatTarget.z
          char.stopY()
          P.moving = false
        }
      } else if (shake.t < 0) {
        char.animate(dt, false, performance.now() * 0.001)
      }

      // Wall bump — fast lunge toward wall, then spring back
      if (shake.t >= 0) {
        shake.t += dt * 6
        const LUNGE = 0.65   // world units toward wall
        const PHASE = 0.28   // fraction of animation spent lunging
        let bump
        if (shake.t < PHASE) {
          // Fast lunge in — ease-in curve
          const p = shake.t / PHASE
          bump = LUNGE * (p * p)
        } else {
          // Spring back out with slight overshoot then settle
          const p = (shake.t - PHASE) / (1.2 - PHASE)
          bump = LUNGE * (1 - p) * Math.exp(-p * 2.5) * Math.cos(p * Math.PI * 1.2)
        }
        kid.position.x = P.target.x + shake.dc * bump
        kid.position.z = P.target.z + shake.dr * bump
        const tilt = Math.max(0, 1 - shake.t / PHASE) * 0.4
        kid.rotation.z = -shake.dc * tilt
        kid.rotation.x =  shake.dr * tilt

        // Cartoon stars spin above head
        const fade = Math.max(0, 1 - shake.t / 1.2)
        dazeGroup.visible = true
        dazeGroup.position.set(kid.position.x, char.HEIGHT + 2.0, kid.position.z)
        dazeGroup.rotation.y += dt * 5
        dazeSprites.forEach(s => { s.material.opacity = fade })

        if (shake.t >= 1.2) {
          shake.t = -1
          kid.position.x = P.target.x; kid.position.z = P.target.z
          kid.rotation.z = 0; kid.rotation.x = 0
          char.stopY()
          dazeGroup.visible = false
        }
      }

      // Camera: orbit around maze center using azimuth + pan offset
      const { x: px, z: pz } = panRef.current
      const az = azimuthRef.current
      const orbitX = Math.sin(az) * camBack
      const orbitZ = Math.cos(az) * camBack
      camDesired.set(mazeCX + px + orbitX, camH, mazeCZ + pz + orbitZ)
      camLook.set(mazeCX + px, 0.5, mazeCZ + pz)
      camera.position.lerp(camDesired, 0.1)
      camera.lookAt(camLook)

      // Doors — clean state machine, no flicker
      const now = performance.now()
      doors.forEach(d => {
        if (d.state === 'closed') return
        const OPEN_A = 1.37  // ~78° — never fully edge-on, face always visible
        if (d.state === 'opening') {
          d.curA += (OPEN_A - d.curA) * 0.14
          d.group.rotation.y = d.curA
          if (OPEN_A - d.curA < 0.015) {
            d.curA = OPEN_A
            d.group.rotation.y = OPEN_A
            d.state = 'open'
            d.openedAt = now
          }
        } else if (d.state === 'open') {
          if (now - d.openedAt > 800) d.state = 'closing'
        } else if (d.state === 'closing') {
          d.curA += (0 - d.curA) * 0.12
          d.group.rotation.y = d.curA
          if (d.curA < 0.008) {
            d.curA = 0; d.group.rotation.y = 0; d.state = 'closed'
          }
        }
      })

      // Emoji markers
      const t = now * 0.001
      // Start emoji follows kid throughout the maze
      const markerY = char.HEIGHT + 1.25 + Math.sin(t * 2.2) * 0.12
      startMarker.sprite.position.set(kid.position.x, markerY, kid.position.z)
      startMarker.light.position.set(kid.position.x, char.HEIGHT + 1.1, kid.position.z)
      startMarker.light.intensity = 0.8 + Math.sin(t * 2.5) * 0.25
      // End emoji bobs at goal
      endMarker.sprite.position.y = 1.65 + Math.sin(t * 1.4) * endMarker.bobAmp
      endMarker.light.intensity   = 1.1 + Math.sin(t * 1.7) * 0.4

      renderer.render(scene, camera)
    }

    // Initial camera — south of maze, looking north across the whole grid
    azimuthRef.current = 0
    camera.position.set(mazeCX, camH, mazeCZ + camBack)
    camera.lookAt(mazeCX, 0.5, mazeCZ)

    tick()

    function applySize() {
      const w = mount.clientWidth, h = mount.clientHeight
      if (!w || !h) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const ro = new ResizeObserver(applySize)
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.forceContextLoss()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      moveRef.current = null
    }
  }, [grid, cols, rows]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard controls ───────────────────────────────────────────────────
  useEffect(() => {
    const map = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1],
                  w: [-1,0], s: [1,0], a: [0,-1], d: [0,1] }
    function onKey(e) {
      const v = map[e.key]; if (!v) return
      e.preventDefault()
      moveRef.current?.(v[0], v[1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Touch: 1-finger swipe = move kid · 2-finger drag = pan camera ─────
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const angle = Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX,
      )
      pan2Ref.current = { cx, cy, basePan: { ...panRef.current }, baseAz: azimuthRef.current, angle }
      touchRef.current = null
    } else if (e.touches.length === 1 && !pan2Ref.current) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }
  function onTouchMove(e) {
    if (pan2Ref.current && e.touches.length === 2) {
      e.preventDefault()
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const angle = Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX,
      )
      // Pan
      const ddx = cx - pan2Ref.current.cx
      const ddy = cy - pan2Ref.current.cy
      const sens = 0.025
      const maxPan = Math.max(cols, rows) * CELL * 0.6
      panRef.current = {
        x: Math.max(-maxPan, Math.min(maxPan, pan2Ref.current.basePan.x - ddx * sens)),
        z: Math.max(-maxPan, Math.min(maxPan, pan2Ref.current.basePan.z - ddy * sens)),
      }
      // Orbit — rotate azimuth by how much the finger angle changed
      const dAngle = angle - pan2Ref.current.angle
      azimuthRef.current = pan2Ref.current.baseAz + dAngle
    }
  }
  function onTouchEnd(e) {
    if (pan2Ref.current) {
      if (e.touches.length < 2) pan2Ref.current = null
      return
    }
    if (!touchRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    touchRef.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return
    Math.abs(dx) > Math.abs(dy)
      ? moveRef.current?.(0, dx > 0 ? 1 : -1)
      : moveRef.current?.(dy > 0 ? 1 : -1, 0)
  }

  const dpad = [
    { dr: -1, dc:  0, label: '▲', row: 1, col: 2 },
    { dr:  0, dc: -1, label: '◀', row: 2, col: 1 },
    { dr:  0, dc:  1, label: '▶', row: 2, col: 3 },
    { dr:  1, dc:  0, label: '▼', row: 3, col: 2 },
  ]
  const btnBase = {
    width: 50, height: 50, minWidth: 50, minHeight: 50,
    borderRadius: 14, border: 'none',
    background: 'rgba(255,255,255,0.88)', fontSize: 20,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.22)',
    touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
    fontFamily: 'Nunito, sans-serif',
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'inherit',
                  overflow: 'hidden', background: '#87ceeb', touchAction: 'none' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} />

      {/* D-pad */}
      <div style={{
        position: 'absolute', bottom: 18, right: 18,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 50px)',
        gridTemplateRows: 'repeat(3, 50px)',
        gap: 6,
      }}>
        {dpad.map(({ dr, dc, label, row, col }) => (
          <button key={label}
            style={{ ...btnBase, gridRow: row, gridColumn: col }}
            onPointerDown={e => { e.preventDefault(); moveRef.current?.(dr, dc) }}>
            {label}
          </button>
        ))}
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        background: 'rgba(0,0,0,0.32)', borderRadius: 8,
        padding: '4px 10px', fontSize: 11, color: 'white',
        fontFamily: 'Nunito, sans-serif', pointerEvents: 'none',
      }}>
        Arrow keys · D-pad · Swipe · 2-finger drag to pan
      </div>
    </div>
  )
}
