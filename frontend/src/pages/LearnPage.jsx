import { useState, useRef, useEffect } from 'react'
import { learnApi } from '../api/client'
import QuotaBanner from '../components/QuotaBanner'

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

function DrawCanvas({ onSubmit, loading, disabled = false, height = 260 }) {
  const canvasRef = useRef(null)
  const drawing   = useRef(false)

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
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
    ctx.strokeStyle = '#2d2d2d'; ctx.lineWidth = 6
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.stroke()
  }
  function stop() { drawing.current = false }

  function clear() {
    const c = canvasRef.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
  }

  function submit() {
    const data = canvasRef.current.toDataURL('image/png').split(',')[1]
    onSubmit(data)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <canvas ref={canvasRef} width={300} height={height}
        style={{ border: '2.5px dashed #ffc0a0', borderRadius: 16, background: '#fffaf7', touchAction: 'none', cursor: 'crosshair' }}
        onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={move} onTouchEnd={stop} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={clear} style={btn('#f5f5f5','#555')}>🗑️ Clear</button>
        <button onClick={submit} disabled={loading || disabled} style={btn('linear-gradient(135deg,#ff6b6b,#ff8e53)','white')}>
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
            background: selected?.char === item.char ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : '#fff8f4',
            color: selected?.char === item.char ? 'white' : '#e05a2b',
            boxShadow: selected?.char === item.char ? '0 4px 14px rgba(255,107,107,0.35)' : '0 2px 6px rgba(0,0,0,0.06)',
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
              <th key={v.char} style={{ ...th(), color:'#ff6b6b', fontSize:16 }}>{v.char}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPOUND_TABLE.map(row => (
            <tr key={row.consonant.char}>
              <td style={{ ...th(), color:'#ff8e53', fontSize:16 }}>{row.consonant.char}</td>
              {row.compounds.map(cell => (
                <td key={cell.char} style={{ padding:0 }}>
                  <button onClick={() => onSelect(cell)}
                    style={{
                      width:44, height:44, border:'none', borderRadius:8, cursor:'pointer',
                      fontFamily:'"Noto Sans Tamil",serif', fontSize:17,
                      background: selected?.char === cell.char ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : 'transparent',
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
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => { setFeedback(null) }, [selected])

  async function handleSubmit(imageData) {
    setLoading(true); setFeedback(null)
    try {
      const age = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
      const result = await learnApi.validate(imageData, selected.char, script, child?.name || 'you', age, child?.id)
      setFeedback(result)
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
        <div style={{ fontSize:80, fontFamily: script==='tamil' ? '"Noto Sans Tamil",serif' : 'Fredoka One,cursive', fontWeight: script==='tamil' ? 400 : 700, color:'#ff6b6b', lineHeight:1, textShadow:'0 4px 16px rgba(255,107,107,0.2)' }}>
          {selected.char}
        </div>
        {selected.roman && <div style={{ fontSize:13, color:'#aaa', fontWeight:700, marginTop:4 }}>
          pronounced: <span style={{ color:'#ff8e53' }}>{selected.roman}</span>
        </div>}
        {selected.meaning && <div style={{ fontSize:11, color:'#bbb', marginTop:2 }}>{selected.meaning}</div>}
        <button onClick={onPlay} style={{ marginTop:8, background:'#fff0e8', border:'none', borderRadius:50, padding:'6px 14px', fontSize:12, fontWeight:700, color:'#ff6b6b', cursor:'pointer' }}>
          🔊 Hear it
        </button>
      </div>
      <DrawCanvas onSubmit={handleSubmit} loading={loading} disabled={quota?.used >= quota?.limit} />
      {feedback && (
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

const WORD_HINTS = {
  tamil:   { hint:'Try: வீடு · பூ · நாய் · மரம் · பால்', placeholder:'Write a Tamil word' },
  english: { hint:'Try: cat · home · tree · sun · book',  placeholder:'Write an English word' },
}

function WordMode({ script, child, quota }) {
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [extraLang, setExtraLang] = useState(null)
  const audioRef = useRef(null)

  // Reset when script changes
  useEffect(() => { setResult(null); setExtraLang(null) }, [script])

  const childAge  = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
  const childName = child?.name || 'you'

  // Cross-language: Tamil→English or English→Tamil
  const crossKey  = script === 'tamil' ? 'english' : 'tamil'
  const crossLabel = script === 'tamil' ? '🇬🇧 In English' : '🌺 In Tamil'
  const crossFont  = script === 'tamil' ? 'Nunito,sans-serif' : '"Noto Sans Tamil",serif'
  const crossTts   = script === 'tamil' ? 'english' : 'tamil'
  const srcTts     = script === 'tamil' ? 'tamil'   : 'english'

  function play(text, tts) {
    const url = learnApi.audioUrl(text, tts)
    if (audioRef.current) { audioRef.current.src = url; audioRef.current.play().catch(()=>{}) }
  }

  async function handleSubmit(imageData) {
    setLoading(true); setResult(null); setExtraLang(null)
    try {
      const data = await learnApi.identifyWord(imageData, script, childName, childAge, child?.id)
      setResult(data)
      // Auto-play the translation so the child hears the other language
      if (data.couldRead && data.translations?.[crossKey]) play(data.translations[crossKey], crossTts)
    } catch {
      setResult({ couldRead:false, meaning:"Couldn't read that — try writing a bit bigger! 😊", emoji:'✍️' })
    } finally { setLoading(false) }
  }

  const hints = WORD_HINTS[script]

  return (
    <div style={{ display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-start' }}>
      <audio ref={audioRef} />

      {/* Canvas side */}
      <div style={{ flex:'0 0 auto' }}>
        <p style={{ margin:'0 0 6px', fontSize:14, color:'#888', fontWeight:700 }}>{hints.placeholder}</p>
        <p style={{ margin:'0 0 12px', fontSize:12, color:'#bbb' }}>{hints.hint}</p>
        <DrawCanvas onSubmit={handleSubmit} loading={loading} disabled={quota?.used >= quota?.limit} height={180} />
      </div>

      {/* Result side */}
      {result ? (
        <div style={{ flex:'1 1 280px', display:'flex', flexDirection:'column', gap:14 }}>
          {result.couldRead ? <>

            {/* Source word + emoji */}
            <div style={{ display:'flex', alignItems:'center', gap:16, background:'#fff8f4', borderRadius:16, padding:'14px 18px' }}>
              <span style={{ fontSize:52 }}>{result.emoji}</span>
              <div>
                <div style={{ fontFamily: script==='tamil' ? '"Noto Sans Tamil",serif' : 'Fredoka One,cursive', fontSize:30, color:'#ff6b6b', lineHeight:1.2 }}>
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
              <div style={{ background:'linear-gradient(135deg,#667eea18,#764ba218)', borderRadius:14, padding:'14px 18px', border:'1.5px solid #c5b8f0' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'#764ba2', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>{crossLabel}</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontFamily:crossFont, fontSize:26, color:'#764ba2', fontWeight:700 }}>
                    {result.translations[crossKey]}
                  </span>
                  <button onClick={() => play(result.translations[crossKey], crossTts)}
                    style={{ background:'linear-gradient(135deg,#667eea,#764ba2)', border:'none', borderRadius:50, padding:'8px 16px', fontSize:13, fontWeight:800, color:'white', cursor:'pointer' }}>
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

          </> : (
            <div style={{ padding:'24px', background:'#fff8f4', borderRadius:16, textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:10 }}>💪</div>
              <div style={{ fontSize:14, color:'#888', lineHeight:1.7 }}>{result.meaning}</div>
            </div>
          )}
        </div>
      ) : !loading && (
        <div style={{ flex:'1 1 280px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px', color:'#ccc', textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>✍️</div>
          <div style={{ fontSize:14, fontWeight:700 }}>Write a word and tap Check!</div>
        </div>
      )}
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
              style={{ padding:'7px 16px', borderRadius:50, border:'none', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Nunito,sans-serif', background: script===s.k ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : '#f5f5f5', color: script===s.k ? 'white' : '#777' }}>
              {s.label}
            </button>
          ))}
        </div>

        <button onClick={() => setMode(mode==='words' ? 'letters' : 'words')}
          style={{ padding:'7px 16px', borderRadius:50, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Nunito,sans-serif', border:`1.5px solid ${mode==='words' ? '#764ba2' : '#ddd'}`, background: mode==='words' ? '#f5f0ff' : 'white', color: mode==='words' ? '#764ba2' : '#999' }}>
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
                style={{ padding:'7px 14px', borderRadius:50, fontSize:13, fontWeight:700, fontFamily:'"Noto Sans Tamil",Nunito,sans-serif', border: catKey===c.key ? 'none' : '1.5px solid #eee', background: catKey===c.key ? '#fff0e8' : 'white', color: catKey===c.key ? '#ff6b6b' : '#888', cursor:'pointer' }}>
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
