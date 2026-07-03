import { useState, useEffect, useRef } from 'react'
import { writingApi } from '../api/client'
import ErrorBox from '../components/ErrorBox'
import ConfirmDialog from '../components/ConfirmDialog'
import QuotaBanner from '../components/QuotaBanner'
import { useOffline } from '../contexts/OfflineContext'
import ThemeLoader from '../components/ThemeLoader'

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 640)
  useEffect(() => {
    const h = () => setM(window.innerWidth < 640)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return m
}

const STARTERS = [
  'One stormy night, I discovered…',
  'The robot looked at me and said…',
  'Deep in the jungle, there was a secret…',
  'My best friend and I found a map that led to…',
  'The dragon wasn\'t scary at all. In fact, she…',
  'I pressed the big red button, and suddenly…',
]

const MIN_WORDS = 30

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function MyWriting({ child, quota }) {
  const offline = useOffline()
  const [entries,  setEntries]  = useState([])
  const [selected, setSelected] = useState(null)  // entry being viewed
  const [editing,  setEditing]  = useState(false) // true = editor open

  // Editor state
  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [fbLoading,setFbLoading]= useState(false)
  const [error,    setError]    = useState('')
  const savedId = useRef(null)  // id of the saved draft being edited
  const autoSaveRef = useRef(null)

  useEffect(() => {
    writingApi.getByChild(child.id).then(setEntries).catch(() => {})
  }, [child.id])

  // Auto-save every 30s while editing
  useEffect(() => {
    if (!editing) return
    autoSaveRef.current = setInterval(() => {
      if (title.trim() && content.trim()) handleSave(true)
    }, 30000)
    return () => clearInterval(autoSaveRef.current)
  }, [editing, title, content])

  function startNew() {
    savedId.current = null
    setTitle(''); setContent(''); setFeedback(null); setError('')
    setSelected(null); setEditing(true)
  }

  function openEntry(e) {
    setSelected(e); setEditing(false)
    setFeedback(e.feedbackReceived ? {
      praise: e.feedbackPraise,
      suggestion: e.feedbackSuggestion,
      encouragement: e.feedbackEncouragement,
      starWord: e.starWord,
      badge: e.badge,
    } : null)
  }

  function editEntry(e) {
    savedId.current = e.id
    setTitle(e.title); setContent(e.content)
    setFeedback(null); setError(''); setEditing(true); setSelected(null)
  }

  async function handleSave(silent = false) {
    if (!title.trim() || !content.trim()) return
    if (!silent) setSaving(true)
    try {
      const data = { childId: child.id, title, content }
      let saved
      if (savedId.current) {
        saved = await writingApi.update(savedId.current, data)
      } else {
        saved = await writingApi.save(data)
        savedId.current = saved.id
      }
      setEntries(prev => {
        const exists = prev.find(e => e.id === saved.id)
        if (!exists) return [saved, ...prev]
        // preserve feedbackReceived — backend clears it on update but UI shouldn't reflect that until reload
        return prev.map(e => e.id === saved.id ? { ...saved, feedbackReceived: e.feedbackReceived } : e)
      })
    } catch (e) { if (!silent) setError(e.message) }
    finally { if (!silent) setSaving(false) }
  }

  async function handleGetFeedback() {
    if (!savedId.current) {
      await handleSave()
      if (!savedId.current) return
    }
    if (wordCount(content) < MIN_WORDS) {
      setError(`Write at least ${MIN_WORDS} words to get feedback (you have ${wordCount(content)})`); return
    }
    setError(''); setFbLoading(true)
    try {
      const result = await writingApi.feedback(savedId.current)
      setFeedback({
        praise: result.feedbackPraise,
        suggestion: result.feedbackSuggestion,
        encouragement: result.feedbackEncouragement,
        starWord: result.starWord,
        badge: result.badge,
      })
      setEntries(prev => prev.map(e => e.id === result.id ? result : e))
      window.__glumbiRefreshQuota?.()
    } catch (e) { setError(e.message) }
    finally { setFbLoading(false) }
  }

  async function handleDelete(id) {
    setConfirmDelete(id)
  }

  async function confirmDeleteEntry() {
    await writingApi.delete(confirmDelete)
    setEntries(prev => prev.filter(e => e.id !== confirmDelete))
    if (selected?.id === confirmDelete) setSelected(null)
    if (savedId.current === confirmDelete) { savedId.current = null; setEditing(false) }
    setConfirmDelete(null)
  }

  const [confirmDelete, setConfirmDelete] = useState(null)
  const wc = wordCount(content)
  const isMobile = useIsMobile()
  const showingContent = editing || (selected && !editing)

  return (
    <>
    {fbLoading && <ThemeLoader theme={child.theme} label="Reading your story…" />}
    <ConfirmDialog
      open={!!confirmDelete}
      title="Delete Story?"
      message="This story will be permanently deleted."
      confirmLabel="Delete"
      onConfirm={confirmDeleteEntry}
      onCancel={() => setConfirmDelete(null)}
    />
    <div style={{ display: isMobile ? 'block' : 'flex', gap: 24, height: '100%', fontFamily: 'Nunito, sans-serif' }}>
      <QuotaBanner quota={quota} />

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {showingContent ? (
            <button onClick={() => { setEditing(false); setSelected(null) }}
              style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none', borderRadius: 50, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              ← Back
            </button>
          ) : (
            <button onClick={startNew}
              style={{ flex: 1, padding: '13px', borderRadius: 50, fontWeight: 800, fontSize: 15, background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              ✍️ Write New Story
            </button>
          )}
        </div>
      )}

      {/* ── Left panel ── */}
      <div style={{ width: isMobile ? '100%' : 280, flexShrink: 0, display: isMobile && showingContent ? 'none' : 'flex', flexDirection: 'column', gap: 12, marginBottom: isMobile ? 16 : 0 }}>
        {!isMobile && (
          <button onClick={startNew}
            style={{
              padding: '14px', borderRadius: 50, fontWeight: 800, fontSize: 15,
              background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}>
            ✍️ Write New Story
          </button>
        )}

        {entries.length === 0 && !editing && (
          <div style={{ textAlign: 'center', padding: '32px 12px', color: '#ccc' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✍️</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>No stories yet — start writing!</div>
          </div>
        )}

        {entries.length > 0 && <div style={{ fontSize: 12, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 2 }}>My Stories</div>}
        {entries.map(e => (
          <div key={e.id} onClick={() => openEntry(e)}
            style={{
              borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
              boxShadow: selected?.id === e.id ? '0 0 0 3px var(--primary), 0 4px 20px rgba(0,0,0,0.15)' : 'var(--shadow)',
              transition: 'box-shadow 0.2s',
            }}>
            {/* Header */}
            <div style={{
              background: 'var(--primary)',
              height: 56, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>{e.feedbackReceived ? '✨' : '✍️'}</span>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 13, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {e.title}
              </span>
              {e.badge && <span style={{ fontSize: 18 }}>{e.badge}</span>}
            </div>
            {/* Footer */}
            <div style={{ background: 'white', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{wordCount(e.content)} words</span>
              {e.feedbackReceived
                ? <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--primary-lt)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 50 }}>Feedback received</span>
                : <span style={{ fontSize: 10, fontWeight: 800, background: '#f5f5f5', color: '#aaa', padding: '3px 8px', borderRadius: 50 }}>Saved</span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Editor */}
        {editing && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="card" style={{ padding: 'clamp(16px,3vw,28px)', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--primary)', marginBottom: 20 }}>✍️ My Story</div>

              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Give your story a title…"
                maxLength={80}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid #eee', fontSize: 18, fontWeight: 800, color: '#333', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif', marginBottom: 16 }} />

              {/* Story starters */}
              {content.length === 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Need a starter?</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STARTERS.map(s => (
                      <button key={s} type="button" onClick={() => setContent(s + ' ')}
                        style={{ padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: 'var(--primary-lt)', color: 'var(--primary)', border: '1.5px solid var(--primary-lt)', cursor: 'pointer' }}>
                        "{s.slice(0, 28)}…"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Start writing your story here… let your imagination run wild! 🚀"
                rows={14}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #eee', fontSize: 15, lineHeight: 1.9, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif', color: '#333' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 12, color: wc >= MIN_WORDS ? '#27ae60' : '#aaa', fontWeight: 700 }}>
                  {wc} words {wc < MIN_WORDS ? `(write ${MIN_WORDS - wc} more for feedback)` : '✓'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleSave()} disabled={saving || !title.trim() || !content.trim()}
                    style={{ padding: '10px 20px', borderRadius: 50, fontWeight: 700, fontSize: 13, background: '#f5f5f5', color: '#555', border: 'none', cursor: 'pointer' }}>
                    {saving ? 'Saving…' : '💾 Save'}
                  </button>
                  <button onClick={handleGetFeedback} disabled={fbLoading || !content.trim() || quota?.used >= quota?.limit || offline}
                    style={{
                      padding: '10px 20px', borderRadius: 50, fontWeight: 800, fontSize: 13,
                      background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none',
                      cursor: fbLoading || !content.trim() || quota?.used >= quota?.limit || offline ? 'not-allowed' : 'pointer',
                      opacity: fbLoading || !content.trim() || quota?.used >= quota?.limit || offline ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                    {fbLoading
                      ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Reading…</>
                      : offline ? '✈️ AI is off' : '✨ Get Feedback'}
                  </button>
                </div>
              </div>
              <ErrorBox msg={error} />
            </div>

            {/* Feedback card */}
            {feedback && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <p style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textAlign: 'center', margin: '0 0 8px' }}>✅ Feedback saved automatically</p>
              <div className="card">
                <div style={{ background: 'var(--primary-lt)', borderRadius: '20px 20px 0 0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 40 }}>{feedback.badge}</span>
                  <div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>Coach's Feedback</div>
                    {feedback.starWord && (
                      <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>⭐ Star word: <em>"{feedback.starWord}"</em></div>
                    )}
                  </div>
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ background: '#e8f8f0', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#27ae60', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>What I loved 💚</div>
                    <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7 }}>{feedback.praise}</div>
                  </div>
                  <div style={{ background: '#fff8e8', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#f39c12', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Try this next time 💡</div>
                    <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7 }}>{feedback.suggestion}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, color: 'var(--primary)', fontStyle: 'italic' }}>
                    {feedback.encouragement}
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        )}

        {/* View mode */}
        {selected && !editing && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="card" style={{ padding: 'clamp(16px,3vw,28px)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(20px,3vw,28px)', color: '#333', margin: '0 0 6px' }}>{selected.title}</h2>
                  <span style={{ fontSize: 12, color: '#aaa', fontWeight: 700 }}>{wordCount(selected.content)} words</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => editEntry(selected)}
                    style={{ padding: '8px 16px', borderRadius: 50, background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(selected.id)}
                    style={{ padding: '8px 16px', borderRadius: 50, background: '#fff0f0', color: '#e74c3c', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
              <div style={{ lineHeight: 2, fontSize: 'clamp(14px,1.8vw,16px)', color: '#444', whiteSpace: 'pre-wrap', background: '#fafafa', borderRadius: 12, padding: 'clamp(14px,2vw,20px)', border: '1.5px solid #f0f0f0' }}>
                {selected.content}
              </div>
              {!selected.feedbackReceived && (
                <button onClick={() => !offline && editEntry(selected)} disabled={offline}
                  style={{ marginTop: 16, padding: '12px 24px', borderRadius: 50, background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none', fontWeight: 800, fontSize: 13, cursor: offline ? 'not-allowed' : 'pointer', opacity: offline ? 0.6 : 1 }}>
                  {offline ? '✈️ AI is off' : '✨ Edit & Get Feedback'}
                </button>
              )}
            </div>

            {selected.feedbackReceived && (
              <div className="card">
                <div style={{ background: 'var(--primary-lt)', borderRadius: '20px 20px 0 0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 40 }}>{selected.badge}</span>
                  <div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>Coach's Feedback</div>
                    {selected.starWord && <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>⭐ Star word: <em>"{selected.starWord}"</em></div>}
                  </div>
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ background: '#e8f8f0', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#27ae60', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>What I loved 💚</div>
                    <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7 }}>{selected.feedbackPraise}</div>
                  </div>
                  <div style={{ background: '#fff8e8', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#f39c12', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Try this next time 💡</div>
                    <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7 }}>{selected.feedbackSuggestion}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, color: 'var(--primary)', fontStyle: 'italic' }}>
                    {selected.feedbackEncouragement}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!editing && !selected && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#ccc' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✍️</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Your stories live here</div>
            <div style={{ fontSize: 14 }}>Write a story, save it, then get encouraging feedback from your AI coach!</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
    </>
  )
}
