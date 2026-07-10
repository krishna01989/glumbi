import { useState, useEffect } from 'react'
import { riddleApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'

function useBreakpoint() {
  const get = () => window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const h = () => setBp(get())
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return bp
}

const BUNDLED_RIDDLES = [
  { question:"I have hands but cannot clap. What am I?", hint:"You look at me to know the time", answer:"clock", emoji:"🕐" },
  { question:"I am full of holes but I can hold water. What am I?", hint:"You use me to wash dishes", answer:"sponge", emoji:"🧽" },
  { question:"The more you take, the more you leave behind. What am I?", hint:"You make these when you walk", answer:"footsteps", emoji:"👣" },
  { question:"I have a tail and a head, but no body. What am I?", hint:"You use me to buy things", answer:"coin", emoji:"💰" },
  { question:"I go up but never come down. What am I?", hint:"Everyone gets more of it every day", answer:"age", emoji:"🎂" },
  { question:"What has teeth but cannot bite?", hint:"You use it to style your hair", answer:"comb", emoji:"✂️" },
  { question:"I can fly without wings. What am I?", hint:"You experience me every night", answer:"dream", emoji:"💭" },
  { question:"What gets wetter as it dries?", hint:"You use this after a bath", answer:"towel", emoji:"🛁" },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function checkAnswer(userInput, correct) {
  const u = userInput.toLowerCase().trim()
  const c = correct.toLowerCase().trim()
  return u === c || u.includes(c) || c.includes(u)
}

export default function Riddle({ child, quota, featureConfig }) {
  const offline = useOffline()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'

  const [riddles, setRiddles] = useState(() => shuffle(BUNDLED_RIDDLES).slice(0, 5))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [input, setInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | 'revealed'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const childAge = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5

  const riddleAiEnabled = (() => {
    if (!featureConfig) return true
    const fc = featureConfig.find(f => f.featureName === 'riddle')
    return !fc || fc.enabled !== false
  })()

  const canGenerate = riddleAiEnabled && !offline && quota && quota.used < quota.limit

  const current = riddles[currentIdx]

  async function handleGenerate() {
    if (!canGenerate) return
    setLoading(true)
    setError('')
    try {
      const result = await riddleApi.generate(child.id, child.name, childAge)
      setRiddles(result.slice(0, 5))
      setCurrentIdx(0)
      setInput('')
      setShowHint(false)
      setWrongCount(0)
      setScore(0)
      setCompleted(false)
      setFeedback(null)
    } catch (err) {
      setError(err.message || 'Could not load riddles. Using bundled ones!')
    } finally {
      setLoading(false)
    }
  }

  function handlePlayAgain() {
    setRiddles(shuffle(BUNDLED_RIDDLES).slice(0, 5))
    setCurrentIdx(0)
    setInput('')
    setShowHint(false)
    setWrongCount(0)
    setScore(0)
    setCompleted(false)
    setFeedback(null)
    setError('')
  }

  function advanceOrComplete(earnedPoint) {
    const newScore = score + (earnedPoint ? 1 : 0)
    setScore(newScore)
    setTimeout(() => {
      if (currentIdx + 1 >= riddles.length) {
        setCompleted(true)
      } else {
        setCurrentIdx(i => i + 1)
        setInput('')
        setShowHint(false)
        setWrongCount(0)
        setFeedback(null)
      }
    }, 1200)
  }

  function handleSubmit() {
    if (!input.trim() || feedback) return
    if (checkAnswer(input, current.answer)) {
      setFeedback('correct')
      advanceOrComplete(true)
    } else {
      const newWrong = wrongCount + 1
      setWrongCount(newWrong)
      if (newWrong >= 2) {
        setFeedback('revealed')
        advanceOrComplete(false)
      } else {
        setFeedback('wrong')
        setTimeout(() => { setFeedback(null); setInput('') }, 1000)
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  const feedbackColor = feedback === 'correct' ? '#6bcb77' : feedback === 'wrong' ? '#ff6b6b' : feedback === 'revealed' ? '#ffa502' : null

  return (
    <div style={{ padding: isMobile ? '12px 12px 40px' : '16px 24px 40px', fontFamily: 'Nunito, sans-serif' }}>
      <FeatureBanner feature="riddle" child={child} isMobile={isMobile} />
      <QuotaBanner quota={quota} isMobile={isMobile} />

      {loading && <ThemeLoader theme={child?.theme} label="Crafting riddles..." />}

      {error && (
        <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 12, padding: '10px 16px', color: '#c0392b', fontSize: 14, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {!completed ? (
        <>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {riddles.map((_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < currentIdx ? '#6bcb77' : i === currentIdx ? 'var(--primary,#ff6b6b)' : '#ddd',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          {/* Riddle card */}
          <div style={{
            background: 'white', borderRadius: 20, padding: isMobile ? '24px 20px' : '32px 36px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `2.5px solid ${feedbackColor || '#f0f0f0'}`,
            textAlign: 'center', marginBottom: 16,
            transition: 'border-color 0.3s', position: 'relative',
          }}>
            {/* Prev question */}
            {currentIdx > 0 && (
              <button onClick={() => { setCurrentIdx(i => i - 1); setInput(''); setShowHint(false); setWrongCount(0); setFeedback(null) }}
                style={{ position:'absolute', left: 10, top:'50%', transform:'translateY(-50%)', width:32, height:32, minWidth:32, borderRadius:'50%', border:'none', background:'var(--primary-lt)', color:'var(--primary)', fontWeight:900, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
                ‹
              </button>
            )}
            {/* Next question */}
            {currentIdx < riddles.length - 1 && (
              <button onClick={() => { setCurrentIdx(i => i + 1); setInput(''); setShowHint(false); setWrongCount(0); setFeedback(null) }}
                style={{ position:'absolute', right: 10, top:'50%', transform:'translateY(-50%)', width:32, height:32, minWidth:32, borderRadius:'50%', border:'none', background:'var(--primary-lt)', color:'var(--primary)', fontWeight:900, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
                ›
              </button>
            )}
            <div style={{ fontSize: isMobile ? 56 : 72, marginBottom: 16, lineHeight: 1 }}>{current?.emoji}</div>
            <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: '#333', lineHeight: 1.5, marginBottom: 20 }}>
              {current?.question}
            </div>

            {showHint && (
              <div style={{ background: '#fff8e1', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#b8860b', fontWeight: 700, marginBottom: 16 }}>
                💡 Hint: {current?.hint}
              </div>
            )}

            {feedback === 'correct' && (
              <div style={{ fontSize: 28, marginBottom: 12, animation: 'popIn 0.4s ease' }}>⭐ Correct!</div>
            )}
            {feedback === 'wrong' && (
              <div style={{ fontSize: 18, color: '#ff6b6b', marginBottom: 12, fontWeight: 800 }}>❌ Try again!</div>
            )}
            {feedback === 'revealed' && (
              <div style={{ background: '#fff3cd', borderRadius: 12, padding: '10px 16px', fontSize: 15, color: '#856404', fontWeight: 800, marginBottom: 12 }}>
                The answer was: <span style={{ color: '#333' }}>{current?.answer}</span>
              </div>
            )}

            {!feedback && (
              <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  autoFocus
                  style={{
                    flex: 1, width: isMobile ? '100%' : 'auto', padding: '12px 16px', borderRadius: 50,
                    border: '2px solid #eee', fontSize: 15, fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button onClick={handleSubmit} style={{
                  padding: '12px 24px', borderRadius: 50, border: 'none',
                  background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white',
                  fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                  whiteSpace: 'nowrap',
                }}>
                  Submit ✓
                </button>
              </div>
            )}
          </div>

          {/* Hint button */}
          {!showHint && !feedback && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <button onClick={() => setShowHint(true)} style={{
                background: 'var(--primary-lt)', border: '2px solid var(--primary)', borderRadius: 50, padding: '8px 20px',
                color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
              }}>
                💡 Show Hint
              </button>
            </div>
          )}
        </>
      ) : (
        /* Completion screen */
        <div style={{ background: 'white', borderRadius: 20, padding: isMobile ? '28px 20px' : '40px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: score >= 4 ? 72 : 56, marginBottom: 12 }}>
            {score === 5 ? '🏆' : score >= 3 ? '⭐' : '🎯'}
          </div>
          <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: '#333', marginBottom: 8 }}>
            You got {score} out of {riddles.length}!
          </div>
          <div style={{ fontSize: 15, color: '#888', marginBottom: 28, lineHeight: 1.7 }}>
            {score === 5 ? 'Perfect score! You are a riddle master! 🧠' :
             score >= 3 ? 'Great job! Keep practising to become a riddle master!' :
             'Good try! Play again to improve your score!'}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={handlePlayAgain} style={{
              padding: '14px 28px', borderRadius: 50,
              border: '2px solid var(--primary)', background: 'var(--primary-lt)',
              color: 'var(--primary)', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
            }}>
              🔄 Play Again
            </button>
            {canGenerate && (
              <button onClick={handleGenerate} disabled={loading} style={{
                padding: '14px 28px', borderRadius: 50, border: 'none',
                background: loading ? '#eee' : 'linear-gradient(135deg,var(--primary),var(--accent))',
                color: loading ? '#aaa' : 'white',
                fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif',
                opacity: loading ? 0.6 : 1,
              }}>
                ✨ New AI Riddles (1 credit)
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI button during game */}
      {!completed && canGenerate && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button onClick={handleGenerate} disabled={loading} style={{
            background: 'var(--primary-lt)', border: '2px solid var(--primary)', borderRadius: 50, padding: '8px 20px',
            color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif',
            opacity: loading ? 0.6 : 1,
          }}>
            ✨ Get New AI Riddles (1 credit)
          </button>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
