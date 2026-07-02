import { useState, useEffect } from 'react'
import { curiosityApi } from '../api/client'
import ErrorBox from '../components/ErrorBox'
import ThemeLoader from '../components/ThemeLoader'
import QuotaBanner from '../components/QuotaBanner'
import { useOffline } from '../contexts/OfflineContext'

const SAMPLE_QUESTIONS = [
  'Why is the sky blue?', 'Why do stars shine?', 'Why do we dream?',
  'Why do birds sing?', 'How do fish breathe underwater?', 'Why is grass green?'
]

function QuizCard({ entry, onCorrect }) {
  const [answered, setAnswered] = useState(null)

  const options = [entry.quizOption1, entry.quizOption2, entry.quizOption3]
    .sort(() => Math.random() - 0.5)   // shuffle so correct isn't always first

  function handleAnswer(opt) {
    if (answered) return
    setAnswered(opt)
    if (opt === entry.quizOption1) onCorrect()  // quizOption1 is always correct
  }

  return (
    <div style={{ background: '#fffdf5', borderRadius: 14, padding: 18, border: '2px solid #ffd93d' }}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: '#d68910' }}>
        🧠 Quick Quiz!
      </div>
      <p style={{ fontSize: 15, marginBottom: 14, fontWeight: 600 }}>{entry.quizQuestion}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, i) => {
          const isCorrect = opt === entry.quizOption1
          const isSelected = answered === opt
          let bg = '#f5f5f5', color = '#444', border = '2px solid transparent'
          if (isSelected && isCorrect)  { bg = '#e8f8e8'; color = '#27ae60'; border = '2px solid #27ae60' }
          if (isSelected && !isCorrect) { bg = '#fff0f0'; color = '#e74c3c'; border = '2px solid #e74c3c' }
          if (answered && isCorrect && !isSelected) { bg = '#e8f8e8'; color = '#27ae60'; border = '2px solid #27ae60' }
          return (
            <button key={i} onClick={() => handleAnswer(opt)}
              style={{ background: bg, color, border, borderRadius: 10, padding: '10px 14px', fontSize: 14, textAlign: 'left', fontWeight: 600, transition: 'all 0.2s' }}>
              {isSelected && isCorrect && '✅ '}{isSelected && !isCorrect && '❌ '}{opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: answered === entry.quizOption1 ? '#27ae60' : '#e74c3c' }}>
          {answered === entry.quizOption1 ? '🎉 Correct! You\'re so smart!' : `Not quite! The answer is: ${entry.quizOption1}`}
        </div>
      )}
    </div>
  )
}

function CuriosityCard({ entry, onDelete }) {
  const [showQuiz, setShowQuiz] = useState(false)
  const [won, setWon]           = useState(false)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Question header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
          <span style={{ fontSize: 36 }}>{entry.sticker}</span>
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--primary)', lineHeight: 1.5 }}>
              {entry.question}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
        <button className="btn-danger" style={{ padding: '6px 10px', fontSize: 12, flexShrink: 0 }}
          onClick={() => onDelete(entry.id)}>✕</button>
      </div>

      {/* 3 fun facts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: '💡 The simple answer', text: entry.funFact1, bg: '#f0f7ff', border: '#4d96ff' },
          { label: '🤩 Wow fact!',          text: entry.funFact2, bg: '#fff0f9', border: '#c77dff' },
          { label: '🍎 Think of it like…', text: entry.funFact3, bg: '#f0fff4', border: '#6bcb77' },
        ].map(({ label, text, bg, border }) => (
          <div key={label} style={{ background: bg, borderLeft: `4px solid ${border}`, borderRadius: '0 10px 10px 0', padding: '10px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: border, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: '#444' }}>{text}</div>
          </div>
        ))}
      </div>

      {/* Quiz toggle */}
      {!showQuiz ? (
        <button className="btn-primary" style={{ fontSize: 14 }} onClick={() => setShowQuiz(true)}>
          🧠 Take the Quiz!
        </button>
      ) : (
        <>
          <QuizCard entry={entry} onCorrect={() => setWon(true)} />
          {won && (
            <div style={{ textAlign: 'center', fontSize: 40, animation: 'spin 0.5s ease' }}>
              {entry.sticker} {entry.sticker} {entry.sticker}
              <div style={{ fontSize: 16, fontFamily: 'Nunito, sans-serif', color: '#d68910', marginTop: 8 }}>
                You earned a sticker! 🎉
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Curiosity({ child, quota }) {
  const offline = useOffline()
  const [entries, setEntries] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => { loadEntries() }, [child.id])

  async function loadEntries() {
    const data = await curiosityApi.getByChild(child.id)
    setEntries(data)
  }

  async function handleAsk(e) {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError('')
    try {
      const entry = await curiosityApi.ask({ childId: child.id, question })
      setEntries(prev => [entry, ...prev])
      setQuestion('')
      window.__glumbiRefreshQuota?.()
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleDelete(id) {
    await curiosityApi.delete(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      <QuotaBanner quota={quota} />
      {/* Ask box */}
      <form className="card" onSubmit={handleAsk}
        style={{ background: 'var(--primary-lt)', border: '2px dashed var(--primary-lt)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 32 }}>🔍</span>
          <h3 style={{ fontSize: 18, color: 'var(--primary)' }}>
            What is {child.name} curious about?
          </h3>
        </div>

        <input
          placeholder='Type any "why" question... e.g. Why do stars twinkle?'
          value={question} onChange={e => setQuestion(e.target.value)} required />

        {/* Sample questions */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginBottom: 8 }}>TRY ONE OF THESE:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SAMPLE_QUESTIONS.map(q => (
              <button key={q} type="button" onClick={() => setQuestion(q)}
                style={{ padding: '5px 12px', fontSize: 12, background: 'white', color: 'var(--primary)', border: '1.5px solid var(--primary-lt)', borderRadius: 50, fontWeight: 600 }}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <ErrorBox msg={error} />
        <button type="submit" disabled={loading || !question.trim() || quota?.used >= quota?.limit || offline}
          style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', fontSize: 16, padding: '12px', borderRadius: 50, fontWeight: 700, border: 'none', cursor: offline ? 'not-allowed' : 'pointer', opacity: offline ? 0.6 : 1 }}>
          {loading ? <><span className="spinner" /> &nbsp;Finding the answer…</> : offline ? '✈️ AI is off' : '✨ Explain to ' + child.name}
        </button>
      </form>

      {loading && <ThemeLoader theme={child.theme} />}

      {/* Entries */}
      {!loading && entries.map(entry => (
        <CuriosityCard key={entry.id} entry={entry} onDelete={handleDelete} />
      ))}

      {entries.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔭</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800 }}>No questions yet!</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Kids ask the best questions — let's answer them! 🌍</div>
        </div>
      )}
    </div>
  )
}
