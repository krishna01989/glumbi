import { isCreditsBlocked } from '../utils/quota'

export default function QuotaBanner({ quota }) {
  if (!isCreditsBlocked(quota)) return null
  return (
    <div style={{
      background: 'linear-gradient(135deg,#fff0f0,#ffe4e4)',
      border: '1.5px solid #ffb3b3',
      borderRadius: 14,
      padding: '14px 18px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <span style={{ fontSize: 24, flexShrink: 0 }}>🚫</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#c0392b', marginBottom: 2 }}>
          Monthly AI credits used up ({quota.used}/{quota.limit} credits)
        </div>
        <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
          Your monthly AI credits are shared across Stories, Activities, Curiosity, Learn to Write, Draw, Read &amp; Quiz, and My Writing. Different features use different amounts. Resets automatically on the 1st of each month.
        </div>
      </div>
    </div>
  )
}
