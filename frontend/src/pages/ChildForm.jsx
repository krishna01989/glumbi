import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { childApi } from '../api/client'
import { THEMES, THEME_GROUPS, applyTheme } from '../themes'

const AVATARS = ['🧒','👧','👦','🧒🏽','👧🏽','👦🏽','🧒🏿','👧🏿','👦🏿']

const EMPTY_FORM = { name: '', birthYear: '', avatarEmoji: '🧒', gender: '', theme: 'coral', enabledFeatures: null }

const CURRENT_YEAR = new Date().getFullYear()
const BIRTH_YEARS  = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - i)

const ALL_FEATURES = [
  { key: 'stories',    label: 'Stories',        emoji: '📖', minAge: 2, featureName: 'story' },
  { key: 'activities', label: 'Activities',      emoji: '🎮', minAge: 2, featureName: 'activity' },
  { key: 'learn',      label: 'Learn to Write',  emoji: '✏️', minAge: 3, maxAge: 8, featureName: 'learn-validate' },
  { key: 'curiosity',  label: 'Curiosity',       emoji: '🔍', minAge: 3, featureName: 'curiosity' },
  { key: 'draw',       label: 'Draw',            emoji: '🎨', minAge: 1, featureName: 'draw' },
  { key: 'flipbook',   label: 'Flipbook Studio', emoji: '🖼️', minAge: 5, featureName: 'flipbook' },
  { key: 'journal',    label: 'Journal',         emoji: '📝', minAge: 2, featureName: null },
  { key: 'timeline',   label: 'Timeline',        emoji: '🗓️', minAge: 1, featureName: null },
  { key: 'readquiz',   label: 'Read & Quiz',     emoji: '📚', minAge: 6, featureName: 'read-quiz' },
  { key: 'mywriting',  label: 'My Writing',      emoji: '✍️', minAge: 7, featureName: 'writing-coach' },
  { key: 'memory',     label: 'Memory Play',     emoji: '🧠', minAge: 2, featureName: 'memory' },
  { key: 'maze',       label: 'Maze',            emoji: '🌀', minAge: 3, featureName: 'maze'   },
  { key: 'riddle',     label: 'Riddle',          emoji: '🧩', minAge: 5, featureName: 'riddle' },
]

function calcAge(birthYear) {
  if (!birthYear) return null
  return CURRENT_YEAR - parseInt(birthYear)
}

function defaultFeatureKeys(age) {
  return ALL_FEATURES.filter(f => age >= f.minAge && (!f.maxAge || age <= f.maxAge)).map(f => f.key)
}

const sectionCard = {
  background: 'white', borderRadius: 16, border: '1.5px solid #f0f0f0',
  padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16,
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
      {children}
    </div>
  )
}

