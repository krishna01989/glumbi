import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Footer from '../components/Footer'
import PublicHeader from '../components/PublicHeader'

/* ── FAQ item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1.5px solid #f0f0f0', padding: '4px 0' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', padding: '16px 4px',
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15, color: open ? '#ff6b6b' : '#3d3d3d',
      }}>
        <span>{q}</span>
        <span style={{ fontSize: 20, color: open ? '#ff6b6b' : '#ccc', flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 4px 16px', fontSize: 14, color: '#777', lineHeight: 1.8, fontFamily: 'Nunito, sans-serif' }}>{a}</div>
      )}
    </div>
  )
}

/* ── How it works steps ── */
const STEPS = [
  { step: '01', emoji: '👤', title: 'Create your account', desc: 'Sign up with email or Google in seconds.' },
  { step: '02', emoji: '🧒', title: 'Add your child', desc: 'Name, age, avatar, and a fun personalised theme.' },
  { step: '03', emoji: '✨', title: 'Generate magic', desc: 'Type a few keywords — a personalised story appears.' },
  { step: '04', emoji: '🎧', title: 'Listen & explore', desc: 'Play aloud in your language and dive into activities.' },
]

/* ── Feature slides ── */
const FEATURES = [
  { emoji: '📖', title: 'Personalised Stories', desc: 'Every story is written for your child — their name, their interests, their age. No two stories are ever the same.', grad: 'linear-gradient(135deg,#ff6b6b,#ff8e53)', tag: 'Core feature', highlights: ['Age-adaptive', 'Interest-based', 'Continuations'] },
  { emoji: '🌟', title: 'Glumbi Guide', desc: 'Glumbi lives inside every feature — pick story paths, earn epilogues, follow up curious questions, and jump between stories and quizzes. One AI friend, every adventure.', grad: 'linear-gradient(135deg,#f7971e,#ffd200)', tag: 'Interactive', highlights: ['True branching stories', 'Cross-feature journeys', 'Remembers choices'] },
  { emoji: '🎯', title: 'Story Activities', desc: 'Each story comes with age-appropriate activities, crafts, and ideas to turn reading into doing.', grad: 'linear-gradient(135deg,#f093fb,#f5576c)', tag: 'After reading', highlights: ['Hands-on ideas', 'Tied to story', 'All ages'] },
  { emoji: '🔭', title: 'Curiosity Questions', desc: '"Why is the sky blue?" Glumbi turns big questions into daily wonder moments that spark real thinking.', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)', tag: 'Daily spark', highlights: ['New every day', 'Age-matched', 'Open-ended'] },
  { emoji: '📝', title: 'Read & Quiz', desc: 'Generate a reading passage on any topic + comprehension questions. Scores tracked over time.', grad: 'linear-gradient(135deg,#43e97b,#38f9d7)', tag: 'Learning', highlights: ['Any topic', 'Score tracking', 'Adjusts to age'] },
  { emoji: '✍️', title: 'My Writing', desc: "Kids write their own stories. Glumbi reads them and gives kind, specific feedback — never harsh, always encouraging.", grad: 'linear-gradient(135deg,#fa709a,#fee140)', tag: 'Creative writing', highlights: ['AI coach', 'Kind feedback', '"What happens next?"'] },
  { emoji: '🎨', title: 'Draw', desc: 'A free canvas to draw anything. Tap "Bring to Life" and AI animates your drawing — bees fly, flowers wiggle, rockets launch!', grad: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', tag: 'Creative play', highlights: ['Free canvas', 'AI animations', 'Fullscreen mode'] },
  { emoji: '🎬', title: 'Flipbook Studio', desc: 'Draw frame by frame and watch your creation come alive as a real animation. Download your movie and share it!', grad: 'linear-gradient(135deg,#f093fb,#f5576c)', tag: 'Animation', highlights: ['Frame-by-frame', 'Play & download', 'Drag to reorder'] },
  { emoji: '✏️', title: 'Learn to Write', desc: 'Guided letter and word tracing in English, Hindi, and Tamil. Canvas validated by AI — effort always counts.', grad: 'linear-gradient(135deg,#f6d365,#fda085)', tag: 'Letters & script', highlights: ['English, Hindi, Tamil', 'AI validation', 'Timeline progress'] },
  { emoji: '🔐', title: 'Parental Lock', desc: 'Set a PIN and a time limit before handing over the device. Kids can snooze — but parents always stay in control.', grad: 'linear-gradient(135deg,#667eea,#764ba2)', tag: 'Screen time', highlights: ['PIN + timer', 'Snooze control', 'No app needed'] },
  { emoji: '🌍', title: '12 Languages', desc: 'Stories narrated in English, Spanish, French, Hindi, Tamil, and more — in warm, natural WaveNet voices.', grad: 'linear-gradient(135deg,#f7971e,#ffd200)', tag: 'Multilingual', highlights: ['12 languages', '4 English accents', 'Male & female voices'] },
  { emoji: '🎙️', title: 'Your Voice', desc: "Record your own voice — or a grandparent's. Every story narrated by someone your child loves.", grad: 'linear-gradient(135deg,#11998e,#38ef7d)', tag: 'Custom voices', highlights: ['Record in browser', 'Up to 5 voices', 'All languages'] },
  { emoji: '🌀', title: 'Maze Adventure', desc: 'Navigate winding corridors with dead ends and wrong turns — only one path leads to the goal! Mazes grow more complex as your child gets older.', grad: 'linear-gradient(135deg,#43e97b,#38f9d7)', tag: 'Problem solving', highlights: ['Dead-end detection', 'Age-adaptive', 'AI themes'] },
  { emoji: '🧩', title: 'Riddles', desc: 'Glumbi AI crafts age-perfect riddles and your child types the answer. With hints, celebrations, and 5 new riddles every round — the fun never runs out.', grad: 'linear-gradient(135deg,#f093fb,#f5576c)', tag: 'Brain teasers', highlights: ['Age-adaptive', 'Hints system', 'AI-generated'] },
]

/* ── Feature Carousel ── */
function FeatureCarousel() {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  function goTo(idx, direction) {
    setDir(direction)
    setActive(idx)
    setAnimKey(k => k + 1)
  }
  function prev() { goTo((active - 1 + FEATURES.length) % FEATURES.length, -1) }
  function next() { goTo((active + 1) % FEATURES.length, 1) }

  function resetTimer() {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => { goTo((active + 1) % FEATURES.length, 1) }, 7000)
  }
  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current) }, [active])

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  function onTouchEnd(e) {
    if (!touchStartX.current) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dy) > Math.abs(dx)) return
    if (dx > 48) next(); else if (dx < -48) prev()
  }

  const f = FEATURES[active]
  const prev1 = FEATURES[(active - 1 + FEATURES.length) % FEATURES.length]
  const next1 = FEATURES[(active + 1) % FEATURES.length]

  return (
    <div
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={resetTimer}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ maxWidth: 960, margin: '0 auto' }}>

      <style>{`
        @keyframes fc-enter-right {
          from { opacity: 0; transform: translateX(56px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fc-enter-left {
          from { opacity: 0; transform: translateX(-56px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        .fc-peek-btn { transition: opacity 0.2s, transform 0.2s; }
        .fc-peek-btn:hover { opacity: 1 !important; transform: scale(1.04) !important; }
        @media (max-width: 600px) {
          .fc-peek { display: none !important; }
          .fc-card-inner { flex-direction: column !important; }
          .fc-left-panel {
            flex: unset !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.12) !important;
            flex-direction: row !important;
            padding: 16px 20px !important;
            gap: 16px !important;
            align-items: center !important;
            justify-content: flex-start !important;
          }
          .fc-left-panel > div:first-child {
            width: 56px !important; height: 56px !important;
            font-size: 28px !important;
          }
          .fc-right-panel { padding: 16px 20px !important; }
        }
      `}</style>

      {/* ── 3-card peek row ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 16, marginBottom: 32 }}>

        {/* Left peek */}
        <div
          className="fc-peek-btn fc-peek"
          onClick={prev}
          style={{
            flex: '0 0 clamp(80px, 10vw, 120px)',
            background: prev1.grad,
            borderRadius: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', opacity: 0.55,
            minHeight: 'clamp(200px, 32vw, 340px)',
            overflow: 'hidden', position: 'relative',
          }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.12)' }} />
          <span style={{ fontSize: 32, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}>{prev1.emoji}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 8px' }}>{prev1.title}</span>
        </div>

        {/* ── CENTER CARD ── */}
        <div
          key={animKey}
          style={{
            flex: 1,
            background: f.grad,
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
            animation: `${dir >= 0 ? 'fc-enter-right' : 'fc-enter-left'} 0.42s cubic-bezier(0.22,1,0.36,1) both`,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'clamp(200px, 32vw, 340px)',
            position: 'relative',
          }}>

          {/* Background decoration circles */}
          <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', top: -120, right: -80, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', bottom: -80, left: -60, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', bottom: 40, right: 40, pointerEvents: 'none' }} />

          {/* Main content — split layout on wide, stack on narrow */}
          <div className="fc-card-inner" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            position: 'relative', zIndex: 1,
          }}>
            {/* LEFT — illustration area */}
            <div className="fc-left-panel" style={{
              flex: '0 0 clamp(120px, 30%, 200px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 'clamp(24px,4vw,40px) clamp(12px,2vw,24px)',
              borderRight: '1px solid rgba(255,255,255,0.12)',
              gap: 12,
            }}>
              {/* Big emoji with glow */}
              <div style={{
                width: 'clamp(80px,12vw,110px)', height: 'clamp(80px,12vw,110px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'clamp(40px,7vw,60px)',
                boxShadow: '0 0 0 8px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.2)',
              }}>
                {f.emoji}
              </div>
              {/* Tag pill */}
              <div style={{
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(6px)',
                borderRadius: 50, padding: '4px 12px',
                fontSize: 10, fontWeight: 900, color: 'white',
                letterSpacing: 0.8, textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {f.tag.toUpperCase()}
              </div>
            </div>

            {/* RIGHT — text content */}
            <div className="fc-right-panel" style={{
              flex: 1, minWidth: 180,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(24px,4vw,40px) clamp(20px,3vw,36px)',
              gap: 12,
            }}>
              <h3 style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: 'clamp(20px,3vw,28px)',
                fontWeight: 900, color: 'white', margin: 0,
                textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                lineHeight: 1.2,
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 'clamp(13px,1.8vw,15px)',
                color: 'rgba(255,255,255,0.88)',
                lineHeight: 1.75, margin: 0,
              }}>
                {f.desc}
              </p>
              {/* Feature highlights */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {f.highlights.map(h => (
                  <span key={h} style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 50, padding: '4px 12px',
                    fontSize: 11, fontWeight: 700, color: 'white',
                  }}>✓ {h}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar — progress */}
          <div style={{ position: 'relative', zIndex: 1, padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((active + 1) / FEATURES.length) * 100}%`, background: 'rgba(255,255,255,0.7)', borderRadius: 10, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>{active + 1} / {FEATURES.length}</span>
          </div>
        </div>

        {/* Right peek */}
        <div
          className="fc-peek-btn fc-peek"
          onClick={next}
          style={{
            flex: '0 0 clamp(80px, 10vw, 120px)',
            background: next1.grad,
            borderRadius: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', opacity: 0.55,
            minHeight: 'clamp(200px, 32vw, 340px)',
            overflow: 'hidden', position: 'relative',
          }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.12)' }} />
          <span style={{ fontSize: 32, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}>{next1.emoji}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 8px' }}>{next1.title}</span>
        </div>
      </div>

      {/* ── Dot navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {FEATURES.map((feat, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > active ? 1 : -1)}
            aria-label={feat.title}
            style={{
              padding: '10px 6px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{
              display: 'block',
              width: i === active ? 28 : 8, height: 8,
              borderRadius: 50,
              background: i === active ? '#ff6b6b' : '#ddd',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Main Landing Page ── */
export default function LandingPage() {
  const navigate = useNavigate()
  const [defaultCredits, setDefaultCredits] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/public/feature-credits`)
      .then(r => r.json())
      .then(data => setDefaultCredits(data.defaultCredits ?? 200))
      .catch(() => {})
  }, [])

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', color: '#3d3d3d', overflowX: 'hidden' }}>
      <PublicHeader />

      {/* ══════════ HERO ══════════ */}
      <section style={{
        background: 'linear-gradient(135deg,#ff6b6b 0%,#ff8e53 40%,#a855f7 80%,#6366f1 100%)',
        padding: `clamp(80px,10vw,120px) clamp(20px,6vw,40px) clamp(100px,12vw,140px)`,
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Floating emojis */}
        {['🌟','🐉','🌈','🚀','🦋','🌙','⭐','🎨','🔮','🧸'].map((e, i) => (
          <span key={i} style={{
            position: 'absolute', fontSize: 28, opacity: 0.18,
            top: `${8 + (i * 9) % 72}%`, left: `${4 + (i * 11) % 92}%`,
            animation: `hero-float ${3 + i * 0.5}s ease-in-out infinite alternate`,
            pointerEvents: 'none',
          }}>{e}</span>
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', borderRadius: 50, padding: '7px 20px', fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 28, border: '1px solid rgba(255,255,255,0.25)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6bcb77', display: 'inline-block', boxShadow: '0 0 0 3px rgba(107,203,119,0.4)' }} />
            AI-powered · Free every month · No credit card
          </div>

          <h1 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(38px,7vw,76px)', color: 'white', lineHeight: 1.05, marginBottom: 20, fontWeight: 900, letterSpacing: -1 }}>
            Magic stories for<br />little ones ✨
          </h1>

          <p style={{ fontSize: 'clamp(15px,2.5vw,19px)', color: 'rgba(255,255,255,0.88)', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.75 }}>
            Meet <strong style={{ color: 'white' }}>Glumbi</strong> — the AI friend who lives inside your child's imagination. Stories, quizzes, drawing, writing, curiosity questions — all personalised to your child, every single day.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <button onClick={() => navigate('/login')}
              style={{ padding: '15px 36px', borderRadius: 50, fontSize: 16, fontWeight: 900, background: 'white', color: '#ff6b6b', border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.18)' }}>
              🌟 Start for Free
            </button>
            <button onClick={() => navigate('/demo')}
              style={{ padding: '15px 32px', borderRadius: 50, fontSize: 16, fontWeight: 800, background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              ✨ Try the Demo
            </button>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            {defaultCredits ?? '…'} <strong style={{ color: 'rgba(255,255,255,0.85)' }}>free AI credits</strong> every month · resets automatically
          </p>
        </div>
      </section>

      {/* ══════════ MEET GLUMBI ══════════ */}
      <section style={{ padding: `clamp(56px,8vw,90px) clamp(16px,5vw,40px)`, background: 'white' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ flex: '0 0 auto', textAlign: 'center', margin: '0 auto' }}>
            <div style={{
              width: 160, height: 160, borderRadius: '50%',
              background: 'linear-gradient(135deg,#fff0e8,#ffd5c0)',
              border: '4px solid #ffcdb8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 16px 48px rgba(255,107,107,0.2)',
              margin: '0 auto', position: 'relative',
            }}>
              <img src="/icon.svg" alt="Glumbi" style={{ width: 110, height: 110 }} />
              {[
                { top: 8, right: 16, size: 10, color: '#ffd93d' },
                { top: 32, left: 6,  size: 7,  color: '#ff6b6b' },
                { bottom: 16, right: 8, size: 8, color: '#a66cff' },
                { bottom: 24, left: 14, size: 6, color: '#6bcb77' },
              ].map((s, i) => (
                <div key={i} style={{
                  position: 'absolute', width: s.size, height: s.size,
                  borderRadius: '50%', background: s.color,
                  top: s.top, right: s.right, bottom: s.bottom, left: s.left,
                  animation: `hero-float ${2.5 + i * 0.4}s ease-in-out infinite alternate`,
                }} />
              ))}
            </div>
            <div style={{ marginTop: 12, fontFamily: 'Nunito, sans-serif', fontSize: 18, color: '#ff6b6b', fontWeight: 900 }}>Glumbi</div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 3, fontStyle: 'italic' }}>your child's imagination friend</div>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'inline-block', background: '#fff0f0', color: '#ff6b6b', borderRadius: 50, padding: '4px 16px', fontSize: 11, fontWeight: 800, marginBottom: 14, letterSpacing: 0.5 }}>
              WHO IS GLUMBI?
            </div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(22px,3.5vw,34px)', color: '#3d3d3d', lineHeight: 1.25, marginBottom: 16 }}>
              The little friend who looks different to every child ✨
            </h2>
            <p style={{ fontSize: 15, color: '#777', lineHeight: 1.9, marginBottom: 12 }}>
              Nobody knows exactly what Glumbi looks like — because <strong style={{ color: '#ff6b6b' }}>Glumbi looks different to every child</strong>. Part storyteller, part explorer, part cheerleader.
            </p>
            <p style={{ fontSize: 15, color: '#777', lineHeight: 1.9 }}>
              Glumbi shows up at bedtime with a tale, answers the big "why" questions, cheers when your child writes their first story, and grows with them — celebrating every milestone along the way.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURE CAROUSEL ══════════ */}
      <section style={{ padding: `clamp(56px,8vw,90px) clamp(16px,5vw,40px)`, background: '#fafafa' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#fff0f0', color: '#ff6b6b', borderRadius: 50, padding: '4px 16px', fontSize: 11, fontWeight: 800, marginBottom: 14, letterSpacing: 0.5 }}>
              10 FEATURES
            </div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(24px,4vw,38px)', color: '#3d3d3d', marginBottom: 10, fontWeight: 900 }}>
              Everything your child needs to thrive 🌱
            </h2>
            <p style={{ fontSize: 15, color: '#888', maxWidth: 440, margin: '0 auto' }}>
              Built for children aged 1–10. All personalised. All safe. All in one place.
            </p>
          </div>
          <FeatureCarousel />
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section style={{ padding: `clamp(56px,8vw,90px) clamp(16px,5vw,40px)`, background: 'white' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(24px,4vw,38px)', color: '#3d3d3d', marginBottom: 10, fontWeight: 900 }}>
              Up and running in minutes ⚡
            </h2>
            <p style={{ fontSize: 15, color: '#888' }}>Four steps to your child's first magical story.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 28 }}>
            {STEPS.map((s, i) => (
              <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
                {/* Connector line — hidden on mobile where grid is single-column */}
                {i < STEPS.length - 1 && (
                  <div className="fc-step-connector" style={{ position: 'absolute', top: 32, left: '60%', width: '80%', height: 2, background: 'linear-gradient(to right,#ffcdb8,transparent)' }} />
                )}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#ff6b6b,#a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(255,107,107,0.25)',
                }}>{s.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#ffb3b3', letterSpacing: 1.5, marginBottom: 6 }}>STEP {s.step}</div>
                <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: '#3d3d3d' }}>{s.title}</h4>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRUST BAR ══════════ */}
      <section style={{ background: 'linear-gradient(135deg,#f8f0ff,#fff0f8)', padding: `32px clamp(16px,5vw,40px)` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
          {[
            { icon: '🔒', text: 'Safety-first — 3-layer AI content guard' },
            { icon: '👨‍👩‍👧', text: 'Built by a parent, for parents' },
            { icon: '🌍', text: '12 languages, real WaveNet voices' },
            { icon: '💳', text: 'Free forever — no credit card' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#6b4fa3' }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section style={{ padding: `clamp(56px,8vw,90px) clamp(16px,5vw,40px)`, background: 'white' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(22px,4vw,36px)', color: '#3d3d3d', marginBottom: 10, fontWeight: 900 }}>
              Questions? We've got answers 💬
            </h2>
            <p style={{ fontSize: 15, color: '#888' }}>Everything parents ask before signing up.</p>
          </div>
          {[
            {
              q: 'What age is Glumbi for?',
              a: "Glumbi is designed for children aged 1–10. Stories, activities, and questions all adapt to your child's age — a 3-year-old gets simple sentences and playful rhymes, while a 9-year-old gets richer vocabulary and more complex quiz questions.",
            },
            {
              q: 'Is it really free?',
              a: `Yes. Every account gets ${defaultCredits ?? '…'} AI credits every month at no cost, no credit card required. Credits reset automatically on the 1st of each month — forever.`,
            },
            {
              q: 'Is the content safe for my child?',
              a: 'Absolutely. Every piece of AI-generated content passes a multi-layer Safety Guard before it reaches your child. Anything flagged is silently discarded. Glumbi was built by a parent, for parents.',
            },
            {
              q: 'Can I lock the app before handing the device to my child?',
              a: 'Yes — set a session time limit and a 4-digit PIN. While locked, the child cannot switch profiles or access parent settings. When time runs out, your PIN is required to continue.',
            },
            {
              q: 'Can I add more than one child?',
              a: 'Yes — up to 3 children under one account, each with their own profile, theme, interests, and learning history.',
            },
            {
              q: 'What languages does Glumbi support?',
              a: 'Stories can be narrated in 12 languages including English (US, Indian, British, Australian accents), Spanish, French, Hindi, Tamil, and more. You can also record your own voice for narration. Learn to Write supports English, Tamil, and Hindi scripts.',
            },
            {
              q: "What happens to my child's data?",
              a: "Journal entries are never sent to any AI. Other content (story prompts, quiz topics) is processed by Glumbi AI to generate responses but is not used for model training. See our Privacy Policy for full details.",
            },
          ].map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section style={{
        padding: `clamp(80px,10vw,120px) clamp(16px,5vw,40px)`,
        background: 'linear-gradient(135deg,#ff6b6b 0%,#ff8e53 40%,#a855f7 80%,#6366f1 100%)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -200, left: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
          <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(28px,5vw,48px)', color: 'white', marginBottom: 14, fontWeight: 900 }}>
            Ready to create some magic?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', marginBottom: 36, maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Glumbi is waiting to meet your child. Join families turning bedtime into the best part of the day.
          </p>
          <button onClick={() => navigate('/login')}
            style={{ padding: '16px 44px', borderRadius: 50, fontSize: 17, fontWeight: 900, background: 'white', color: '#ff6b6b', border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)' }}>
            Get Started — It's Free ✨
          </button>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 16 }}>No credit card · No trial period · Just magic, every month</p>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes hero-float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-18px) rotate(8deg); }
        }
        @media (max-width: 600px) {
          .fc-step-connector { display: none !important; }
        }
      `}</style>
    </div>
  )
}
