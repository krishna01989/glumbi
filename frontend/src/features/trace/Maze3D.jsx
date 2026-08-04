import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const CELL   = 2.4
const WALL_H = 1.6
const WALL_T = 0.18

function c2w(r, c) { return new THREE.Vector3(c * CELL, 0, r * CELL) }

// ── Character archetype lookup ─────────────────────────────────────────────
const FLIERS   = new Set(['🐝','🦋','🐦','🦅','🦜','🕊️','🦚','🦩','🦆','🦢','🦉','🦤','🐧','✈️','🛸','🚁','🧚','🪄','🐉','🐲','🧜','🦄','🐛','🦗','🦟','💫','⭐','🌟','🌈','☁️','🪁'])
const SWIMMERS = new Set(['🐟','🐠','🐡','🐬','🐳','🐋','🦈','🦑','🐙','🦐','🦞','🦀','🐚','🪸','🧜'])
const QUADS    = new Set(['🦊','🐱','🐶','🐰','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🦔','🐹','🦝','🦨','🦡','🦦','🦥','🐺','🦌','🐗','🐴','🦓','🦒','🐘','🦏','🦛'])
const ROCKETS  = new Set(['🚀','🛩️','🛺','🚂','🚃','🚄'])

function getCharType(emoji) {
  if (ROCKETS.has(emoji))  return 'rocket'
  if (FLIERS.has(emoji))   return 'flier'
  if (SWIMMERS.has(emoji)) return 'fish'
  if (QUADS.has(emoji))    return 'quad'
  return 'sprite'
}

// ── Per-emoji colour configs ───────────────────────────────────────────────
const QUAD_COLORS = {
  '🦊': { body: 0xE8732A, belly: 0xF5D5A0, detail: 0x222222 },
  '🐱': { body: 0xF4A460, belly: 0xFFFFFF, detail: 0xFFB6C1 },
  '🐶': { body: 0xC68642, belly: 0xF5DEB3, detail: 0x8B4513 },
  '🐰': { body: 0xFFFFFF, belly: 0xFFE4E1, detail: 0xFFB6C1 },
  '🐻': { body: 0x8B4513, belly: 0xD2691E, detail: 0x3B1F0A },
  '🐼': { body: 0x333333, belly: 0xFFFFFF, detail: 0x111111 },
  '🐨': { body: 0x888888, belly: 0xCCCCCC, detail: 0x555555 },
  '🐯': { body: 0xE8A020, belly: 0xF5D5A0, detail: 0x222222 },
  '🦁': { body: 0xD4A040, belly: 0xF0D080, detail: 0x8B6914 },
  '🦝': { body: 0x888888, belly: 0xCCCCCC, detail: 0x222222 },
  '🐺': { body: 0x888888, belly: 0xCCCCCC, detail: 0x333333 },
}
const FLIER_COLORS = {
  '🐝': { body: 0xFFD700, stripe: 0x222222, wing: 0xCCEEFF },
  '🦋': { body: 0xFF6600, stripe: 0x000000, wing: 0xFF8C00 },
  '🐦': { body: 0x4488FF, stripe: 0xFF4444, wing: 0x6699FF },
  '🦅': { body: 0x8B4513, stripe: 0xFFFFFF, wing: 0x8B4513 },
  '🦜': { body: 0x22CC44, stripe: 0xFF4400, wing: 0x22CC44 },
  '🕊️': { body: 0xFFFFFF, stripe: 0xDDDDDD, wing: 0xFFFFFF },
  '🧚': { body: 0xFFAADD, stripe: 0xFF88BB, wing: 0xFFEEFF },
}

// ── buildCharacter ─────────────────────────────────────────────────────────
function buildCharacter(emoji, primCol, emojiTexFn) {
  const type = getCharType(emoji)
  if (type === 'quad')   return buildQuad(emoji, primCol)
  if (type === 'flier')  return buildFlier(emoji, primCol)
  if (type === 'rocket') return buildRocket(primCol)
  if (type === 'fish')   return buildFish(primCol)
  if (type === 'sprite') return buildEmojiSprite(emoji, emojiTexFn)
  return buildKid(primCol)
}

// ── Helper ─────────────────────────────────────────────────────────────────
function mat(color, shininess = 40) {
  return new THREE.MeshPhongMaterial({ color, shininess })
}

