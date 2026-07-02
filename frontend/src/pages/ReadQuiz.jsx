import { useState, useEffect } from 'react'
import { readQuizApi } from '../api/client'
import ErrorBox from '../components/ErrorBox'
import ThemeLoader from '../components/ThemeLoader'
import ConfirmDialog from '../components/ConfirmDialog'
import QuotaBanner from '../components/QuotaBanner'
import { useOffline } from '../contexts/OfflineContext'

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 640)
  useEffect(() => {
    const h = () => setM(window.innerWidth < 640)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return m
}

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

export default function ReadQuiz({ child, quota }) {
  const offline = useOffline()
  const [entries,  setEntries]  = useState([])
  const [selected, setSelected] = useState(null)
  const [topic,    setTopic]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [answers,     setAnswers]     = useState([null, null, null])
  const [submitted,   setSubmitted]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const isMobile = useIsMobile()

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
    setConfirmDelete(id)
  }

  async function confirmDeleteEntry() {
    await readQuizApi.delete(confirmDelete)
    setEntries(prev => prev.filter(e => e.id !== confirmDelete))
    if (selected?.id === confirmDelete) setSelected(null)
    setConfirmDelete(null)
  }

  const lessonColor = 'var(--primary)'

  return (
    <>
    <ConfirmDialog
      open={!!confirmDelete}
      title="Delete Entry?"
      message="This story and quiz will be permanently deleted."
      confirmLabel="Delete"
      onConfirm={confirmDeleteEntry}
      onCancel={() => setConfirmDelete(null)}
    />
    <div style={{ display: isMobile ? 'block' : 'flex', gap: 24, height: '100%', fontFamily: 'Nunito, sans-serif' }}>

      {/* Mobile back button */}
      {isMobile && selected && (
        <button onClick={() => setSelected(null)}
          style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none', borderRadius: 50, padding: '8px 16px', fontWeight: 700, fontSize: 13, marginBottom: 12, cursor: 'pointer' }}>
          ← Back
        </button>
      )}

      {/* ── Left panel ── */}
      <div style={{ width: isMobile ? '100%' : 300, flexShrink: 0, display: isMobile && selected ? 'none' : 'flex', flexDirection: 'column', gap: 16, marginBottom: isMobile ? 16 : 0 }}>

        <QuotaBanner quota={quota} />
        {/* Generate form */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: 'var(--primary)', marginBottom: 14 }}>📚 Read & Quiz</div>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#888', display: 'block', marginBottom: 8 }}>PICK A TOPIC</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {TOPICS.map(t => (
                  <button key={t.label} type="button" onClick={() => setTopic(t.label)}
                    style={{
                      padding: '5px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: topic === t.label ? 'var(--primary)' : 'var(--primary-lt)',
                      color: topic === t.label ? 'white' : 'var(--primary)',
                      border: topic === t.label ? 'none' : '1.5px solid var(--primary-lt)',
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
            <ErrorBox msg={error} />
            <button type="submit" disabled={loading || !topic.trim() || quota?.used >= quota?.limit || offline}
              style={{
                padding: '12px', borderRadius: 50, fontWeight: 800, fontSize: 14,
                background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none',
                cursor: loading || !topic.trim() || offline ? 'not-allowed' : 'pointer',
                opacity: loading || !topic.trim() || offline ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Generating…</>
                : offline ? '✈️ AI is off' : '📖 Generate Story'}
            </button>
          </form>
        </div>

        {/* History */}
        {entries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 2 }}>History</div>
            {entries.map(e => {
              const scoreColor = e.score === 3 ? '#27ae60' : e.score >= 2 ? '#f39c12' : '#e74c3c'
              return (
                <div key={e.id} onClick={() => openEntry(e)}
                  style={{
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    boxShadow: selected?.id === e.id ? '0 0 0 3px var(--primary), 0 4px 20px rgba(0,0,0,0.15)' : 'var(--shadow)',
                    transition: 'box-shadow 0.2s',
                  }}>
                  {/* Coloured header */}
                  <div style={{
                    background: 'var(--primary)',
                    height: 56, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
                  }}>
                    <span style={{ fontSize: 22 }}>
                      {TOPICS.find(t => t.label === e.topic)?.emoji || '📖'}
                    </span>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 13, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {e.title}
                    </span>
                    {e.completed && (
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'white', background: 'rgba(0,0,0,0.2)', borderRadius: 50, padding: '2px 8px' }}>
                        {e.score}/3
                      </span>
                    )}
                  </div>
                  {/* Footer */}
                  <div style={{ background: 'white', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{e.topic}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {e.lesson && (
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--primary-lt)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 50 }}>
                          {e.lesson}
                        </span>
                      )}
                      {e.completed && (
                        <span style={{ fontSize: 13 }}>
                          {e.score === 3 ? '🏆' : e.score >= 2 ? '⭐' : '💪'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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
                  <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(20px,3vw,28px)', color: '#333', margin: '0 0 8px' }}>
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
                    <span style={{ float: 'left', fontSize: 52, lineHeight: 0.8, marginRight: 8, marginTop: 6, color: lessonColor, fontFamily: 'Nunito, sans-serif' }}>
                      {selected.story[0]}
                    </span>
                    {selected.story.slice(1)}
                  </>
                )}
              </div>
            </div>

            {/* Quiz */}
            <div className="card" style={{ padding: 'clamp(16px,3vw,28px)' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 20, color: 'var(--primary)', marginBottom: 20 }}>
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
                        if (answers[qi] === oi && !submitted) { bg = 'var(--primary-lt)'; border = '2px solid var(--primary)'; color = 'var(--primary)' }
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
                    background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
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
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, marginBottom: 6,
                    color: selected.score === 3 ? '#27ae60' : selected.score >= 2 ? '#f39c12' : '#e74c3c' }}>
                    {selected.score === 3 ? 'Perfect score!' : selected.score >= 2 ? 'Great job!' : 'Keep practising!'}
                  </div>
                  <div style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                    You got {selected.score} out of 3 correct
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {selected.score < 3 && (
                      <button onClick={() => { setAnswers([null, null, null]); setSubmitted(false) }}
                        style={{ padding: '10px 24px', borderRadius: 50, background: 'var(--primary)', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'white' }}>
                        🔄 Try again
                      </button>
                    )}
                    <button onClick={() => { setSelected(null); setSubmitted(false) }}
                      style={{ padding: '10px 24px', borderRadius: 50, background: '#f5f5f5', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#555' }}>
                      Read another story →
                    </button>
                  </div>
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
    </>
  )
}