export default function ChildForm({ onChildCreated, onChildUpdated, enabledFeatureConfig = [], inChildContext = false }) {
  const { id } = useParams()
  const isEdit  = !!id
  const navigate = useNavigate()

  const [form, setForm]             = useState(EMPTY_FORM)
  const [features, setFeatures]     = useState(null)
  const [loading, setLoading]       = useState(false)
  const [fetching, setFetching]     = useState(isEdit)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [hasPinSet, setHasPinSet]   = useState(false)
  const [pinVal, setPinVal]         = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError]     = useState('')

  useEffect(() => {
    if (!isEdit) { if (!inChildContext) applyTheme('coral'); return }
    childApi.get(id).then(child => {
      if (!inChildContext) applyTheme(child.theme || 'coral')
      setForm({ name: child.name, birthYear: child.birthYear, avatarEmoji: child.avatarEmoji, gender: child.gender || '', theme: child.theme || 'coral' })
      setFeatures(child.enabledFeatures ? JSON.parse(child.enabledFeatures) : defaultFeatureKeys(calcAge(child.birthYear) ?? 5))
      setHasPinSet(!!child.hasPinSet)
      setFetching(false)
    })
  }, [id])

  useEffect(() => {
    if (isEdit || !form.birthYear) return
    const age = calcAge(form.birthYear)
    if (age !== null && features === null) setFeatures(defaultFeatureKeys(age))
  }, [form.birthYear])

  const age       = calcAge(form.birthYear)
  const ageTooOld   = age !== null && age > 13
  const ageTooYoung = age !== null && age < 1

  const theme   = THEMES[form.theme] || THEMES.coral
  const primary = theme.primary
  const primaryLt = theme.primaryLt
  const headerGrad = theme.headerGrad

  async function handleDelete() {
    setDeleting(true)
    try {
      await childApi.delete(id)
      const prefixes = ['glm_offline_', 'glm_session_start_', 'glm_session_limit_',
        'glm_session_original_limit_', 'glm_session_max_snooze_', 'glm_snooze_count_', 'glumbi_voice_']
      prefixes.forEach(p => localStorage.removeItem(`${p}${id}`))
      navigate('/child')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (ageTooOld || ageTooYoung) return
    if (!isEdit && pinVal.length !== 4) { setPinError('PIN is required — enter 4 digits'); return }
    if (!isEdit && pinVal !== pinConfirm) { setPinError('PINs do not match'); return }
    if (isEdit && !hasPinSet && pinVal.length !== 4) { setPinError('PIN is required — enter 4 digits'); return }
    if (isEdit && pinVal && pinVal.length !== 4) { setPinError('Enter a 4-digit PIN'); return }
    if (isEdit && pinVal && pinVal !== pinConfirm) { setPinError('PINs do not match'); return }
    setLoading(true)
    try {
      const payload = { ...form, enabledFeatures: features ? JSON.stringify(features) : null, ...(pinVal ? { pin: pinVal } : {}) }
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
    <div style={{ maxWidth: 520, margin: '24px auto', padding: '0 16px', textAlign: 'center', color: '#aaa' }}>
      Loading…
    </div>
  )

  return (
    <div style={{ maxWidth: 520, margin: `${inChildContext ? '0' : '24px'} auto`, padding: '0 16px', fontFamily: 'Nunito, sans-serif' }}>
      {/* Hero banner */}
      <div style={{
        background: headerGrad, borderRadius: 20, padding: '28px 28px 24px',
        marginBottom: 20, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -10, fontSize: 100, opacity: 0.1, lineHeight: 1 }}>
          {form.avatarEmoji}
        </div>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{form.avatarEmoji}</div>
        <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 4 }}>
          {form.name || (isEdit ? 'Edit Child' : 'New Child')}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          {isEdit ? '✏️ Update profile' : '🌟 Set up your child\'s profile'}
          {age !== null && !ageTooOld && !ageTooYoung && (
            <span style={{ marginLeft: 10 }}>· Age {age}</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Identity */}
        <div style={sectionCard}>
          <SectionLabel>Identity</SectionLabel>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6, fontWeight: 700 }}>Name</label>
            <input placeholder="e.g. Emma, Liam, Sofia" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #eee', fontSize: 14, boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif' }} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8, fontWeight: 700 }}>Gender</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ val: 'girl', label: '👧 Girl' }, { val: 'boy', label: '👦 Boy' }].map(g => (
                <button key={g.val} type="button"
                  onClick={() => setForm(f => ({ ...f, gender: g.val }))}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
                    background: form.gender === g.val ? primaryLt : '#f5f5f5',
                    border: form.gender === g.val ? `2px solid ${primary}` : '2px solid transparent',
                    color: form.gender === g.val ? primary : '#888',
                    cursor: 'pointer',
                  }}>{g.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6, fontWeight: 700 }}>Birth Year</label>
            <select value={form.birthYear}
              onChange={e => setForm(f => ({ ...f, birthYear: e.target.value ? parseInt(e.target.value) : '' }))}
              required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: `1.5px solid ${(ageTooOld || ageTooYoung) ? '#e74c3c' : '#eee'}`, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Nunito, sans-serif', background: 'white', appearance: 'auto' }}>
              <option value="">Select year…</option>
              {BIRTH_YEARS.map(y => (
                <option key={y} value={y}>{y} (age {CURRENT_YEAR - y})</option>
              ))}
            </select>
            <div style={{ marginTop: 6, fontSize: 11, color: '#bbb' }}>
              Used only to personalise stories for your child's age. Never shared.
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div style={sectionCard}>
          <SectionLabel>Avatar</SectionLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {AVATARS.map(a => (
              <button key={a} type="button"
                onClick={() => setForm(f => ({ ...f, avatarEmoji: a }))}
                style={{
                  fontSize: 28, padding: '8px 12px', borderRadius: 12,
                  background: form.avatarEmoji === a ? primaryLt : '#f5f5f5',
                  border: form.avatarEmoji === a ? `2px solid ${primary}` : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.12s ease',
                }}>{a}</button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div style={sectionCard}>
          <SectionLabel>App Theme</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {THEME_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc', marginBottom: 8, letterSpacing: 0.5 }}>
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
                          transition: 'all 0.12s ease',
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

        {/* Features */}
        {features !== null && (
          <div style={sectionCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1 }}>Features</div>
              {age !== null && (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#bbb', background: '#f5f5f5', padding: '3px 10px', borderRadius: 50 }}>
                  Age {age}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_FEATURES.map(f => {
                const curAge = calcAge(form.birthYear)
                const enabled = features.includes(f.key)
                const tooYoung = curAge !== null && curAge < f.minAge
                const adminDisabled = f.featureName != null &&
                  enabledFeatureConfig.length > 0 &&
                  enabledFeatureConfig.some(fc => fc.featureName === f.featureName && fc.enabled === false)
                return (
                  <button key={f.key} type="button"
                    onClick={() => {
                      if (adminDisabled) return
                      setFeatures(prev =>
                        prev.includes(f.key) ? prev.filter(k => k !== f.key) : [...prev, f.key]
                      )
                    }}
                    title={adminDisabled ? 'This feature is currently unavailable' : tooYoung ? `Recommended for ages ${f.minAge}+` : ''}
                    style={{
                      padding: '8px 14px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                      cursor: adminDisabled ? 'not-allowed' : 'pointer',
                      background: adminDisabled ? '#f0f0f0' : enabled ? primaryLt : '#f5f5f5',
                      border: adminDisabled ? `2px solid #e0e0e0` : enabled ? `2px solid ${primary}` : '2px solid transparent',
                      color: adminDisabled ? '#ccc' : enabled ? primary : '#aaa',
                      opacity: tooYoung ? 0.5 : 1,
                      transition: 'all 0.12s ease',
                    }}>
                    {f.emoji} {f.label}
                    {tooYoung && <span style={{ fontSize: 10, marginLeft: 4 }}>{f.minAge}+</span>}
                    {adminDisabled && <span style={{ fontSize: 10, marginLeft: 4 }}>🚫</span>}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 10 }}>
              Toggle features on/off for this child. Features marked 🚫 are currently unavailable.
            </div>
          </div>
        )}

        <div style={sectionCard}>
          <SectionLabel>🔐 Lock PIN {isEdit && hasPinSet
            ? <span style={{ fontSize: 11, fontWeight: 800, color: '#27ae60', background: '#e8f8f0', border: '1.5px solid #6bcb77', borderRadius: 50, padding: '2px 10px', marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>Set — leave blank to keep</span>
            : <span style={{ fontSize: 11, fontWeight: 700, color: '#e55', marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>required</span>
          }</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
              placeholder="• • • •"
              value={pinVal}
              onChange={e => { setPinVal(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError('') }}
              style={{ padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${pinError ? '#e74c3c' : '#eee'}`, fontSize: 20, fontWeight: 900, letterSpacing: 12, textAlign: 'center', fontFamily: 'Nunito, sans-serif', WebkitTextSecurity: 'disc', outline: 'none' }} />
            {(!isEdit || pinVal) && (
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                placeholder="Confirm PIN"
                value={pinConfirm}
                onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError('') }}
                style={{ padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${pinError ? '#e74c3c' : '#eee'}`, fontSize: 20, fontWeight: 900, letterSpacing: 12, textAlign: 'center', fontFamily: 'Nunito, sans-serif', WebkitTextSecurity: 'disc', outline: 'none' }} />
            )}
            {pinError && <div style={{ fontSize: 12, color: '#e74c3c', fontWeight: 700, textAlign: 'center' }}>{pinError}</div>}
            <div style={{ fontSize: 12, color: '#aaa' }}>
              Locks the app when handing the device to {form.name || 'your child'}.
            </div>
          </div>
        </div>

        {isEdit && (
          <div style={{ marginBottom: 16 }}>
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)}
                style={{
                  width: '100%', padding: '13px', fontSize: 14, fontWeight: 700, borderRadius: 50,
                  background: 'transparent', border: '1.5px solid #ffb3b3', color: '#e55',
                  cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff0f0' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                🗑️ Delete {form.name || 'Child'}'s Profile
              </button>
            ) : (
              <div style={{ background: '#fff5f5', border: '1.5px solid #ffb3b3', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ fontWeight: 800, color: '#c0392b', fontSize: 14, marginBottom: 6 }}>
                  Delete {form.name || 'this child'}'s profile?
                </div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 1.5 }}>
                  This will permanently delete all stories, journals, activities, and every other piece of content for this profile. This cannot be undone.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setConfirmDelete(false)}
                    style={{
                      flex: 1, padding: '11px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                      background: '#f5f5f5', border: 'none', color: '#888', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                    }}>
                    Cancel
                  </button>
                  <button type="button" onClick={handleDelete} disabled={deleting}
                    style={{
                      flex: 1, padding: '11px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                      background: deleting ? '#ccc' : '#e55', border: 'none', color: 'white',
                      cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif',
                    }}>
                    {deleting ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button type="submit"
          disabled={loading || ageTooOld || ageTooYoung}
          style={{
            padding: '15px', fontSize: 16, fontWeight: 900, borderRadius: 50,
            background: (loading || ageTooOld || ageTooYoung) ? '#ccc' : headerGrad,
            color: 'white', border: 'none', cursor: (loading || ageTooOld || ageTooYoung) ? 'not-allowed' : 'pointer',
            boxShadow: (loading || ageTooOld || ageTooYoung) ? 'none' : `0 6px 20px ${primary}44`,
            marginBottom: 32, fontFamily: 'Nunito, sans-serif',
            transition: 'all 0.15s ease',
          }}>
          {loading
            ? <><span className="spinner" />&nbsp;Saving…</>
            : isEdit ? '✅ Save Changes' : '🌟 Get Started →'}
        </button>
      </form>
    </div>
  )
}
