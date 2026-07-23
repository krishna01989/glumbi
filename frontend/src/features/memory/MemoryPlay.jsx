import { useState, useEffect, useCallback, useRef } from 'react'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import { useSearchParams } from 'react-router-dom'
import { memoryApi, learnApi } from '../../api/client'
import ErrorBox from '../../components/ErrorBox'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'
import HistoryDrawer, { fmtDate } from '../../components/HistoryDrawer'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'

const TABS = [
  { key: 'flashcards', label: '📇 Flashcards' },
  { key: 'match',      label: '🎴 Memory Match' },
  { key: 'wordofday',  label: '💬 Word of Day' },
]

const MATCH_THEMES = ['Animals', 'Space', 'Food', 'Nature', 'Sports']

// ── Flashcard flip card ──────────────────────────────────────────────────────

function FlipCard({ q, a, index, onFirstFlip }) {
  const [flipped, setFlipped] = useState(false)
  function handleClick() {
    if (!flipped && onFirstFlip) onFirstFlip()
    setFlipped(f => !f)
  }
  return (
    <div onClick={handleClick}
      style={{
        perspective: 800,
        cursor: 'pointer',
        minHeight: 120,
      }}>
      <div style={{
        position: 'relative',
        width: '100%', minHeight: 120,
        transition: 'transform 0.5s',
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front — question */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          background: 'var(--primary-lt)',
          borderRadius: 16, padding: 20,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Q {index + 1}
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 700, color: '#333' }}>{q}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 10 }}>Tap to flip →</div>
        </div>
        {/* Back — answer */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          borderRadius: 16, padding: 20,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.85)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Answer
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800, color: 'white' }}>{a}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 10 }}>← Tap to flip back</div>
        </div>
      </div>
    </div>
  )
}

// ── Flashcards tab ────────────────────────────────────────────────────────────

