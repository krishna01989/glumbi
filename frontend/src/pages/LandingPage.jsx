import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Footer from '../components/Footer'
import PublicHeader from '../components/PublicHeader'

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1.5px solid #f0f0f0', padding: '4px 0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', padding: '18px 4px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
          fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 16, color: open ? '#ff6b6b' : '#3d3d3d',
        }}>
        <span>{q}</span>
        <span style={{ fontSize: 22, color: open ? '#ff6b6b' : '#ccc', flexShrink: 0, lineHeight: 1 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 4px 18px', fontSize: 15, color: '#777', lineHeight: 1.8, fontFamily: 'Nunito, sans-serif' }}>
          {a}
        </div>
      )}
    </div>
  )
}

const FEATURES = [
  {
    emoji: '📖',
    title: 'Bedtime Stories',
    desc: 'Glumbi AI creates personalized stories where your child is the hero. Choose a theme and watch the magic unfold.',
    color: '#ff6b6b', bg: '#fff0f0',
  },
  {
    emoji: '🎮',
    title: 'Daily Activities',
    desc: 'Age-perfect activity suggestions tailored to the time of day and weather. Never run out of fun ideas.',
    color: '#4d96ff', bg: '#f0f6ff',
  },
  {
    emoji: '🔍',
    title: 'Curiosity Corner',
    desc: 'Your child asked "why is the sky blue?" — get fun, age-appropriate answers with a mini quiz and sticker reward.',
    color: '#8e44ad', bg: '#f8f0ff',
  },
  {
    emoji: '📚',
    title: 'Read & Quiz',
    desc: 'Longer reading stories with comprehension questions — builds reading skills and makes learning feel like an adventure.',
    color: '#c0392b', bg: '#fff5f5',
  },
  {
    emoji: '✍️',
    title: 'My Writing',
    desc: 'Children write their own stories and get warm, encouraging feedback from Glumbi AI — celebrating creativity, not correcting it.',
    color: '#d68910', bg: '#fffbf0',
  },
  {
    emoji: '📝',
    title: 'Growth Journal',
    desc: 'Capture precious milestones, moods, and memories. Build a timeline of your little one growing up.',
    color: '#2d9a4e', bg: '#f0fff4',
  },
  {
    emoji: '🎨',
    title: 'Drawing Canvas',
    desc: 'A full drawing canvas with a rich colour palette and brush sizes — pure creative free play.',
    color: '#e67e22', bg: '#fff8f0',
  },
  {
    emoji: '✏️',
    title: 'Learn to Write',
    desc: 'Practice English and Tamil letters, numbers, and words on a drawing canvas. Glumbi AI checks each attempt, celebrates progress, and translates words into 4 languages.',
    color: '#f97316', bg: '#fff7ed',
  },
  {
    emoji: '🛡️',
    title: 'Safe & Guarded',
    desc: 'Every prompt is filtered through 4 layers of content safety. Only age-appropriate, child-friendly content gets through.',
    color: '#636e72', bg: '#f5f5f5',
  },
]

const STEPS = [
  { step: '01', title: 'Create your account', desc: 'Sign up with email or continue with Google in seconds.' },
  { step: '02', title: 'Add your child', desc: 'Enter their name, age, pick an avatar and a fun theme.' },
  { step: '03', title: 'Generate magic', desc: 'Type a few keywords and watch a personalized story come to life.' },
  { step: '04', title: 'Listen & explore', desc: 'Play the story aloud in your preferred language and explore activities.' },
]

