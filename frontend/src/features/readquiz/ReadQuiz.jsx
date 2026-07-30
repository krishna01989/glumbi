import { isCreditsBlocked } from '../../utils/quota'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { readQuizApi } from '../../api/client'
import Confetti from '../../components/Confetti'
import ErrorBox from '../../components/ErrorBox'
import ThemeLoader from '../../components/ThemeLoader'
import ConfirmDialog from '../../components/ConfirmDialog'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'
import HistoryDrawer, { fmtDate } from '../../components/HistoryDrawer'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const h = () => setM(window.innerWidth < 1024)
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
  const { track } = useTracker()
  const { markActive } = useFeatureDuration('readquiz', track)
  const quizStartTime = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const offline = useOffline()
  const [entries,  setEntries]  = useState([])
  const [entriesPage, setEntriesPage]           = useState(0)
  const [entriesTotalPages, setEntriesTotalPages] = useState(1)
  const [entriesTotalCount, setEntriesTotalCount] = useState(0)
  const [entriesLoading, setEntriesLoading]     = useState(false)
  const [selected, setSelected] = useState(null)
  const [topic,    setTopic]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [answers,     setAnswers]     = useState([null, null, null])
  const [submitted,   setSubmitted]   = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fsRef = useRef(null)
  const isMobile = useIsMobile()

  // Glumbi guide state
  const [glumbiPhase, setGlumbiPhase] = useState('idle') // idle | intro | reading | post
  const [glumbiPicked, setGlumbiPicked] = useState(null)

  function initGlumbi(entry) {
    // Already completed — jump straight to post so Glumbi score comment + cross-nav buttons show
    setGlumbiPhase(entry.glumbiIntro ? (entry.completed ? 'post' : 'intro') : 'idle')
    setGlumbiPicked(null)
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) fsRef.current?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  const fromStoryFired = useRef(false)
  useEffect(() => {
    fetchEntries(0, true)
    const prefill = location.state?.glumbiPrefill
    if (prefill) setTopic(prefill)
    const storyId = location.state?.storyId
    if (storyId && !fromStoryFired.current) {
      fromStoryFired.current = true
      handleGenerateFromStory(storyId)
    }
  }, [child.id])

  async function handleGenerateFromStory(storyId) {
    setLoading(true); setError('')
    try {
      const entry = await readQuizApi.fromStory(child.id, storyId)
      const isNew = !entry.completed && entry.createdAt
        && (Date.now() - new Date(entry.createdAt).getTime()) < 10000
      const questions = JSON.parse(entry.questionsJson || '[]')
      setEntries(prev => {
        const exists = prev.some(e => e.id === entry.id)
        return exists ? prev : [{ ...entry, questions }, ...prev]
      })
      fetchEntries(0, true)
      openEntry({ ...entry, questions })
      initGlumbi(entry)
      if (isNew) {
        track('readquiz', 'generate', { metadata: { topic: entry.topic, fromStory: true } }); markActive()
        window.__glumbiRefreshQuota?.('read-quiz')
      }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function fetchEntries(page, replace) {
    setEntriesLoading(true)
    try {
      const data = await readQuizApi.getByChildPaged(child.id, page)
      setEntries(prev => replace ? data.content : [...prev, ...data.content])
      setEntriesPage(data.number)
      setEntriesTotalPages(data.totalPages)
      setEntriesTotalCount(data.totalElements)
    } catch {} finally { setEntriesLoading(false) }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true); setError('')
    try {
      const entry = await readQuizApi.generate(child.id, topic)
      track('readquiz', 'generate', { metadata: { topic } }); markActive()
      quizStartTime.current = Date.now()
      const questions = JSON.parse(entry.questionsJson || '[]')
      setEntries(prev => [{ ...entry, questions }, ...prev])
      fetchEntries(0, true)
      openEntry({ ...entry, questions })
      initGlumbi(entry)
      setTopic('')
      window.__glumbiRefreshQuota?.('read-quiz')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function openEntry(entry) {
    markActive()
    const questions = entry.questions || JSON.parse(entry.questionsJson || '[]')
    setSelected({ ...entry, questions })
    const savedAnswers = entry.completed && entry.answersJson
      ? JSON.parse(entry.answersJson)
      : [null, null, null]
    setAnswers(savedAnswers)
    setSubmitted(entry.completed)
    initGlumbi(entry)
  }

  async function handleSubmit() {
    if (answers.some(a => a === null)) {
      setError('Please answer all 3 questions first!'); return
    }
    setError('')
    try {
      const result = await readQuizApi.submit(selected.id, answers)
      selected.questions?.forEach((q, qi) => {
        const correct = answers[qi] === q.correctIndex
        track('readquiz', correct ? 'correct' : 'wrong', { metadata: { question: q.question, questionIndex: qi + 1 } })
      })
      track('readquiz', 'complete', { metadata: { score: result.score, total: 3 }, durationSeconds: quizStartTime.current ? Math.round((Date.now() - quizStartTime.current) / 1000) : null })
      setSelected({ ...selected, score: result.score, completed: true, answersJson: result.answersJson })
      setEntries(prev => prev.map(e => e.id === result.id ? { ...e, score: result.score, completed: true, answersJson: result.answersJson } : e))
      setSubmitted(true)
      if (result.score >= 2) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000) }
      if (selected.glumbiIntro) setGlumbiPhase('post')
    } catch (e) { setError(e.message) }
  }

  async function handleDelete(id) {
    setConfirmDelete(id)
  }

  async function confirmDeleteEntry() {
    await readQuizApi.delete(confirmDelete)
    if (selected?.id === confirmDelete) setSelected(null)
    setConfirmDelete(null)
    fetchEntries(0, true)
  }

  const lessonColor = 'var(--primary)'

  return (
    <>
    {showConfetti && <Confetti />}
    <ConfirmDialog
      open={!!confirmDelete}
      title="Delete Entry?"
      message="This story and quiz will be permanently deleted."
      confirmLabel="Delete"
      onConfirm={confirmDeleteEntry}
      onCancel={() => setConfirmDelete(null)}
    />
    <FeatureBanner feature="readquiz" child={child} isMobile={isMobile} />
    <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 4 }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>📖</span>
      <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
        <strong>Parent tip:</strong> For early readers, read the passage aloud together before the quiz. The questions work best as a conversation — let your child think out loud rather than guessing alone.
      </div>
    </div>
    <div style={{ display: isMobile ? 'block' : 'flex', gap: 24, height: '100%', fontFamily: 'Nunito, sans-serif', marginTop: isMobile ? 6 : 16 }}>

      {/* Mobile back button */}
      {isMobile && selected && (
        <button onClick={() => setSelected(null)}
          style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none', borderRadius: 50, padding: '8px 16px', fontWeight: 700, fontSize: 13, marginTop: 4, marginBottom: 6, cursor: 'pointer' }}>
          ← Back
        </button>
      )}

      {/* ── Left panel ── */}
      <div style={{ width: isMobile ? '100%' : 300, flexShrink: 0, display: isMobile && selected ? 'none' : 'flex', flexDirection: 'column', gap: 16, marginBottom: isMobile ? 16 : 0, overflowY: isMobile ? undefined : 'auto', minHeight: 0 }}>

        <QuotaBanner quota={quota} />
        {/* Generate form */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 28 }}>📚</span>
            <h3 style={{ fontSize: 18, color: 'var(--primary)' }}>Read & Quiz</h3>
          </div>
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
            <button type="submit" disabled={loading || !topic.trim() || isCreditsBlocked(quota) || offline}
              style={{
                padding: '12px', borderRadius: 50, fontWeight: 800, fontSize: 16,
                background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none',
                cursor: loading || !topic.trim() || offline ? 'not-allowed' : 'pointer',
                opacity: loading || !topic.trim() || offline ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Creating magic…</>
                : offline ? '✈️ ✨ Generate Story' : '✨ Generate Story'}
            </button>
          </form>
        </div>

      </div>

      <HistoryDrawer icon="📚" title="My Reads" count={entriesTotalCount}>
        {close => (<>
        {entries.map(e => {
          const isSelected = selected?.id === e.id
          return (
            <div key={e.id} onClick={() => { openEntry(e); close() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 12, cursor: 'pointer', flexShrink: 0,
                background: isSelected ? 'var(--primary-lt)' : 'white',
                border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid #f0f0f0',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{TOPICS.find(t => t.label === e.topic)?.emoji || '📖'}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--primary)' : '#333',
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {e.title}
              </span>
              {e.lesson && (
                <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--primary-lt)', color: 'var(--primary)',
                  padding: '2px 7px', borderRadius: 50, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {e.lesson}
                </span>
              )}
              {e.completed
                ? <span style={{ fontSize: 15, flexShrink: 0 }}>{e.score === 3 ? '🏆' : e.score >= 2 ? '⭐' : '💪'}</span>
                : <span style={{ fontSize: 10, fontWeight: 800, background: '#f5f5f5', color: '#aaa',
                    padding: '2px 7px', borderRadius: 50, flexShrink: 0 }}>New</span>
              }
            </div>
          )
        })}
        {entriesPage + 1 < entriesTotalPages && (
          <button onClick={() => fetchEntries(entriesPage + 1, false)} disabled={entriesLoading}
            style={{ margin: '12px auto 0', display: 'block', padding: '8px 24px', borderRadius: 20,
              border: 'none', background: '#6c63ff', color: '#fff', fontFamily: 'Nunito, sans-serif',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: entriesLoading ? 0.6 : 1 }}>
            {entriesLoading ? 'Loading…' : 'Load more'}
          </button>
        )}
        </>)}
      </HistoryDrawer>

      {/* ── Right panel ── */}
      <div ref={fsRef} style={isFullscreen ? {
        height: '100dvh', width: '100dvw', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: 'linear-gradient(135deg, var(--primary), var(--accent))',
      } : { flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* Fullscreen header */}
        {isFullscreen && selected && (
          <div style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14,
            padding: isMobile ? '12px 14px' : '14px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
          }}>
            <span style={{ fontSize: isMobile ? 28 : 36 }}>
              {TOPICS.find(t => t.label === selected.topic)?.emoji || '📚'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? 15 : 20, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {selected.title}
              </h2>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 2 }}>
                🌟 {selected.lesson} · ⏱ {selected.readingTime}
              </div>
            </div>
            <button onClick={toggleFullscreen} title="Exit fullscreen"
              style={{ width: 34, height: 34, minWidth: 34, minHeight: 34, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/>
              </svg>
            </button>
          </div>
        )}

        <div style={isFullscreen ? { flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px' : '24px max(24px, calc(50% - 440px))' } : {}}>
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
              background: isFullscreen ? 'rgba(255,255,255,0.95)' : `linear-gradient(135deg,${lessonColor}22,${lessonColor}11)`,
              borderRadius: 20, padding: 'clamp(20px,3vw,32px)',
              border: isFullscreen ? 'none' : `2px solid ${lessonColor}33`, marginBottom: 24,
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {!isFullscreen && (
                    <button onClick={toggleFullscreen} title="Fullscreen reading mode"
                      style={{ background: '#f5f5f5', border: 'none', color: '#888', padding: '6px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
                      </svg>
                    </button>
                  )}
                  <button onClick={() => handleDelete(selected.id)}
                    style={{ background: '#fff0f0', border: 'none', color: '#e74c3c', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>

              {/* ── Glumbi guide ── */}
              {selected.glumbiIntro && glumbiPhase !== 'idle' && (() => {
                const gbtn = (label, onClick, solid = true) => (
                  <button onClick={onClick} style={{
                    padding: '10px 22px', borderRadius: 50, fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    border: solid ? 'none' : '2.5px solid var(--primary)',
                    background: solid ? 'var(--primary)' : 'transparent',
                    color: solid ? '#fff' : 'var(--primary)',
                    fontFamily: 'Nunito, sans-serif',
                  }}>{label}</button>
                )
                const GlumbiBubble = ({ text, children }) => (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '14px 0', padding: '16px 18px', background: 'var(--primary-lt, #fff8f0)', border: '2px solid var(--primary)', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 32, flexShrink: 0, lineHeight: 1 }}>🌟</div>
                    <div style={{ flex: 1 }}>
                      {text && <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', lineHeight: 1.55, marginBottom: children ? 12 : 0, fontFamily: 'Nunito, sans-serif' }}><strong>Glumbi:</strong> {text}</div>}
                      {children}
                    </div>
                  </div>
                )

                if (glumbiPhase === 'intro') return (
                  <GlumbiBubble text={selected.glumbiIntro}>
                    {gbtn("Let's read! 📖", () => setGlumbiPhase('reading'))}
                  </GlumbiBubble>
                )

                if (glumbiPhase === 'reading') return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '10px 0', padding: '12px 16px', background: 'var(--primary-lt, #fff8f0)', border: '2px solid var(--primary)', borderRadius: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>🌟</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Nunito, sans-serif' }}>Read the story, then answer the questions below!</span>
                    </div>
                    {gbtn("I'm ready! 🧠", () => { setGlumbiPhase('idle'); track('readquiz', 'glumbi_ready', { metadata: { topic: selected?.topic, title: selected?.title } }); document.getElementById('rq-quiz-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) })}
                  </div>
                )

                if (glumbiPhase === 'post' && selected.glumbiScoreComment) {
                  const scoreIndex = Math.min(selected.score ?? 0, 3)
                  const comment = selected.glumbiScoreComment.split('|')[scoreIndex] || 'Amazing effort!'
                  return (
                    <GlumbiBubble text={comment}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {gbtn('Read a story! 📖', () => {
                          track('readquiz', 'glumbi_cross_nav', { metadata: { from: 'readquiz', to: 'stories' } })
                          navigate(`/child/${child.id}/stories`, { state: { glumbiPrefill: selected.topic } })
                        })}
                        {gbtn('Bye Glumbi! 🌙', () => setGlumbiPhase('idle'), false)}
                      </div>
                    </GlumbiBubble>
                  )
                }

                return null
              })()}

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
            <div id="rq-quiz-section" style={{
              background: isFullscreen ? 'rgba(255,255,255,0.95)' : `linear-gradient(135deg,${lessonColor}22,${lessonColor}11)`,
              borderRadius: 20, padding: 'clamp(20px,3vw,32px)',
              border: isFullscreen ? 'none' : `2px solid ${lessonColor}33`, marginBottom: 24,
            }}>
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
        </div>{/* end inner scroll wrapper */}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
    </>
  )
}