function FlashcardsTab({ child, quota, isMobile }) {
  const { track } = useTracker()
  const offline = useOffline()
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const flipTracked = useRef(false)
  useFeatureDuration('flashcards', track)
  const [sets, setSets] = useState([])
  const [activeSet, setActiveSet] = useState(null)
  const [setsPage, setSetsPage]           = useState(0)
  const [setsTotalPages, setSetsTotalPages] = useState(1)
  const [setsLoading, setSetsLoading]     = useState(false)

  useEffect(() => { fetchSets(0, true) }, [child.id])

  async function fetchSets(page, replace) {
    setSetsLoading(true)
    try {
      const data = await memoryApi.getFlashcardsPaged(child.id, page)
      setSets(prev => replace ? data.content : [...prev, ...data.content])
      setSetsPage(data.number)
      setSetsTotalPages(data.totalPages)
    } catch {} finally { setSetsLoading(false) }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!topic.trim() || offline) return
    setLoading(true); setError('')
    try {
      const set = await memoryApi.generateFlashcards(child.id, topic)
      track('flashcards', 'generate', { metadata: { topic } })
      setSets(prev => [set, ...prev])
      setActiveSet(set)
      setTopic('')
      window.__glumbiRefreshQuota?.('memory-flashcards')
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  async function handleDelete(id) {
    await memoryApi.deleteFlashcards(id)
    setSets(prev => prev.filter(s => s.id !== id))
    if (activeSet?.id === id) setActiveSet(null)
  }

  function loadSet(set) {
    try {
      const cards = typeof set.cards === 'string' ? JSON.parse(set.cards) : set.cards
      setActiveSet({ ...set, parsedCards: cards })
    } catch { setActiveSet(set) }
  }

  const parsedActive = activeSet
    ? (activeSet.parsedCards || (() => { try { return JSON.parse(activeSet.cards) } catch { return [] } })())
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <form onSubmit={handleGenerate} className="card"
        style={{ background: 'var(--primary-lt)', border: '2px dashed var(--primary-lt)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>📇</span>
          <h3 style={{ fontSize: 16, color: 'var(--primary)', margin: 0 }}>Generate Flashcards for {child.name}</h3>
        </div>
        <input placeholder="Enter a topic… e.g. Solar System, Animals, Colors"
          value={topic} onChange={e => setTopic(e.target.value)} required />
        <ErrorBox msg={error} />
        <button type="submit" disabled={loading || !topic.trim() || offline || quota?.used >= quota?.limit}
          style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', fontSize: 16, padding: '12px', borderRadius: 50, fontWeight: 700, border: 'none', cursor: (loading || offline) ? 'not-allowed' : 'pointer', opacity: (loading || offline) ? 0.6 : 1 }}>
          {loading ? <><span className="spinner" /> &nbsp;Generating…</> : offline ? '✈️ ✨ Generate Cards' : '✨ Generate Cards'}
        </button>
      </form>

      {loading && <ThemeLoader theme={child.theme} />}

      {activeSet && parsedActive.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
            📇 {activeSet.topic}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {parsedActive.map((card, i) => (
              <FlipCard key={i} index={i} q={card.q} a={card.a} onFirstFlip={() => { if (!flipTracked.current) { flipTracked.current = true; track('flashcards', 'view') } }} />
            ))}
          </div>
        </div>
      )}

      <HistoryDrawer icon="🧠" title="Past Sets" count={sets.length}>
        {close => (<>
          {sets.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fafafa', borderRadius: 12, gap: 10, flexShrink: 0 }}>
              <button onClick={() => { loadSet(s); close() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--primary)', textAlign: 'left', flex: 1 }}>
                📇 {s.topic}
              </button>
              <span style={{ fontSize: 11, color: '#bbb' }}>{fmtDate(s.createdAt)}</span>
              <button className="btn-danger" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', padding: 0, fontSize: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(s.id)}>✕</button>
            </div>
          ))}
          {setsPage + 1 < setsTotalPages && (
            <button onClick={() => fetchSets(setsPage + 1, false)} disabled={setsLoading}
              style={{ margin: '12px auto 0', display: 'block', padding: '8px 24px', borderRadius: 20,
                border: 'none', background: '#6c63ff', color: '#fff', fontFamily: 'Nunito, sans-serif',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: setsLoading ? 0.6 : 1 }}>
              {setsLoading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>)}
      </HistoryDrawer>

      {sets.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📇</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800 }}>No flashcard sets yet!</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Pick a topic and generate your first set above.</div>
        </div>
      )}
    </div>
  )
}

// ── Word of Day tab ────────────────────────────────────────────────────────────

