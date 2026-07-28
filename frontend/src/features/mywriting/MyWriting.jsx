import { useState, useEffect, useRef } from 'react'
import Confetti from '../../components/Confetti'
import { writingApi, storyApi } from '../../api/client'
import ErrorBox from '../../components/ErrorBox'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'
import ThemeLoader from '../../components/ThemeLoader'
import HistoryDrawer, { fmtDate } from '../../components/HistoryDrawer'
import { runPageCurl } from '../../utils/pageCurl'

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const h = () => setM(window.innerWidth < 1024)
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

function StoryCard({ e, chapterNum, selected, onOpen }) {
  const isSelected = selected?.id === e.id
  const displayTitle = `${chapterNum ? `Ch.${chapterNum}: ` : ''}${e.title}`
  return (
    <div onClick={() => onOpen(e)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
        borderRadius: 12, cursor: 'pointer', flexShrink: 0,
        background: isSelected ? 'var(--primary-lt)' : 'white',
        border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid #f0f0f0',
        transition: 'background 0.15s, border-color 0.15s',
      }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{e.feedbackReceived ? '✨' : '✍️'}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--primary)' : '#333',
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {displayTitle}
      </span>
      {e.badge && <span style={{ fontSize: 16, flexShrink: 0 }}>{e.badge}</span>}
      <span style={{ fontSize: 10, fontWeight: 800, flexShrink: 0, whiteSpace: 'nowrap',
        background: e.feedbackReceived ? 'var(--primary-lt)' : '#f5f5f5',
        color: e.feedbackReceived ? 'var(--primary)' : '#aaa',
        padding: '2px 7px', borderRadius: 50 }}>
        {e.feedbackReceived ? 'Feedback ✓' : `${wordCount(e.content)}w`}
      </span>
    </div>
  )
}

function SeriesGroup({ root, chapters, selected, onOpen }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ flexShrink: 0 }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 4px', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#aaa' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          📖 {root.title}
        </span>
        <span style={{ fontSize: 10, color: '#bbb', fontWeight: 700 }}>{chapters.length + 1} chapters</span>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 12, borderLeft: '2px solid var(--primary-lt)' }}>
          <StoryCard e={root} chapterNum={1} selected={selected} onOpen={onOpen} />
          {chapters.map((ch, i) => <StoryCard key={ch.id} e={ch} chapterNum={i + 2} selected={selected} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  )
}

