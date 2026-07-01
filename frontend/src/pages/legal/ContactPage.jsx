import { useState } from 'react'
import LegalLayout from './LegalLayout'

export default function ContactPage() {
  const [sent, setSent]       = useState(false)
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Opens the user's mail client with pre-filled fields as a simple no-backend approach
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    const sub  = encodeURIComponent(subject || 'Glumbi enquiry')
    window.open(`mailto:hello@glumbi.com?subject=${sub}&body=${body}`)
    setSent(true)
  }

  return (
    <LegalLayout title="Contact Us" updated={null}>
      <p>We'd love to hear from you — whether it's a question, a bug report, a feature idea, or just to say hello. We typically reply within 1–2 business days.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, margin: '24px 0' }}>
        {[
          { emoji: '💬', label: 'General',  email: 'hello@glumbi.com' },
          { emoji: '🔒', label: 'Privacy',  email: 'privacy@glumbi.com' },
          { emoji: '🛠️', label: 'Support',  email: 'support@glumbi.com' },
          { emoji: '⚖️', label: 'Legal',    email: 'legal@glumbi.com' },
        ].map(c => (
          <a key={c.label} href={`mailto:${c.email}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 14,
              background: '#fff9f0', border: '1.5px solid #ffcdb8',
              textDecoration: 'none', color: '#333',
            }}>
            <span style={{ fontSize: 22 }}>{c.emoji}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: '#ff6b6b' }}>{c.email}</div>
            </div>
          </a>
        ))}
      </div>

      {sent ? (
        <div style={{ background: '#f0fff4', border: '2px solid #6bcb77', borderRadius: 16, padding: '24px', textAlign: 'center', margin: '24px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#1e6b3c', marginBottom: 6 }}>Your mail client opened!</div>
          <p style={{ color: '#555', fontSize: 14 }}>Send the pre-filled email and we'll get back to you within 1–2 business days.</p>
          <button onClick={() => setSent(false)}
            style={{ marginTop: 12, background: 'none', border: 'none', color: '#ff6b6b', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Send another message
          </button>
        </div>
      ) : (
        <>
          <h2>Send us a message</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Your name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Priya" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@example.com" required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Feature request, bug report…" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us what's on your mind…" required rows={5}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'Nunito, sans-serif' }} />
            </div>
            <button type="submit"
              style={{
                padding: '13px 32px', borderRadius: 50, fontSize: 15, fontWeight: 800,
                background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)', color: 'white',
                border: 'none', cursor: 'pointer', alignSelf: 'flex-start',
                boxShadow: '0 4px 16px rgba(255,107,107,0.3)',
              }}>
              ✉️ Open Mail & Send
            </button>
          </form>
        </>
      )}
    </LegalLayout>
  )
}

const labelStyle = { fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }
const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '2px solid #eee', fontSize: 14, boxSizing: 'border-box',
  fontFamily: 'Nunito, sans-serif',
}