// ── 1. Human kid (default fallback) ───────────────────────────────────────
function buildKid(primCol) {
  const group = new THREE.Group()
  const mSkin  = mat(0xFFCBA4, 40); const mHair = mat(0x3B1F0A, 10)
  const mShirt = mat(primCol,  30); const mPants= mat(0x2244AA, 20)
  const mShoe  = mat(0x221100, 60)
  const mWhite = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const mPupil = new THREE.MeshBasicMaterial({ color: 0x111111 })
  const mShine = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const mCheek = new THREE.MeshBasicMaterial({ color: 0xffaaaa, transparent: true, opacity: 0.55 })
  const mBelt  = mat(0x331100, 80)

  const shoeGeo = new THREE.BoxGeometry(0.16, 0.09, 0.22)
  const shoeL = new THREE.Mesh(shoeGeo, mShoe); shoeL.position.set(-0.11, 0.045, 0.02)
  const shoeR = new THREE.Mesh(shoeGeo, mShoe); shoeR.position.set(0.11, 0.045, 0.02)
  group.add(shoeL, shoeR)

  const legGeo = new THREE.BoxGeometry(0.15, 0.38, 0.15)
  const legL = new THREE.Mesh(legGeo, mPants); legL.position.set(-0.11, 0.28, 0)
  const legR = new THREE.Mesh(legGeo, mPants); legR.position.set(0.11, 0.28, 0)
  group.add(legL, legR)

  group.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.055, 0.24), mBelt), { position: new THREE.Vector3(0, 0.49, 0) }))
  group.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.40, 0.23), mShirt), { position: new THREE.Vector3(0, 0.69, 0) }))
  group.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.25), mWhite), { position: new THREE.Vector3(0, 0.895, 0) }))

  function makeArm(side) {
    const g = new THREE.Group()
    g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.22, 10), mShirt), { position: new THREE.Vector3(0, -0.11, 0) }))
    g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.20, 10), mSkin),  { position: new THREE.Vector3(0, -0.32, 0) }))
    g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), mSkin), { position: new THREE.Vector3(0, -0.44, 0) }))
    g.position.set(side * 0.30, 0.82, 0); g.rotation.z = side * -0.12
    return g
  }
  const armL = makeArm(-1), armR = makeArm(1)
  group.add(armL, armR)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 22, 16), mSkin)
  head.position.set(0, 1.16, 0); head.scale.set(1, 1.08, 0.96); group.add(head)

  const earGeo = new THREE.SphereGeometry(0.085, 10, 8)
  const earL = new THREE.Mesh(earGeo, mSkin); earL.position.set(-0.25, 1.16, 0); earL.scale.set(0.55, 0.7, 0.5)
  const earR = new THREE.Mesh(earGeo, mSkin); earR.position.set(0.25, 1.16, 0);  earR.scale.set(0.55, 0.7, 0.5)
  group.add(earL, earR)

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.272, 20, 12), mHair)
  hairCap.position.set(0, 1.22, -0.01); hairCap.scale.set(1, 0.62, 1); group.add(hairCap)
  ;[[-0.08,0.06],[0,0.1],[0.08,0.06]].forEach(([tx,tz]) => {
    const t = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), mHair)
    t.position.set(tx, 1.45, tz - 0.05); group.add(t)
  })

  function makeEye(side) {
    const g = new THREE.Group()
    g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), mWhite)))
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 8), mPupil)
    pupil.position.set(side * 0.01, -0.01, 0.055); g.add(pupil)
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), mShine)
    shine.position.set(side * 0.025, 0.025, 0.068); g.add(shine)
    g.position.set(side * 0.105, 1.18, 0.215); return g
  }
  group.add(makeEye(-1), makeEye(1))

  const browMat = new THREE.MeshBasicMaterial({ color: 0x2a1200 })
  const browGeo = new THREE.BoxGeometry(0.09, 0.022, 0.018)
  const browL = new THREE.Mesh(browGeo, browMat); browL.position.set(-0.105, 1.245, 0.235); browL.rotation.z = 0.18
  const browR = new THREE.Mesh(browGeo, browMat); browR.position.set(0.105, 1.245, 0.235); browR.rotation.z = -0.18
  group.add(browL, browR)

  group.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), mSkin), { position: new THREE.Vector3(0, 1.12, 0.254) }))

  const cheekGeo = new THREE.CircleGeometry(0.055, 12)
  const cheekL = new THREE.Mesh(cheekGeo, mCheek); cheekL.position.set(-0.155, 1.10, 0.245)
  const cheekR = new THREE.Mesh(cheekGeo, mCheek); cheekR.position.set(0.155, 1.10, 0.245)
  group.add(cheekL, cheekR)

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 8, 14, Math.PI), new THREE.MeshBasicMaterial({ color: 0xcc2211 }))
  smile.position.set(0, 1.08, 0.245); smile.rotation.z = Math.PI; group.add(smile)

  group.traverse(m => { if (m.isMesh) m.castShadow = true })
  const HEIGHT = 0

  return {
    group, HEIGHT,
    animate(dt, moving, walkT) {
      if (moving) {
        armL.rotation.x =  Math.sin(walkT) * 0.48
        armR.rotation.x = -Math.sin(walkT) * 0.48
        legL.rotation.x = -Math.sin(walkT) * 0.38
        legR.rotation.x =  Math.sin(walkT) * 0.38
        group.position.y = Math.abs(Math.sin(walkT * 2)) * 0.07
      } else {
        armL.rotation.x = armR.rotation.x = legL.rotation.x = legR.rotation.x = 0
        group.position.y = 0
      }
    },
    stopY() { group.position.y = 0 },
  }
}

