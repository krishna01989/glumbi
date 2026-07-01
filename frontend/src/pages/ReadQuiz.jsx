import { useState, useEffect } from 'react'
import { readQuizApi } from '../api/client'
import ThemeLoader from '../components/ThemeLoader'

const TOPICS = [
  { emoji: '🦁', label: 'Safari adventure' },
  { emoji: '🚀', label: 'Space explorer' },
  { emoji: '🌊', label: 'Ocean mystery' },
  { emoji: '🏔️', label: 'Mountain quest' },
  { emoji: '🧪', label: 'Young scientist' },
  { emoji: '🗺️', label: 'Hidden treasure' },
  { emoji: '🤖', label: 'Robot friend' },
  { emoji: '🌿', label: 'Jungle rescue' },
]

const LESSON_COLORS = {
  Courage: '#ff6b6b', Kindness: '#ff8e53', Curiosity: '#4d96ff',
  Perseverance: '#8e44ad', Friendship: '#2d9a4e', Honesty: '#e67e22',
}

export default function ReadQuiz({ child }) {
  const [entries,  setEntries]  = useState([])
  const [selected, setSelected] = useState(null)
  const [topic,    setTopic]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  // quiz state
  const [answers,  setAnswers]  = useState([null, null, null])
  const [submitted,setSubmitted]= useState(false)

  useEffect(() => {
    readQuizApi.getByChild(child.id).then(setEntries).catch(() => {})
  }, [child.id])

  async function handleGenerate(e) {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true); setError('')
    try {
      const entry = await readQuizApi.generate(child.id, topic)
      const questions = JSON.parse(entry.questionsJson || '[]')
      setEntries(prev => [{ ...entry, questions }, ...prev])
      openEntry({ ...entry, questions })
      setTopic('')
      window.__glumbiRefreshQuota?.()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function openEntry(entry) {
    const questions = entry.questions || JSON.parse(entry.questionsJson || '[]')
    setSelected({ ...entry, questions })
    setAnswers([null, null, null])
    setSubmitted(entry.completed)
  }

  async function handleSubmit() {
    if (answers.some(a => a === null)) {
      setError('Please answer all 3 questions first!'); return
    }
    setError('')
    try {
      const result = await readQuizApi.submit(selected.id, answers)
      setSelected({ ...selected, score: result.score, completed: true })
      setEntries(prev => prev.map(e => e.id === result.id ? { ...e, score: result.score, completed: true } : e))
      setSubmitted(true)
    } catch (e) { setError(e.message) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this story?')) return
    await readQuizApi.delete(id)
    setEntries(prev => prev.filter(e => e.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const lessonColor = selected ? (LESSON_COLORS[selected.lesson] || '#667eea') : '#667eea'

  return (
    <div style={{ display: 'flex', gap: 24, height: '100%', fontFamily: 'Nunito, sans-serif' }}>

      {/* ── Left panel ── */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Generate form */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: '#4d96ff', marginBottom: 14 }}>📚 Read & Quiz</div>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#888', display: 'block', marginBottom: 8 }}>PICK A TOPIC</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {TOPICS.map(t => (
                  <button key={t.label} type="button" onClick={() => setTopic(t.label)}
                    style={{
                      padding: '5px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: topic === t.label ? 'linear-gradient(135deg,#4d96ff,#667eea)' : '#f0f4ff',
                      color: topic === t.label ? 'white' : '#4d96ff',
                      border: topic === t.label ? 'none' : '1.5px solid #c5d5ff',
                    }}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
              <input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="or type your own…"
                maxLength={80}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '2px solid #eee', fontSize: 13, boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif' }} />
            </div>
            {error && <div style={{ fontSize: 12, color: '#e74c3c', fontWeight: 700 }}>🚫 {error}</div>}
            <button type="submit" disabled={loading || !topic.trim()}
              style={{
                padding: '12px', borderRadius: 50, fontWeight: 800, fontSize: 14,
                background: 'linear-gradient(135deg,#4d96ff,#667eea)', color: 'white', border: 'none',
                cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !topic.trim() ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Generating…</>
                : '📖 Generate Story'}
            </button>
          </form>
        </div>

        {/* History */}
        {entries.length > 0 && (
          <div className="card" style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>History</div>
            {entries.map(e => (
              <div key={e.id} onClick={() => openEntry(e)}
                style={{
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 6,
                  background: selected?.id === e.id ? '#f0f4ff' : 'transparent',
                  border: selected?.id === e.id ? '1.5px solid #c5d5ff' : '1.5px solid transparent',
                }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#333', marginBottom: 2 }}>{e.title}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#aaa' }}>{e.topic}</span>
                  {e.completed && (
                    <span style={{ fontSize: 11, fontWeight: 800, color: e.score === 3 ? '#27ae60' : e.score >= 2 ? '#f39c12' : '#e74c3c' }}>
                      {e.score}/3 ⭐
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <ThemeLoader theme={child.theme} label="Crafting your story & questions…" />
        ) : !selected ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#ccc' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Pick a topic and generate your story</div>
            <div style={{ fontSize: 14 }}>Read it, then answer 3 questions to earn your score!</div>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>

            {/* Story header */}
            <div style={{
              background: `linear-gradient(135deg,${lessonColor}22,${lessonColor}11)`,
              borderRadius: 20, padding: 'clamp(20px,3vw,32px)',
              border: `2px solid ${lessonColor}33`, marginBottom: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 'clamp(20px,3vw,28px)', color: '#333', margin: '0 0 8px' }}>
                    {selected.title}
                  </h2>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ background: `${lessonColor}22`, color: lessonColor, padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 800 }}>
                      🌟 {selected.lesson}
                    </span>
                    <span style={{ background: '#f5f5f5', color: '#888', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>
                      ⏱ {selected.readingTime}
                    </span>
                    {selected.completed && (
                      <span style={{
                        padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 800,
                        background: selected.score === 3 ? '#e8f8f0' : selected.score >= 2 ? '#fff8e8' : '#fff0f0',
                        color: selected.score === 3 ? '#27ae60' : selected.score >= 2 ? '#f39c12' : '#e74c3c',
                      }}>
                        {selected.score}/3 correct
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(selected.id)}
                  style={{ background: '#fff0f0', border: 'none', color: '#e74c3c', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  🗑 Delete
                </button>
              </div>

              {/* Story text */}
              <div style={{
                background: 'white', borderRadius: 14, padding: 'clamp(16px,2vw,24px)',
                lineHeight: 2, fontSize: 'clamp(14px,1.8vw,16px)', color: '#444',
                whiteSpace: 'pre-wrap',
              }}>
                {selected.story[0] && (
                  <>
                    <span style={{ float: 'left', fontSize: 52, lineHeight: 0.8, marginRight: 8, marginTop: 6, color: lessonColor, fontFamily: 'Fredoka One, cursive' }}>
                      {selected.story[0]}
                    </span>
                    {selected.story.slice(1)}
                  </>
                )}
              </div>
            </div>

            {/* Quiz */}
            <div className="card" style={{ padding: 'clamp(16px,3vw,28px)' }}>
              <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20, color: '#4d96ff', marginBottom: 20 }}>
                🧠 Comprehension Quiz
              </div>

              {selected.questions?.map((q, qi) => {
                const isCorrect = submitted && answers[qi] === q.correctIndex
                const isWrong   = submitted && answers[qi] !== q.correctIndex && answers[qi] !== null
                return (
                  <div key={qi} style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#333', marginBottom: 10 }}>
                      {qi + 1}. {q.question}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options?.map((opt, oi) => {
                        let bg = '#f8f8f8', border = '2px solid #eee', color = '#444'
                        if (answers[qi] === oi && !submitted) { bg = '#f0f4ff'; border = '2px solid #4d96ff'; color = '#4d96ff' }
                        if (submitted) {
                          if (oi === q.correctIndex) { bg = '#e8f8f0'; border = '2px solid #27ae60'; color = '#27ae60' }
                          else if (answers[qi] === oi) { bg = '#fff0f0'; border = '2px solid #e74c3c'; color = '#e74c3c' }
                        }
                        return (
                          <button key={oi} disabled={submitted}
                            onClick={() => { if (!submitted) { const a = [...answers]; a[qi] = oi; setAnswers(a) } }}
                            style={{
                              padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                              fontSize: 14, fontWeight: 600, cursor: submitted ? 'default' : 'pointer',
                              background: bg, border, color, fontFamily: 'Nunito, sans-serif',
                              transition: 'all 0.15s',
                            }}>
                            {submitted && oi === q.correctIndex && '✅ '}
                            {submitted && answers[qi] === oi && oi !== q.correctIndex && '❌ '}
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {submitted && isWrong && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#888', fontWeight: 700 }}>
                        Correct answer: {q.options[q.correctIndex]}
                      </div>
                    )}
                  </div>
                )
              })}

              {error && <div style={{ fontSize: 13, color: '#e74c3c', fontWeight: 700, marginBottom: 12 }}>🚫 {error}</div>}

              {!submitted ? (
                <button onClick={handleSubmit}
                  style={{
                    padding: '14px 32px', borderRadius: 50, fontWeight: 800, fontSize: 16,
                    background: 'linear-gradient(135deg,#4d96ff,#667eea)', color: 'white', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(77,150,255,0.35)',
                  }}>
                  ✅ Submit Answers
                </button>
              ) : (
                <div style={{
                  background: selected.score === 3 ? 'linear-gradient(135deg,#e8f8f0,#d4f4e2)' : selected.score >= 2 ? 'linear-gradient(135deg,#fff8e8,#ffefc8)' : 'linear-gradient(135deg,#fff0f0,#ffd9d9)',
                  borderRadius: 16, padding: 24, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>
                    {selected.score === 3 ? '🏆' : selected.score >= 2 ? '⭐' : '💪'}
                  </div>
                  <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 22, marginBottom: 6,
                    color: selected.score === 3 ? '#27ae60' : selected.score >= 2 ? '#f39c12' : '#e74c3c' }}>
                    {selected.score === 3 ? 'Perfect score!' : selected.score >= 2 ? 'Great job!' : 'Keep practising!'}
                  </div>
                  <div style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                    You got {selected.score} out of 3 correct
                  </div>
                  <button onClick={() => { setSelected(null); setSubmitted(false) }}
                    style={{ padding: '10px 24px', borderRadius: 50, background: '#f5f5f5', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#555' }}>
                    Read another story →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}
