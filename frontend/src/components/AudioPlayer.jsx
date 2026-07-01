import { useEffect, useRef, useState } from 'react'

const LANG_EMOJI = {
  english: '🇬🇧', spanish: '🇪🇸', french: '🇫🇷', italian: '🇮🇹',
  chinese: '🇨🇳', japanese: '🇯🇵', korean: '🇰🇷',
  tamil: '🇮🇳', hindi: '🇮🇳', malayalam: '🇮🇳', telugu: '🇮🇳', kannada: '🇮🇳',
}

const LANG_LABEL = {
  english: 'English', spanish: 'Español', french: 'Français', italian: 'Italiano',
  chinese: '普通话', japanese: '日本語', korean: '한국어',
  tamil: 'தமிழ்', hindi: 'हिंदी', malayalam: 'മലയാളം', telugu: 'తెలుగు', kannada: 'ಕನ್ನಡ',
}

function fmt(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* audio — the live HTMLAudioElement created and already playing in the parent */
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export default function AudioPlayer({ audio, lang, onStop }) {
  const [playing,     setPlaying]     = useState(true)
  const [current,     setCurrent]     = useState(0)
  const [duration,    setDuration]    = useState(0)
  const [speed,       setSpeed]       = useState(1)
  const [speedOpen,   setSpeedOpen]   = useState(false)
  const [volume,      setVolume]      = useState(1)
  const [volOpen,     setVolOpen]     = useState(false)
  const seeking = useRef(false)

  useEffect(() => {
    if (!audio) return

    const onTime     = () => { if (!seeking.current) setCurrent(audio.currentTime) }
    const onMeta     = () => setDuration(audio.duration)
    const onPlay     = () => setPlaying(true)
    const onPause    = () => setPlaying(false)
    const onEnded    = () => { setPlaying(false); setCurrent(0); onStop?.() }

    // Audio may already have metadata (e.g. re-render)
    if (audio.duration) setDuration(audio.duration)
    if (audio.currentTime) setCurrent(audio.currentTime)

    audio.addEventListener('timeupdate',    onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('play',          onPlay)
    audio.addEventListener('pause',         onPause)
    audio.addEventListener('ended',         onEnded)

    return () => {
      audio.removeEventListener('timeupdate',    onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('play',          onPlay)
      audio.removeEventListener('pause',         onPause)
      audio.removeEventListener('ended',         onEnded)
    }
  }, [audio])

  function togglePlay() {
    if (!audio) return
    if (playing) audio.pause()
    else         audio.play()
  }

  function seek(val) {
    const t = Number(val)
    setCurrent(t)
    if (audio) audio.currentTime = t
  }

  function skip(secs) {
    if (!audio) return
    const max = isFinite(audio.duration) ? audio.duration : 0
    const t = Math.max(0, Math.min(audio.currentTime + secs, max || audio.currentTime + secs))
    audio.currentTime = t
    setCurrent(t)
  }

  function changeVolume(v) {
    const val = Number(v)
    if (audio) audio.volume = val
    setVolume(val)
  }

  function volIcon(v) {
    if (v === 0) return '🔇'
    if (v < 0.4) return '🔈'
    if (v < 0.7) return '🔉'
    return '🔊'
  }

  function applySpeed(s) {
    if (audio) audio.playbackRate = s
    setSpeed(s)
    setSpeedOpen(false)
  }

  function handleStop() {
    if (audio) { audio.pause(); audio.currentTime = 0 }
    onStop?.()
  }

  const pct   = duration > 0 ? (current / duration) * 100 : 0
  const emoji = LANG_EMOJI[lang] || '🔊'
  const label = LANG_LABEL[lang] || lang

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary), var(--accent, #ff8e53))',
      borderRadius: 20, padding: '14px 18px',
      boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column', gap: 10,
      animation: 'fadeIn 0.3s ease',
    }}>

      {/* Top row: language + sound bars + close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.3 }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Animated sound bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 20 }}>
            {[1, 1.6, 0.8, 1.4, 0.9, 1.5, 0.7].map((h, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 2,
                background: 'rgba(255,255,255,0.7)',
                height: playing ? `${h * 14}px` : '4px',
                transition: 'height 0.15s ease',
                animation: playing ? `wave-bar ${0.6 + i * 0.1}s ease-in-out infinite alternate` : 'none',
                animationDelay: `${i * 0.08}s`,
              }} />
            ))}
          </div>
          {/* Stop / close */}
          <button onClick={handleStop} title="Stop"
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
          {/* Track */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.25)' }} />
          {/* Fill */}
          <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 5, borderRadius: 4, background: 'white', transition: seeking.current ? 'none' : 'width 0.1s linear' }} />
          {/* Native range (transparent, on top for interaction) */}
          <input type="range" min={0} max={audio?.duration || duration || 100} step={0.5} value={current}
            onMouseDown={() => { seeking.current = true }}
            onTouchStart={() => { seeking.current = true }}
            onChange={e => seek(e.target.value)}
            onMouseUp={e  => { seeking.current = false; seek(e.target.value) }}
            onTouchEnd={() => { seeking.current = false }}
            style={{ position: 'absolute', left: 0, right: 0, width: '100%', opacity: 0, cursor: 'pointer', height: 20, margin: 0 }}
          />
          {/* Thumb dot */}
          <div style={{
            position: 'absolute', left: `calc(${pct}% - 8px)`,
            width: 16, height: 16, borderRadius: '50%',
            background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            transition: seeking.current ? 'none' : 'left 0.1s linear',
            pointerEvents: 'none',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button onClick={() => skip(-10)} title="Back 10s"
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ↩10
        </button>
        <button onClick={togglePlay} title={playing ? 'Pause' : 'Play'}
          style={{ background: 'white', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', color: 'var(--primary)', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(0,0,0,0.2)' }}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => skip(10)} title="Forward 10s"
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          10↪
        </button>
        {/* Volume */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setVolOpen(o => !o); setSpeedOpen(false) }} title="Volume"
            style={{ background: volOpen ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12, padding: '4px 10px', cursor: 'pointer', color: 'white', fontSize: 14, minWidth: 36, textAlign: 'center' }}>
            {volIcon(volume)}
          </button>
          {volOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, var(--primary), var(--accent, #ff8e53))',
              borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              padding: '12px 16px', zIndex: 10, minWidth: 160,
            }}>
              {/* Label + percentage */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 }}>VOLUME</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>{Math.round(volume * 100)}%</span>
              </div>
              {/* Custom track */}
              <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.25)' }} />
                <div style={{ position: 'absolute', left: 0, width: `${volume * 100}%`, height: 5, borderRadius: 4, background: 'white' }} />
                <input type="range" min={0} max={1} step={0.05} value={volume}
                  onChange={e => changeVolume(e.target.value)}
                  style={{ position: 'absolute', left: 0, right: 0, width: '100%', opacity: 0, cursor: 'pointer', height: 20, margin: 0 }} />
                <div style={{
                  position: 'absolute', left: `calc(${volume * 100}% - 8px)`,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', pointerEvents: 'none',
                }} />
              </div>
              {/* Min/max icons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                <span>🔇</span><span>🔊</span>
              </div>
            </div>
          )}
        </div>

        {/* Speed */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setSpeedOpen(o => !o); setVolOpen(false) }} title="Playback speed"
            style={{ background: speedOpen ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12, padding: '4px 10px', cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 800, minWidth: 42, textAlign: 'center' }}>
            {speed}×
          </button>
          {speedOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
              background: 'white', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              overflow: 'hidden', minWidth: 72, zIndex: 10,
            }}>
              {SPEEDS.map(s => (
                <button key={s} onClick={() => applySpeed(s)}
                  style={{
                    display: 'block', width: '100%', padding: '8px 14px',
                    background: s === speed ? 'var(--primary)' : 'transparent',
                    color: s === speed ? 'white' : '#333',
                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    textAlign: 'center',
                  }}>
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
