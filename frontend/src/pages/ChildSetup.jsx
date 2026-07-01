import { useState, useEffect } from 'react'
import { childApi } from '../api/client'

const AVATARS = ['🧒','👧','👦','🧒🏽','👧🏽','👦🏽','🧒🏿','👧🏿','👦🏿']
const EMPTY_FORM = { name: '', birthDate: '', avatarEmoji: '🧒', gender: '' }

export default function ChildSetup({ onChildSelected, onLogout }) {
  const [children, setChildren] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState(null)   // null = create mode, child = edit mode
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadChildren() }, [])

  async function loadChildren() {
    try {
      const data = await childApi.getAll()
      setChildren(data)
      if (data.length === 0) setShowForm(true)
    } catch { setShowForm(true) }
  }

  function openEditForm(e, child) {
    e.stopPropagation()   // don't trigger the "select child" click
    setEditingChild(child)
    setForm({ name: child.name, birthDate: child.birthDate, avatarEmoji: child.avatarEmoji, gender: child.gender || '' })
    setShowForm(true)
  }

  function openCreateForm() {
    setEditingChild(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingChild(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingChild) {
        const updated = await childApi.update(editingChild.id, form)
        setChildren(prev => prev.map(c => c.id === updated.id ? updated : c))
        cancelForm()
      } else {
        const child = await childApi.create(form)
        setChildren(prev => [...prev, child])
        cancelForm()
        onChildSelected(child)
      }
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
        <img src="/logo.svg" alt="Glumbi" style={{ width: 240, height: 'auto' }} />
        {onLogout && (
          <button onClick={onLogout}
            style={{ position: 'absolute', top: 0, right: 0, padding: '6px 14px', fontSize: 12, background: '#f0f0f0', color: '#888', borderRadius: 50, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Sign Out
          </button>
        )}
      </div>

      {children.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
          <h2 style={{ fontSize: 20, color: '#444', marginBottom: 8 }}>No children added yet</h2>
          <p style={{ color: '#aaa', fontSize: 14, marginBottom: 28 }}>Add your little one to get started with stories and adventures!</p>
          <button className="btn-primary" style={{ fontSize: 16, padding: '12px 32px' }} onClick={openCreateForm}>
            + Add Your Child
          </button>
        </div>
      )}

      {children.length > 0 && !showForm && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, color: '#888', marginBottom: 12 }}>Choose a child</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {children.map(c => (
              <div key={c.id} className="card" onClick={() => onChildSelected(c)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#f4845f'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                <span style={{ fontSize: 36 }}>{c.avatarEmoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{c.name}</div>
                  <div style={{ color: '#888', fontSize: 13 }}>Born {c.birthDate}</div>
                </div>
                <button
                  onClick={e => openEditForm(e, c)}
                  style={{ background: '#f0ebe6', color: '#888', padding: '6px 12px', fontSize: 13, borderRadius: 8 }}>
                  ✏️ Edit
                </button>
              </div>
            ))}
          </div>
          <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }}
            onClick={openCreateForm}>+ Add another child</button>
        </div>
      )}

      {showForm && (
        <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 18 }}>{editingChild ? `Edit ${editingChild.name}` : 'Add your child'}</h2>

          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Name</label>
            <input placeholder="e.g. Emma, Liam, Sofia" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Gender</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ val: 'girl', label: '👧 Girl' }, { val: 'boy', label: '👦 Boy' }].map(g => (
                <button key={g.val} type="button"
                  onClick={() => setForm(f => ({ ...f, gender: g.val }))}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    background: form.gender === g.val ? '#ffeee8' : '#f5f5f5',
                    border: form.gender === g.val ? '2px solid #f4845f' : '2px solid transparent',
                    cursor: 'pointer',
                  }}>{g.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Date of birth</label>
            <input type="date" value={form.birthDate}
              onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} required />
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Pick an avatar</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {AVATARS.map(a => (
                <button key={a} type="button"
                  onClick={() => setForm(f => ({ ...f, avatarEmoji: a }))}
                  style={{
                    fontSize: 28, padding: '6px 10px', borderRadius: 10,
                    background: form.avatarEmoji === a ? '#ffeee8' : '#f5f5f5',
                    border: form.avatarEmoji === a ? '2px solid #f4845f' : '2px solid transparent'
                  }}>{a}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={cancelForm}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? <span className="spinner" /> : editingChild ? 'Save Changes' : 'Get Started →'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