// Maps feature names to landing page display config
const CREDIT_DISPLAY = [
  { featureName: 'story',          icon: '📖', label: 'Stories'         },
  { featureName: 'activity',       icon: '🎮', label: 'Activities'      },
  { featureName: 'curiosity',      icon: '🔍', label: 'Curiosity'       },
  { featureName: 'read-quiz',      icon: '📚', label: 'Read & Quiz'     },
  { featureName: 'draw',           icon: '🎨', label: 'Drawing'         },
  { featureName: 'learn-word',     icon: '✏️',  label: 'Learn to Write'  },
  { featureName: 'story-listen',   icon: '🔊', label: 'Story Audio'     },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [featureCredits, setFeatureCredits] = useState([])
  const [defaultCredits, setDefaultCredits] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/public/feature-credits`)
      .then(r => r.json())
      .then(data => {
        setFeatureCredits(data.features ?? [])
        setDefaultCredits(data.defaultCredits ?? 200)
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', color: '#3d3d3d', overflowX: 'hidden' }}>

      <PublicHeader />

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg,#ff6b6b,#ff8e53,#ffd93d)',
        padding: '100px 40px 120px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* floating emojis */}
        {['🌟','🐉','🌈','🚀','🦋','🌙','⭐','🎨'].map((e, i) => (
          <span key={i} style={{
            position: 'absolute', fontSize: 32, opacity: 0.2,
            top: `${10 + (i * 11) % 70}%`,
            left: `${5 + (i * 13) % 90}%`,
            animation: `float ${3 + i * 0.4}s ease-in-out infinite alternate`,
          }}>{e}</span>
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 24 }}>
            ✨ Glumbi AI — magic for kids
          </div>
          <h1 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 'clamp(40px, 7vw, 72px)', color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
            Magic stories for<br />little ones
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.9)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Meet Glumbi — the little friend who lives inside your child's imagination. Stories, activities, curiosity answers, reading, writing, and more. All personalised. All magical.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')}
              style={{ padding: '16px 36px', borderRadius: 50, fontSize: 17, fontWeight: 800, background: 'white', color: '#ff6b6b', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
              🌟 Start for Free
            </button>
            <button onClick={() => navigate('/demo')}
              style={{ padding: '16px 36px', borderRadius: 50, fontSize: 17, fontWeight: 800, background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              ✨ Try it Free
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 20 }}>No credit card required · <strong style={{ color: 'white' }}>{defaultCredits ?? '…'} free AI credits every month</strong></p>
        </div>
      </section>

      {/* ── Meet Glumbi ── */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap' }}>
          {/* Illustration */}
          <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
            <div style={{
              width: 200, height: 200, borderRadius: '50%',
              background: 'linear-gradient(135deg,#fff8f0,#ffeedd)',
              border: '4px solid #ffcdb8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 40px rgba(255,107,107,0.15)',
              margin: '0 auto',
              position: 'relative',
            }}>
              <img src="/icon.svg" alt="Glumbi" style={{ width: 140, height: 140 }} />
              {/* Sparkle dots */}
              {[
                { top: 10, right: 18, size: 10, color: '#ffd93d' },
                { top: 30, left: 8,  size: 7,  color: '#ff6b6b' },
                { bottom: 18, right: 10, size: 8, color: '#a66cff' },
                { bottom: 28, left: 16, size: 6, color: '#6bcb77' },
              ].map((s, i) => (
                <div key={i} style={{
                  position: 'absolute', width: s.size, height: s.size,
                  borderRadius: '50%', background: s.color,
                  top: s.top, right: s.right, bottom: s.bottom, left: s.left,
                  animation: `float ${2.5 + i * 0.4}s ease-in-out infinite alternate`,
                }} />
              ))}
            </div>
            <div style={{ marginTop: 16, fontFamily: 'Fredoka One, cursive', fontSize: 22, color: '#ff6b6b' }}>Glumbi</div>
            <div style={{ fontSize: 12, color: '#bbb', marginTop: 4, fontStyle: 'italic' }}>your child's imagination friend</div>
          </div>

          {/* Story */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'inline-block', background: '#fff0f0', color: '#ff6b6b', borderRadius: 50, padding: '5px 16px', fontSize: 12, fontWeight: 800, marginBottom: 16, letterSpacing: 0.5 }}>
              WHO IS GLUMBI?
            </div>
            <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 'clamp(26px,4vw,38px)', color: '#3d3d3d', lineHeight: 1.2, marginBottom: 20 }}>
              The little friend who lives inside every child's imagination ✨
            </h2>
            <p style={{ fontSize: 16, color: '#777', lineHeight: 1.9, marginBottom: 16 }}>
              Nobody knows exactly what Glumbi looks like — because <strong style={{ color: '#ff6b6b' }}>Glumbi looks different to every child</strong>. That's the magic.
            </p>
            <p style={{ fontSize: 16, color: '#777', lineHeight: 1.9, marginBottom: 16 }}>
              Glumbi is part storyteller, part explorer, part cheerleader. Glumbi shows up at bedtime with a tale, answers the big "why" questions, suggests today's adventure, and cheers the loudest when your little one writes their very first story.
            </p>
            <p style={{ fontSize: 16, color: '#777', lineHeight: 1.9 }}>
              Glumbi grows with your child — learning what they love, celebrating who they're becoming, and turning ordinary days into extraordinary memories.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '100px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 40, color: '#3d3d3d', marginBottom: 12 }}>
              Everything your child needs to thrive 🌱
            </h2>
            <p style={{ fontSize: 17, color: '#888', maxWidth: 520, margin: '0 auto' }}>
              Nine features designed for children aged 1–10, guarded with Glumbi AI safety at every step.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: 'white', borderRadius: 20, padding: '28px 24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: `2px solid ${f.bg}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>
                  {f.emoji}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: f.color, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '100px 40px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 40, color: '#3d3d3d', marginBottom: 12 }}>
              Up and running in minutes ⚡
            </h2>
            <p style={{ fontSize: 17, color: '#888' }}>Four simple steps to your child's first magical story.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, position: 'relative' }}>
            {STEPS.map((s, i) => (
              <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Fredoka One, cursive', fontSize: 22, color: 'white',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
                }}>
                  {s.step}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 32, left: '60%', width: '80%', height: 2, background: 'linear-gradient(to right,#ffcdb8,transparent)', display: 'block' }} />
                )}
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '100px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 40, color: '#3d3d3d', marginBottom: 12 }}>
              Questions? We've got answers 💬
            </h2>
            <p style={{ fontSize: 17, color: '#888' }}>Everything parents ask before signing up.</p>
          </div>
          {[
            {
              q: 'What age is Glumbi for?',
              a: 'Glumbi is designed for children aged 1–10. Stories, activities, and questions all adapt to your child\'s age — a 3-year-old gets simple sentences and playful rhymes, while a 9-year-old gets richer vocabulary and more complex quiz questions.',
            },
            {
              q: 'Is it really free?',
              a: `Yes. Every account gets ${defaultCredits ?? '…'} AI credits every month at no cost, with no credit card required. Credits reset automatically on the 1st of each month. There is no trial period — it\'s simply free, every month.`,
            },
            {
              q: 'Is the content safe for my child?',
              a: 'Absolutely. Every piece of AI-generated content passes a multi-layer Safety Guard before it reaches your child. Anything flagged as inappropriate is silently discarded and never shown. Glumbi was built by a parent, for parents.',
            },
            {
              q: 'Can I add more than one child?',
              a: 'Yes — you can add up to 3 children under one account, each with their own profile, theme, interests, and learning history. Switch between children from the sidebar in seconds.',
            },
            {
              q: 'What languages does Glumbi support?',
              a: 'Stories can be narrated in 12 languages: English (US, Indian, British, and Australian accents), Spanish, French, Italian, Chinese, Japanese, Korean, Tamil, Hindi, Malayalam, Telugu, and Kannada. Learn to Write supports English, Tamil, and Hindi scripts.',
            },
            {
              q: 'Do I need to install anything?',
              a: 'No. Glumbi runs entirely in your browser — no app download needed. It works on any device: phone, tablet, or desktop.',
            },
            {
              q: 'What happens to my child\'s data?',
              a: "Your child's Journal entries are never sent to any AI. Other content (story prompts, quiz topics) is processed by Anthropic's Claude AI to generate responses but is not used for model training. See our Privacy Policy for full details.",
            },
          ].map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* ── Languages ── */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg,#f8f0ff,#fff0f8)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
          <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 36, color: '#8e44ad', marginBottom: 16 }}>
            Speaks your child's language
          </h2>
          <p style={{ fontSize: 16, color: '#777', lineHeight: 1.8, marginBottom: 40 }}>
            Stories can be listened to in <strong>12 languages</strong> using natural Google WaveNet voices — warm, clear, and perfect for bedtime.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, textAlign: 'left' }}>
            {[
              { group: '🌍 International', color: '#4d96ff', bg: '#f0f6ff', langs: ['English', 'Español', 'Français', 'Italiano', '普通话', '日本語', '한국어'] },
              { group: '🇮🇳 Regional India', color: '#e67e22', bg: '#fff8f0', langs: ['தமிழ்', 'हिंदी', 'മലയാളം', 'తెలుగు', 'ಕನ್ನಡ'] },
            ].map(({ group, color, bg, langs }) => (
              <div key={group} style={{ background: 'white', borderRadius: 20, padding: '24px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color, marginBottom: 16 }}>{group}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {langs.map(l => (
                    <span key={l} style={{ padding: '6px 14px', borderRadius: 50, background: bg, color, fontSize: 14, fontWeight: 700 }}>
                      🔊 {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Credits ── */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#fff8e1', borderRadius: 50, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#e67e22', marginBottom: 20 }}>
            🎁 Always free — no surprises
          </div>
          <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 40, color: '#3d3d3d', marginBottom: 16 }}>
            {defaultCredits ?? '…'} AI credits, every month
          </h2>
          <p style={{ fontSize: 17, color: '#888', maxWidth: 540, margin: '0 auto 48px', lineHeight: 1.7 }}>
            Every account gets {defaultCredits ?? '…'} credits automatically each month. No card needed, no trial period — just magic, every single month.
          </p>

          {/* Credit breakdown cards — live from API */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 48 }}>
            {CREDIT_DISPLAY.map(({ featureName, icon, label }) => {
              const fc = featureCredits.find(f => f.featureName === featureName)
              const cost = fc?.creditCost ?? null
              const budget = defaultCredits ?? 100
              const uses = cost ? Math.floor(budget / cost) : null
              return (
                <div key={featureName} style={{
                  background: '#fafafa', borderRadius: 16, padding: '20px 16px', textAlign: 'center',
                  border: '1.5px solid #f0f0f0',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#333', marginBottom: 4 }}>{label}</div>
                  {cost != null ? (
                    <>
                      <div style={{
                        display: 'inline-block',
                        background: cost >= 3 ? '#fff3cd' : cost >= 2 ? '#e8f4fd' : '#e8f5e9',
                        color: cost >= 3 ? '#856404' : cost >= 2 ? '#0277bd' : '#2e7d32',
                        fontWeight: 800, fontSize: 13, padding: '3px 12px', borderRadius: 50, marginBottom: 8,
                      }}>
                        {cost} {cost === 1 ? 'credit' : 'credits'}
                      </div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>up to {uses}× per month</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: '#ccc' }}>Loading…</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* How credits reset */}
          <div style={{
            background: 'linear-gradient(135deg,#f8f0ff,#fff0f8)', borderRadius: 20, padding: '28px 32px',
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
            border: '1.5px solid #e8d5f5',
          }}>
            <div style={{ fontSize: 48 }}>🔄</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#8e44ad', marginBottom: 6 }}>Credits reset on the 1st of every month</div>
              <div style={{ fontSize: 14, color: '#777', lineHeight: 1.7, maxWidth: 460 }}>
                Your {defaultCredits ?? '…'} credits refresh automatically — no action needed. Mix and match features freely. Switch to <strong>Practice Mode</strong> any time to explore without spending credits.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '100px 40px',
        background: 'linear-gradient(135deg,#ff6b6b,#ff8e53,#ffd93d)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 44, color: 'white', marginBottom: 16 }}>
          Ready to create some magic? ✨
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
          Glumbi is waiting to meet your child. Join families turning bedtime into the best part of the day.
        </p>
        <button onClick={() => navigate('/login')}
          style={{ padding: '18px 48px', borderRadius: 50, fontSize: 18, fontWeight: 800, background: 'white', color: '#ff6b6b', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
          🌟 Get Started — It's Free
        </button>
      </section>

      {/* ── Footer ── */}
      <Footer />

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </div>
  )
}