export default function MyWriting({ child, quota }) {
  const { track } = useTracker()
  const { markActive } = useFeatureDuration('mywriting', track)
  const offline = useOffline()
  const [entries,  setEntries]  = useState([])
  const [entriesPage, setEntriesPage]             = useState(0)
  const [entriesTotalPages, setEntriesTotalPages] = useState(1)
  const [entriesTotalCount, setEntriesTotalCount] = useState(0)
  const [entriesLoading, setEntriesLoading]       = useState(false)
  const [selected, setSelected] = useState(null)  // entry being viewed
  const [editing,  setEditing]  = useState(false) // true = editor open

  // Editor state
  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [fbLoading,setFbLoading]= useState(false)
  const [continuation, setContinuation] = useState(null)
  const [contLoading, setContLoading]   = useState(false)
  const [prevFeedback, setPrevFeedback] = useState(null)
  const [showPrevTips, setShowPrevTips] = useState(false)
  const [error,    setError]    = useState('')
  const [flipState, setFlipState] = useState(null) // { dir: 'forward'|'back', to: entry }
  const savedId = useRef(null)       // id of the saved draft being edited
  const parentStoryIdRef = useRef(null)
  const seriesIdRef = useRef(null)
  const autoSaveRef = useRef(null)
  const oldPageTurningRef  = useRef(null)
  const foldShadowRef      = useRef(null)
  const foldHighlightRef   = useRef(null)
  const touchStartX        = useRef(null)
  const touchStartY        = useRef(null)

  useEffect(() => { fetchEntries(0, true) }, [child.id])

  async function fetchEntries(page, replace) {
    setEntriesLoading(true)
    try {
      const data = await writingApi.getByChildPaged(child.id, page)
      const flat = data.content.flatMap(({ root, chapters }) => [root, ...(chapters || [])])
      setEntries(prev => replace ? flat : [...prev, ...flat])
      setEntriesPage(data.number)
      setEntriesTotalPages(data.totalPages)
      setEntriesTotalCount(data.totalElements)
    } catch {} finally { setEntriesLoading(false) }
  }

  const untitledTitle = () => `Untitled – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  // Auto-save every 30s while editing (uses untitled fallback if no title yet)
  useEffect(() => {
    if (!editing) return
    autoSaveRef.current = setInterval(() => {
      if (content.trim()) handleSave(true, title.trim() ? undefined : untitledTitle())
    }, 30000)
    return () => clearInterval(autoSaveRef.current)
  }, [editing, title, content])

  // Emergency save ref — updated every render to capture latest state
  const mwEmergencyRef = useRef(null)
  mwEmergencyRef.current = () => {
    if (editing && content.trim()) handleSave(true, title.trim() ? undefined : untitledTitle())
  }
  useEffect(() => {
    window.__glumbiEmergencySaves ??= new Set()
    const fn = () => mwEmergencyRef.current?.()
    window.__glumbiEmergencySaves.add(fn)
    return () => window.__glumbiEmergencySaves?.delete(fn)
  }, [])

  function startNew() {
    savedId.current = null; parentStoryIdRef.current = null; seriesIdRef.current = null
    setTitle(''); setContent(''); setFeedback(null); setError(''); setContinuation(null)
    setPrevFeedback(null); setShowPrevTips(false)
    setSelected(null); setEditing(true)
  }

  async function handleContinue(entry) {
    setContLoading(true); setContinuation(null)
    try {
      const result = await writingApi.continue(entry.id)
      track('mywriting', 'ai_continue')
      setContinuation(result)
      window.__glumbiRefreshQuota?.('writing-coach')
    } catch (e) { setError(e.message) }
    finally { setContLoading(false) }
  }

  function openEntry(e) {
    markActive()
    setSelected(e); setEditing(false); setContinuation(null); setError('')
    setFeedback(e.feedbackReceived ? {
      praise: e.feedbackPraise,
      suggestion: e.feedbackSuggestion,
      encouragement: e.feedbackEncouragement,
      starWord: e.starWord,
      badge: e.badge,
    } : null)
    // Load parent's feedback tip for chapters
    if (e.parentStoryId) {
      const parent = entries.find(p => p.id === e.parentStoryId)
      setPrevFeedback(parent?.feedbackSuggestion || null)
    } else {
      setPrevFeedback(null)
    }
    setShowPrevTips(false)
  }

  function editEntry(e) {
    savedId.current = e.id
    setTitle(e.title); setContent(e.content)
    setFeedback(null); setError(''); setEditing(true); setSelected(null); setContinuation(null)
    setPrevFeedback(null); setShowPrevTips(false)
    parentStoryIdRef.current = null; seriesIdRef.current = null
  }

  async function handleSave(silent = false, fallbackTitle = undefined) {
    const effectiveTitle = title.trim() || fallbackTitle
    if (!effectiveTitle || !content.trim()) return
    if (!silent) setSaving(true)
    try {
      const data = { childId: child.id, title: effectiveTitle, content,
        parentStoryId: parentStoryIdRef.current || undefined,
        seriesId: seriesIdRef.current || undefined,
      }
      let saved
      if (savedId.current) {
        saved = await writingApi.update(savedId.current, data)
      } else {
        saved = await writingApi.save(data)
        savedId.current = saved.id
      }
      track('mywriting', 'save'); markActive()
      setEntries(prev => {
        const exists = prev.find(e => e.id === saved.id)
        if (!exists) {
          fetchEntries(0, true)
          return [saved, ...prev]
        }
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
      track('mywriting', 'feedback', { metadata: { wordCount: wordCount(content) } }); markActive()
      setFeedback({
        praise: result.feedbackPraise,
        suggestion: result.feedbackSuggestion,
        encouragement: result.feedbackEncouragement,
        starWord: result.starWord,
        badge: result.badge,
      })
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000)
      setEntries(prev => prev.map(e => e.id === result.id ? result : e))
      window.__glumbiRefreshQuota?.('writing-coach')
    } catch (e) { setError(e.message) }
    finally { setFbLoading(false) }
  }

  async function handleDelete(id) {
    setConfirmDelete(id)
  }

  async function confirmDeleteEntry() {
    const result = await writingApi.delete(confirmDelete)
    const seriesDeleted = result?.seriesDeleted
    if (selected?.id === confirmDelete || (seriesDeleted && selected?.seriesId === confirmDelete)) setSelected(null)
    if (savedId.current === confirmDelete) { savedId.current = null; setEditing(false) }
    setConfirmDelete(null)
    fetchEntries(0, true)
  }

  const [confirmDelete, setConfirmDelete] = useState(null)
  const deletingEntry = entries.find(e => e.id === confirmDelete)
  const deletingHasSeries = deletingEntry && entries.some(e => e.seriesId === deletingEntry.id)

  // Chapter navigation — mirrors the same pattern as Stories
  const seriesChapters = (() => {
    if (!selected) return []
    const rootId = selected.seriesId || selected.id
    const root = entries.find(e => e.id === rootId)
    if (!root) return []
    const chapters = entries.filter(e => e.seriesId === rootId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    return [root, ...chapters]
  })()
  const chapterIndex = seriesChapters.findIndex(e => e.id === selected?.id)
  const hasPrev = chapterIndex > 0
  const hasNext = chapterIndex < seriesChapters.length - 1

  function navigateChapter(dir) {
    const next = dir === 'right' ? seriesChapters[chapterIndex + 1] : seriesChapters[chapterIndex - 1]
    if (!next || flipState) return
    setFlipState({ dir: dir === 'right' ? 'forward' : 'back', to: next })
  }

  function handleFlipEnd() {
    if (!flipState) return
    openEntry(flipState.to)
    setFlipState(null)
  }

  useEffect(() => {
    if (!flipState) return
    return runPageCurl(oldPageTurningRef, foldShadowRef, foldHighlightRef, flipState.dir, handleFlipEnd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipState?.dir, flipState?.to?.id])

  useEffect(() => {
    function onKey(e) {
      if (!selected || editing || seriesChapters.length < 2) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' && hasNext && !flipState) navigateChapter('right')
      if (e.key === 'ArrowLeft'  && hasPrev && !flipState) navigateChapter('left')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, editing, hasPrev, hasNext, flipState])

  const wc = wordCount(content)
  const MAX_CHARS = 4000
  const charCount = content.length
  const nearLimit = charCount > MAX_CHARS * 0.85
  const overLimit = charCount > MAX_CHARS
  const isMobile = useIsMobile()
  const showingContent = editing || (selected && !editing)

  return (
    <>
    {showConfetti && <Confetti />}
    {(fbLoading || contLoading) && <ThemeLoader theme={child.theme} label={contLoading ? 'Imagining what happens next…' : 'Reading your story…'} />}
    <ConfirmDialog
      open={!!confirmDelete}
      title={deletingHasSeries ? "Delete Whole Series?" : deletingEntry?.parentStoryId ? "Delete Chapter?" : "Delete Story?"}
      message={deletingHasSeries
        ? `This is the first chapter of a series. Deleting it will permanently delete all chapters in the series.`
        : deletingEntry?.parentStoryId
          ? "This chapter will be permanently deleted."
          : "This story will be permanently deleted."}
      confirmLabel="Delete"
      onConfirm={confirmDeleteEntry}
      onCancel={() => setConfirmDelete(null)}
    />
    <FeatureBanner feature="mywriting" child={child} isMobile={isMobile} />
    <QuotaBanner quota={quota} />
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : undefined, gap: isMobile ? 16 : 24, height: '100%', fontFamily: 'Nunito, sans-serif', marginTop: isMobile ? 6 : 16 }}>

      {/* Mobile top bar */}
      {isMobile && (
        showingContent ? (
          <button onClick={() => { setEditing(false); setSelected(null) }}
            style={{ alignSelf: 'flex-start', background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none', borderRadius: 50, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 4, marginBottom: 6 }}>
            ← Back
          </button>
        ) : (
          <button onClick={startNew}
            style={{ marginBottom: 12, padding: '13px', borderRadius: 50, fontWeight: 800, fontSize: 15, background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            ✍️ Write New Story
          </button>
        )
      )}

      {/* ── Left panel ── */}
      <div style={{ width: isMobile ? '100%' : 280, flexShrink: 0, display: isMobile && showingContent ? 'none' : 'flex', flexDirection: 'column', gap: 12, marginBottom: isMobile ? 16 : 0, overflowY: isMobile ? undefined : 'auto', minHeight: 0 }}>
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


      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, marginTop: isMobile ? 8 : 0 }}>

        {/* Editor */}
        {editing && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Last time's tips */}
            {prevFeedback && (
              <div style={{ borderRadius: 12, border: '1.5px solid #ffd93d', background: '#fffdf0', overflow: 'hidden', marginBottom: 16 }}>
                <button type="button" onClick={() => setShowPrevTips(v => !v)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#d68910' }}>💡 Last time's tip — try to apply it!</span>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{showPrevTips ? '▲' : '▼'}</span>
                </button>
                {showPrevTips && (
                  <div style={{ padding: '0 16px 12px', fontSize: 13, color: '#555', lineHeight: 1.7 }}>{prevFeedback}</div>
                )}
              </div>
            )}
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
                <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: wc >= MIN_WORDS ? '#27ae60' : '#aaa' }}>
                    {wc} words {wc < MIN_WORDS ? `(write ${MIN_WORDS - wc} more for feedback)` : '✓'}
                  </span>
                  {nearLimit && (
                    <span style={{ color: overLimit ? '#e74c3c' : '#e67e22' }}>
                      {overLimit
                        ? `Too long for feedback — ${charCount - MAX_CHARS} chars over limit`
                        : `${MAX_CHARS - charCount} chars left before feedback limit`}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleSave()} disabled={saving || !title.trim() || !content.trim()}
                    style={{ padding: '10px 20px', borderRadius: 50, fontWeight: 700, fontSize: 13, background: '#f5f5f5', color: '#555', border: 'none', cursor: 'pointer' }}>
                    {saving ? 'Saving…' : '💾 Save'}
                  </button>
                  <button onClick={handleGetFeedback} disabled={fbLoading || !content.trim() || overLimit || quota?.used >= quota?.limit || offline}
                    style={{
                      padding: '10px 20px', borderRadius: 50, fontWeight: 800, fontSize: 13,
                      background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none',
                      cursor: fbLoading || !content.trim() || overLimit || quota?.used >= quota?.limit || offline ? 'not-allowed' : 'pointer',
                      opacity: fbLoading || !content.trim() || overLimit || quota?.used >= quota?.limit || offline ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                    {fbLoading
                      ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Reading…</>
                      : offline ? '✈️ ✨ Get Feedback' : '✨ Get Feedback'}
                  </button>
                </div>
              </div>
              <div style={{ marginTop: error ? 12 : 0 }}><ErrorBox msg={error} /></div>
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
              {/* Chapter nav arrows + dots (only for series) */}
              {seriesChapters.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
                  <button onClick={() => navigateChapter('left')} disabled={!hasPrev || !!flipState}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hasPrev ? 'var(--primary-lt)' : '#f0f0f0', color: hasPrev ? 'var(--primary)' : '#ccc', cursor: hasPrev ? 'pointer' : 'default', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
                    ‹
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {seriesChapters.map((_, i) => (
                      <button key={i} onClick={() => {
                        if (i === chapterIndex || flipState) return
                        navigateChapter(i > chapterIndex ? 'right' : 'left')
                      }} style={{ width: i === chapterIndex ? 18 : 8, height: 8, borderRadius: 4, border: 'none', padding: 0, cursor: i === chapterIndex ? 'default' : 'pointer', background: i === chapterIndex ? 'var(--primary)' : '#ddd', transition: 'all 0.2s' }} />
                    ))}
                  </div>
                  <button onClick={() => navigateChapter('right')} disabled={!hasNext || !!flipState}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hasNext ? 'var(--primary-lt)' : '#f0f0f0', color: hasNext ? 'var(--primary)' : '#ccc', cursor: hasNext ? 'pointer' : 'default', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
                    ›
                  </button>
                </div>
              )}

              {/* Story content with page-curl on chapter navigation */}
              {(() => {
                const textStyle = { lineHeight: 2, fontSize: 'clamp(14px,1.8vw,16px)', color: '#444', whiteSpace: 'pre-wrap', background: '#fafafa', borderRadius: 12, padding: 'clamp(14px,2vw,20px)', border: '1.5px solid #f0f0f0' }
                const renderText = (entry) => <div style={textStyle}>{entry.content}</div>

                if (!flipState) return (
                  <div
                    onTouchStart={e => {
                      touchStartX.current = e.touches[0].clientX
                      touchStartY.current = e.touches[0].clientY
                    }}
                    onTouchEnd={e => {
                      if (touchStartX.current === null) return
                      const dx = e.changedTouches[0].clientX - touchStartX.current
                      const dy = e.changedTouches[0].clientY - touchStartY.current
                      touchStartX.current = null
                      touchStartY.current = null
                      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return
                      if (dx < 0 && hasNext) navigateChapter('right')
                      else if (dx > 0 && hasPrev) navigateChapter('left')
                    }}>
                    {renderText(selected)}
                  </div>
                )

                const isFwd = flipState.dir === 'forward'
                const initClip = isFwd
                  ? 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
                  : 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'

                return (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                    {renderText(flipState.to)}
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', clipPath: isFwd ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)' }}>
                      {renderText(selected)}
                    </div>
                    <div ref={oldPageTurningRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', clipPath: initClip }}>
                      {renderText(selected)}
                    </div>
                    <div ref={foldShadowRef} style={{ position: 'absolute', top: 0, bottom: 0, width: '6%', left: isFwd ? '45%' : '50%', pointerEvents: 'none', zIndex: 5, background: isFwd ? 'linear-gradient(to left,rgba(0,0,0,0.25),transparent)' : 'linear-gradient(to right,rgba(0,0,0,0.25),transparent)', opacity: 0.22 }} />
                    <div ref={foldHighlightRef} style={{ position: 'absolute', top: 0, bottom: 0, width: 2, left: '50%', pointerEvents: 'none', zIndex: 6, background: 'rgba(255,255,255,0.65)' }} />
                  </div>
                )
              })()}
              {!selected.feedbackReceived && (
                <button onClick={() => !offline && editEntry(selected)} disabled={offline}
                  style={{ marginTop: 16, padding: '12px 24px', borderRadius: 50, background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', border: 'none', fontWeight: 800, fontSize: 13, cursor: offline ? 'not-allowed' : 'pointer', opacity: offline ? 0.6 : 1 }}>
                  {offline ? '✈️ ✨ Edit & Get Feedback' : '✨ Edit & Get Feedback'}
                </button>
              )}
            </div>

            {selected.feedbackReceived && (
              continuation ? (
                // Collapsed when continuation is showing — just a reminder strip
                <div style={{ borderRadius: 12, border: '1.5px solid #ffd93d', background: '#fffdf0', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
                    <span style={{ fontSize: 20 }}>{selected.badge || '✨'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#d68910', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Last time's tip</div>
                      <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{selected.feedbackSuggestion}</div>
                    </div>
                  </div>
                </div>
              ) : (
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
              )
            )}

            {/* Continue story suggestion — only on the last chapter */}
            <div style={{ marginTop: 16 }}>
              {!continuation && chapterIndex === seriesChapters.length - 1 && (
                <button
                  onClick={() => handleContinue(selected)}
                  disabled={contLoading || offline || quota?.used >= quota?.limit}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 50, fontWeight: 800, fontSize: 14,
                    background: contLoading ? '#f5f5f5' : 'linear-gradient(135deg,#8e44ad,#3498db)',
                    color: contLoading ? '#aaa' : 'white', border: 'none',
                    cursor: contLoading || offline || quota?.used >= quota?.limit ? 'not-allowed' : 'pointer',
                    opacity: offline || quota?.used >= quota?.limit ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {contLoading
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#aaa', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Imagining what happens next…</>
                    : offline ? '✈️ ✨ What happens next?' : '✨ What happens next?'}
                </button>
              )}
              {continuation && (
                <div className="card" style={{ animation: 'fadeIn 0.5s ease' }}>
                  <div style={{ background: 'linear-gradient(135deg,#8e44ad22,#3498db22)', borderRadius: '20px 20px 0 0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#8e44ad' }}>✨ Story continues…</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#333', marginTop: 2 }}>{continuation.title}</div>
                    </div>
                    <button onClick={() => setContinuation(null)}
                      style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#aaa', padding: 4 }}>✕</button>
                  </div>
                  <div style={{ padding: '16px 24px' }}>
                    <div style={{ lineHeight: 1.9, fontSize: 14, color: '#444', whiteSpace: 'pre-wrap', background: '#fafafa', borderRadius: 12, padding: 16, border: '1.5px solid #f0f0f0', marginBottom: 12 }}>
                      {continuation.content}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setTitle(continuation.title)
                          setContent(continuation.content)
                          savedId.current = null
                          if (selected?.feedbackSuggestion) {
                            setPrevFeedback(selected.feedbackSuggestion)
                            setShowPrevTips(false)
                          }
                          parentStoryIdRef.current = selected.id
                          seriesIdRef.current = selected.seriesId || selected.id
                          savedId.current = null
                          setFeedback(null)
                          setEditing(true); setSelected(null); setContinuation(null)
                        }}
                        style={{ padding: '10px 20px', borderRadius: 50, background: 'linear-gradient(135deg,#8e44ad,#3498db)', color: 'white', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                        📝 Use this — keep writing!
                      </button>
                      <button onClick={() => handleContinue(selected)}
                        style={{ padding: '10px 20px', borderRadius: 50, background: '#f5f5f5', color: '#555', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        🔄 Try another idea
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ marginTop: error ? 12 : 0 }}><ErrorBox msg={error} /></div>
            </div>
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

    {/* Writing history drawer */}
    {(() => {
      const roots = entries.filter(e => !e.seriesId)
      const chaptersBySeriesId = entries.reduce((acc, e) => {
        if (e.seriesId) { (acc[e.seriesId] = acc[e.seriesId] || []).push(e) }
        return acc
      }, {})
      return (
        <HistoryDrawer icon="✍️" title="My Stories" count={entriesTotalCount}>
          {close => (<>
            {roots.map(root => {
              const chapters = (chaptersBySeriesId[root.id] || []).slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              const open = e => { openEntry(e); close() }
              return chapters.length > 0
                ? <SeriesGroup key={root.id} root={root} chapters={chapters} selected={selected} onOpen={open} />
                : <StoryCard key={root.id} e={root} selected={selected} onOpen={open} />
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
      )
    })()}
    </>
  )
}
