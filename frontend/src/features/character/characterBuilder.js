import * as THREE from 'three'

// ── Character archetype lookup sets ───────────────────────────────────────────
export const FLIERS   = new Set(['🐝','🦋','🐦','🦅','🦜','🕊️','🦚','🦩','🦆','🦢','🦉','🦤','🐧','✈️','🛸','🚁','🧚','🪄','🐉','🐲','🧜','🦄','🐛','🦗','🦟','💫','⭐','🌟','🌈','☁️','🪁'])
export const SWIMMERS = new Set(['🐟','🐠','🐡','🐬','🐳','🐋','🦈','🦑','🐙','🦐','🦞','🦀','🐚','🪸','🧜'])
export const QUADS    = new Set(['🦊','🐱','🐶','🐰','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🦔','🐹','🦝','🦨','🦡','🦦','🦥','🐺','🦌','🐗','🐴','🦓','🦒','🐘','🦏','🦛'])
export const ROCKETS  = new Set(['🚀','🛩️','🛺','🚂','🚃','🚄'])

// ── Per-emoji colour configs ───────────────────────────────────────────────────
export const QUAD_COLORS = {
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

export const FLIER_COLORS = {
  '🐝': { body: 0xFFD700, stripe: 0x222222, wing: 0xCCEEFF },
  '🦋': { body: 0xFF6600, stripe: 0x000000, wing: 0xFF8C00 },
  '🐦': { body: 0x4488FF, stripe: 0xFF4444, wing: 0x6699FF },
  '🦅': { body: 0x8B4513, stripe: 0xFFFFFF, wing: 0x8B4513 },
  '🦜': { body: 0x22CC44, stripe: 0xFF4400, wing: 0x22CC44 },
  '🕊️': { body: 0xFFFFFF, stripe: 0xDDDDDD, wing: 0xFFFFFF },
  '🧚': { body: 0xFFAADD, stripe: 0xFF88BB, wing: 0xFFEEFF },
}

// ── Shared material helper ─────────────────────────────────────────────────────
export function mat(color, shininess = 40) {
  return new THREE.MeshPhongMaterial({ color, shininess })
}

// ── Archetype classifier ───────────────────────────────────────────────────────
export function getCharType(emoji) {
  if (ROCKETS.has(emoji))  return 'rocket'
  if (FLIERS.has(emoji))   return 'flier'
  if (SWIMMERS.has(emoji)) return 'fish'
  if (QUADS.has(emoji))    return 'quad'
  return 'sprite'
}

// ── 1. Human kid (default / Universe Hub avatar) ──────────────────────────────
export function buildKid(primCol) {
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

// ── 2. Quadruped (fox, cat, dog, etc.) ────────────────────────────────────────
export function buildQuad(emoji, primCol) {
  const c = QUAD_COLORS[emoji] || { body: 0xE8732A, belly: 0xF5D5A0, detail: 0x222222 }
  const mBody   = mat(c.body,   30)
  const mBelly  = mat(c.belly,  20)
  const mDetail = mat(c.detail, 10)
  const mWhite  = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const mPupil  = new THREE.MeshBasicMaterial({ color: 0x111111 })

  const group = new THREE.Group()

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.80), mBody)
  body.position.set(0, 0.48, 0); group.add(body)

  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.12), mBelly)
  belly.position.set(0, 0.40, 0.38); group.add(belly)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), mBody)
  head.position.set(0, 0.72, 0.46); head.scale.set(1, 0.9, 1.1); group.add(head)

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.16), mBelly)
  snout.position.set(0, 0.63, 0.70); group.add(snout)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mDetail)
  nose.position.set(0, 0.67, 0.77); group.add(nose)

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

  function makeEye(side) {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), mWhite))
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 6), mPupil)
    p.position.set(side * 0.008, 0.01, 0.04); g.add(p)
    g.position.set(side * 0.11, 0.76, 0.67); return g
  }
  group.add(makeEye(-1), makeEye(1))

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.10, 0.45, 10), mBody)
  tail.position.set(0, 0.60, -0.45); tail.rotation.x = -0.8; group.add(tail)
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), mBelly)
  tailTip.position.set(0, 0.75, -0.62); group.add(tailTip)

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

// ── 3. Flier (bee, butterfly, bird) ───────────────────────────────────────────
export function buildFlier(emoji, primCol) {
  const c = FLIER_COLORS[emoji] || { body: 0xFFD700, stripe: 0x222222, wing: 0xCCEEFF }
  const mBody   = mat(c.body,  40)
  const mStripe = mat(c.stripe, 10)
  const mWhite  = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const mPupil  = new THREE.MeshBasicMaterial({ color: 0x111111 })

  const group = new THREE.Group()
  group.position.y = 0.5

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), mBody)
  body.scale.set(0.9, 1.4, 0.9); body.position.set(0, 0, 0); group.add(body)

  ;[0.08, -0.06].forEach(y => {
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 14), mStripe)
    stripe.position.y = y; group.add(stripe)
  })

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), mBody)
  head.position.set(0, 0.32, 0); group.add(head)

  function makeEye(side) {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mWhite))
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 6), mPupil)
    p.position.set(side * 0.01, 0.01, 0.05); g.add(p)
    g.position.set(side * 0.09, 0.34, 0.14); return g
  }
  group.add(makeEye(-1), makeEye(1))

  function makeAntenna(side) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.24, 6), mStripe)
    stick.position.set(side * 0.08, 0.54, 0.04); stick.rotation.z = side * -0.35
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mStripe)
    ball.position.set(side * 0.14, 0.68, 0.06); group.add(stick, ball)
  }
  makeAntenna(-1); makeAntenna(1)

  const wingGeo = new THREE.SphereGeometry(0.28, 12, 8)
  const wingMat = new THREE.MeshPhongMaterial({ color: c.wing, transparent: true, opacity: 0.65, side: THREE.DoubleSide, shininess: 120 })
  const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.scale.set(1.1, 0.18, 0.7); wingL.position.set(-0.30, 0.10, -0.05)
  const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.scale.set(1.1, 0.18, 0.7); wingR.position.set(0.30, 0.10, -0.05)
  group.add(wingL, wingR)

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
      group.position.y = HEIGHT + Math.sin(walkT * (moving ? 3 : 1.5)) * 0.08
    },
    stopY() { group.position.y = HEIGHT },
  }
}

