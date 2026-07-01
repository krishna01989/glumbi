import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { childApi } from '../api/client'
import { THEMES, THEME_GROUPS } from '../themes'

const AVATARS = ['🧒','👧','👦','🧒🏽','👧🏽','👦🏽','🧒🏿','👧🏿','👦🏿']
const EMPTY_FORM = { name: '', birthYear: '', avatarEmoji: '🧒', gender: '', theme: 'coral', enabledFeatures: null }

const CURRENT_YEAR = new Date().getFullYear()
// age 1 (youngest) to age 10 (oldest)
const BIRTH_YEARS  = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 1 - i)

const ALL_FEATURES = [
  { key: 'stories',    label: 'Stories',    emoji: '📖', minAge: 3 },
  { key: 'activities', label: 'Activities', emoji: '🎮', minAge: 3 },
  { key: 'curiosity',  label: 'Curiosity',  emoji: '🔍', minAge: 3 },
  { key: 'draw',       label: 'Draw',       emoji: '🎨', minAge: 3 },
  { key: 'journal',    label: 'Journal',    emoji: '📝', minAge: 3 },
  { key: 'timeline',   label: 'Timeline',   emoji: '🗓️', minAge: 3 },
  { key: 'readquiz',   label: 'Read & Quiz',emoji: '📚', minAge: 7 },
  { key: 'mywriting',  label: 'My Writing', emoji: '✍️', minAge: 7 },
]

function calcAge(birthYear) {
  if (!birthYear) return null
  return CURRENT_YEAR - parseInt(birthYear)
}

function defaultFeatureKeys(age) {
  return ALL_FEATURES.filter(f => age >= f.minAge).map(f => f.key)
}