// ── 2. Quadruped (fox, cat, dog, etc.) ────────────────────────────────────
function buildQuad(emoji, primCol) {
  const c = QUAD_COLORS[emoji] || { body: 0xE8732A, belly: 0xF5D5A0, detail: 0x222222 }
  const mBody   = mat(c.body,   30)
  const mBelly  = mat(c.belly,  20)
  const mDetail = mat(c.detail, 10)
  const mWhite  = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const mPupil  = new THREE.MeshBasicMaterial({ color: 0x111111 })

  const group = new THREE.Group()

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.80), mBody)
  body.position.set(0, 0.48, 0); group.add(body)

  // Belly patch
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.12), mBelly)
  belly.position.set(0, 0.40, 0.38); group.add(belly)

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), mBody)
  head.position.set(0, 0.72, 0.46); head.scale.set(1, 0.9, 1.1); group.add(head)

  // Snout
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.16), mBelly)
  snout.position.set(0, 0.63, 0.70); group.add(snout)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mDetail)
  nose.position.set(0, 0.67, 0.77); group.add(nose)

  // Ears
  function makeEar(side) {
    const g = new THREE.Group()
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.22, 6), mBody)
    g.add(outer)
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 6), mDetail)
    inner.position.y = 0.02; g.add(inner)
    g.position.set(side * 0.18, 0.96, 0.38); g.rotation.z = side * 0.12
    return g
  }
  group.add(makeEar(-1), makeEar(1))

  // Eyes
  function makeEye(side) {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), mWhite))
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 6), mPupil)
    p.position.set(side * 0.008, 0.01, 0.04); g.add(p)
    g.position.set(side * 0.11, 0.76, 0.67); return g
  }
  group.add(makeEye(-1), makeEye(1))

  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.10, 0.45, 10), mBody)
  tail.position.set(0, 0.60, -0.45); tail.rotation.x = -0.8; group.add(tail)
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), mBelly)
  tailTip.position.set(0, 0.75, -0.62); group.add(tailTip)

  // 4 legs
  const legGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.34, 8)
  function makeLeg(x, z) {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(legGeo, mBody))
    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.07, 0.18), mDetail)
    paw.position.set(0, -0.21, 0.04); g.add(paw)
    g.position.set(x, 0.28, z); return g
  }
  const fLegL = makeLeg(-0.18, 0.28), fLegR = makeLeg(0.18, 0.28)
  const bLegL = makeLeg(-0.18, -0.28), bLegR = makeLeg(0.18, -0.28)
  group.add(fLegL, fLegR, bLegL, bLegR)

  group.traverse(m => { if (m.isMesh) m.castShadow = true })
  const HEIGHT = 0

  return {
    group, HEIGHT,
    animate(dt, moving, walkT) {
      if (moving) {
        // Diagonal pairs: fL+bR swing together, fR+bL together
        fLegL.rotation.x =  Math.sin(walkT) * 0.5
        bLegR.rotation.x =  Math.sin(walkT) * 0.5
        fLegR.rotation.x = -Math.sin(walkT) * 0.5
        bLegL.rotation.x = -Math.sin(walkT) * 0.5
        group.position.y = Math.abs(Math.sin(walkT * 2)) * 0.05
      } else {
        fLegL.rotation.x = fLegR.rotation.x = bLegL.rotation.x = bLegR.rotation.x = 0
        group.position.y = 0
      }
    },
    stopY() { group.position.y = 0 },
  }
}

