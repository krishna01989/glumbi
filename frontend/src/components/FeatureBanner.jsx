import { useEffect, useRef } from 'react'

const FEATURE_META = {
  stories:    { emoji: '📖', title: 'Stories',        subtitle: 'Dive into magical adventures!',      floaters: ['📚','✨','⭐','🌟','🪄'] },
  activities: { emoji: '🎮', title: 'Activities',     subtitle: 'Play, learn and level up!',          floaters: ['🏆','⚡','🎯','🌟','🎲'] },
  learn:      { emoji: '✏️', title: 'Learn to Write', subtitle: 'Practice makes perfect!',            floaters: ['🔤','⭐','📝','🌟','💡'] },
  curiosity:  { emoji: '🔍', title: 'Curiosity',      subtitle: 'Explore the world around you!',      floaters: ['🌍','💡','🔬','🚀','⭐'] },
  draw:       { emoji: '🎨', title: 'Draw',           subtitle: 'Unleash your inner artist!',         floaters: ['🖌️','✏️','🎭','⭐','🌈'] },
  journal:    { emoji: '📝', title: 'Journal',        subtitle: 'Capture your memories!',             floaters: ['💭','✨','🌈','⭐','🦋'] },
  readquiz:   { emoji: '📚', title: 'Read & Quiz',    subtitle: 'Read, learn and test yourself!',     floaters: ['🧠','💡','⭐','🎯','🏆'] },
  mywriting:  { emoji: '✍️', title: 'My Writing',     subtitle: 'Tell your own story!',               floaters: ['💭','✨','📖','🌟','🦄'] },
  memory:             { emoji: '🧠', title: 'Memory Play',    subtitle: 'Train your brain!',       floaters: ['📇','🎴','💡','⭐','🌟'] },
  'memory-flashcards':{ emoji: '📇', title: 'Flashcards',    subtitle: 'Flip & learn!',            floaters: ['📇','💡','⭐','🌟','✨'] },
  'memory-match':     { emoji: '🎴', title: 'Memory Match',  subtitle: 'Find the pairs!',          floaters: ['🎴','🃏','⭐','🌟','✨'] },
  'memory-wordofday': { emoji: '💬', title: 'Word of Day',   subtitle: 'Grow your words!',         floaters: ['💬','📖','⭐','🌟','✨'] },
  timeline:   { emoji: '🗓️', title: 'Timeline',       subtitle: 'Your journey so far!',               floaters: ['⭐','🌈','✨','💫','🎉'] },
  maze:       { emoji: '🌀', title: 'Maze',            subtitle: 'Find the right path through the maze!', floaters: ['🦊','🚀','🐝','🐱','⭐','🌈'] },
  riddle:     { emoji: '🧩', title: 'Riddle',         subtitle: 'Can you crack the riddle?',           floaters: ['💡','🌟','❓','🧠','✨','🎯'] },
  flipbook:     { emoji: '🎬', title: 'Flipbook Studio', subtitle: 'Make your drawings move!',           floaters: ['🎞️','✨','🖌️','⭐','🎭'] },
  'torch-hunt': { emoji: '🔦', title: 'Torch Hunt',     subtitle: 'Shine your light, find what hides!', floaters: ['🌙','⭐','🔦','✨','🌟'] },
}

export default function FeatureBanner({ feature, child, isMobile }) {
  const meta = FEATURE_META[feature] || { emoji: '✨', title: feature, subtitle: '', floaters: ['⭐','🌟','✨'] }
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const particles = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 10 + Math.random() * 14,
      speed: 0.3 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.4,
      opacity: 0.12 + Math.random() * 0.18,
      emoji: meta.floaters[i % meta.floaters.length],
      phase: Math.random() * Math.PI * 2,
    }))

    let raf
    let t = 0
    function draw() {
      ctx.clearRect(0, 0, W, H)
      t += 0.012
      particles.forEach(p => {
        ctx.globalAlpha = p.opacity * (0.7 + 0.3 * Math.sin(t + p.phase))
        ctx.font = `${p.size}px serif`
        ctx.fillText(p.emoji, p.x, p.y)
        p.y -= p.speed
        p.x += p.drift
        if (p.y < -30) { p.y = H + 20; p.x = Math.random() * W }
        if (p.x < -30) p.x = W + 20
        if (p.x > W + 30) p.x = -20
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [feature])

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--header-grad)',
      borderRadius: isMobile ? 16 : 24,
      padding: isMobile ? '20px 20px 24px' : '24px 32px 28px',
      marginBottom: isMobile ? 12 : 16,
      flexShrink: 0,
    }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 18 }}>
        <div style={{
          fontSize: isMobile ? 44 : 56,
          animation: 'fb-bounce 2.4s ease-in-out infinite',
          flexShrink: 0, lineHeight: 1,
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
        }}>{meta.emoji}</div>
        <div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: isMobile ? 20 : 26, color: 'white', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            {meta.title}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
            {child?.name ? `Hey ${child.name}! ` : ''}{meta.subtitle}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fb-bounce {
          0%, 100% { transform: translateY(0) rotate(-3deg) }
          50%       { transform: translateY(-8px) rotate(3deg) }
        }
      `}</style>
    </div>
  )
}