export default function ChildForm({ onChildCreated, onChildUpdated }) {
  const { id } = useParams()
  const isEdit  = !!id
  const navigate = useNavigate()

  const [form, setForm]         = useState(EMPTY_FORM)
  const [features, setFeatures] = useState(null) // null = not yet set
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    childApi.getAll().then(children => {
      const child = children.find(c => String(c.id) === id)
      if (child) {
        setForm({ name: child.name, birthYear: child.birthYear, avatarEmoji: child.avatarEmoji, gender: child.gender || '', theme: child.theme || 'coral' })
        setFeatures(child.enabledFeatures ? JSON.parse(child.enabledFeatures) : defaultFeatureKeys(calcAge(child.birthYear) ?? 5))
      }
      setFetching(false)
    })
  }, [id])

  // When birthYear changes in create mode, set default features
  useEffect(() => {
    if (isEdit || !form.birthYear) return
    const age = calcAge(form.birthYear)
    if (age !== null && features === null) setFeatures(defaultFeatureKeys(age))
  }, [form.birthYear])

  const age = calcAge(form.birthYear)
  const ageTooOld   = age !== null && age > 13
  const ageTooYoung = age !== null && age < 2

  async function handleSubmit(e) {
    e.preventDefault()
    if (ageTooOld || ageTooYoung) return
    setLoading(true)
    try {
      const payload = { ...form, enabledFeatures: features ? JSON.stringify(features) : null }
      if (isEdit) {
        const updated = await childApi.update(id, payload)
        if (onChildUpdated) onChildUpdated(updated)
        else navigate('/child')
      } else {
        const child = await childApi.create(payload)
        onChildCreated(child)
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px', textAlign: 'center', color: '#aaa' }}>
      Loading…
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 22, color: '#f4845f', margin: '0 0 28px' }}>
        {isEdit ? '✏️ Edit Child' : '🌟 Add Your Child'}
      </h1>

      <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6, fontWeight: 700 }}>Name</label>
          <input placeholder="e.g. Emma, Liam, Sofia" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8, fontWeight: 700 }}>Gender</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ val: 'girl', label: '👧 Girl' }, { val: 'boy', label: '👦 Boy' }].map(g => (
              <button key={g.val} type="button"
                onClick={() => setForm(f => ({ ...f, gender: g.val }))}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  background: form.gender === g.val ? '#ffeee8' : '#f5f5f5',
                  border: form.gender === g.val ? '2px solid #f4845f' : '2px solid transparent',
                  cursor: 'pointer',
                }}>{g.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6, fontWeight: 700 }}>
            Birth Year
          </label>
          <select value={form.birthYear}
            onChange={e => setForm(f => ({ ...f, birthYear: e.target.value ? parseInt(e.target.value) : '' }))}
            required
            style={{ borderColor: (ageTooOld || ageTooYoung) ? '#e74c3c' : undefined }}>
            <option value="">Select year…</option>
            {BIRTH_YEARS.map(y => (
              <option key={y} value={y}>{y} (age {CURRENT_YEAR - y})</option>
            ))}
          </select>
          <div style={{ marginTop: 6, fontSize: 11, color: '#bbb' }}>
            Used only to personalise stories for your child's age. Never shared.
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 10, fontWeight: 700 }}>Avatar</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {AVATARS.map(a => (
              <button key={a} type="button"
                onClick={() => setForm(f => ({ ...f, avatarEmoji: a }))}
                style={{
                  fontSize: 28, padding: '8px 12px', borderRadius: 12,
                  background: form.avatarEmoji === a ? '#ffeee8' : '#f5f5f5',
                  border: form.avatarEmoji === a ? '2px solid #f4845f' : '2px solid transparent',
                  cursor: 'pointer',
                }}>{a}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 12, fontWeight: 700 }}>App Theme</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {THEME_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#bbb', marginBottom: 8, letterSpacing: 0.5 }}>
                  {group.label}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {group.keys.map(key => {
                    const t = THEMES[key]
                    const active = form.theme === key
                    return (
                      <button key={key} type="button"
                        onClick={() => setForm(f => ({ ...f, theme: key }))}
                        style={{
                          padding: '10px 6px', borderRadius: 14, fontSize: 11, fontWeight: 700,
                          background: active ? t.primaryLt : '#f5f5f5',
                          border: active ? `2px solid ${t.primary}` : '2px solid transparent',
                          color: active ? t.primary : '#888',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                        }}>
                        <div style={{ width: '100%', height: 16, borderRadius: 6, background: t.headerGrad }} />
                        <span style={{ fontSize: 18, marginTop: 2 }}>{t.emoji}</span>
                        <span>{t.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {features !== null && (
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 10, fontWeight: 700 }}>
              Features
              {form.birthYear && <span style={{ fontWeight: 400, color: '#bbb', marginLeft: 8 }}>
                (age {calcAge(form.birthYear)})
              </span>}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_FEATURES.map(f => {
                const age = calcAge(form.birthYear)
                const enabled = features.includes(f.key)
                const tooYoung = age !== null && age < f.minAge
                return (
                  <button key={f.key} type="button"
                    onClick={() => setFeatures(prev =>
                      prev.includes(f.key) ? prev.filter(k => k !== f.key) : [...prev, f.key]
                    )}
                    title={tooYoung ? `Recommended for ages ${f.minAge}+` : ''}
                    style={{
                      padding: '8px 14px', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      background: enabled ? '#ffeee8' : '#f5f5f5',
                      border: enabled ? '2px solid #f4845f' : '2px solid transparent',
                      color: enabled ? '#f4845f' : '#aaa',
                      opacity: tooYoung ? 0.5 : 1,
                    }}>
                    {f.emoji} {f.label}
                    {tooYoung && <span style={{ fontSize: 10, marginLeft: 4 }}>7+</span>}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>
              Toggle features on/off for this child.
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: 16 }} disabled={loading || ageTooOld || ageTooYoung}>
          {loading
            ? <><span className="spinner" />&nbsp;Saving…</>
            : isEdit ? '✅ Save Changes' : '✨ Get Started →'}
        </button>
      </form>
    </div>
  )
}
