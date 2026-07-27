import { useEffect, useRef } from 'react'

const COLORS = ['#ff6b6b','#ffd32a','#2ed573','#1e90ff','#ff69b4','#ffa502','#9c6ef8','#00bcd4','#ff4757','#26de81']
const SHAPES = ['circle','square','strip']

function rand(min, max) { return Math.random() * (max - min) + min }

export default function Confetti({ count = 120, duration = 2800 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: count }, () => ({
      x:      rand(0, canvas.width),
      y:      rand(-80, -10),
      w:      rand(7, 14),
      h:      rand(5, 10),
      color:  COLORS[Math.floor(rand(0, COLORS.length))],
      shape:  SHAPES[Math.floor(rand(0, SHAPES.length))],
      vx:     rand(-2.5, 2.5),
      vy:     rand(3, 7),
      angle:  rand(0, Math.PI * 2),
      spin:   rand(-0.12, 0.12),
      opacity:1,
    }))

    const start = performance.now()
    let raf

    function draw(now) {
      const elapsed = now - start
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const fadeStart = duration * 0.6
      particles.forEach(p => {
        p.x     += p.vx
        p.y     += p.vy
        p.vy    += 0.12          // gravity
        p.angle += p.spin
        p.opacity = elapsed > fadeStart
          ? Math.max(0, 1 - (elapsed - fadeStart) / (duration * 0.4))
          : 1

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 4, p.w, p.h / 2)
        }
        ctx.restore()
      })

      if (elapsed < duration) {
        raf = requestAnimationFrame(draw)
      }
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [count, duration])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        pointerEvents: 'none', width: '100%', height: '100%',
      }}
    />
  )
}
