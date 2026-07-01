import React, { useState, useEffect, useRef } from 'react'
import { storyApi } from '../api/client'
import ThemeLoader from '../components/ThemeLoader'
import AudioPlayer from '../components/AudioPlayer'
import ConfirmDialog from '../components/ConfirmDialog'
import QuotaBanner from '../components/QuotaBanner'

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 640)
  useEffect(() => {
    const h = () => setM(window.innerWidth < 640)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return m
}

// Free keyword → illustration mapping (no API cost)
const SCENE_MAP = {
  dragon:   { bg: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', emoji: '🐉', stars: true },
  princess: { bg: 'linear-gradient(135deg,#f8c8d4,#f4a0b8,#e67ea3)', emoji: '👸', stars: false },
  forest:   { bg: 'linear-gradient(135deg,#134e2a,#1e7b45,#27ae60)',  emoji: '🌲', stars: false },
  ocean:    { bg: 'linear-gradient(135deg,#0077b6,#00b4d8,#90e0ef)',  emoji: '🌊', stars: false },
  space:    { bg: 'linear-gradient(135deg,#03001c,#301b3f,#3c415c)',  emoji: '🚀', stars: true },
  puppy:    { bg: 'linear-gradient(135deg,#f9d29d,#f4a261,#e76f51)',  emoji: '🐶', stars: false },
  magic:    { bg: 'linear-gradient(135deg,#4a0e8f,#7b2d8b,#c77dff)',  emoji: '🪄', stars: true },
  rainbow:  { bg: 'linear-gradient(135deg,#ff9a9e,#fad0c4,#ffecd2)',  emoji: '🌈', stars: false },
  castle:   { bg: 'linear-gradient(135deg,#636e72,#b2bec3,#dfe6e9)',  emoji: '🏰', stars: true },
  dinosaur: { bg: 'linear-gradient(135deg,#2d6a4f,#40916c,#74c69d)',  emoji: '🦕', stars: false },
  default:  { bg: 'linear-gradient(135deg,#667eea,#764ba2)',           emoji: '📖', stars: true },
}

function getScene(keywords = '') {
  const kw = keywords.toLowerCase()
  for (const [key, scene] of Object.entries(SCENE_MAP)) {
    if (kw.includes(key)) return scene
  }
  return SCENE_MAP.default
}

function StoryIllustration({ story }) {
  const scene = getScene(story.keywords)
  return (
    <div style={{
      background: scene.bg,
      borderRadius: '14px 14px 0 0',
      height: 180,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating stars */}
      {scene.stars && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, fontSize: 12, lineHeight: '28px', letterSpacing: '18px', padding: 8 }}>
          ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
        </div>
      )}
      <div style={{ fontSize: 72, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))', position: 'relative', zIndex: 1 }}>
        {scene.emoji}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
        {story.keywords || 'A magical story'}
      </div>
    </div>
  )
}

const LANG_SCRIPT = {
  tamil: 'தமிழ்', hindi: 'हिंदी', malayalam: 'മലയാളം',
  telugu: 'తెలుగు', kannada: 'ಕನ್ನಡ',
  spanish: 'Español', french: 'Français', italian: 'Italiano',
  chinese: '普通话', japanese: '日本語', korean: '한국어',
}

