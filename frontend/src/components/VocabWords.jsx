import { useState } from 'react'
import { learnApi } from '../api/client'

export default function VocabWords({ vocabWordsJson, theme }) {
  const [playing, setPlaying] = useState(null)

  if (!vocabWordsJson) return null
  let words = []
  try { words = JSON.parse(vocabWordsJson) } catch { return null }
  if (!words.length) return null

  const primary   = theme?.primary   || '#ff6b6b'
  const primaryLt = theme?.primaryLt || '#ff9f9f'
  const cardBg    = theme?.cardBg    || '#fff'

  const playWord = async (word) => {
    if (playing === word) return
    setPlaying(word)
    try {
      const url = await learnApi.vocabAudioUrl(word)
      const audio = new Audio(url)
      audio.onended = () => setPlaying(null)
      audio.onerror = () => setPlaying(null)
      audio.play()
    } catch {
      setPlaying(null)
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>💎</span>
        <span style={{ fontWeight: 900, fontSize: 15, color: primary }}>Word Treasure</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {words.map((v, i) => (
          <div key={i} style={{
            background: cardBg,
            borderRadius: 14,
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            border: `1.5px solid ${primaryLt}33`,
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{v.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: primary, marginBottom: 2 }}>{v.word?.toLowerCase()}</div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.4 }}>{v.definition}</div>
            </div>
            <button
              onClick={() => playWord(v.word)}
              style={{
                background: playing === v.word ? primary : `${primary}18`,
                border: 'none', borderRadius: '50%',
                width: 36, height: 36, minWidth: 36, minHeight: 36,
                cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, padding: 0,
              }}
            >
              {playing === v.word ? '🔊' : '🔉'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
