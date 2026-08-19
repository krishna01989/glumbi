import { useState, useEffect } from 'react'
import ChaseRunner from './ChaseRunner'
import StoryRunner from './StoryRunner'

export default function GamePicker({ runnerLevelJson, characterEmoji, theme, birthYear, onClose }) {
  const [game, setGame] = useState(null)  // null | 'chase' | 'story'
  const col = theme?.primary || '#FF6B6B'

  // Session timeout exits all the way out, not just back to picker
  useEffect(() => {
    window.addEventListener('glumbi-force-exit', onClose)
    return () => window.removeEventListener('glumbi-force-exit', onClose)
  }, [onClose])

  if (game === 'chase') {
    return <ChaseRunner runnerLevelJson={runnerLevelJson} characterEmoji={characterEmoji}
                        theme={theme} birthYear={birthYear} onClose={() => setGame(null)} />
  }

  if (game === 'story') {
    return <StoryRunner runnerLevelJson={runnerLevelJson} characterEmoji={characterEmoji}
                        theme={theme} birthYear={birthYear} onClose={() => setGame(null)} />
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a1a',
                  display: 'flex', flexDirection: 'column', fontFamily: 'Nunito,sans-serif',
                  overflowY: 'auto' }}>
      <button onClick={onClose} style={{
        position: 'sticky', top: 14, alignSelf: 'flex-end', marginRight: 14, zIndex: 10001,
        width: 36, height: 36, minWidth: 36, minHeight: 36, padding: 0, flexShrink: 0,
        borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.18)',
        color: '#fff', fontSize: 16, cursor: 'pointer', lineHeight: 1,
      }}>✕</button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '16px 32px 32px', gap: 20, minHeight: 'max-content' }}>
        <div style={{ fontSize: 48 }}>🎮</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>Choose your game!</div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20,
                      padding: '14px 22px', maxWidth: 320, textAlign: 'center',
                      color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
          Pick a mini-game to play with your story
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          <button onClick={() => setGame('chase')} style={{
            background: col, color: '#fff', border: 'none', borderRadius: 20,
            padding: '18px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 130 }}>
            <span style={{ fontSize: 36 }}>👾</span>
            <span>Maze Chase</span>
            <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>Swipe to navigate</span>
          </button>
          <button onClick={() => setGame('story')} style={{
            background: 'rgba(255,255,255,0.14)', color: '#fff', border: `2px solid ${col}`,
            borderRadius: 20, padding: '18px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 130 }}>
            <span style={{ fontSize: 36 }}>🏃</span>
            <span>Story Run</span>
            <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>Tap to jump</span>
          </button>
        </div>
      </div>
    </div>
  )
}
