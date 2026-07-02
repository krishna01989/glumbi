import { useState, useRef, useEffect } from 'react'
import { learnApi } from '../api/client'
import QuotaBanner from '../components/QuotaBanner'
import ThemeLoader from '../components/ThemeLoader'
import { useOffline } from '../contexts/OfflineContext'

// ── Tamil data ─────────────────────────────────────────────────────────────────

const TAMIL_VOWELS = [
  { char: 'அ', roman: 'a'  }, { char: 'ஆ', roman: 'aa' }, { char: 'இ', roman: 'i'  },
  { char: 'ஈ', roman: 'ii' }, { char: 'உ', roman: 'u'  }, { char: 'ஊ', roman: 'uu' },
  { char: 'எ', roman: 'e'  }, { char: 'ஏ', roman: 'ee' }, { char: 'ஐ', roman: 'ai' },
  { char: 'ஒ', roman: 'o'  }, { char: 'ஓ', roman: 'oo' }, { char: 'ஔ', roman: 'au' },
]

const TAMIL_CONSONANTS = [
  { char: 'க', roman: 'ka'  }, { char: 'ங', roman: 'nga' }, { char: 'ச', roman: 'sa'  },
  { char: 'ஞ', roman: 'nya' }, { char: 'ட', roman: 'ta'  }, { char: 'ண', roman: 'ṇa' },
  { char: 'த', roman: 'tha' }, { char: 'ந', roman: 'na'  }, { char: 'ப', roman: 'pa'  },
  { char: 'ம', roman: 'ma'  }, { char: 'ய', roman: 'ya'  }, { char: 'ர', roman: 'ra'  },
  { char: 'ல', roman: 'la'  }, { char: 'வ', roman: 'va'  }, { char: 'ழ', roman: 'zha' },
  { char: 'ள', roman: 'ḷa' }, { char: 'ற', roman: 'ṟa' }, { char: 'ன', roman: 'na'  },
]

// Vowel signs that combine with consonants to form compound chars
const VOWEL_SIGNS = ['', 'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ']

// Build the 18×12 compound (உயிர்மெய்) table dynamically
const COMPOUND_TABLE = TAMIL_CONSONANTS.map(con => ({
  consonant: con,
  compounds: TAMIL_VOWELS.map((v, vi) => ({
    char:  con.char + VOWEL_SIGNS[vi],
    roman: con.roman.replace(/a$/, '') + v.roman,
  })),
}))

const AYTHAM = { char: 'ஃ', roman: 'aḵ' }

// ── English data ───────────────────────────────────────────────────────────────

const ENG_VOWELS     = 'AEIOU'.split('').map(c => ({ char: c }))
const ENG_CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'.split('').map(c => ({ char: c }))
const ENG_NUMBERS    = ['1','2','3','4','5','6','7','8','9','10'].map(c => ({ char: c }))

// ── Canvas component ───────────────────────────────────────────────────────────