// ── 4. Rocket ─────────────────────────────────────────────────────────────────
export function buildRocket(primCol) {
  const mBody    = mat(0xEEEEEE, 60)
  const mNose    = mat(primCol,  40)
  const mFin     = mat(0xCC3322, 30)
  const mWindow  = new THREE.MeshPhongMaterial({ color: 0x88CCFF, shininess: 120, transparent: true, opacity: 0.85 })
  const mExhaust = mat(0xFF6600, 80)

  const group = new THREE.Group()
  group.position.y = 0.55

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.65, 12), mBody)
  body.position.y = 0; group.add(body)

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 12), mNose)
  nose.position.y = 0.50; group.add(nose)

  const win = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), mWindow)
  win.position.set(0, 0.08, 0.18); group.add(win)

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

  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.25, 10), mExhaust)
  flame.position.y = -0.44; flame.rotation.z = Math.PI; group.add(flame)

  group.traverse(m => { if (m.isMesh) m.castShadow = false })
  const HEIGHT = 0.55

  return {
    group, HEIGHT,
    animate(dt, moving, walkT) {
      const wobble = moving ? Math.sin(walkT * 2.5) * 0.10 : Math.sin(walkT) * 0.04
      group.rotation.z = wobble
      flame.scale.y = 0.85 + Math.sin(walkT * 8) * 0.2
      group.position.y = HEIGHT + Math.sin(walkT * (moving ? 4 : 1.5)) * 0.06
    },
    stopY() { group.position.y = HEIGHT; group.rotation.z = 0 },
  }
}

// ── 5. Fish / swimmer ─────────────────────────────────────────────────────────
export function buildFish(primCol) {
  const mBody = mat(0x4488FF, 50)
  const mFin  = mat(0xFF8800, 30)
  const mBelly= mat(0xCCEEFF, 20)
  const mEye  = new THREE.MeshBasicMaterial({ color: 0x111111 })

  const group = new THREE.Group()
  group.position.y = 0.35

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), mBody)
  body.scale.set(1.5, 0.8, 0.9); group.add(body)

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), mBelly)
  belly.scale.set(1.1, 0.6, 0.5); belly.position.set(0, -0.04, 0.10); group.add(belly)

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.22), mFin)
  tail.position.set(-0.38, 0, 0); group.add(tail)
  const tailTip1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.10), mFin)
  tailTip1.position.set(-0.46, 0.12, 0); group.add(tailTip1)
  const tailTip2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.10), mFin)
  tailTip2.position.set(-0.46, -0.12, 0); group.add(tailTip2)

  const topFin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.04), mFin)
  topFin.position.set(0, 0.22, 0); group.add(topFin)

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mEye)
  eye.position.set(0.22, 0.06, 0.14); group.add(eye)
  const eyeShine = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }))
  eyeShine.position.set(0.225, 0.07, 0.17); group.add(eyeShine)

  group.rotation.y = Math.PI / 2

  group.traverse(m => { if (m.isMesh) m.castShadow = false })
  const HEIGHT = 0.35

  return {
    group, HEIGHT,
    animate(dt, moving, walkT) {
      const wag = Math.sin(walkT * (moving ? 5 : 2)) * (moving ? 0.35 : 0.12)
      tail.rotation.y    = wag
      tailTip1.rotation.y = wag * 1.3
      tailTip2.rotation.y = wag * 1.3
      group.position.y = HEIGHT + Math.sin(walkT * (moving ? 3 : 1)) * 0.07
    },
    stopY() { group.position.y = HEIGHT },
  }
}

// ── 6. Emoji sprite fallback (AI custom themes) ────────────────────────────────
export function buildEmojiSprite(emoji, emojiTexFn) {
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

// ── Main dispatcher ────────────────────────────────────────────────────────────
// emojiTexFn: (emoji, size) => THREE.CanvasTexture — caller provides this
// because it requires a browser canvas and is feature-specific
export function buildCharacter(emoji, primCol, emojiTexFn) {
  const type = getCharType(emoji)
  if (type === 'quad')   return buildQuad(emoji, primCol)
  if (type === 'flier')  return buildFlier(emoji, primCol)
  if (type === 'rocket') return buildRocket(primCol)
  if (type === 'fish')   return buildFish(primCol)
  if (type === 'sprite') return buildEmojiSprite(emoji, emojiTexFn)
  return buildKid(primCol)
}