export default function Stories({ child, quota }) {
  const [stories, setStories] = useState([])
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [speaking, setSpeaking]         = useState(false)
  const [speakingLang, setSpeakingLang] = useState(null)
  const [audioSrc, setAudioSrc]         = useState(null)
  const [translating, setTranslating]   = useState(null)
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [langPickerPos,  setLangPickerPos]  = useState({ top: 0, right: 0 })
  const [error, setError]               = useState('')
  const [audioError, setAudioError]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // storyId to delete
  const [showList, setShowList]         = useState(true)
  const isMobile = useIsMobile()
  const langPickerRef = useRef(null)
  const langBtnRef    = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target)) setLangPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openLangPicker() {
    if (langBtnRef.current) {
      const rect = langBtnRef.current.getBoundingClientRect()
      const popupWidth = Math.min(280, window.innerWidth - 16)
      // align right edge to button right, but clamp so it doesn't go off left edge
      const rightEdge = window.innerWidth - rect.right
      const leftEdge  = rect.right - popupWidth
      const clampedRight = leftEdge < 8 ? window.innerWidth - popupWidth - 8 : rightEdge
      setLangPickerPos({ top: rect.bottom + 8, right: clampedRight })
    }
    setLangPickerOpen(o => !o)
  }

  useEffect(() => { loadStories() }, [child.id])

  async function loadStories() {
    const data = await storyApi.getByChild(child.id)
    setStories(data)
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!keywords.trim()) return
    setLoading(true)
    setError('')
    try {
      const story = await storyApi.generate({ childId: child.id, keywords })
      setStories(prev => [story, ...prev])
      setSelected(story)
      setKeywords('')
      window.__glumbiRefreshQuota?.()

    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleDelete(storyId) {
    setConfirmDelete(storyId)
  }

  async function confirmDeleteStory() {
    await storyApi.delete(confirmDelete)
    setStories(prev => prev.filter(s => s.id !== confirmDelete))
    if (selected?.id === confirmDelete) setSelected(null)
    setConfirmDelete(null)
  }

  async function toggleFav(storyId) {
    const updated = await storyApi.toggleFavorite(storyId)
    setStories(prev => prev.map(s => s.id === storyId ? updated : s))
    if (selected?.id === storyId) setSelected(updated)
  }

  const audioRef = useRef(null)

  function stopSpeaking() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setSpeaking(false); setSpeakingLang(null); setAudioSrc(null)
  }

  async function handleListen(story, lang) {
    if (speaking && speakingLang === lang) { stopSpeaking(); return }
    stopSpeaking()
    setAudioError('')
    setTranslating(lang)
    try {
      const url = storyApi.listenUrl(story.id, lang)
      const audio = new Audio(url)
      audioRef.current = audio
      // play() must be called here — in the click handler — to satisfy browser autoplay policy
      await audio.play()
      setSpeaking(true)
      setSpeakingLang(lang)
      setAudioSrc(url)
    } catch (e) {
      setAudioError('Could not play audio. Please try again.')
      audioRef.current = null
    } finally {
      setTranslating(null)
    }
  }

  const scene = selected ? getScene(selected.keywords) : null

  return (
    <>
    <ConfirmDialog
      open={!!confirmDelete}
      title="Delete Story?"
      message="This story will be permanently deleted."
      confirmLabel="Delete"
      onConfirm={confirmDeleteStory}
      onCancel={() => setConfirmDelete(null)}
    />
    <div style={{
      display: isMobile ? 'flex' : 'grid',
      flexDirection: isMobile ? 'column' : undefined,
      gridTemplateColumns: isMobile ? undefined : '320px 1fr',
      gap: isMobile ? 16 : 24,
      height: isMobile ? 'auto' : 'calc(100vh - 116px)',
    }}>
      {/* Mobile back button */}
      {isMobile && selected && (
        <button onClick={() => { setSelected(null); setShowList(true) }}
          style={{ alignSelf: 'flex-start', background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none', borderRadius: 50, padding: '8px 16px', fontWeight: 700, fontSize: 13 }}>
          ← Back to Stories
        </button>
      )}

      {/* ── Sidebar ── */}
      <div style={{ display: isMobile && selected ? 'none' : 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', padding: '4px 6px 4px 2px', margin: '0 -6px 0 -2px' }}>

        {/* Generator card */}
        <QuotaBanner quota={quota} />
        <form className="card" onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'linear-gradient(135deg,#fff9f0,#fff0f0)', border: '2px dashed #ffcdb8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🪄</span>
            <h3 style={{ fontSize: 18, color: 'var(--primary)' }}>Story Magic</h3>
          </div>
          <textarea
            placeholder={`What should ${child.name}'s story be about?\n\ne.g. dragon, brave girl, magic forest`}
            value={keywords} onChange={e => setKeywords(e.target.value)}
            rows={3} style={{ resize: 'none', background: 'white' }} />
          <button type="submit" className="btn-primary" disabled={loading || !keywords.trim() || quota?.used >= quota?.limit}
            style={{ fontSize: 16 }}>
            {loading ? <><span className="spinner" /> &nbsp;Creating magic…</> : '✨ Generate Story'}
          </button>
          {error && (
            <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
              🚫 {error}
            </div>
          )}
        </form>

        {/* Story cards list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading && <ThemeLoader theme={child.theme} />}
          {stories.map(s => (
            <div key={s.id}
              onClick={() => { setSelected(s); if (isMobile) setShowList(false) }}
              style={{
                borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                boxShadow: selected?.id === s.id ? '0 0 0 3px var(--primary), 0 4px 20px rgba(255,107,107,0.2)' : 'var(--shadow)',
                transition: 'box-shadow 0.2s',
              }}>
              {/* Mini illustration */}
              <div style={{
                background: getScene(s.keywords).bg,
                height: 60, display: 'flex', alignItems: 'center',
                padding: '0 14px', gap: 10,
              }}>
                <span style={{ fontSize: 28 }}>{getScene(s.keywords).emoji}</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 13, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {s.title}
                </span>
                <span onClick={e => { e.stopPropagation(); toggleFav(s.id) }} style={{ fontSize: 18, cursor: 'pointer' }}>
                  {s.favorite ? '⭐' : '☆'}
                </span>
              </div>
              <div style={{ background: 'white', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                  {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {s.keywords && <span className="tag" style={{ fontSize: 10 }}>{s.keywords.split(',')[0]}</span>}
                  {s.language && s.language !== 'english' && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#f0f0ff', color: '#5c6bc0', padding: '3px 8px', borderRadius: 50 }}>
                      {LANG_SCRIPT[s.language] || s.language}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {stories.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
              <div style={{ fontWeight: 700 }}>No stories yet!</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Generate your first magical story above</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Story Reader ── */}
      {selected ? (
        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Full illustration header */}
          <StoryIllustration story={selected} />

          {/* Story content */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'white', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontSize: isMobile ? 20 : 26, color: 'var(--text)', lineHeight: 1.2 }}>{selected.title}</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative' }}>
                {!speaking && (
                  <div style={{ position: 'relative' }} ref={langPickerRef}>
                    <button ref={langBtnRef} onClick={openLangPicker}
                      style={{ padding: '8px 16px', fontSize: 13, borderRadius: 50, border: 'none', background: '#4d96ff', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {translating ? <><span className="spinner" /> Translating…</> : '🔊 Listen'}
                    </button>
                    {langPickerOpen && (
                      <div style={{
                        position: 'fixed', top: langPickerPos.top, right: langPickerPos.right, zIndex: 1000,
                        background: 'white', borderRadius: 16, padding: 16,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
                        width: Math.min(280, window.innerWidth - 16), maxHeight: '70vh', overflowY: 'auto', border: '1px solid #f0f0f0',
                      }}>
                        {[
                          { group: '🌍 International', langs: [
                            { lang: 'english',  label: 'English',   script: 'English' },
                            { lang: 'spanish',  label: 'Español',   script: 'Español' },
                            { lang: 'french',   label: 'Français',  script: 'Français' },
                            { lang: 'italian',  label: 'Italiano',  script: 'Italiano' },
                            { lang: 'chinese',  label: '普通话',     script: '普通话' },
                            { lang: 'japanese', label: '日本語',     script: '日本語' },
                            { lang: 'korean',   label: '한국어',     script: '한국어' },
                          ]},
                          { group: '🇮🇳 Regional India', langs: [
                            { lang: 'tamil',     label: 'தமிழ்',      script: 'தமிழ்' },
                            { lang: 'hindi',     label: 'हिंदी',       script: 'हिंदी' },
                            { lang: 'malayalam', label: 'മലയാളം',    script: 'മലയാളം' },
                            { lang: 'telugu',    label: 'తెలుగు',     script: 'తెలుగు' },
                            { lang: 'kannada',   label: 'ಕನ್ನಡ',     script: 'ಕನ್ನಡ' },
                          ]},
                        ].map(({ group, langs }) => (
                          <div key={group} style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>{group}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {langs.map(({ lang, label }) => (
                                <button key={lang} onClick={() => { setLangPickerOpen(false); handleListen(selected, lang) }}
                                  style={{ padding: '6px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700, border: '1.5px solid #eee', background: speakingLang === lang ? '#4d96ff' : '#f5f5f5', color: speakingLang === lang ? 'white' : '#444', cursor: 'pointer' }}>
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => toggleFav(selected.id)}
                  style={{ padding: '8px 14px', fontSize: 18, background: selected.favorite ? '#fff3cd' : '#f5f5f5', borderRadius: 50 }}>
                  {selected.favorite ? '⭐' : '☆'}
                </button>
                <button onClick={() => handleDelete(selected.id)}
                  className="btn-danger" style={{ padding: '8px 14px', fontSize: 13 }}>
                  🗑
                </button>
              </div>
            </div>

            {/* Audio player */}
            {speaking && audioRef.current && (
              <AudioPlayer
                audio={audioRef.current}
                lang={speakingLang}
                onStop={stopSpeaking}
              />
            )}
            {audioError && (
              <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                🔇 {audioError}
              </div>
            )}

            <div style={{ height: 2, background: 'linear-gradient(to right,var(--primary),var(--accent),var(--green))', borderRadius: 4 }} />

            {/* Story text styled like a storybook */}
            <div style={{
              lineHeight: 2, fontSize: 17, color: '#444',
              whiteSpace: 'pre-wrap',
              fontFamily: 'Nunito, sans-serif',
              background: '#fffdf9',
              borderRadius: 14,
              padding: '20px 24px',
              border: '1.5px solid #f5ede4',
            }}>
              {/* Large drop cap on first letter */}
              {selected.content.slice(0, 1) && (
                <>
                  <span style={{ float: 'left', fontSize: 64, lineHeight: 0.8, marginRight: 8, marginTop: 8, color: 'var(--primary)', fontFamily: 'Fredoka One, cursive' }}>
                    {selected.content[0]}
                  </span>
                  {selected.content.slice(1)}
                </>
              )}
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
              <span>✨ Created for {child.name}</span>
              <span>{new Date(selected.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 16, color: 'var(--muted)',
          background: 'white', borderRadius: 20, boxShadow: 'var(--shadow)',
        }}>
          <div style={{ fontSize: 72 }}>📚</div>
          <div style={{ fontFamily: 'Fredoka One', fontSize: 20, color: '#ccc' }}>Pick a story to read!</div>
          <div style={{ fontSize: 13 }}>or generate a brand new one ✨</div>
        </div>
      )}
    </div>
    </>
  )
}
