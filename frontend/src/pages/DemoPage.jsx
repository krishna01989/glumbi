import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoApi } from '../api/client'
import ErrorBox from '../components/ErrorBox'
import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'

const SCENE_MAP = {
  dragon:   { bg: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', emoji: '🐉' },
  princess: { bg: 'linear-gradient(135deg,#f8c8d4,#f4a0b8,#e67ea3)', emoji: '👸' },
  forest:   { bg: 'linear-gradient(135deg,#134e2a,#1e7b45,#27ae60)',  emoji: '🌲' },
  ocean:    { bg: 'linear-gradient(135deg,#0077b6,#00b4d8,#90e0ef)',  emoji: '🌊' },
  space:    { bg: 'linear-gradient(135deg,#03001c,#301b3f,#3c415c)',  emoji: '🚀' },
  puppy:    { bg: 'linear-gradient(135deg,#f9d29d,#f4a261,#e76f51)',  emoji: '🐶' },
  magic:    { bg: 'linear-gradient(135deg,#4a0e8f,#7b2d8b,#c77dff)',  emoji: '🪄' },
  rainbow:  { bg: 'linear-gradient(135deg,#ff9a9e,#fad0c4,#ffecd2)',  emoji: '🌈' },
  safari:   { bg: 'linear-gradient(135deg,#c8a96e,#e6c97a,#f5e6b0)',  emoji: '🦁' },
  robot:    { bg: 'linear-gradient(135deg,#37474f,#546e7a,#90a4ae)',   emoji: '🤖' },
  fairy:    { bg: 'linear-gradient(135deg,#e040fb,#ab47bc,#f8bbd0)',   emoji: '🧚' },
  default:  { bg: 'linear-gradient(135deg,#667eea,#764ba2)',           emoji: '📖' },
}

function getScene(keywords = '') {
  const kw = keywords.toLowerCase()
  for (const [key, scene] of Object.entries(SCENE_MAP)) {
    if (key !== 'default' && kw.includes(key)) return scene
  }
  return SCENE_MAP.default
}

const DEMO_CATEGORIES = [
  { id: 'adventure',  emoji: '⚡', label: 'Adventure' },
  { id: 'bedtime',    emoji: '🌙', label: 'Bedtime' },
  { id: 'funny',      emoji: '😂', label: 'Funny' },
  { id: 'mystery',    emoji: '🔍', label: 'Mystery' },
  { id: 'friendship', emoji: '🤝', label: 'Friendship' },
  { id: 'nature',     emoji: '🌿', label: 'Nature' },
  { id: 'space',      emoji: '🚀', label: 'Space' },
]

export default function DemoPage() {
  const navigate = useNavigate()
  const [childName, setChildName] = useState('')
  const [keywords,  setKeywords]  = useState('')
  const [category,  setCategory]  = useState('adventure')
  const [story,     setStory]     = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [limitHit,  setLimitHit]  = useState(false)

  // Reset loading state when browser restores page from bfcache (back button after 403 redirect)
  useEffect(() => {
    const handlePageShow = (e) => { if (e.persisted) setLoading(false) }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  // Turnstile
  const turnstileRef    = useRef(null)
  const widgetIdRef     = useRef(null)
  const turnstileToken  = useRef(null)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  useEffect(() => {
    // Poll until Turnstile script loads, then render widget
    const iv = setInterval(() => {
      if (!window.turnstile || !turnstileRef.current || widgetIdRef.current != null) return
      clearInterval(iv)
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback:          (token) => { turnstileToken.current = token },
        'expired-callback': ()      => { turnstileToken.current = null },
        'error-callback':   ()      => { turnstileToken.current = null },
        size: 'normal',
        theme: 'light',
      })
    }, 100)
    return () => clearInterval(iv)
  }, [siteKey])

  async function handleGenerate(e) {
    e.preventDefault()
    setError(''); setStory(null)

    setLoading(true)
    try {
      const result = await demoApi.story(childName, keywords, turnstileToken.current || '', category)
      setStory(result)
      // Reset widget so they get a fresh token for next generation
      if (widgetIdRef.current != null) {
        window.turnstile.reset(widgetIdRef.current)
        turnstileToken.current = null
      }
    } catch (err) {
      // axios interceptor swallows 403 via window.location — always reset loading
      setLoading(false)
      if (err.message?.includes('free demo') || err.message?.includes('limitReached')) {
        setLimitHit(true)
      } else {
        setError(err.message || 'Something went wrong. Please try again!')
        if (widgetIdRef.current != null) window.turnstile.reset(widgetIdRef.current)
      }
    } finally {
      setLoading(false)
    }
  }

  const scene = story ? getScene(keywords) : null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fff9f0,#fff0f0)', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', flex: 1, padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,24px)', boxSizing: 'border-box' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 'clamp(28px,5vw,42px)', fontFamily: 'Nunito, sans-serif', color: '#ff6b6b', lineHeight: 1.2, marginBottom: 12 }}>
            ✨ Try Glumbi Live
          </div>
          <p style={{ fontSize: 'clamp(14px,2.5vw,17px)', color: '#888', maxWidth: 480, margin: '0 auto' }}>
            Enter any child's name, pick a story type, and a few ideas — watch Glumbi AI create a magical story in seconds. No sign-up needed!
          </p>
          <div style={{ display: 'inline-block', marginTop: 12, background: '#fff3cd', color: '#856404', padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>
            🎁 2 free stories per day • No credit card
          </div>
        </div>

        {/* Generator */}
        {!limitHit && (
          <form onSubmit={handleGenerate} style={{
            background: 'white', borderRadius: 24, padding: 'clamp(20px,4vw,32px)',
            boxShadow: '0 8px 40px rgba(255,107,107,0.12)',
            border: '2px dashed #ffcdb8', marginBottom: 32,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#555', display: 'block', marginBottom: 8 }}>
                  👦 Child's name
                </label>
                <input
                  value={childName} onChange={e => setChildName(e.target.value)}
                  placeholder="e.g. Emma, Liam, Sofia, Noah…"
                  maxLength={30} required
                  style={{ padding: '12px 16px', borderRadius: 12, border: '2px solid #eee', fontSize: 15, width: '100%', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#555', display: 'block', marginBottom: 8 }}>
                  🎭 Story type
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {DEMO_CATEGORIES.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '6px 14px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                        background: category === cat.id ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : '#f5f5f5',
                        color:      category === cat.id ? 'white' : '#555',
                        boxShadow:  category === cat.id ? '0 2px 8px rgba(255,107,107,0.3)' : 'none',
                      }}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#555', display: 'block', marginBottom: 8 }}>
                  🪄 What's the story about?
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {[
                    { emoji: '🐉', label: 'Dragon & castle' },
                    { emoji: '🚀', label: 'Space adventure' },
                    { emoji: '🌊', label: 'Ocean & mermaids' },
                    { emoji: '🦁', label: 'Safari animals' },
                    { emoji: '🍄', label: 'Enchanted forest' },
                    { emoji: '🧚', label: 'Fairy garden' },
                    { emoji: '🤖', label: 'Friendly robot' },
                    { emoji: '🌈', label: 'Rainbow kingdom' },
                  ].map(chip => (
                    <button key={chip.label} type="button"
                      onClick={() => setKeywords(chip.label)}
                      style={{
                        padding: '6px 14px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                        background: keywords === chip.label ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : '#f5f5f5',
                        color:      keywords === chip.label ? 'white' : '#555',
                        border:     keywords === chip.label ? 'none' : '2px solid #eee',
                        transition: 'all 0.15s',
                      }}>
                      {chip.emoji} {chip.label}
                    </button>
                  ))}
                </div>
                <input
                  value={keywords} onChange={e => setKeywords(e.target.value)}
                  placeholder="or type your own… e.g. brave puppy, treasure map"
                  maxLength={100} required
                  style={{ padding: '12px 16px', borderRadius: 12, border: '2px solid #eee', fontSize: 15, width: '100%', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif' }}
                />
              </div>

              {/* Turnstile widget */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div ref={turnstileRef} />
              </div>

              <ErrorBox msg={error} />
              <button type="submit" disabled={loading || !childName.trim() || !keywords.trim()}
                style={{
                  padding: '16px', borderRadius: 50, fontSize: 17, fontWeight: 800,
                  background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)',
                  color: 'white', border: 'none',
                  cursor: loading || !childName.trim() || !keywords.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !childName.trim() || !keywords.trim() ? 0.6 : 1,
                  boxShadow: '0 6px 24px rgba(255,107,107,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                {loading ? (
                  <>
                    <span style={{ display: 'inline-block', width: 20, height: 20, border: '3px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Creating magic…
                  </>
                ) : '✨ Generate Story'}
              </button>
            </div>
          </form>
        )}

        {/* Limit hit */}
        {limitHit && (
          <div style={{
            background: 'white', borderRadius: 24, padding: 'clamp(24px,4vw,40px)',
            boxShadow: '0 8px 40px rgba(255,107,107,0.12)',
            textAlign: 'center', marginBottom: 32,
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 26, color: '#ff6b6b', marginBottom: 8 }}>
              You loved it!
            </h2>
            <p style={{ color: '#888', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
              You've used your 2 free demo stories for today. Create a free account to unlock everything Glumbi has to offer — all personalised to your child's age.
            </p>
            <button onClick={() => navigate('/login')}
              style={{
                padding: '16px 40px', borderRadius: 50, fontSize: 17, fontWeight: 800,
                background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(255,107,107,0.35)',
              }}>
              🌟 Create Free Account
            </button>
          </div>
        )}

        {/* Story result */}
        {story && (
          <div style={{
            background: 'white', borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
            animation: 'fadeIn 0.5s ease',
            marginBottom: 32,
          }}>
            <div style={{
              background: scene.bg, height: 160,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <div style={{ fontSize: 72, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{scene.emoji}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                {keywords}
              </div>
            </div>

            <div style={{ padding: 'clamp(20px,4vw,32px)' }}>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(20px,3vw,28px)', color: '#333', marginBottom: 16 }}>
                {story.title}
              </h2>
              <div style={{ height: 3, background: 'linear-gradient(to right,#ff6b6b,#ffd93d,#6bcb77)', borderRadius: 4, marginBottom: 20 }} />
              <div style={{
                lineHeight: 2, fontSize: 'clamp(14px,2vw,17px)', color: '#444',
                whiteSpace: 'pre-wrap', background: '#fffdf9',
                borderRadius: 14, padding: 'clamp(16px,3vw,24px)',
                border: '1.5px solid #f5ede4',
              }}>
                {story.content[0] && (
                  <>
                    <span style={{ float: 'left', fontSize: 56, lineHeight: 0.8, marginRight: 8, marginTop: 8, color: '#ff6b6b', fontFamily: 'Nunito, sans-serif' }}>
                      {story.content[0]}
                    </span>
                    {story.content.slice(1)}
                  </>
                )}
              </div>

              <div style={{
                marginTop: 28, background: 'linear-gradient(135deg,#fff9f0,#fff0f0)',
                borderRadius: 18, padding: 'clamp(16px,3vw,24px)',
                border: '2px solid #ffcdb8', textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>💫</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: '#ff6b6b', marginBottom: 6 }}>
                  Want personalized stories like this every day?
                </div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
                  Create a free account and unlock everything Glumbi has to offer — stories, activities, learning, creativity, and more, all personalised to your child's age.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate('/login')}
                    style={{
                      padding: '12px 28px', borderRadius: 50, fontSize: 15, fontWeight: 800,
                      background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)',
                      color: 'white', border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(255,107,107,0.3)',
                    }}>
                    🌟 Sign Up Free
                  </button>
                  <button onClick={() => { setStory(null); setKeywords(''); setChildName('') }}
                    style={{ padding: '12px 28px', borderRadius: 50, fontSize: 15, fontWeight: 700, background: '#f5f5f5', color: '#666', border: 'none', cursor: 'pointer' }}>
                    Try Another Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature teaser */}
        {!story && !limitHit && (
          <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(20px,4vw,28px)', boxShadow: '0 4px 24px rgba(255,107,107,0.08)', border: '1.5px solid #ffe4d6', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#ff6b6b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
              But that's just the start
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {['🎮 Activities', '🔍 Curiosity', '✏️ Learn to Write', '🎨 Draw', '📚 Read & Quiz', '🧠 Memory Play', '🐾 Trace Game', '🧩 Riddles'].map(f => (
                <span key={f} style={{ background: '#fff0f0', color: '#f4845f', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 50, border: '1.5px solid #ffcdb8' }}>{f}</span>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#aaa', margin: 0, lineHeight: 1.7 }}>
              Sign up free and explore everything — all features adapt to your child's age and grow with them.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
      <Footer />
    </div>
  )
}
