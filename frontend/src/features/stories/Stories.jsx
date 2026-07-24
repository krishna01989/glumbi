import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { storyApi, voiceApi } from '../../api/client'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import AudioPlayer from '../../components/AudioPlayer'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorBox from '../../components/ErrorBox'
import QuotaBanner from '../../components/QuotaBanner'
import HistoryDrawer, { fmtDate } from '../../components/HistoryDrawer'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
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

const STORY_CATEGORIES = [
  { id: 'adventure',  emoji: '⚡', label: 'Adventure' },
  { id: 'bedtime',    emoji: '🌙', label: 'Bedtime' },
  { id: 'funny',      emoji: '😂', label: 'Funny' },
  { id: 'mystery',    emoji: '🔍', label: 'Mystery' },
  { id: 'friendship', emoji: '🤝', label: 'Friendship' },
  { id: 'nature',     emoji: '🌿', label: 'Nature' },
  { id: 'space',      emoji: '🚀', label: 'Space' },
]

function categoryEmoji(category) {
  return STORY_CATEGORIES.find(c => c.id === category)?.emoji || '📖'
}

function StoryIllustration({ story }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
      borderRadius: '14px 14px 0 0',
      height: 180,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: 72, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))', position: 'relative', zIndex: 1 }}>
        {categoryEmoji(story.category)}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
        {(story.keywords && story.keywords.toLowerCase() !== 'continue' ? story.keywords.split(',')[0].trim() : null) || 'A magical story'}
      </div>
    </div>
  )
}

const VOICE_MAP = {
  spanish:   { F: 'es-ES-Wavenet-C', M: 'es-ES-Wavenet-B' },
  french:    { F: 'fr-FR-Wavenet-E', M: 'fr-FR-Wavenet-B' },
  italian:   { F: 'it-IT-Wavenet-A', M: 'it-IT-Wavenet-C' },
  chinese:   { F: 'cmn-CN-Wavenet-A', M: 'cmn-CN-Wavenet-B' },
  japanese:  { F: 'ja-JP-Wavenet-A',  M: 'ja-JP-Wavenet-C' },
  korean:    { F: 'ko-KR-Wavenet-A',  M: 'ko-KR-Wavenet-C' },
  tamil:     { F: 'ta-IN-Wavenet-A',  M: 'ta-IN-Wavenet-B' },
  hindi:     { F: 'hi-IN-Wavenet-A',  M: 'hi-IN-Wavenet-B' },
  malayalam: { F: 'ml-IN-Wavenet-A',  M: 'ml-IN-Wavenet-B' },
  telugu:    { F: 'te-IN-Standard-A', M: 'te-IN-Standard-B' },
  kannada:   { F: 'kn-IN-Standard-A', M: 'kn-IN-Standard-B' },
}

const LANG_SCRIPT = {
  tamil: 'தமிழ்', hindi: 'हिंदी', malayalam: 'മലയാളം',
  telugu: 'తెలుగు', kannada: 'ಕನ್ನಡ',
  spanish: 'Español', french: 'Français', italian: 'Italiano',
  chinese: '普通话', japanese: '日本語', korean: '한국어',
}

function StoryListCard({ s, selected, onSelect, onToggleFav, chapterNum }) {
  const isSelected = selected?.id === s.id
  const chapterLabel = s.title.includes(' · ') ? s.title.substring(s.title.indexOf(' · ') + 3) : null
  const displayTitle = `${chapterNum ? `Ch.${chapterNum}: ` : ''}${chapterLabel || s.title}`
  const tag = s.keywords && !s.title.includes(' · ') ? s.keywords.split(',')[0] : null
  const lang = s.language && s.language !== 'english' ? s.language : null
  return (
    <div onClick={() => onSelect(s)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
        borderRadius: 12, cursor: 'pointer', flexShrink: 0,
        background: isSelected ? 'var(--primary-lt)' : 'white',
        border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid #f0f0f0',
        transition: 'background 0.15s, border-color 0.15s',
      }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{categoryEmoji(s.category)}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--primary)' : '#333',
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {displayTitle}
      </span>
      {(tag || lang) && (
        <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--primary-lt)', color: 'var(--primary)',
          padding: '2px 7px', borderRadius: 50, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {tag || lang}
        </span>
      )}
      <span onClick={e => { e.stopPropagation(); onToggleFav(s.id) }}
        style={{ fontSize: 14, cursor: 'pointer', color: s.favorite ? '#f59e0b' : '#ccc', flexShrink: 0 }}>
        {s.favorite ? '⭐' : '☆'}
      </span>
    </div>
  )
}

function StorySeriesGroup({ root, chapters, selected, onSelect, onToggleFav }) {
  const [open, setOpen] = useState(false)
  const rootTitle = root.title.includes(' · ') ? root.title.substring(0, root.title.indexOf(' · ')) : root.title
  return (
    <div style={{ flexShrink: 0 }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 4px', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#aaa' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          📖 {rootTitle}
        </span>
        <span style={{ fontSize: 10, color: '#bbb', fontWeight: 700 }}>{chapters.length + 1} chapters</span>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 12, borderLeft: '2px solid var(--primary-lt)' }}>
          <StoryListCard s={root} selected={selected} onSelect={onSelect} onToggleFav={onToggleFav} chapterNum={1} />
          {chapters.map((ch, i) => <StoryListCard key={ch.id} s={ch} selected={selected} onSelect={onSelect} onToggleFav={onToggleFav} chapterNum={i + 2} />)}
        </div>
      )}
    </div>
  )
}