// ── 3. Flier (bee, butterfly, bird) ──────────────────────────────────────
function buildFlier(emoji, primCol) {
  const c = FLIER_COLORS[emoji] || { body: 0xFFD700, stripe: 0x222222, wing: 0xCCEEFF }
  const mBody   = mat(c.body,  40)
  const mStripe = mat(c.stripe, 10)
  const mWhite  = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const mPupil  = new THREE.MeshBasicMaterial({ color: 0x111111 })

  const group = new THREE.Group()
  // Float above ground
  group.position.y = 0.5

  // Body (oval)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), mBody)
  body.scale.set(0.9, 1.4, 0.9); body.position.set(0, 0, 0); group.add(body)

  // Stripes (2 dark bands)
  ;[0.08, -0.06].forEach(y => {
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 14), mStripe)
    stripe.position.y = y; group.add(stripe)
  })

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), mBody)
  head.position.set(0, 0.32, 0); group.add(head)

  // Eyes
  function makeEye(side) {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mWhite))
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 6), mPupil)
    p.position.set(side * 0.01, 0.01, 0.05); g.add(p)
    g.position.set(side * 0.09, 0.34, 0.14); return g
  }
  group.add(makeEye(-1), makeEye(1))

  // Antennae
  function makeAntenna(side) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.24, 6), mStripe)
    stick.position.set(side * 0.08, 0.54, 0.04); stick.rotation.z = side * -0.35
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mStripe)
    ball.position.set(side * 0.14, 0.68, 0.06); group.add(stick, ball)
  }
  makeAntenna(-1); makeAntenna(1)

  // Wings — translucent flat ellipses
  const wingGeo = new THREE.SphereGeometry(0.28, 12, 8)
  const wingMat = new THREE.MeshPhongMaterial({ color: c.wing, transparent: true, opacity: 0.65, side: THREE.DoubleSide, shininess: 120 })
  const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.scale.set(1.1, 0.18, 0.7); wingL.position.set(-0.30, 0.10, -0.05)
  const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.scale.set(1.1, 0.18, 0.7); wingR.position.set(0.30, 0.10, -0.05)
  group.add(wingL, wingR)

  // Lower wings (smaller)
  const wLo = wingGeo
  const wingLL = new THREE.Mesh(wLo, wingMat); wingLL.scale.set(0.7, 0.14, 0.5); wingLL.position.set(-0.24, -0.12, -0.04)
  const wingRL = new THREE.Mesh(wLo, wingMat); wingRL.scale.set(0.7, 0.14, 0.5); wingRL.position.set(0.24, -0.12, -0.04)
  group.add(wingLL, wingRL)

  group.traverse(m => { if (m.isMesh) m.castShadow = false })
  const HEIGHT = 0.5

  let wingPhase = 0
  return {
    group, HEIGHT,
    animate(dt, moving, walkT) {
      wingPhase += dt * 18
      const flap = Math.sin(wingPhase) * 0.55
      wingL.rotation.z  = -flap; wingR.rotation.z  = flap
      wingLL.rotation.z = -flap * 0.7; wingRL.rotation.z = flap * 0.7
      // Hover bob — faster when moving
      group.position.y = HEIGHT + Math.sin(walkT * (moving ? 3 : 1.5)) * 0.08
    },
    stopY() { group.position.y = HEIGHT },
  }
}