function DrawCanvas({ onSubmit, loading, disabled = false, height = 260, fullWidth = false }) {
  const canvasRef = useRef(null)
  const drawing   = useRef(false)

  // Internal canvas resolution — large so AI gets a crisp image
  const canvasW = fullWidth ? 800 : 300
  const canvasH = fullWidth ? 600 : height

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const src = e.touches ? e.touches[0] : e
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY }
  }

  function start(e) {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e, canvasRef.current)
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
  }
  function move(e) {
    e.preventDefault()
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e, canvasRef.current)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = fullWidth ? 10 : 6   // thicker strokes on large canvas
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.stroke()
  }
  function stop() { drawing.current = false }

  function clear() {
    const c = canvasRef.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
  }

  function submit() {
    const c = canvasRef.current
    const ctx = c.getContext('2d')

    // Crop to bounding box of drawn content + padding, so AI sees a tight image
    const pixels = ctx.getImageData(0, 0, c.width, c.height).data
    let minX = c.width, minY = c.height, maxX = 0, maxY = 0
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const alpha = pixels[(y * c.width + x) * 4 + 3]
        if (alpha > 20) {
          if (x < minX) minX = x; if (x > maxX) maxX = x
          if (y < minY) minY = y; if (y > maxY) maxY = y
        }
      }
    }

    let imageData
    if (maxX > minX && maxY > minY) {
      const pad = 24
      const x = Math.max(0, minX - pad), y = Math.max(0, minY - pad)
      const w = Math.min(c.width, maxX + pad) - x
      const h = Math.min(c.height, maxY + pad) - y
      const crop = document.createElement('canvas')
      crop.width = w; crop.height = h
      const cCtx = crop.getContext('2d')
      cCtx.fillStyle = '#ffffff'
      cCtx.fillRect(0, 0, w, h)
      cCtx.drawImage(c, x, y, w, h, 0, 0, w, h)
      imageData = crop.toDataURL('image/png').split(',')[1]
    } else {
      imageData = c.toDataURL('image/png').split(',')[1]
    }

    onSubmit(imageData)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: fullWidth ? '100%' : 'auto' }}>
      <canvas ref={canvasRef} width={canvasW} height={canvasH}
        style={{ border: '2.5px solid var(--primary)', borderRadius: 16, background: '#ffffff', touchAction: 'none', cursor: 'crosshair', width: fullWidth ? '100%' : canvasW, height: fullWidth ? 'auto' : canvasH, display: 'block' }}
        onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={move} onTouchEnd={stop} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={clear} style={btn('#f5f5f5','#555')}>🗑️ Clear</button>
        <button onClick={submit} disabled={loading || disabled} style={btn('linear-gradient(135deg,var(--primary),var(--accent))','white')}>
          {loading ? <><span className="spinner" style={{ width:14,height:14,borderWidth:2 }}/>&nbsp;Checking…</> : '✨ Check!'}
        </button>
      </div>
    </div>
  )
}

function btn(bg, color) {
  return { padding:'9px 20px', borderRadius:50, border:'none', background:bg, color, fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif', display:'flex', alignItems:'center', gap:6 }
}

// ── Shared letter grid ─────────────────────────────────────────────────────────

function LetterGrid({ letters, selected, onSelect, isTamil }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {letters.map(item => (
        <button key={item.char} onClick={() => onSelect(item)}
          style={{
            width: isTamil ? 60 : 52, height: isTamil ? 60 : 52,
            borderRadius:12, border:'none', cursor:'pointer',
            fontFamily: isTamil ? '"Noto Sans Tamil",serif' : 'Fredoka One,cursive',
            fontSize: isTamil ? 22 : 22, fontWeight: isTamil ? 400 : 700,
            background: selected?.char === item.char ? 'var(--primary)' : 'var(--primary-lt)',
            color: selected?.char === item.char ? 'white' : 'var(--primary)',
            boxShadow: selected?.char === item.char ? '0 4px 14px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
            transition:'all 0.15s',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1,
          }}>
          <span>{item.char}</span>
          {item.roman && <span style={{ fontSize:8, fontFamily:'Nunito,sans-serif', fontWeight:700, opacity:0.75 }}>{item.roman}</span>}
        </button>
      ))}
    </div>
  )
}

// ── Compound table ─────────────────────────────────────────────────────────────

