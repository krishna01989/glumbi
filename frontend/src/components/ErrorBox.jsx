export default function ErrorBox({ msg, icon = '🚫' }) {
  if (!msg) return null
  return (
    <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
      {icon} {msg}
    </div>
  )
}