// ── 4. Rocket ─────────────────────────────────────────────────────────────
function buildRocket(primCol) {
  const mBody    = mat(0xEEEEEE, 60)
  const mNose    = mat(primCol,  40)
  const mFin     = mat(0xCC3322, 30)
  const mWindow  = new THREE.MeshPhongMaterial({ color: 0x88CCFF, shininess: 120, transparent: true, opacity: 0.85 })
  const mExhaust = mat(0xFF6600, 80)

  const group = new THREE.Group()
  group.position.y = 0.55

  // Body cylinder
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.65, 12), mBody)
  body.position.y = 0; group.add(body)

  // Nose cone
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 12), mNose)
  nose.position.y = 0.50; group.add(nose)

  // Window
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), mWindow)
  win.position.set(0, 0.08, 0.18); group.add(win)

  // 3 fins
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.18), mFin)
    fin.position.set(
      Math.sin((i / 3) * Math.PI * 2) * 0.18,
      -0.28,
      Math.cos((i / 3) * Math.PI * 2) * 0.18,
    )
    fin.rotation.y = (i / 3) * Math.PI * 2
    group.add(fin)
  }

  // Exhaust flame (cone)
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.25, 10), mExhaust)
  flame.position.y = -0.44; flame.rotation.z = Math.PI; group.add(flame)

  group.traverse(m => { if (m.isMesh) m.castShadow = false })
  const HEIGHT = 0.55

  return {
    group, HEIGHT,
    animate(dt, moving, walkT) {
      // Wobble side to side when moving, gentle hover when still
      const wobble = moving ? Math.sin(walkT * 2.5) * 0.10 : Math.sin(walkT) * 0.04
      group.rotation.z = wobble
      // Flame flicker
      flame.scale.y = 0.85 + Math.sin(walkT * 8) * 0.2
      group.position.y = HEIGHT + Math.sin(walkT * (moving ? 4 : 1.5)) * 0.06
    },
    stopY() { group.position.y = HEIGHT; group.rotation.z = 0 },
  }
}

// ── 5. Fish / swimmer ─────────────────────────────────────────────────────
function buildFish(primCol) {
  const mBody = mat(0x4488FF, 50)
  const mFin  = mat(0xFF8800, 30)
  const mBelly= mat(0xCCEEFF, 20)
  const mEye  = new THREE.MeshBasicMaterial({ color: 0x111111 })

  const group = new THREE.Group()
  group.position.y = 0.35

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), mBody)
  body.scale.set(1.5, 0.8, 0.9); group.add(body)

  // Belly stripe
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), mBelly)
  belly.scale.set(1.1, 0.6, 0.5); belly.position.set(0, -0.04, 0.10); group.add(belly)

  // Tail fin
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.22), mFin)
  tail.position.set(-0.38, 0, 0); group.add(tail)
  const tailTip1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.10), mFin)
  tailTip1.position.set(-0.46, 0.12, 0); group.add(tailTip1)
  const tailTip2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.10), mFin)
  tailTip2.position.set(-0.46, -0.12, 0); group.add(tailTip2)

  // Top fin
  const topFin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.04), mFin)
  topFin.position.set(0, 0.22, 0); group.add(topFin)

  // Eye
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mEye)
  eye.position.set(0.22, 0.06, 0.14); group.add(eye)
  const eyeShine = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }))
  eyeShine.position.set(0.225, 0.07, 0.17); group.add(eyeShine)

  // Face the right direction (fish swims sideways by default — rotate to face forward)
  group.rotation.y = Math.PI / 2

  group.traverse(m => { if (m.isMesh) m.castShadow = false })
  const HEIGHT = 0.35

  return {
    group, HEIGHT,
    animate(dt, moving, walkT) {
      // Tail wag
      const wag = Math.sin(walkT * (moving ? 5 : 2)) * (moving ? 0.35 : 0.12)
      tail.rotation.y    = wag
      tailTip1.rotation.y = wag * 1.3
      tailTip2.rotation.y = wag * 1.3
      // Gentle up-down swim
      group.position.y = HEIGHT + Math.sin(walkT * (moving ? 3 : 1)) * 0.07
    },
    stopY() { group.position.y = HEIGHT },
  }
}

// ── 6. Emoji sprite fallback (AI themes) ─────────────────────────────────
function buildEmojiSprite(emoji, emojiTexFn) {
  const group = new THREE.Group()
  const isFlier = FLIERS.has(emoji)
  const HEIGHT = isFlier ? 0.55 : 0

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexFn(emoji, 128), transparent: true }))
  sprite.scale.set(0.7, 0.7, 1)
  sprite.position.y = 0.35
  group.add(sprite)

  group.position.y = HEIGHT

  return {
    group, HEIGHT,
    animate(dt, moving, walkT) {
      if (isFlier) {
        group.position.y = HEIGHT + Math.sin(walkT * (moving ? 4 : 1.5)) * 0.09
        sprite.material.rotation = Math.sin(walkT * 2) * 0.08
      } else {
        group.position.y = HEIGHT + (moving ? Math.abs(Math.sin(walkT * 2)) * 0.10 : 0)
        sprite.material.rotation = moving ? Math.sin(walkT * 2) * 0.12 : 0
      }
    },
    stopY() { group.position.y = HEIGHT },
  }
}

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