export default function Stories({ child, quota }) {
  const { track } = useTracker()
  useFeatureDuration('stories', track)
  const navigate = useNavigate()
  const location = useLocation()
  const offline = useOffline()
  const [stories, setStories] = useState([])
  const [storiesPage, setStoriesPage]               = useState(0)
  const [historiesTotalPages, setHistoriesTotalPages] = useState(1)
  const [storiesTotalCount, setStoriesTotalCount]   = useState(0)
  const [storiesLoading, setStoriesLoading]         = useState(false)
  const [keywords, setKeywords]           = useState('')
  const [category, setCategory]           = useState('adventure')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [speaking, setSpeaking]         = useState(false)
  const [speakingLang, setSpeakingLang] = useState(null)
  const [speakingStoryId, setSpeakingStoryId] = useState(null)
  const [audioSrc, setAudioSrc]         = useState(null)
  const [translating, setTranslating]   = useState(null)
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [langPickerPos,  setLangPickerPos]  = useState({ top: 0, right: 0 })
  const [selectedAccent, setSelectedAccent] = useState(() => localStorage.getItem('glumbi_accent') || 'en-US')
  const [selectedGender, setSelectedGender] = useState(() => localStorage.getItem('glumbi_gender') || 'F')
  const [familyVoices,   setFamilyVoices]   = useState([])
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => {
    const saved = localStorage.getItem(`glumbi_voice_${child.id}`)
    return saved ? parseInt(saved, 10) : null  // null = default Google TTS
  })
  const [similarStories, setSimilarStories] = useState([])

  // Glumbi guide state
  const [glumbiPhase, setGlumbiPhase]           = useState('idle') // idle | intro | reading1 | mid | reading2 | post | epilogue
  const [glumbiMidPicked, setGlumbiMidPicked]   = useState(null)   // index of chosen prediction
  const [glumbiPrevPicked, setGlumbiPrevPicked] = useState(null)   // last pick before "try other ending"
  const [glumbiEpilogueOpen, setGlumbiEpilogueOpen] = useState(false)

  const loadGlumbiState = (story) => {
    setGlumbiPhase(story?.glumbiIntro ? 'intro' : 'idle')
    setGlumbiMidPicked(null)
    setGlumbiPrevPicked(null)
    setGlumbiEpilogueOpen(false)
  }
  const saveGlumbiState = () => {}
  const updateGlumbiPhase = (phase, midPicked2, epilogueOpen2) => {
    setGlumbiPhase(phase)
    if (midPicked2 !== undefined) setGlumbiMidPicked(midPicked2)
    if (epilogueOpen2 !== undefined) setGlumbiEpilogueOpen(epilogueOpen2)
  }

  const [error, setError]               = useState('')
  const [audioError, setAudioError]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // storyId to delete
  const [showList, setShowList]         = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [flipState, setFlipState]       = useState(null) // { dir: 'forward'|'back', to: story } | null
  const isMobile = useIsMobile()
  const langPickerRef      = useRef(null)
  const langBtnRef         = useRef(null)
  const fsRef              = useRef(null)
  const touchStartX        = useRef(null)
  const touchStartY        = useRef(null)
  const oldPageTurningRef  = useRef(null)
  const foldShadowRef      = useRef(null)
  const foldHighlightRef   = useRef(null)

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) fsRef.current?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  useEffect(() => {
    function handler(e) {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target)) setLangPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openLangPicker() {
    if (langBtnRef.current) {
      const rect = langBtnRef.current.getBoundingClientRect()
      const popupWidth = Math.min(280, window.innerWidth - 16)
      // align right edge to button right, but clamp so it doesn't go off left edge
      const rightEdge = window.innerWidth - rect.right
      const leftEdge  = rect.right - popupWidth
      const clampedRight = leftEdge < 8 ? window.innerWidth - popupWidth - 8 : rightEdge
      setLangPickerPos({ top: rect.bottom + 8, right: clampedRight })
    }
    setLangPickerOpen(o => !o)
  }

  useEffect(() => {
    fetchStories(0, true)
    voiceApi.list().then(setFamilyVoices).catch(() => {})
    const prefill = location.state?.glumbiPrefill
    if (prefill) setKeywords(prefill)
  }, [child.id])

  async function fetchStories(page, replace) {
    setStoriesLoading(true)
    try {
      const data = await storyApi.getByChildPaged(child.id, page)
      // Flatten { root, chapters } entries back into a single array (same shape as before)
      const flat = data.content.flatMap(({ root, chapters }) => [root, ...(chapters || [])])
      setStories(prev => replace ? flat : [...prev, ...flat])
      setStoriesPage(data.number)
      setHistoriesTotalPages(data.totalPages)
      setStoriesTotalCount(data.totalElements)
    } finally { setStoriesLoading(false) }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!keywords.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await storyApi.generate({ childId: child.id, keywords, category })
      track('stories', 'generate', { metadata: { category } })
      const story = res.story ?? res   // fallback if backend not yet updated
      const similar = res.similar ?? []
      setSelected(story)
      fetchStories(0, true)
      setGlumbiPhase(story.glumbiIntro ? 'intro' : 'idle')
      setGlumbiMidPicked(null)
      setGlumbiPrevPicked(null)
      setGlumbiEpilogueOpen(false)
if (similar.length > 0) track('stories', 'similar_viewed', { metadata: { trigger: 'generate' } })
      setSimilarStories(similar)
      setKeywords('')
      window.__glumbiRefreshQuota?.('story')

    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleContinue(story) {
    track('stories', 'continue', { metadata: { category: story.category } })
    setLoading(true)
    setError('')
    try {
      const res = await storyApi.continue(child.id, story.id)
      const continued = {
        ...(res.story ?? res),
        parentStoryId: (res.story ?? res).parentStoryId ?? story.id,
        seriesId: (res.story ?? res).seriesId ?? (story.seriesId || story.id),
      }
      const similar = res.similar ?? []
      setSelected(continued)
      fetchStories(0, true)
      if (similar.length > 0) track('stories', 'similar_viewed', { metadata: { trigger: 'continue' } })
      setSimilarStories(similar)
      window.__glumbiRefreshQuota?.('story')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleDelete(storyId) {
    setConfirmDelete(storyId)
  }

  async function confirmDeleteStory() {
    const result = await storyApi.delete(confirmDelete)
    const seriesDeleted = result?.seriesDeleted
    if (selected?.id === confirmDelete || (seriesDeleted && selected?.seriesId === confirmDelete)) setSelected(null)
    setConfirmDelete(null)
    fetchStories(0, true)
  }

  const deletingStory = stories.find(s => s.id === confirmDelete)
  const deletingHasSeries = deletingStory && stories.some(s => s.seriesId === deletingStory.id)

  // Series chapter navigation
  const seriesChapters = (() => {
    if (!selected) return []
    const rootId = selected.seriesId || selected.id
    const root = stories.find(s => s.id === rootId)
    if (!root) return []
    const chapters = stories
      .filter(s => s.seriesId === rootId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    return [root, ...chapters]
  })()
  const chapterIndex = seriesChapters.findIndex(s => s.id === selected?.id)
  const hasPrev = chapterIndex > 0
  const hasNext = chapterIndex < seriesChapters.length - 1

  function navigateChapter(dir) {
    const next = dir === 'right' ? seriesChapters[chapterIndex + 1] : seriesChapters[chapterIndex - 1]
    if (!next || flipState || (glumbiPhase !== 'idle' && glumbiPhase !== 'epilogue')) return
    setFlipState({ dir: dir === 'right' ? 'forward' : 'back', to: next })
  }

  function handleFlipEnd() {
    if (!flipState) return
    setSelected(flipState.to)
    loadGlumbiState(flipState.to)
    setSimilarStories([])
    storyApi.getSimilar(flipState.to.id).then(s => { setSimilarStories(s); if (s.length > 0) track('stories', 'similar_viewed', { metadata: { trigger: 'select' } }) }).catch(() => {})
    setFlipState(null)
  }

  // Start the canvas-free curved page-curl animation whenever a flip begins
  useEffect(() => {
    if (!flipState) return
    return runPageCurl(
      oldPageTurningRef, foldShadowRef, foldHighlightRef,
      flipState.dir,
      handleFlipEnd,
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipState?.dir, flipState?.to?.id])

  useEffect(() => {
    function onKey(e) {
      if (!selected || seriesChapters.length < 2) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' && hasNext && !flipState && (glumbiPhase === 'idle' || glumbiPhase === 'epilogue')) navigateChapter('right')
      if (e.key === 'ArrowLeft' && hasPrev && !flipState && (glumbiPhase === 'idle' || glumbiPhase === 'epilogue')) navigateChapter('left')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, hasPrev, hasNext])

  async function toggleFav(storyId) {
    const updated = await storyApi.toggleFavorite(storyId)
    setStories(prev => prev.map(s => s.id === storyId ? updated : s))
    if (selected?.id === storyId) setSelected(updated)
    track('stories', updated.favorite ? 'favorite' : 'unfavorite')
  }

  const audioRef = useRef(null)
  const playedRef = useRef(new Set()) // tracks "storyId:lang" combos played this session

  function stopSpeaking() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setSpeaking(false); setSpeakingLang(null); setSpeakingStoryId(null); setAudioSrc(null)
  }

  const ENGLISH_VOICES = {
    'en-US': { F: 'en-US-Wavenet-F', M: 'en-US-Wavenet-D' },
    'en-IN': { F: 'en-IN-Wavenet-A', M: 'en-IN-Wavenet-B' },
    'en-GB': { F: 'en-GB-Wavenet-A', M: 'en-GB-Wavenet-B' },
    'en-AU': { F: 'en-AU-Wavenet-A', M: 'en-AU-Wavenet-B' },
  }

  function handleGenderChange(g) {
    setSelectedGender(g)
    localStorage.setItem('glumbi_gender', g)
  }

  function handleVoiceSelect(id) {
    setSelectedVoiceId(id)
    if (id === null) localStorage.removeItem(`glumbi_voice_${child.id}`)
    else localStorage.setItem(`glumbi_voice_${child.id}`, String(id))
  }

  function storyHasCachedAudio(story, lang) {
    // Session-level: played at least once this session
    if (playedRef.current.has(story.id + ':' + lang.toLowerCase())) return true
    // DB-level: R2 URL persisted from a previous session
    if (!story.audioUrls) return false
    try {
      let parsed = story.audioUrls
      if (typeof parsed === 'string') parsed = JSON.parse(parsed)
      if (typeof parsed === 'string') parsed = JSON.parse(parsed)
      if (typeof parsed !== 'object' || parsed === null) return false
      const prefix = story.id + ':' + lang.toLowerCase()
      return Object.keys(parsed).some(k => k.startsWith(prefix))
    } catch { return false }
  }

  async function handleListen(story, lang, voice) {
    if (speaking && speakingStoryId === story.id && speakingLang === lang) { stopSpeaking(); return }
    track('stories', 'listen', { metadata: { language: lang } })
    // advance Glumbi from intro → reading1 when user taps Listen
    if (story.glumbiIntro && (glumbiPhase === 'intro' || glumbiPhase === 'idle')) {
      updateGlumbiPhase('reading1')
    }
    stopSpeaking()
    if (offline && !storyHasCachedAudio(story, lang)) {
      setAudioError('Audio not available in practice mode. Turn AI on to listen for the first time.')
      return
    }
    setAudioError('')
    setTranslating(lang)
    try {
      // If custom voice selected, skip Google voice resolution
      const resolvedVoice = selectedVoiceId ? null : (
        lang === 'english'
          ? (voice || ENGLISH_VOICES[selectedAccent]?.[selectedGender] || 'en-US-Wavenet-F')
          : (VOICE_MAP[lang]?.[selectedGender] || null)
      )
      const isPart1Phase = glumbiPhase === 'reading1' || glumbiPhase === 'mid'
      const isPart2Phase = glumbiPhase === 'reading2' || glumbiPhase === 'post' || glumbiPhase === 'epilogue'
      const glumbiPart = isPart1Phase ? 1 : isPart2Phase ? 2 : null
      const url = storyApi.listenUrl(story.id, lang, resolvedVoice, selectedVoiceId, glumbiPart, isPart2Phase ? glumbiMidPicked : null)
      const audio = new Audio(url)
      audioRef.current = audio
      // play() must be called here — in the click handler — to satisfy browser autoplay policy
      audio.onended = () => {
        setSpeaking(false); setSpeakingLang(null); setSpeakingStoryId(null); setAudioSrc(null)
        // advance Glumbi phase when full-story TTS finishes
        setGlumbiPhase(prev => {
          const next = prev === 'reading1' ? 'mid' : prev === 'reading2' ? 'post' : prev
          if (next !== prev) saveGlumbiState(story.id, next, glumbiMidPicked, glumbiEpilogueOpen)
          return next
        })
      }
      await audio.play()
      setSpeaking(true)
      setSpeakingLang(lang)
      setSpeakingStoryId(story.id)
      setAudioSrc(url)
      playedRef.current.add(story.id + ':' + lang.toLowerCase())
      // Mark this lang/voice combo as cached locally so offline check works without a re-fetch
      const resolvedKey = story.id + ':' + lang.toLowerCase() +
        (selectedVoiceId ? ':el:' + selectedVoiceId : (resolvedVoice ? ':' + resolvedVoice : ''))
      const updatedUrls = JSON.stringify({ ...(story.audioUrls ? JSON.parse(story.audioUrls) : {}), [resolvedKey]: url })
      const updatedStory = { ...story, audioUrls: updatedUrls }
      setStories(prev => prev.map(s => s.id === story.id ? updatedStory : s))
      if (selected?.id === story.id) setSelected(updatedStory)
    } catch (e) {
      setAudioError('Could not play audio. Please try again.')
      audioRef.current = null
    } finally {
      setTranslating(null)
    }
  }


  return (
    <>
    <ConfirmDialog
      open={!!confirmDelete}
      title={deletingHasSeries ? "Delete Whole Series?" : deletingStory?.parentStoryId ? "Delete Chapter?" : "Delete Story?"}
      message={deletingHasSeries
        ? "This is the first chapter of a series. Deleting it will permanently delete all chapters in the series."
        : deletingStory?.parentStoryId
          ? "This chapter will be permanently deleted."
          : "This story will be permanently deleted."}
      confirmLabel="Delete"
      onConfirm={confirmDeleteStory}
      onCancel={() => setConfirmDelete(null)}
    />
    <style>{`
      .chapter-nav-btn { transition: opacity 0.2s, background 0.2s; }
      .chapter-nav-btn:hover { opacity: 1 !important; }
    `}</style>
    <FeatureBanner feature="stories" child={child} isMobile={isMobile} />
    <div style={{
      display: isMobile ? 'flex' : 'grid',
      flexDirection: isMobile ? 'column' : undefined,
      marginTop: isMobile ? 6 : 16,
      gridTemplateColumns: isMobile ? undefined : '320px 1fr',
      gap: isMobile ? 16 : 24,
      height: isMobile ? 'auto' : '100%',
    }}>
      {/* Mobile back button */}
      {isMobile && selected && (
        <button onClick={() => { setSelected(null); setShowList(true) }}
          style={{ alignSelf: 'flex-start', background: 'var(--primary-lt)', color: 'var(--primary)', border: 'none', borderRadius: 50, padding: '8px 16px', fontWeight: 700, fontSize: 13, marginTop: 4, marginBottom: 6 }}>
          ← Back
        </button>
      )}

      {/* ── Sidebar ── */}
      <div style={{ display: isMobile && selected ? 'none' : 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', minHeight: 0, padding: '4px 6px 4px 2px', margin: '0 -6px 0 -2px' }}>

        {/* Generator card */}
        <QuotaBanner quota={quota} />
        <form className="card" onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--primary-lt)', border: '2px dashed var(--primary-lt)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🪄</span>
            <h3 style={{ fontSize: 18, color: 'var(--primary)' }}>Story Magic</h3>
          </div>
          {/* Category chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STORY_CATEGORIES.map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                style={{
                  padding: '5px 12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                  background: category === cat.id ? 'var(--primary)' : 'white',
                  color: category === cat.id ? 'white' : 'var(--primary)',
                  boxShadow: category === cat.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          <textarea
            placeholder={`What should ${child.name}'s story be about?\n\ne.g. dragon, brave girl, magic forest`}
            value={keywords} onChange={e => setKeywords(e.target.value)}
            rows={3} style={{ resize: 'none', background: 'white' }} />
          <button type="submit" className="btn-primary" disabled={loading || !keywords.trim() || quota?.used >= quota?.limit || offline}
            style={{ fontSize: 16 }}>
            {loading ? <><span className="spinner" /> &nbsp;Creating magic…</> : offline ? '✈️ ✨ Generate Story' : '✨ Generate Story'}
          </button>
          <ErrorBox msg={error} />
        </form>

        {loading && <ThemeLoader theme={child.theme} />}

      </div>

      {/* ── Story Reader ── */}
      {isMobile && loading && <ThemeLoader theme={child.theme} />}
      {selected ? (
        <div ref={fsRef} style={isFullscreen ? {
          height: '100dvh', width: '100dvw',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        } : {
          borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)',
          display: 'flex', flexDirection: 'column', height: '100%',
          position: 'relative',
        }}>

          {/* Chapter navigation arrows + dots */}
          {seriesChapters.length > 1 && (glumbiPhase === 'idle' || glumbiPhase === 'epilogue') && (
            <>
              <button className="chapter-nav-btn" onClick={() => navigateChapter('left')} disabled={!hasPrev || !!flipState}
                style={{
                  position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', zIndex:20,
                  width:38, height:38, borderRadius:'50%', border:'none', cursor: hasPrev ? 'pointer' : 'default',
                  background:'rgba(0,0,0,0.18)', backdropFilter:'blur(6px)',
                  color:'white', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center',
                  opacity: hasPrev ? 0.75 : 0.15, padding:0, boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
                }}>‹</button>
              <button className="chapter-nav-btn" onClick={() => navigateChapter('right')} disabled={!hasNext || !!flipState}
                style={{
                  position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', zIndex:20,
                  width:38, height:38, borderRadius:'50%', border:'none', cursor: hasNext ? 'pointer' : 'default',
                  background:'rgba(0,0,0,0.18)', backdropFilter:'blur(6px)',
                  color:'white', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center',
                  opacity: hasNext ? 0.75 : 0.15, padding:0, boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
                }}>›</button>
              <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6, zIndex:20 }}>
                {seriesChapters.map((_, i) => (
                  <div key={i} onClick={() => {
                    if (i === chapterIndex || flipState) return
                    navigateChapter(i > chapterIndex ? 'right' : 'left')
                  }} style={{
                    width: i === chapterIndex ? 20 : 6, height:6, borderRadius:3, cursor: i === chapterIndex ? 'default' : 'pointer',
                    background: i === chapterIndex ? 'var(--primary)' : 'rgba(0,0,0,0.18)',
                    transition:'all 0.3s',
                  }} />
                ))}
              </div>
            </>
          )}

          {/* Fullscreen header — themed banner with title + controls */}
          {isFullscreen ? (
            <div style={{
              flexShrink: 0, position: 'relative',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              padding: isMobile ? '12px 14px 10px' : '16px 20px',
              display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 0,
              borderBottom: '1px solid rgba(255,255,255,0.15)',
            }}>
              {/* Row 1: emoji + title + exit button */}
              <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 10 : 16, position:'relative', zIndex:1 }}>
                <div style={{ fontSize: isMobile ? 36 : 52, filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.3))', flexShrink:0 }}>
                  {categoryEmoji(selected.category)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h2 style={{ fontSize: isMobile ? 16 : 22, color:'white', margin:0, lineHeight:1.2,
                    textShadow:'0 2px 8px rgba(0,0,0,0.3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {selected.title}
                  </h2>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:3, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>
                    {selected.keywords || 'A magical story'} · {child.name}
                  </div>
                </div>
                {/* Exit button always top-right in row 1 */}
                <button onClick={toggleFullscreen} title="Exit fullscreen"
                  style={{ width:34, height:34, borderRadius:50, border:'none', flexShrink:0,
                    background:'rgba(255,255,255,0.2)', backdropFilter:'blur(6px)',
                    color:'white', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', padding:0,
                    boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/>
                  </svg>
                </button>
              </div>
              {/* Row 2 (mobile) or inline (desktop): action buttons */}
              <div style={{ display:'flex', gap:8, alignItems:'center', position:'relative', zIndex:1,
                flexWrap: isMobile ? undefined : 'wrap',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                marginTop: isMobile ? 0 : 10,
              }}>
                {(!speaking || speakingStoryId !== selected?.id) && (
                  <div style={{ position:'relative', display:'inline-flex' }} ref={langPickerRef}>
                    <button ref={langBtnRef} onClick={openLangPicker}
                      style={{ padding:'7px 14px', fontSize:13, borderRadius:50, border:'none',
                        background:'rgba(255,255,255,0.2)', backdropFilter:'blur(6px)',
                        color:'white', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6,
                        boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
                      {translating ? <><span className="spinner" /> Translating…</> : '🔊 Listen'}
                    </button>
                    {langPickerOpen && (
                      <div style={{
                        position: 'fixed', top: langPickerPos.top, right: langPickerPos.right, zIndex: 2000,
                        background: 'white', borderRadius: 16, padding: 16,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
                        width: Math.min(280, window.innerWidth - 16),
                        maxHeight: `calc(100vh - ${langPickerPos.top + 16}px)`,
                        overflowY: 'auto', border: '1px solid #f0f0f0',
                      }}>
                        {familyVoices.length > 0 && (<div style={{ marginBottom:12 }}>
                          <div style={{ fontSize:11, fontWeight:800, color:'#aaa', letterSpacing:0.5, textTransform:'uppercase', marginBottom:6 }}>🎙️ Voice</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                            <button onClick={e => { e.stopPropagation(); handleVoiceSelect(null) }}
                              style={{ padding:'5px 12px', borderRadius:50, fontSize:11, fontWeight:700, border:`1.5px solid ${selectedVoiceId===null?'var(--primary)':'#eee'}`, background:selectedVoiceId===null?'var(--primary-lt)':'#f5f5f5', color:selectedVoiceId===null?'var(--primary)':'#666', cursor:'pointer' }}>Default</button>
                            {familyVoices.map(v => (
                              <button key={v.id} onClick={e => { e.stopPropagation(); handleVoiceSelect(v.id) }}
                                style={{ padding:'5px 12px', borderRadius:50, fontSize:11, fontWeight:700, border:`1.5px solid ${selectedVoiceId===v.id?'var(--primary)':'#eee'}`, background:selectedVoiceId===v.id?'var(--primary-lt)':'#f5f5f5', color:selectedVoiceId===v.id?'var(--primary)':'#666', cursor:'pointer' }}>
                                {v.name}</button>
                            ))}
                          </div>
                        </div>)}
                        {!selectedVoiceId && (<>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                            <span style={{ fontSize:11, fontWeight:800, color:'#aaa', letterSpacing:0.5, textTransform:'uppercase', flex:1 }}>Voice</span>
                            {[{g:'F',label:'♀ Female'},{g:'M',label:'♂ Male'}].map(({g,label}) => (
                              <button key={g} onClick={e => { e.stopPropagation(); handleGenderChange(g) }}
                                style={{ padding:'4px 12px', borderRadius:50, fontSize:11, fontWeight:700, border:`1.5px solid ${selectedGender===g?'var(--primary)':'#eee'}`, background:selectedGender===g?'var(--primary-lt)':'#f5f5f5', color:selectedGender===g?'var(--primary)':'#666', cursor:'pointer' }}>{label}</button>
                            ))}
                          </div>
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:11, fontWeight:800, color:'#aaa', letterSpacing:0.5, textTransform:'uppercase', marginBottom:6 }}>🎙 English Accent</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                              {[{id:'en-US',label:'🇺🇸 US'},{id:'en-IN',label:'🇮🇳 India'},{id:'en-GB',label:'🇬🇧 British'},{id:'en-AU',label:'🇦🇺 Aussie'}].map(({id,label}) => (
                                <button key={id} onClick={e => { e.stopPropagation(); setSelectedAccent(id); localStorage.setItem('glumbi_accent', id) }}
                                  style={{ padding:'5px 10px', borderRadius:50, fontSize:11, fontWeight:700, border:`1.5px solid ${selectedAccent===id?'var(--primary)':'#eee'}`, background:selectedAccent===id?'var(--primary-lt)':'#f5f5f5', color:selectedAccent===id?'var(--primary)':'#666', cursor:'pointer' }}>{label}</button>
                              ))}
                            </div>
                          </div>
                        </>)}
                        <div style={{ height:1, background:'#f0f0f0', marginBottom:12 }} />
                        {[
                          {group:'🌍 International',langs:[{lang:'english',label:'English'},{lang:'spanish',label:'Español'},{lang:'french',label:'Français'},{lang:'italian',label:'Italiano'},{lang:'chinese',label:'普通话'},{lang:'japanese',label:'日本語'},{lang:'korean',label:'한국어'}]},
                          {group:'🇮🇳 Regional India',langs:[{lang:'tamil',label:'தமிழ்'},{lang:'hindi',label:'हिंदी'},{lang:'malayalam',label:'മലയാളം'},{lang:'telugu',label:'తెలుగు'},{lang:'kannada',label:'ಕನ್ನಡ'}]},
                        ].map(({group,langs}) => (
                          <div key={group} style={{ marginBottom:12 }}>
                            <div style={{ fontSize:11, fontWeight:800, color:'#aaa', letterSpacing:0.5, textTransform:'uppercase', marginBottom:8 }}>{group}</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                              {langs.map(({lang,label}) => (
                                <button key={lang} onClick={() => { setLangPickerOpen(false); handleListen(selected, lang) }}
                                  style={{ padding:'6px 12px', borderRadius:50, fontSize:12, fontWeight:700, border:'1.5px solid #eee', background:speakingLang===lang?'var(--primary)':'#f5f5f5', color:speakingLang===lang?'white':'#444', cursor:'pointer' }}>{label}</button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => toggleFav(selected.id)}
                  style={{ padding:'7px 12px', fontSize:18,
                    background: isFullscreen ? 'rgba(255,255,255,0.2)' : (selected.favorite ? '#fff3cd' : '#f5f5f5'),
                    borderRadius:50, border:'none', cursor:'pointer',
                    boxShadow: isFullscreen ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
                  {selected.favorite ? '⭐' : '☆'}
                </button>
                {chapterIndex === seriesChapters.length - 1 && (
                <button onClick={() => handleContinue(selected)} disabled={loading || offline || quota?.used >= quota?.limit}
                  title={offline ? 'AI is off — go online to continue stories' : 'Continue this story'}
                  style={{ padding:'7px 14px', fontSize:13, fontWeight:700, borderRadius:50, border:'none',
                    cursor: loading || offline || quota?.used >= quota?.limit ? 'not-allowed' : 'pointer',
                    background: isFullscreen ? 'rgba(255,255,255,0.2)' : 'var(--primary-lt)',
                    color: isFullscreen ? 'white' : 'var(--primary)',
                    opacity: loading || offline ? 0.5 : 1, whiteSpace:'nowrap',
                    boxShadow: isFullscreen ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    backdropFilter: isFullscreen ? 'blur(6px)' : 'none' }}>
                  {offline ? '✈️ ▶ Continue' : '▶ Continue'}
                </button>
                )}
                <button onClick={() => handleDelete(selected.id)}
                  style={{ padding:'7px 12px', fontSize:13, borderRadius:50, border:'none', cursor:'pointer',
                    background: isFullscreen ? 'rgba(255,0,0,0.3)' : '#fee', color: isFullscreen ? 'white' : '#e55' }}>
                  🗑
                </button>
              </div>
            </div>
          ) : (
            /* Normal mode header: illustration + title/buttons */
            <>
              <StoryIllustration story={selected} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, padding:'16px 28px 14px' }}>
                <h2 style={{ fontSize: isMobile ? 20 : 26, color:'var(--text)', lineHeight:1.2, margin:0 }}>{selected.title}</h2>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', position:'relative' }}>
                  {(!speaking || speakingStoryId !== selected?.id) && (
                    <div style={{ position:'relative', display:'inline-flex' }} ref={langPickerRef}>
                      <button ref={langBtnRef} onClick={openLangPicker}
                        style={{ padding:'8px 16px', fontSize:13, borderRadius:50, border:'none', background:'var(--primary)', color:'white', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                        {translating ? <><span className="spinner" /> Translating…</> : '🔊 Listen'}
                      </button>
                      {langPickerOpen && (
                        <div style={{
                          position:'fixed', top:langPickerPos.top, right:langPickerPos.right, zIndex:1000,
                          background:'white', borderRadius:16, padding:16,
                          boxShadow:'0 8px 40px rgba(0,0,0,0.16)',
                          width: Math.min(280, window.innerWidth - 16),
                          maxHeight:`calc(100vh - ${langPickerPos.top + 16}px)`,
                          overflowY:'auto', border:'1px solid #f0f0f0',
                        }}>
                          {/* same picker content rendered in normal mode */}
                          {/* (duplicate of FS picker above — needed for both modes) */}
                          <div style={{ fontSize:11, fontWeight:800, color:'#aaa', letterSpacing:0.5, textTransform:'uppercase', marginBottom:6 }}>🎙️ Voice</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                            <button onClick={e => { e.stopPropagation(); handleVoiceSelect(null) }}
                              style={{ padding:'5px 12px', borderRadius:50, fontSize:11, fontWeight:700, border:`1.5px solid ${selectedVoiceId===null?'var(--primary)':'#eee'}`, background:selectedVoiceId===null?'var(--primary-lt)':'#f5f5f5', color:selectedVoiceId===null?'var(--primary)':'#666', cursor:'pointer' }}>
                              Default
                            </button>
                            {familyVoices.map(v => (
                              <button key={v.id} onClick={e => { e.stopPropagation(); handleVoiceSelect(v.id) }}
                                style={{ padding:'5px 12px', borderRadius:50, fontSize:11, fontWeight:700, border:`1.5px solid ${selectedVoiceId===v.id?'var(--primary)':'#eee'}`, background:selectedVoiceId===v.id?'var(--primary-lt)':'#f5f5f5', color:selectedVoiceId===v.id?'var(--primary)':'#666', cursor:'pointer' }}>
                                {v.name}
                              </button>
                            ))}
                          </div>
                          {!selectedVoiceId && (<>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                              <span style={{ fontSize:11, fontWeight:800, color:'#aaa', letterSpacing:0.5, textTransform:'uppercase', flex:1 }}>Voice</span>
                              {[{g:'F',label:'♀ Female'},{g:'M',label:'♂ Male'}].map(({g,label}) => (
                                <button key={g} onClick={e => { e.stopPropagation(); handleGenderChange(g) }}
                                  style={{ padding:'4px 12px', borderRadius:50, fontSize:11, fontWeight:700, border:`1.5px solid ${selectedGender===g?'var(--primary)':'#eee'}`, background:selectedGender===g?'var(--primary-lt)':'#f5f5f5', color:selectedGender===g?'var(--primary)':'#666', cursor:'pointer' }}>
                                  {label}
                                </button>
                              ))}
                            </div>
                            <div style={{ marginBottom:10 }}>
                              <div style={{ fontSize:11, fontWeight:800, color:'#aaa', letterSpacing:0.5, textTransform:'uppercase', marginBottom:6 }}>🎙 English Accent</div>
                              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                                {[{id:'en-US',label:'🇺🇸 US'},{id:'en-IN',label:'🇮🇳 India'},{id:'en-GB',label:'🇬🇧 British'},{id:'en-AU',label:'🇦🇺 Aussie'}].map(({id,label}) => (
                                  <button key={id} onClick={e => { e.stopPropagation(); setSelectedAccent(id); localStorage.setItem('glumbi_accent', id) }}
                                    style={{ padding:'5px 10px', borderRadius:50, fontSize:11, fontWeight:700, border:`1.5px solid ${selectedAccent===id?'var(--primary)':'#eee'}`, background:selectedAccent===id?'var(--primary-lt)':'#f5f5f5', color:selectedAccent===id?'var(--primary)':'#666', cursor:'pointer' }}>
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>)}
                          <div style={{ height:1, background:'#f0f0f0', marginBottom:12 }} />
                          {[
                            {group:'🌍 International',langs:[{lang:'english',label:'English'},{lang:'spanish',label:'Español'},{lang:'french',label:'Français'},{lang:'italian',label:'Italiano'},{lang:'chinese',label:'普通话'},{lang:'japanese',label:'日本語'},{lang:'korean',label:'한국어'}]},
                            {group:'🇮🇳 Regional India',langs:[{lang:'tamil',label:'தமிழ்'},{lang:'hindi',label:'हिंदी'},{lang:'malayalam',label:'മലയാളം'},{lang:'telugu',label:'తెలుగు'},{lang:'kannada',label:'ಕನ್ನಡ'}]},
                          ].map(({group,langs}) => (
                            <div key={group} style={{ marginBottom:12 }}>
                              <div style={{ fontSize:11, fontWeight:800, color:'#aaa', letterSpacing:0.5, textTransform:'uppercase', marginBottom:8 }}>{group}</div>
                              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                                {langs.map(({lang,label}) => (
                                  <button key={lang} onClick={() => { setLangPickerOpen(false); handleListen(selected, lang) }}
                                    style={{ padding:'6px 12px', borderRadius:50, fontSize:12, fontWeight:700, border:'1.5px solid #eee', background:speakingLang===lang?'var(--primary)':'#f5f5f5', color:speakingLang===lang?'white':'#444', cursor:'pointer' }}>
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => toggleFav(selected.id)}
                    style={{ padding:'8px 14px', fontSize:18, background:selected.favorite?'#fff3cd':'#f5f5f5', borderRadius:50, border:'none', cursor:'pointer' }}>
                    {selected.favorite ? '⭐' : '☆'}
                  </button>
                  {chapterIndex === seriesChapters.length - 1 && (
                  <button onClick={() => handleContinue(selected)} disabled={loading || offline || quota?.used >= quota?.limit}
                    style={{ padding:'8px 14px', fontSize:13, fontWeight:700, borderRadius:50, border:'none', cursor:loading||offline||quota?.used>=quota?.limit?'not-allowed':'pointer', background:'var(--primary-lt)', color:'var(--primary)', opacity:loading||offline?0.5:1, whiteSpace:'nowrap' }}>
                    {offline ? '✈️ ▶ Continue' : '▶ Continue'}
                  </button>
                  )}
                  <button onClick={() => handleDelete(selected.id)} className="btn-danger" style={{ padding:'8px 14px', fontSize:13 }}>🗑</button>
                  {/* Fullscreen button in normal mode */}
                  <button onClick={toggleFullscreen} title="Fullscreen reading mode"
                    style={{ padding:'8px 10px', fontSize:13, borderRadius:50, border:'none', background:'#f5f5f5', color:'#888', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Story body (shared between FS and normal mode) ── */}
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
            }}
            style={{
              flex:1, overflowY:'auto', position:'relative',
              background: isFullscreen ? 'rgba(255,255,255,0.96)' : 'white',
              padding: isFullscreen ? '28px max(28px, calc(50% - 360px))' : '28px 28px 24px',
              display:'flex', flexDirection:'column', gap:16,
              borderRadius: isFullscreen ? '20px 20px 0 0' : 0,
            }}>

            {/* Audio player */}
            {speaking && audioRef.current && speakingStoryId === selected?.id && (
              <AudioPlayer audio={audioRef.current} lang={speakingLang} onStop={stopSpeaking} />
            )}
            <ErrorBox msg={audioError} icon="🔇" />

            <div style={{ height:2, background:'linear-gradient(to right,var(--primary),var(--accent),var(--green))', borderRadius:4 }} />

            {/* Category + keywords tags */}
            {(() => {
              const cat = selected.category ? STORY_CATEGORIES.find(c => c.id === selected.category) : null
              const kwTag = selected.keywords && selected.keywords.toLowerCase() !== 'continue'
                ? selected.keywords.split(',')[0].trim() : null
              if (!cat && !kwTag) return null
              return (
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:-4 }}>
                  {cat && (
                    <span style={{ fontSize:12, fontWeight:700, background:'var(--primary-lt)', color:'var(--primary)', padding:'3px 10px', borderRadius:50 }}>
                      {cat.emoji} {cat.label}
                    </span>
                  )}
                  {kwTag && (
                    <span style={{ fontSize:12, fontWeight:700, background:'#f0f0f0', color:'#666', padding:'3px 10px', borderRadius:50 }}>
                      {kwTag}
                    </span>
                  )}
                </div>
              )
            })()}

            {/* ── Glumbi guide ── */}
            {selected?.glumbiIntro && glumbiPhase !== 'idle' && (() => {
              const gbtn = (label, onClick, solid = true) => (
                <button onClick={onClick} style={{
                  padding: '10px 22px', borderRadius: 50, fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  border: solid ? 'none' : '2.5px solid var(--primary)',
                  background: solid ? 'var(--primary)' : 'transparent',
                  color: solid ? '#fff' : 'var(--primary)',
                  fontFamily: 'Nunito, sans-serif',
                }}>
                  {label}
                </button>
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
              // Sticky progress bar shown while reading part 1 or part 2
              const ReadingBar = ({ part, onDone }) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '10px 0', padding: '12px 16px', background: 'var(--primary-lt, #fff8f0)', border: '2px solid var(--primary)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>🌟</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Nunito, sans-serif' }}>
                      {part === 1 ? 'Read part 1 — what do you think happens next?' : 'Almost there — finish the story!'}
                    </span>
                  </div>
                  {gbtn(part === 1 ? "I'm ready! →" : 'Finished! →', onDone)}
                </div>
              )

              if (glumbiPhase === 'intro') return (
                <GlumbiBubble text={selected.glumbiIntro}>
                  {gbtn("Let's go! 🚀", () => updateGlumbiPhase('reading1'))}
                </GlumbiBubble>
              )

              if (glumbiPhase === 'reading1') return (
                <ReadingBar part={1} onDone={() => updateGlumbiPhase('mid')} />
              )

              if (glumbiPhase === 'mid' && selected.glumbiMidQuestion) {
                let choices = []
                try { choices = JSON.parse(selected.glumbiMidChoices || '[]') } catch {}
                return (
                  <GlumbiBubble text={glumbiPrevPicked !== null ? `You chose "${choices[glumbiPrevPicked]}" last time — Ooh, what if we chose differently? 🔀` : selected.glumbiMidQuestion}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {choices.map((c, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => {
                              if (glumbiMidPicked !== null) return
                              setGlumbiMidPicked(i)
                              setGlumbiPrevPicked(null)
                              saveGlumbiState(selected.id, 'mid', i, glumbiEpilogueOpen)
                              track('stories', 'glumbi_mid_choice', { metadata: { choice: i, choiceText: choices[i], storyTitle: selected?.title } })
                              setTimeout(() => updateGlumbiPhase('reading2', i), 1000)
                            }}
                            style={{ padding: '10px 22px', borderRadius: 50, border: '2.5px solid var(--primary)', fontSize: 15, fontWeight: 800, cursor: glumbiMidPicked !== null ? 'default' : 'pointer', transition: 'all 0.2s', fontFamily: 'Nunito, sans-serif',
                              background: glumbiMidPicked === i ? 'var(--primary)' : 'transparent',
                              color: glumbiMidPicked === i ? '#fff' : 'var(--primary)',
                              opacity: glumbiMidPicked !== null && glumbiMidPicked !== i ? 0.35 : 1 }}>
                            {c}
                          </button>
                          {glumbiPrevPicked === i && glumbiMidPicked === null && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', opacity: 0.7 }}>✨ you picked this last time</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {glumbiMidPicked !== null && <div style={{ marginTop: 10, fontSize: 14, color: 'var(--primary)', fontWeight: 700 }}>Great pick! Let's find out... ✨</div>}
                  </GlumbiBubble>
                )
              }

              if (glumbiPhase === 'reading2') return (
                <ReadingBar part={2} onDone={() => updateGlumbiPhase('post')} />
              )

              if (glumbiPhase === 'post' && selected.glumbiPostQuestion) return (
                <GlumbiBubble text={selected.glumbiPostQuestion}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {gbtn('Tell me more! 🔮', () => {
                      track('stories', 'glumbi_epilogue_requested')
                      setGlumbiEpilogueOpen(true)
                      updateGlumbiPhase('epilogue', glumbiMidPicked, true)
                    })}
                    {(selected.storyPart2A && selected.storyPart2B) && gbtn('Other ending ✨', () => {
                      const otherBranch = glumbiMidPicked === 1 ? 0 : 1
                      track('stories', 'glumbi_other_ending', { metadata: { branch: otherBranch === 1 ? 'b' : 'a' } })
                      setGlumbiPrevPicked(glumbiMidPicked)
                      updateGlumbiPhase('mid', null)
                      stopSpeaking()
                    }, false)}
                    {!offline && gbtn('Quiz time! 📚', () => {
                      track('stories', 'glumbi_cross_nav', { metadata: { from: 'stories', to: 'readquiz' } })
                      navigate(`/child/${child.id}/readquiz`, { state: { storyId: selected.id } })
                    }, false)}
                    {gbtn('Bye Glumbi! 🌙', () => { track('stories', 'glumbi_post_response'); updateGlumbiPhase('idle') }, false)}
                  </div>
                </GlumbiBubble>
              )

              if (glumbiPhase === 'epilogue' && selected.glumbiEpilogue) return (
                <GlumbiBubble text={`Here's what happened next... ${selected.glumbiEpilogue}`}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {!offline && gbtn('Quiz time! 📚', () => {
                      track('stories', 'glumbi_cross_nav', { metadata: { from: 'stories', to: 'readquiz' } })
                      navigate(`/child/${child.id}/readquiz`, { state: { storyId: selected.id } })
                    }, false)}
                    {gbtn('The end! 🌙', () => { track('stories', 'glumbi_post_response'); updateGlumbiPhase('idle') }, false)}
                  </div>
                </GlumbiBubble>
              )

              return null
            })()}

            {/* Story text — with page-turn when navigating chapters */}
            {(() => {
              const textStyle = {
                lineHeight:2, fontSize: isFullscreen ? 19 : 17, color:'#444',
                whiteSpace:'pre-wrap', fontFamily:'Nunito, sans-serif',
                background:'#fffdf9', borderRadius:14,
                padding:'20px 24px', border:'1.5px solid #f5ede4',
              }
              const getDisplayContent = (story) => {
                if (story.id === selected?.id) {
                  if ((glumbiPhase === 'reading1' || glumbiPhase === 'mid') && story.storyPart1) return story.storyPart1
                  if (glumbiPhase === 'reading2' || glumbiPhase === 'post' || glumbiPhase === 'epilogue') {
                    const branch = glumbiMidPicked === 1 ? story.storyPart2B : story.storyPart2A
                    return branch || story.storyPart2 || null // fallback for old stories
                  }
                }
                return story.content
              }
              const renderText = (story) => {
                const displayContent = getDisplayContent(story)
                return displayContent.slice(0,1) ? (
                  <div style={textStyle}>
                    <span style={{ float:'left', fontSize:64, lineHeight:0.8, marginRight:8, marginTop:8, color:'var(--primary)', fontFamily:'Nunito, sans-serif' }}>
                      {displayContent[0]}
                    </span>
                    {displayContent.slice(1)}
                  </div>
                ) : <div style={textStyle}>{displayContent}</div>
              }

              if (!flipState) return renderText(selected)

              const isFwd = flipState.dir === 'forward'
              // Initial clip-path for the turning half (right or left side of page)
              const initClip = isFwd
                ? 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
                : 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
              // Initial shadow position and highlight position
              const initShadowLeft = isFwd ? '45%' : '50%'
              const initHlLeft     = isFwd ? '50%' : '50%'

              return (
                <div style={{ position:'relative', borderRadius:14, overflow:'hidden' }}>
                  {/* Layer 1 — new chapter (underneath, full width) */}
                  {renderText(flipState.to)}

                  {/* Layer 2 — static remaining half of old page */}
                  <div style={{
                    position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none',
                    clipPath: isFwd ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
                  }}>
                    {renderText(selected)}
                  </div>

                  {/* Layer 3 — turning half with animated curved clip-path */}
                  <div ref={oldPageTurningRef} style={{
                    position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none',
                    clipPath: initClip,
                  }}>
                    {renderText(selected)}
                  </div>

                  {/* Layer 4a — fold shadow (gradient, follows the fold) */}
                  <div ref={foldShadowRef} style={{
                    position:'absolute', top:0, bottom:0, width:'6%',
                    left: initShadowLeft, pointerEvents:'none', zIndex:5,
                    background: isFwd
                      ? 'linear-gradient(to left, rgba(0,0,0,0.25), transparent)'
                      : 'linear-gradient(to right, rgba(0,0,0,0.25), transparent)',
                    opacity: 0.22,
                  }} />

                  {/* Layer 4b — fold highlight (thin bright line at the fold edge) */}
                  <div ref={foldHighlightRef} style={{
                    position:'absolute', top:0, bottom:0, width:2,
                    left: initHlLeft, pointerEvents:'none', zIndex:6,
                    background: 'rgba(255,255,255,0.65)',
                  }} />
                </div>
              )
            })()}

            {/* Similar stories — RAG recommendations */}
            {similarStories.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  ✨ You might also like
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {similarStories.map(s => (
                    <button key={s.id} onClick={() => {
                      const target = s.seriesId ? (stories.find(r => r.id === s.seriesId) ?? s) : s
                      setSelected(target); loadGlumbiState(target); setSimilarStories([]); track('stories', 'similar_clicked'); storyApi.getSimilar(target.id).then(s => { setSimilarStories(s); if (s.length > 0) track('stories', 'similar_viewed', { metadata: { trigger: 'similar_nav' } }) }).catch(() => {})
                    }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--primary-lt)', border: '1.5px solid var(--primary-lt)',
                        borderRadius: 50, padding: '7px 14px', cursor: 'pointer',
                        fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700,
                        color: 'var(--primary)', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-lt)'}
                    >
                      <span>{categoryEmoji(s.category)}</span>
                      <span style={{ maxWidth: 160, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {s.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize:12, color:'var(--muted)', marginTop:'auto', display:'flex', justifyContent:'space-between' }}>
              <span>✨ Created for {child.name}</span>
              <span>{new Date(selected.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#ccc' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Pick a story to read!</div>
          <div style={{ fontSize: 14 }}>or generate a brand new one ✨</div>
        </div>
      )}
    </div>

    {/* Stories history drawer */}
    {(() => {
      const roots = stories.filter(s => !s.seriesId)
      const chaptersBySeriesId = stories.reduce((acc, s) => {
        if (s.seriesId) (acc[s.seriesId] = acc[s.seriesId] || []).push(s)
        return acc
      }, {})
      function handleSelect(s) {
        if (selected?.id === s.id) return
        if (speaking) stopSpeaking()
        setLangPickerOpen(false); setAudioError(''); setSelected(s); setSimilarStories([]); loadGlumbiState(s)
        storyApi.getSimilar(s.id).then(r => { setSimilarStories(r); if (r.length > 0) track('stories', 'similar_viewed', { metadata: { trigger: 'select' } }) }).catch(() => {})
        if (isMobile) setShowList(false)
        track('stories', 'read', { metadata: { category: s.category } })
      }
      return (
        <HistoryDrawer icon="📖" title="My Adventures" count={storiesTotalCount}>
          {close => (<>
            {roots.map(root => {
              const chapters = (chaptersBySeriesId[root.id] || []).slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              const sel = s => { handleSelect(s); close() }
              return chapters.length > 0
                ? <StorySeriesGroup key={root.id} root={root} chapters={chapters} selected={selected} onSelect={sel} onToggleFav={toggleFav} />
                : <StoryListCard key={root.id} s={root} selected={selected} onSelect={sel} onToggleFav={toggleFav} />
            })}
            {storiesPage + 1 < historiesTotalPages && (
              <button onClick={() => fetchStories(storiesPage + 1, false)} disabled={storiesLoading}
                style={{ margin: '12px auto 0', display: 'block', padding: '8px 24px', borderRadius: 20,
                  border: 'none', background: '#6c63ff', color: '#fff', fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: storiesLoading ? 0.6 : 1 }}>
                {storiesLoading ? 'Loading…' : 'Load more'}
              </button>
            )}
          </>)}
        </HistoryDrawer>
      )
    })()}
    </>
  )
}