function CompoundTable({ selected, onSelect }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ borderCollapse:'collapse', fontFamily:'"Noto Sans Tamil",serif' }}>
        <thead>
          <tr>
            <th style={th()}></th>
            {TAMIL_VOWELS.map(v => (
              <th key={v.char} style={{ ...th(), color:'var(--primary)', fontSize:16 }}>{v.char}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPOUND_TABLE.map(row => (
            <tr key={row.consonant.char}>
              <td style={{ ...th(), color:'var(--primary)', fontSize:16 }}>{row.consonant.char}</td>
              {row.compounds.map(cell => (
                <td key={cell.char} style={{ padding:0 }}>
                  <button onClick={() => onSelect(cell)}
                    style={{
                      width:44, height:44, border:'none', borderRadius:8, cursor:'pointer',
                      fontFamily:'"Noto Sans Tamil",serif', fontSize:17,
                      background: selected?.char === cell.char ? 'var(--primary)' : 'transparent',
                      color: selected?.char === cell.char ? 'white' : '#444',
                      transition:'all 0.12s',
                    }}>
                    {cell.char}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function th() { return { padding:'4px 6px', textAlign:'center', fontSize:14, fontWeight:700, color:'#aaa' } }

// ── Letter practice panel ──────────────────────────────────────────────────────

function LetterPanel({ selected, script, child, onPlay, quota }) {
  const offline = useOffline()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => { setFeedback(null) }, [selected])

  async function handleSubmit(imageData) {
    setLoading(true); setFeedback(null)
    try {
      const age = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
      const result = await learnApi.validate(imageData, selected.char, script, child?.name || 'you', age, child?.id)
      setFeedback(result)
      window.__glumbiRefreshQuota?.()
    } catch { setFeedback({ correct:true, feedback:'Great effort! Keep practising! 🌟' }) }
    finally { setLoading(false) }
  }

  if (!selected) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', color:'#ccc', textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:10 }}>👆</div>
      <div style={{ fontSize:14, fontWeight:700 }}>Tap a letter to start!</div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
      {/* Big letter */}
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:80, fontFamily: script==='tamil' ? '"Noto Sans Tamil",serif' : 'Fredoka One,cursive', fontWeight: script==='tamil' ? 400 : 700, color:'var(--primary)', lineHeight:1, textShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
          {selected.char}
        </div>
        {selected.roman && <div style={{ fontSize:13, color:'#aaa', fontWeight:700, marginTop:4 }}>
          pronounced: <span style={{ color:'var(--primary)' }}>{selected.roman}</span>
        </div>}
        {selected.meaning && <div style={{ fontSize:11, color:'#bbb', marginTop:2 }}>{selected.meaning}</div>}
        <button onClick={onPlay} style={{ marginTop:8, background:'var(--primary-lt)', border:'none', borderRadius:50, padding:'6px 14px', fontSize:12, fontWeight:700, color:'var(--primary)', cursor:'pointer' }}>
          🔊 Hear it
        </button>
      </div>
      <DrawCanvas onSubmit={handleSubmit} loading={loading} disabled={quota?.used >= quota?.limit || offline} fullWidth />
      {offline && <div style={{ textAlign:'center', fontSize:13, fontWeight:700, color:'#aaa', marginTop:4 }}>✈️ Practice mode — AI check is off</div>}
      {loading && <ThemeLoader theme={child?.theme} />}
      {!loading && feedback && (
        <div style={{ maxWidth:300, padding:'12px 16px', borderRadius:14, textAlign:'center', background: feedback.correct ? '#f0fff4' : '#fff8f0', border:`1.5px solid ${feedback.correct ? '#6bcb77' : '#ffc0a0'}`, fontSize:14, lineHeight:1.6, fontWeight:600, color: feedback.correct ? '#1e6b3c' : '#c05a00' }}>
          <div style={{ fontSize:26, marginBottom:6 }}>{feedback.correct ? '🎉' : '💪'}</div>
          {feedback.feedback}
        </div>
      )}
    </div>
  )
}

// ── Word mode ──────────────────────────────────────────────────────────────────

const ALL_TRANS_LANGS = [
  { key:'english', label:'English', flag:'🇬🇧', tts:'english' },
  { key:'tamil',   label:'Tamil',   flag:'🌺',  tts:'tamil'   },
  { key:'hindi',   label:'हिंदी',  flag:'🇮🇳', tts:'hindi'   },
  { key:'french',  label:'French',  flag:'🇫🇷', tts:'english' },
]

const WORD_POOL = {
  tamil: [
    'வீடு','பூ','நாய்','மரம்','பால்','கண்','கை','அம்மா','அப்பா','பறவை',
    'மீன்','நிலா','நீர்','காடு','பழம்','பயிர்','கோழி','யானை','புலி','மான்',
    'வானம்','மேகம்','மழை','நதி','மலை','கல்','நெல்','வாழை','மாமரம்','ஆறு',
  ],
  english: [
    'cat','dog','home','tree','sun','book','fish','bird','moon','star',
    'rain','lake','frog','duck','rose','leaf','boat','kite','bell','gate',
    'lamp','sand','rock','wave','nest','seed','road','hand','foot','drum',
  ],
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
const BANK_SIZE = 10

function WordMode({ script, child, quota }) {
  const offline = useOffline()
  const [targetWord,    setTargetWord]    = useState('')
  const [customWord,    setCustomWord]    = useState('')
  const [step,          setStep]          = useState('pick')   // 'pick' | 'draw'
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState(null)
  const [extraLang,     setExtraLang]     = useState(null)
  const [visibleWords,  setVisibleWords]  = useState(() => shuffle(WORD_POOL[script]).slice(0, BANK_SIZE))
  const audioRef = useRef(null)

  // Reset when script changes
  useEffect(() => {
    setTargetWord(''); setCustomWord(''); setStep('pick'); setResult(null); setExtraLang(null)
    setVisibleWords(shuffle(WORD_POOL[script]).slice(0, BANK_SIZE))
  }, [script])

  function refreshWords() { setVisibleWords(shuffle(WORD_POOL[script]).slice(0, BANK_SIZE)) }

  const childAge  = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
  const childName = child?.name || 'you'

  // Cross-language: Tamil→English or English→Tamil
  const crossKey   = script === 'tamil' ? 'english' : 'tamil'
  const crossLabel = script === 'tamil' ? '🇬🇧 In English' : '🌺 In Tamil'
  const crossFont  = script === 'tamil' ? 'Nunito,sans-serif' : '"Noto Sans Tamil",serif'
  const crossTts   = script === 'tamil' ? 'english' : 'tamil'
  const srcTts     = script === 'tamil' ? 'tamil'   : 'english'

  function play(text, tts) {
    const url = learnApi.audioUrl(text, tts)
    if (audioRef.current) { audioRef.current.src = url; audioRef.current.play().catch(()=>{}) }
  }

  function pickWord(w) { setTargetWord(w); setCustomWord(''); setStep('draw'); setResult(null) }
  function useCustomWord() {
    const w = customWord.trim()
    if (!w) return
    setTargetWord(w); setStep('draw'); setResult(null)
  }

  async function handleSubmit(imageData) {
    setLoading(true); setResult(null); setExtraLang(null)
    try {
      const data = await learnApi.identifyWord(imageData, script, childName, childAge, child?.id, targetWord)
      setResult(data)
      window.__glumbiRefreshQuota?.()
      if (data.correct && data.translations?.[crossKey]) play(data.translations[crossKey], crossTts)
    } catch {
      setResult({ correct:false, couldRead:false, feedback:"Couldn't read that — try writing a bit bigger! 😊", emoji:'✍️' })
    } finally { setLoading(false) }
  }

  const wordFont = script === 'tamil' ? '"Noto Sans Tamil",serif' : 'Fredoka One,cursive'

  /* ── Step 1: Pick a word ─────────────────────────────────── */
  if (step === 'pick') return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <audio ref={audioRef} />
      <div style={{ background:'var(--primary-lt)', borderRadius:16, padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <p style={{ margin:0, fontSize:15, fontWeight:800, color:'var(--primary)' }}>
            {script === 'tamil' ? '🌺 Pick a Tamil word to write:' : '✏️ Pick an English word to write:'}
          </p>
          <button onClick={refreshWords} title="New words"
            style={{ background:'white', border:'none', borderRadius:50, padding:'6px 12px', fontSize:16, cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.08)', lineHeight:1 }}>
            🔀
          </button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
          {visibleWords.map(w => (
            <button key={w} onClick={() => pickWord(w)}
              style={{ padding:'8px 18px', borderRadius:50, border:'none', fontFamily: wordFont, fontSize: script==='tamil'?18:15, fontWeight:700, background:'white', color:'var(--primary)', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
              {w}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input value={customWord} onChange={e => setCustomWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && useCustomWord()}
            placeholder={script==='tamil' ? 'Or type your own Tamil word…' : 'Or type your own word…'}
            style={{ flex:1, padding:'10px 14px', borderRadius:50, border:'1.5px solid var(--primary-lt)', fontSize:14, fontFamily:'Nunito,sans-serif', outline:'none' }} />
          <button onClick={useCustomWord} disabled={!customWord.trim()}
            style={{ padding:'10px 20px', borderRadius:50, border:'none', background:'var(--primary)', color:'white', fontWeight:800, fontSize:14, cursor: customWord.trim()?'pointer':'not-allowed', opacity: customWord.trim()?1:0.5 }}>
            Go →
          </button>
        </div>
      </div>
    </div>
  )

  /* ── Step 2: Draw the word ──────────────────────────────── */
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <audio ref={audioRef} />

      {/* Target word display */}
      <div style={{ background:'var(--primary-lt)', borderRadius:16, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--primary)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Write this word:</div>
          <div style={{ fontFamily: wordFont, fontSize: script==='tamil'?40:34, fontWeight:700, color:'var(--primary)', lineHeight:1.2 }}>{targetWord}</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
          <button onClick={() => play(targetWord, srcTts)}
            style={{ background:'white', border:'none', borderRadius:50, padding:'7px 14px', fontSize:12, fontWeight:700, color:'var(--primary)', cursor:'pointer' }}>
            🔊 Hear it
          </button>
          <button onClick={() => { setStep('pick'); setResult(null) }}
            style={{ background:'none', border:'none', fontSize:12, fontWeight:700, color:'#aaa', cursor:'pointer' }}>
            ← Pick different word
          </button>
        </div>
      </div>

      {/* Canvas */}
      <DrawCanvas onSubmit={handleSubmit} loading={loading} disabled={quota?.used >= quota?.limit || offline} fullWidth />
      {offline && <div style={{ textAlign:'center', fontSize:13, fontWeight:700, color:'#aaa', marginTop:4 }}>✈️ Practice mode — AI check is off</div>}

      {/* Loading / Result side */}
      {loading ? (
        <div><ThemeLoader theme={child?.theme} /></div>
      ) : result ? (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Correct/incorrect feedback banner */}
          <div style={{ padding:'14px 18px', borderRadius:14, textAlign:'center', background: result.correct ? '#f0fff4' : '#fff8f0', border:`1.5px solid ${result.correct ? '#6bcb77' : '#ffc0a0'}` }}>
            <div style={{ fontSize:28, marginBottom:6 }}>{result.correct ? '🎉' : '💪'}</div>
            <div style={{ fontSize:14, fontWeight:700, color: result.correct ? '#1e6b3c' : '#c05a00', lineHeight:1.6 }}>{result.feedback}</div>
          </div>

          {result.correct ? <>

            {/* Source word + emoji */}
            <div style={{ display:'flex', alignItems:'center', gap:16, background:'var(--primary-lt)', borderRadius:16, padding:'14px 18px' }}>
              <span style={{ fontSize:52 }}>{result.emoji}</span>
              <div>
                <div style={{ fontFamily: script==='tamil' ? '"Noto Sans Tamil",serif' : 'Fredoka One,cursive', fontSize:30, color:'var(--primary)', lineHeight:1.2 }}>
                  {result.word}
                </div>
                <button onClick={() => play(result.word, srcTts)}
                  style={{ marginTop:6, background:'none', border:'none', fontSize:11, fontWeight:700, color:'#ccc', cursor:'pointer', padding:0 }}>
                  🔊 Hear in {script === 'tamil' ? 'Tamil' : 'English'}
                </button>
              </div>
            </div>

            {/* Meaning */}
            <div style={{ background:'#f0fff4', borderRadius:14, padding:'12px 16px', border:'1.5px solid #c3f0ca' }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#6bcb77', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>What it means</div>
              <div style={{ fontSize:14, color:'#2d2d2d', lineHeight:1.7 }}>{result.meaning}</div>
            </div>

            {/* PRIMARY: cross-language translation — always shown */}
            {result.translations?.[crossKey] && (
              <div style={{ background:'var(--primary-lt)', borderRadius:14, padding:'14px 18px', border:'1.5px solid var(--primary-lt)' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'var(--primary)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>{crossLabel}</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontFamily:crossFont, fontSize:26, color:'var(--primary)', fontWeight:700 }}>
                    {result.translations[crossKey]}
                  </span>
                  <button onClick={() => play(result.translations[crossKey], crossTts)}
                    style={{ background:'linear-gradient(135deg,var(--primary),var(--accent))', border:'none', borderRadius:50, padding:'8px 16px', fontSize:13, fontWeight:800, color:'white', cursor:'pointer' }}>
                    🔊 Hear it
                  </button>
                </div>
              </div>
            )}

            {/* Fun fact */}
            {result.funFact && (
              <div style={{ background:'#fffbf0', borderRadius:14, padding:'12px 16px', border:'1.5px solid #ffe9a0' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'#f0a000', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>✨ Fun fact</div>
                <div style={{ fontSize:14, color:'#2d2d2d', lineHeight:1.7 }}>{result.funFact}</div>
              </div>
            )}

            {/* Extra translations — all languages except source */}
            {(() => {
              const extraLangs = ALL_TRANS_LANGS.filter(l => l.key !== script)
              return (
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:'#bbb', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Also in</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                    {extraLangs.map(l => (
                      <button key={l.key} onClick={() => setExtraLang(extraLang === l.key ? null : l.key)}
                        style={{ padding:'6px 14px', borderRadius:50, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif', background: extraLang===l.key ? '#f0f0f0' : '#f8f8f8', color: extraLang===l.key ? '#333' : '#aaa', boxShadow: extraLang===l.key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                  {extraLang && result.translations?.[extraLang] && (() => {
                    const l = ALL_TRANS_LANGS.find(x => x.key === extraLang)
                    const isScriptLang = extraLang === 'tamil' || extraLang === 'hindi'
                    return (
                      <div style={{ display:'flex', alignItems:'center', gap:12, background:'#f5f5f5', borderRadius:12, padding:'12px 16px' }}>
                        <span style={{ fontFamily: isScriptLang ? '"Noto Sans Tamil","Noto Sans Devanagari",serif' : 'inherit', fontSize:22, color:'#555', fontWeight:700 }}>
                          {result.translations[extraLang]}
                        </span>
                        <button onClick={() => play(result.translations[extraLang], l.tts)}
                          style={{ background:'none', border:'none', fontSize:12, fontWeight:700, color:'#888', cursor:'pointer', padding:0 }}>
                          🔊
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            })()}

          </> : null}
          {/* Try again button */}
          <button onClick={() => setResult(null)}
            style={{ alignSelf:'center', padding:'10px 24px', borderRadius:50, border:'none', background:'var(--primary)', color:'white', fontWeight:800, fontSize:14, cursor:'pointer' }}>
            ✍️ Try again
          </button>
        </div>
      ) : null}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

const TAMIL_CATS = [
  { key:'vowels',     label:'உயிர் (12)',    letters: TAMIL_VOWELS },
  { key:'consonants', label:'மெய் (18)',     letters: TAMIL_CONSONANTS },
  { key:'compound',   label:'உயிர்மெய் (216)', letters: null },
  { key:'aytham',    label:'ஆய்தம்',        letters: [AYTHAM] },
]

const ENG_CATS = [
  { key:'vowels',     label:'Vowels',     letters: ENG_VOWELS },
  { key:'consonants', label:'Consonants', letters: ENG_CONSONANTS },
  { key:'numbers',    label:'Numbers',    letters: ENG_NUMBERS },
]

export default function LearnPage({ child, quota }) {
  const [script,   setScript]   = useState('tamil')
  const [mode,     setMode]     = useState('letters')   // 'letters' | 'words'
  const [catKey,   setCatKey]   = useState('vowels')
  const [selected, setSelected] = useState(null)
  const audioRef = useRef(null)

  const isTamil  = script === 'tamil'
  const cats     = isTamil ? TAMIL_CATS : ENG_CATS
  const cat      = cats.find(c => c.key === catKey) || cats[0]

  useEffect(() => {
    setSelected(null)
    setCatKey(cats[0].key)
  }, [script])

  useEffect(() => { setSelected(null) }, [catKey])

  function selectLetter(item) {
    setSelected(item)
    const url = learnApi.audioUrl(item.char, isTamil ? 'tamil' : 'english')
    if (audioRef.current) { audioRef.current.src = url; audioRef.current.load(); audioRef.current.play().catch(()=>{}) }
  }

  function replayAudio() {
    if (!selected) return
    const url = learnApi.audioUrl(selected.char, isTamil ? 'tamil' : 'english')
    if (audioRef.current) { audioRef.current.src = url; audioRef.current.load(); audioRef.current.play().catch(()=>{}) }
  }

  return (
    <div style={{ fontFamily:'Nunito,sans-serif', maxWidth:860, margin:'0 auto' }}>
      <audio ref={audioRef} />
      <QuotaBanner quota={quota} />

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:'Fredoka One,cursive', fontSize:26, color:'#2d2d2d', margin:'0 0 4px' }}>Learn to Write ✏️</h2>
        <p style={{ margin:0, fontSize:14, color:'#999' }}>Tap a letter to hear it, draw it, or write Tamil words!</p>
      </div>

      {/* Script + mode bar */}
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6 }}>
          {[{k:'tamil',label:'🌺 Tamil'},{k:'english',label:'🔤 English'}].map(s => (
            <button key={s.k} onClick={() => { setScript(s.k); setMode('letters') }}
              style={{ padding:'7px 16px', borderRadius:50, border:'none', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Nunito,sans-serif', background: script===s.k ? 'var(--primary)' : '#f5f5f5', color: script===s.k ? 'white' : '#777' }}>
              {s.label}
            </button>
          ))}
        </div>

        <button onClick={() => setMode(mode==='words' ? 'letters' : 'words')}
          style={{ padding:'7px 16px', borderRadius:50, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Nunito,sans-serif', border:`1.5px solid ${mode==='words' ? 'var(--primary)' : '#ddd'}`, background: mode==='words' ? 'var(--primary-lt)' : 'white', color: mode==='words' ? 'var(--primary)' : '#999' }}>
          ✍️ Write a word
        </button>
      </div>

      {mode === 'words' ? (
        <WordMode script={script} child={child} quota={quota} />
      ) : (
        <>
          {/* Category tabs */}
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
            {cats.map(c => (
              <button key={c.key} onClick={() => setCatKey(c.key)}
                style={{ padding:'7px 14px', borderRadius:50, fontSize:13, fontWeight:700, fontFamily:'"Noto Sans Tamil",Nunito,sans-serif', border: catKey===c.key ? 'none' : '1.5px solid #eee', background: catKey===c.key ? 'var(--primary-lt)' : 'white', color: catKey===c.key ? 'var(--primary)' : '#888', cursor:'pointer' }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-start' }}>
            {/* Letter grid / compound table */}
            <div style={{ flex:'1 1 300px' }}>
              {cat.key === 'compound' ? (
                <CompoundTable selected={selected} onSelect={selectLetter} />
              ) : (
                <LetterGrid letters={cat.letters} selected={selected} onSelect={selectLetter} isTamil={isTamil} />
              )}
            </div>

            {/* Practice panel */}
            <div style={{ flex:'0 0 auto', minWidth:300 }}>
              <LetterPanel selected={selected} script={script} child={child} onPlay={replayAudio} quota={quota} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
