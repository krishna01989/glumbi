import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildCharacter } from './characterBuilder'

// Lightweight Three.js character panel — no maze, just the character.
// state: 'idle' | 'celebrate' | 'oops'
export default function CharacterPanel({ emoji = '🦊', primaryColor = '#ff6b6b', state = 'idle', size = 90 }) {
  const mountRef    = useRef(null)
  const stateRef    = useRef(state)
  const oopsRef     = useRef(0)   // oops shake phase
  const celebRef    = useRef(0)   // celebrate phase

  // Sync state changes without recreating the scene
  useEffect(() => {
    const prev = stateRef.current
    stateRef.current = state
    if (prev !== 'oops'      && state === 'oops')      oopsRef.current  = 0
    if (prev !== 'celebrate' && state === 'celebrate')  celebRef.current = 0
  }, [state])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 20)
    camera.position.set(0, 0.9, 2.0)
    camera.lookAt(0, 0.7, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.85))
    const key = new THREE.DirectionalLight(0xfffbe0, 0.75)
    key.position.set(2, 4, 3)
    scene.add(key)

    function emojiTex(e, s = 128) {
      const cv = document.createElement('canvas')
      cv.width = cv.height = s
      const ctx = cv.getContext('2d')
      ctx.font = `${s * 0.78}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(e, s / 2, s / 2 + 4)
      return new THREE.CanvasTexture(cv)
    }

    const col = new THREE.Color(primaryColor)
    const char = buildCharacter(emoji, col, emojiTex)
    scene.add(char.group)

    // Daze stars (for celebrate state)
    const starsGroup = new THREE.Group()
    starsGroup.visible = false
    const starMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 })
    ;[0, 1, 2, 3, 4].forEach(i => {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 4), starMat)
      star.userData.baseAngle = (i / 5) * Math.PI * 2
      starsGroup.add(star)
    })
    starsGroup.position.y = char.HEIGHT + 2.0
    scene.add(starsGroup)

    let walkT = 0
    let animId
    let lastTime = performance.now()

    function tick(now) {
      animId = requestAnimationFrame(tick)
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const st = stateRef.current
      walkT += dt * (st === 'celebrate' ? 3.5 : 1.5)

      if (st === 'oops') {
        oopsRef.current += dt * 11
        char.group.rotation.y = Math.sin(oopsRef.current) * 0.4 * Math.exp(-oopsRef.current * 0.28)
        char.group.position.y = 0
        char.animate(dt, false, walkT)
        starsGroup.visible = false
      } else if (st === 'celebrate') {
        celebRef.current += dt
        char.group.rotation.y = Math.sin(celebRef.current * 3.2) * 0.28
        char.group.position.y = Math.abs(Math.sin(celebRef.current * 4)) * 0.18
        char.animate(dt, true, walkT)
        starsGroup.visible = true
        starsGroup.rotation.y += dt * 4.5
        starsGroup.children.forEach(star => {
          const a = star.userData.baseAngle + starsGroup.rotation.y
          star.position.set(Math.sin(a) * 0.42, 0, Math.cos(a) * 0.42)
        })
      } else {
        // idle
        char.group.rotation.y = 0
        char.animate(dt, false, walkT)
        starsGroup.visible = false
        if (char.stopY && stateRef.current === 'idle') {
          // allow the archetype's own idle to control Y
        }
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animId)
      renderer.forceContextLoss()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [emoji, primaryColor, size]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={mountRef} style={{ width: size, height: size, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }} />
  )
}