function WordOfDayTab({ child, quota }) {
  const { track } = useTracker()
  useFeatureDuration('wordofday', track)
  const offline = useOffline()
  const [word, setWord] = useState(null)
  const [history, setHistory] = useState([])
  const [histPage, setHistPage]           = useState(0)
  const [histTotalPages, setHistTotalPages] = useState(1)
  const [histLoading, setHistLoading]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const audioRef = useRef(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    setLoading(true)
    Promise.all([
      memoryApi.getWordOfDay(child.id),
      memoryApi.getWordOfDayHistoryPaged(child.id, 0),
    ]).then(([today, histData]) => {
      if (today) track('wordofday', 'view')
      setWord(today)
      setHistory(histData.content.filter(h => h.id !== today?.id))
      setHistPage(histData.number)
      setHistTotalPages(histData.totalPages)
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false))
    window.__glumbiRefreshQuota?.()
  }, [child.id])

  async function fetchHistory(page) {
    setHistLoading(true)
    try {
      const data = await memoryApi.getWordOfDayHistoryPaged(child.id, page)
      setHistory(prev => [...prev, ...data.content.filter(h => h.id !== word?.id)])
      setHistPage(data.number)
      setHistTotalPages(data.totalPages)
    } catch {} finally { setHistLoading(false) }
  }

  if (loading) return <ThemeLoader theme={child.theme} />

  if (error) return (
    <div className="card"><ErrorBox msg={error} /></div>
  )

  if (!word) return null

  const isMobile = window.innerWidth < 768

  function playAudio(w, id) {
    if (offline) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (speakingId === id) { setSpeaking(false); setSpeakingId(null); return }
    track('wordofday', 'listen', { metadata: { word: w } })
    setSpeaking(true); setSpeakingId(id)
    const audio = new Audio(learnApi.audioUrl(w, 'en-US'))
    audioRef.current = audio
    audio.onended = () => { setSpeaking(false); setSpeakingId(null) }
    audio.onerror = () => { setSpeaking(false); setSpeakingId(null) }
    audio.play().catch(() => { setSpeaking(false); setSpeakingId(null) })
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Today's word */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-lt), white)', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center', padding: isMobile ? '24px 20px' : 40 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Today's Word</div>
        <div style={{ fontSize: isMobile ? 56 : 80 }}>{word.emoji}</div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: isMobile ? 28 : 40, fontWeight: 900, color: 'var(--primary)' }}>
          {word.word}
        </div>
        <button onClick={() => playAudio(word.word, word.id)} disabled={offline}
          style={{ background: speakingId === word.id ? 'var(--primary)' : 'rgba(0,0,0,0.06)', borderRadius: 50, padding: '7px 18px', fontSize: 13, fontWeight: 700, color: speakingId === word.id ? 'white' : '#666', letterSpacing: 0.5, border: 'none', cursor: offline ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s' }}>
          {speakingId === word.id ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Playing…</> : <>🔊 {word.pronunciation}</>}
        </button>
        <div style={{ fontSize: isMobile ? 14 : 16, color: '#444', lineHeight: 1.7, fontWeight: 600 }}>{word.meaning}</div>
        <div style={{ background: 'var(--primary-lt)', borderRadius: 14, padding: '12px 16px', fontSize: isMobile ? 13 : 15, color: '#333', lineHeight: 1.7, width: '100%', textAlign: 'left', boxSizing: 'border-box' }}>
          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Example: </span>
          <em>"{word.exampleSentence}"</em>
        </div>
        <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>
          {fmtDate(word.date)}
        </div>
      </div>

      {/* History button */}
      <HistoryDrawer icon="🧠" title={`Past Words`} count={history.length}>
        {history.map((h, i) => (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid #f5f5f5' : 'none', flexShrink: 0 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{h.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: 'var(--primary)' }}>{h.word}</span>
                <span style={{ fontSize: 11, color: '#bbb' }}>
                  {fmtDate(h.date)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 2, lineHeight: 1.5 }}>{h.meaning}</div>
            </div>
            <button onClick={() => playAudio(h.word, h.id)} disabled={offline}
              style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', border: 'none', background: speakingId === h.id ? 'var(--primary)' : 'var(--primary-lt)', color: speakingId === h.id ? 'white' : 'var(--primary)', cursor: offline ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, padding: 0, flexShrink: 0 }}>
              {speakingId === h.id ? <span className="spinner" style={{ width: 10, height: 10, borderWidth: 2 }} /> : '🔊'}
            </button>
          </div>
        ))}
        {histPage + 1 < histTotalPages && (
          <button onClick={() => fetchHistory(histPage + 1)} disabled={histLoading}
            style={{ margin: '12px auto 0', display: 'block', padding: '8px 24px', borderRadius: 20,
              border: 'none', background: '#6c63ff', color: '#fff', fontFamily: 'Nunito, sans-serif',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: histLoading ? 0.6 : 1 }}>
            {histLoading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </HistoryDrawer>
    </div>
  )
}

// ── Memory Match tab ──────────────────────────────────────────────────────────

const DIFFICULTIES = [
  { key: 'easy',   label: '🟢 Easy',   pairs: 2, cols: 2 },
  { key: 'medium', label: '🟡 Medium', pairs: 4, cols: 4 },
  { key: 'hard',   label: '🔴 Hard',   pairs: 6, cols: 4 },
]

function MatchGame({ pairs, difficulty = 'medium', setDifficulty, onReset }) {
  const { track } = useTracker()
  const diff = DIFFICULTIES.find(d => d.key === difficulty) || DIFFICULTIES[2]
  const slicedPairs = pairs.slice(0, diff.pairs)

  function freshCards() {
    const all = [...slicedPairs, ...slicedPairs].map((p, i) => ({ ...p, id: i, matched: false, flipped: false }))
    return all.sort(() => Math.random() - 0.5)
  }

  const [cards, setCards] = useState(freshCards)
  const [flippedIds, setFlippedIds] = useState([])
  const [locked, setLocked] = useState(false)
  const [moves, setMoves] = useState(0)
  const matchStartTime = useRef(Date.now())

  // Reset cards when difficulty changes without unmounting (preserves fullscreen)
  useEffect(() => {
    setCards(freshCards())
    setFlippedIds([])
    setLocked(false)
    setMoves(0)
    matchStartTime.current = Date.now()
  }, [difficulty]) // eslint-disable-line react-hooks/exhaustive-deps
  const won = cards.every(c => c.matched)
  const prevWonRef = useRef(false)
  useEffect(() => {
    if (won && !prevWonRef.current) track('memorymatch', 'complete', { metadata: { difficulty, moves }, durationSeconds: Math.round((Date.now() - matchStartTime.current) / 1000) })
    prevWonRef.current = won
  }, [won]) // eslint-disable-line react-hooks/exhaustive-deps
  const cardsRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      cardsRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  function resetGame() {
    setCards(freshCards())
    setFlippedIds([])
    setLocked(false)
    setMoves(0)
  }

  function flip(card) {
    if (locked || card.flipped || card.matched) return
    const newFlipped = [...flippedIds, card.id]
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, flipped: true } : c))
    setFlippedIds(newFlipped)

    if (newFlipped.length === 2) {
      setLocked(true)
      setMoves(m => m + 1)
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id))
      if (a && b && a.label === b.label) {
        track('memorymatch', 'match', { metadata: { pair: a.label } })
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c))
          setFlippedIds([])
          setLocked(false)
        }, 600)
      } else {
        track('memorymatch', 'mismatch')
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c))
          setFlippedIds([])
          setLocked(false)
        }, 1000)
      }
    }
  }

  const [viewport, setViewport] = useState({ vw: window.innerWidth, vh: window.innerHeight })
  useEffect(() => {
    const update = () => setViewport({ vw: window.innerWidth, vh: window.innerHeight })
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', () => setTimeout(update, 100))
    return () => { window.removeEventListener('resize', update); window.removeEventListener('orientationchange', update) }
  }, [])
  const { vw, vh } = viewport

  const isLandscapeMobile = isFullscreen && vw > vh && vh < 560
  const isMobileGrid = vw < 480 && !isLandscapeMobile
  const cols = isMobileGrid && diff.cols > 2 ? Math.min(diff.cols, 3) : diff.cols

  // Landscape fullscreen: calculate exact card pixel size to fill height without scrolling
  // Available height = vh minus: toggle btn (32) + its margin (4) + moves bar (26) + its margin (8) + padding (16)
  const lsAvailH = vh - 32 - 4 - 26 - 8 - 16
  const lsRows = Math.ceil(cards.length / cols)
  const lsGap = 6
  const lsCardH = Math.max(40, Math.floor((lsAvailH - lsGap * (lsRows - 1)) / lsRows))
  const lsCardW = Math.floor(lsCardH * 0.75)
  const emojiSize = isLandscapeMobile ? Math.max(16, Math.floor(lsCardH * 0.38)) : diff.pairs <= 2 ? 72 : diff.pairs <= 4 ? 52 : 40
  const labelSize = isLandscapeMobile ? Math.max(9, Math.floor(lsCardH * 0.16)) : diff.pairs <= 2 ? 20 : diff.pairs <= 4 ? 15 : 13

  const fsStyle = isFullscreen ? {
    background: '#fff9f0', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100dvh', width: '100dvw', overflow: 'hidden',
    padding: isLandscapeMobile ? '6px 16px' : '16px 24px', boxSizing: 'border-box',
  } : {}

  return (
    <div ref={cardsRef} style={fsStyle}>
      {/* Top bar: difficulty (fullscreen only) + fullscreen toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: isLandscapeMobile ? 2 : 6, gap: 8 }}>
        <div style={{ display: 'flex', gap: isLandscapeMobile ? 4 : 6, alignItems: 'center', visibility: isFullscreen ? 'visible' : 'hidden' }}>
          {DIFFICULTIES.map(d => (
            <button key={d.key} onClick={() => setDifficulty?.(d.key)}
              style={{
                padding: isLandscapeMobile ? '3px 8px' : '5px 12px',
                fontSize: isLandscapeMobile ? 10 : 11,
                fontWeight: 700, borderRadius: 50, border: '2px solid', cursor: 'pointer',
                borderColor: difficulty === d.key ? 'var(--primary)' : '#e0e0e0',
                background: difficulty === d.key ? 'var(--primary)' : 'white',
                color: difficulty === d.key ? 'white' : '#888',
                transition: 'all 0.15s',
              }}>
              {d.label}
            </button>
          ))}
        </div>
        <button onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Play fullscreen'}
          style={{ width: 32, height: 32, minWidth: 32, borderRadius: 8, border: '1.5px solid var(--primary-lt)', background: 'var(--primary-lt)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-lt)'; e.currentTarget.style.color = 'var(--primary)' }}>
          {isFullscreen ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
            </svg>
          )}
        </button>
      </div>

      {won ? (
        <div style={{ textAlign: 'center', padding: isLandscapeMobile ? '8px 24px' : 40, display: 'flex', flexDirection: isLandscapeMobile ? 'row' : 'column', alignItems: 'center', gap: isLandscapeMobile ? 20 : 0 }}>
          <div style={{ fontSize: isLandscapeMobile ? 48 : 80 }}>🎉</div>
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: isLandscapeMobile ? 20 : 28, fontWeight: 900, color: 'var(--primary)', marginTop: isLandscapeMobile ? 0 : 16 }}>
              You did it!
            </div>
            <div style={{ fontSize: isLandscapeMobile ? 13 : 16, color: '#666', marginTop: 4, marginBottom: isLandscapeMobile ? 8 : 28 }}>Matched all pairs in {moves} moves!</div>
            <button onClick={resetGame}
              style={{ padding: isLandscapeMobile ? '8px 20px' : '12px 32px', borderRadius: 50, border: 'none', fontWeight: 800, fontSize: isLandscapeMobile ? 13 : 15, cursor: 'pointer',
                background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              🔄 Play Again
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isLandscapeMobile
              ? `repeat(${cols}, ${lsCardW}px)`
              : `repeat(${cols}, 1fr)`,
            gridTemplateRows: isLandscapeMobile
              ? `repeat(${lsRows}, ${lsCardH}px)`
              : undefined,
            gap: isLandscapeMobile ? lsGap : isMobileGrid ? 8 : 12,
            maxWidth: isLandscapeMobile
              ? undefined
              : isFullscreen ? Math.min(cols * 160, 800) : (cols <= 2 ? 320 : '100%'),
            margin: '0 auto',
            width: isLandscapeMobile ? undefined : '100%',
            flexShrink: 0,
          }}>
            {cards.map(card => (
              <div key={card.id} onClick={() => flip(card)}
                style={{
                  width: isLandscapeMobile ? lsCardW : undefined,
                  height: isLandscapeMobile ? lsCardH : undefined,
                  aspectRatio: isLandscapeMobile ? undefined : '3/4',
                  borderRadius: isLandscapeMobile ? 8 : 16,
                  cursor: (card.flipped || card.matched || locked) ? 'default' : 'pointer',
                  perspective: 600,
                }}>
                <div style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.4s', transform: (card.flipped || card.matched) ? 'rotateY(180deg)' : 'rotateY(0)', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: isLandscapeMobile ? 8 : 16, background: card.matched ? '#e8f8e8' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: emojiSize, color: 'white', fontWeight: 900, boxShadow: 'var(--shadow)' }}>
                    {card.matched ? '✅' : '?'}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: isLandscapeMobile ? 8 : 16, background: card.matched ? '#e8f8e8' : 'var(--primary-lt)', border: card.matched ? '2px solid #6bcb77' : '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: isLandscapeMobile ? 2 : 8, padding: isLandscapeMobile ? 4 : 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                    <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{card.emoji}</span>
                    <span style={{ fontSize: labelSize, fontWeight: 800, color: card.matched ? '#27ae60' : 'var(--primary)', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.2, width: '100%' }}>{card.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: isLandscapeMobile ? 4 : 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: isLandscapeMobile ? 11 : 13, color: '#aaa' }}>Moves: {moves}</span>
            <button onClick={resetGame}
              style={{ padding: isLandscapeMobile ? '4px 12px' : '6px 16px', borderRadius: 50, border: '1.5px solid #e0e0e0', background: 'white', fontSize: isLandscapeMobile ? 11 : 12, fontWeight: 700, color: '#888', cursor: 'pointer' }}>
              🔄 Reset
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function MemoryMatchTab({ child, quota, isActive, isMobile }) {
  const { track } = useTracker()
  const offline = useOffline()
  const matchStartRef = useRef(null)
  const matchElapsedRef = useRef(0)
  const activeThemeRef = useRef(null)

  useEffect(() => {
    if (isActive) {
      matchStartRef.current = Date.now()
      matchElapsedRef.current = 0
    } else if (matchStartRef.current !== null) {
      const seconds = Math.round((matchElapsedRef.current + Date.now() - matchStartRef.current) / 1000)
      if (seconds >= 5) track('memorymatch', 'session', { durationSeconds: seconds, metadata: activeThemeRef.current ? { theme: activeThemeRef.current } : undefined })
      matchStartRef.current = null
      matchElapsedRef.current = 0
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire session on page navigation (unmount while active)
  useEffect(() => {
    return () => {
      if (matchStartRef.current === null) return
      const seconds = Math.round((matchElapsedRef.current + Date.now() - matchStartRef.current) / 1000)
      if (seconds >= 5) track('memorymatch', 'session', { durationSeconds: seconds, metadata: activeThemeRef.current ? { theme: activeThemeRef.current } : undefined })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [theme, setTheme] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matches, setMatches] = useState([])
  const [matchesPage, setMatchesPage]           = useState(0)
  const [matchesTotalPages, setMatchesTotalPages] = useState(1)
  const [matchesLoading, setMatchesLoading]     = useState(false)
  const [activeMatch, setActiveMatch] = useState(null)
  const [activePairs, setActivePairs] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')

  useEffect(() => { fetchMatches(0, true) }, [child.id])

  async function fetchMatches(page, replace) {
    setMatchesLoading(true)
    try {
      const data = await memoryApi.getMatchesPaged(child.id, page)
      setMatches(prev => replace ? data.content : [...prev, ...data.content])
      setMatchesPage(data.number)
      setMatchesTotalPages(data.totalPages)
    } catch {} finally { setMatchesLoading(false) }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!theme.trim() || offline) return
    setLoading(true); setError('')
    try {
      const match = await memoryApi.generateMatch(child.id, theme)
      track('memorymatch', 'generate', { metadata: { theme } })
      setMatches(prev => [match, ...prev])
      startMatch(match)
      setTheme('')
      window.__glumbiRefreshQuota?.('memory-match')
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  function startMatch(match) {
    try {
      const pairs = typeof match.pairs === 'string' ? JSON.parse(match.pairs) : match.pairs
      setActiveMatch(match)
      setActivePairs(pairs)
      activeThemeRef.current = match.theme ?? null
    } catch {}
  }

  async function handleDelete(id) {
    await memoryApi.deleteMatch(id)
    setMatches(prev => prev.filter(m => m.id !== id))
    if (activeMatch?.id === id) { setActiveMatch(null); setActivePairs(null) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <form onSubmit={handleGenerate} className="card"
        style={{ background: 'var(--primary-lt)', border: '2px dashed var(--primary-lt)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🎴</span>
          <h3 style={{ fontSize: 16, color: 'var(--primary)', margin: 0 }}>Memory Match for {child.name}</h3>
        </div>
        <input placeholder="Enter a theme… e.g. Animals, Space, Food"
          value={theme} onChange={e => setTheme(e.target.value)} required />
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginBottom: 8 }}>QUICK THEMES:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MATCH_THEMES.map(t => (
              <button key={t} type="button" onClick={() => setTheme(t)}
                style={{ padding: '5px 14px', fontSize: 12, background: 'white', color: 'var(--primary)', border: '1.5px solid var(--primary-lt)', borderRadius: 50, fontWeight: 600, cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <ErrorBox msg={error} />
        <button type="submit" disabled={loading || !theme.trim() || offline || quota?.used >= quota?.limit}
          style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white', fontSize: 16, padding: '12px', borderRadius: 50, fontWeight: 700, border: 'none', cursor: (loading || offline) ? 'not-allowed' : 'pointer', opacity: (loading || offline) ? 0.6 : 1 }}>
          {loading ? <><span className="spinner" /> &nbsp;Generating…</> : offline ? '✈️ ✨ Generate Game' : '✨ Generate Game'}
        </button>
      </form>

      {loading && <ThemeLoader theme={child.theme} />}

      {activePairs && activeMatch && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
            🎴 {activeMatch.theme} — Find the Pairs! <span style={{ fontSize: 13, fontWeight: 600, color: '#999', marginLeft: 6 }}>{DIFFICULTIES.find(d => d.key === difficulty)?.label}</span>
          </div>
          {/* Difficulty — only relevant once a game is active */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>DIFFICULTY:</span>
            {DIFFICULTIES.map(d => (
              <button key={d.key} type="button" onClick={() => setDifficulty(d.key)}
                style={{ padding: '6px 14px', fontSize: 12, fontWeight: 700, borderRadius: 50, border: '2px solid', cursor: 'pointer',
                  borderColor: difficulty === d.key ? 'var(--primary)' : '#e0e0e0',
                  background: difficulty === d.key ? 'var(--primary)' : 'white',
                  color: difficulty === d.key ? 'white' : '#666' }}>
                {d.label}
              </button>
            ))}
          </div>
          <MatchGame key={activeMatch.id} pairs={activePairs} difficulty={difficulty} setDifficulty={setDifficulty} />
        </div>
      )}

      <HistoryDrawer icon="🎴" title="Past Games" count={matches.length}>
        {close => (<>
          {matches.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fafafa', borderRadius: 12, gap: 10, flexShrink: 0 }}>
              <button onClick={() => { startMatch(m); close() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--primary)', textAlign: 'left', flex: 1 }}>
                🔁 Replay: {m.theme}
              </button>
              <span style={{ fontSize: 11, color: '#bbb' }}>{fmtDate(m.createdAt)}</span>
              <button className="btn-danger" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', padding: 0, fontSize: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(m.id)}>✕</button>
            </div>
          ))}
          {matchesPage + 1 < matchesTotalPages && (
            <button onClick={() => fetchMatches(matchesPage + 1, false)} disabled={matchesLoading}
              style={{ margin: '12px auto 0', display: 'block', padding: '8px 24px', borderRadius: 20,
                border: 'none', background: '#6c63ff', color: '#fff', fontFamily: 'Nunito, sans-serif',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: matchesLoading ? 0.6 : 1 }}>
              {matchesLoading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>)}
      </HistoryDrawer>

      {matches.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎴</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800 }}>No games yet!</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Choose a theme and start matching!</div>
        </div>
      )}
    </div>
  )
}

