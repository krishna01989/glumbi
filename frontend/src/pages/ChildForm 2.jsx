import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { childApi } from '../api/client'
import { THEMES, THEME_GROUPS } from '../themes'

const AVATARS = ['🧒','👧','👦','🧒🏽','👧🏽','👦🏽','🧒🏿','👧🏿','👦🏿']
const EMPTY_FORM = { name: '', birthDate: '', avatarEmoji: '🧒', gender: '', theme: 'coral' }

export default function ChildForm({ onChildCreated }) {
  const { id } = useParams()
  const isEdit  = !!id
  const navigate = useNavigate()

  const [form, setForm]       = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    childApi.getAll().then(children => {
      const child = children.find(c => String(c.id) === id)
      if (child) setForm({ name: child.name, birthDate: child.birthDate, avatarEmoji: child.avatarEmoji, gender: child.gender || '', theme: child.theme || 'coral' })
      setFetching(false)
    })
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await childApi.update(id, form)
        navigate('/child')
      } else {
        const child = await childApi.create(form)
        onChildCreated(child)   // App picks it up → navigates to /stories
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/child')}
          style={{ background: '#f0f0f0', border: 'none', borderRadius: 50, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#666', cursor: 'pointer' }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 22, color: '#f4845f', margin: 0 }}>
          {isEdit ? '✏️ Edit Child' : '🌟 Add Your Child'}
        </h1>
      </div>

      <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6, fontWeight: 700 }}>Name</label>
          <input placeholder="e.g. Priya" value={form.name}
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
          <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6, fontWeight: 700 }}>Date of Birth</label>
          <input type="date" value={form.birthDate}
            onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} required />
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

        <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: 16 }} disabled={loading}>
          {loading
            ? <><span className="spinner" />&nbsp;Saving…</>
            : isEdit ? '✅ Save Changes' : '✨ Get Started →'}
        </button>
      </form>
    </div>
  )
}
