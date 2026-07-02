import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi } from '../api/client'

function calcAge(birthYear) {
  return !birthYear ? null : new Date().getFullYear() - parseInt(birthYear)
}

export default function ChildList({ onChildSelected, onLogout }) {
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
            {children.map(c => (
              <div key={c.id} className="card" onClick={() => onChildSelected(c)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#f4845f'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                <span style={{ fontSize: 36 }}>{c.avatarEmoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{c.name}</div>
                  <div style={{ color: '#888', fontSize: 13 }}>
                    {c.gender === 'girl' ? '👧' : '👦'} · {calcAge(c.birthYear)} yrs old
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); navigate(`/child/${c.id}/edit`) }}
                  style={{ background: '#f0ebe6', color: '#888', padding: '6px 12px', fontSize: 13, borderRadius: 8 }}>
                  ✏️ Edit
                </button>
              </div>
            ))}
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
