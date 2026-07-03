import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi } from '../api/client'
import { THEMES } from '../themes'

function calcAge(birthYear) {
  return !birthYear ? null : new Date().getFullYear() - parseInt(birthYear)
}

export default function ChildList({ onChildSelected, onLogout, onChildSelectedLocked }) {
  const [children, setChildren] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    childApi.getAll().then(data => {
      setChildren(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px', textAlign: 'center', color: '#aaa' }}>
      Loading…
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 20px' }}>

      {children.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
          <h2 style={{ fontSize: 20, color: '#444', marginBottom: 8 }}>No children added yet</h2>
          <p style={{ color: '#aaa', fontSize: 14, marginBottom: 28 }}>Add your little one to get started with stories and adventures!</p>
          <button className="btn-primary" style={{ fontSize: 16, padding: '12px 32px' }} onClick={() => navigate('/child/new')}>
            + Add Your Child
          </button>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: 16, color: '#888', marginBottom: 12 }}>Choose a child</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {children.map(c => {
              const t = THEMES[c.theme] || THEMES.coral
              return (
              <div key={c.id} className="card" onClick={() => onChildSelected(c)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                  border: `2px solid transparent`, transition: 'all 0.15s', padding: 0, overflow: 'hidden' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.primary}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                {/* Themed left strip */}
                <div style={{ width: 6, alignSelf: 'stretch', background: t.headerGrad, flexShrink: 0 }} />
                <span style={{ fontSize: 36, padding: '14px 0 14px 8px' }}>{c.avatarEmoji}</span>
                <div style={{ flex: 1, padding: '14px 0' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: t.primary }}>{c.name}</div>
                  <div style={{ color: '#aaa', fontSize: 13 }}>
                    {c.gender === 'girl' ? '👧' : '👦'} · {calcAge(c.birthYear)} yrs old
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onChildSelectedLocked(c) }}
                  title="Hand to child (locked)"
                  style={{ background: t.primaryLt, color: t.primary, padding: '6px 12px', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
                  🔒
                </button>
                <button onClick={e => { e.stopPropagation(); navigate(`/child/${c.id}/edit`) }}
                  style={{ background: '#f0ebe6', color: '#888', padding: '6px 12px', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0, marginRight: 14 }}>
                  ✏️
                </button>
              </div>
            )})}

          </div>
          <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }}
            onClick={() => navigate('/child/new')}>
            + Add another child
          </button>
        </div>
      )}
    </div>
  )
}