const MODE_BUBBLES = [
  { key: 'flashcards', emoji: '📇', label: 'Flashcards',   desc: 'Flip & learn',    color: 'var(--primary,#ff6b6b)',                              delay: '0s',   dur: '3.2s' },
  { key: 'match',      emoji: '🎴', label: 'Memory Match', desc: 'Find the pairs',  color: 'linear-gradient(135deg,var(--primary),var(--accent))', delay: '0.4s', dur: '2.8s' },
  { key: 'wordofday',  emoji: '💬', label: 'Word of Day',  desc: 'Grow your words', color: 'linear-gradient(315deg,var(--primary),var(--accent))', delay: '0.8s', dur: '3.6s' },
]

// ── Main MemoryPlay page ────────────────────────────────────────────────────────

export default function MemoryPlay({ child, quota }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const VALID_TABS = ['flashcards', 'wordofday', 'match']
  const tab = VALID_TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : null

  // Lazy-mount MemoryMatchTab only after user first visits it (preserves mid-game state on subsequent tab switches)
  const [matchMounted, setMatchMounted] = useState(false)
  useEffect(() => { if (tab === 'match') setMatchMounted(true) }, [tab])

  const isMobile = window.innerWidth < 600

  function selectTab(key) {
    setSearchParams({ tab: key }, { replace: true })
  }

  function goBack() {
    setSearchParams({}, { replace: true })
  }

  const bannerFeature = tab ? `memory-${tab}` : 'memory'

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}>
      <style>{`
        @keyframes memBounceIn {
          0%   { opacity: 0; transform: scale(0.55) translateY(28px); }
          60%  { opacity: 1; transform: scale(1.08) translateY(-6px); }
          80%  { transform: scale(0.96) translateY(2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes memFloat {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%     { transform: translateY(-14px) rotate(1deg); }
        }
        .mem-bubble {
          animation: memBounceIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both, memFloat var(--float-dur) ease-in-out infinite;
          animation-delay: var(--bounce-delay), calc(var(--bounce-delay) + 0.6s);
        }
        .mem-bubble:hover { transform: scale(1.07) !important; }
        .mem-bubble:active { transform: scale(0.95) !important; }
      `}</style>

      <FeatureBanner feature={bannerFeature} child={child} isMobile={isMobile} />
      <QuotaBanner quota={quota} />

      {/* Back button — shown when a tab is active */}
      {tab && (
        <div>
          <button onClick={goBack} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary-lt,#ffe5e5)', border: 'none',
            borderRadius: 50, padding: '8px 16px 8px 12px', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: 'var(--primary,#ff6b6b)',
            transition: 'opacity 0.15s',
          }}>
            ← Back
          </button>
        </div>
      )}

      {/* Mode selector — shown when no tab is active */}
      {!tab && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: isMobile ? '24px 8px 40px' : '32px 16px 56px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: 'var(--primary,#ff6b6b)', fontFamily: 'Nunito, sans-serif' }}>
              What do you want to play? 🧠
            </div>
            <div style={{ fontSize: 14, color: '#aaa', fontFamily: 'Nunito, sans-serif', marginTop: 4 }}>Pick a mode to begin</div>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 28, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {MODE_BUBBLES.map(b => (
              <button
                key={b.key}
                className="mem-bubble"
                onClick={() => selectTab(b.key)}
                style={{
                  '--bounce-delay': b.delay,
                  '--float-dur': b.dur,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, cursor: 'pointer', border: 'none',
                  width: isMobile ? 220 : 160, height: isMobile ? 100 : 160,
                  borderRadius: isMobile ? 24 : '50%',
                  background: b.color,
                  boxShadow: '0 10px 36px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                  flexDirection: isMobile ? 'row' : 'column',
                  padding: isMobile ? '0 24px' : 0,
                }}>
                <span style={{ fontSize: isMobile ? 36 : 44, lineHeight: 1 }}>{b.emoji}</span>
                <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: isMobile ? 16 : 15, color: 'white', lineHeight: 1.2 }}>{b.label}</div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>{b.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab content */}
      {tab === 'flashcards' && <FlashcardsTab child={child} quota={quota} isMobile={isMobile} />}
      {tab === 'wordofday'  && <WordOfDayTab  child={child} quota={quota} />}

      {/* MemoryMatchTab lazy-mounted on first visit, then kept alive for mid-game state */}
      {matchMounted && (
        <div style={{ display: tab === 'match' ? 'block' : 'none' }}>
          <MemoryMatchTab child={child} quota={quota} isActive={tab === 'match'} isMobile={isMobile} />
        </div>
      )}
    </div>
  )
}
