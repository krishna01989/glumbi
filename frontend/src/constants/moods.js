export const MOODS = [
  { value: 'happy',     emoji: '😄', label: 'Happy',     color: '#f59e0b', bg: '#fffbeb' },
  { value: 'excited',   emoji: '🤩', label: 'Excited',   color: '#ec4899', bg: '#fdf2f8' },
  { value: 'proud',     emoji: '🥰', label: 'Proud',     color: '#10b981', bg: '#ecfdf5' },
  { value: 'grateful',  emoji: '🙏', label: 'Grateful',  color: '#f97316', bg: '#fff7ed' },
  { value: 'loved',     emoji: '🥹', label: 'Loved',     color: '#e11d48', bg: '#fff1f2' },
  { value: 'curious',   emoji: '🤔', label: 'Curious',   color: '#0ea5e9', bg: '#f0f9ff' },
  { value: 'calm',      emoji: '😌', label: 'Calm',      color: '#14b8a6', bg: '#f0fdfa' },
  { value: 'bored',     emoji: '😑', label: 'Bored',     color: '#a3a3a3', bg: '#fafafa' },
  { value: 'tired',     emoji: '😴', label: 'Tired',     color: '#6366f1', bg: '#eef2ff' },
  { value: 'nervous',   emoji: '😬', label: 'Nervous',   color: '#d97706', bg: '#fefce8' },
  { value: 'scared',    emoji: '😨', label: 'Scared',    color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'sad',       emoji: '😢', label: 'Sad',       color: '#64748b', bg: '#f8fafc' },
  { value: 'angry',     emoji: '😠', label: 'Angry',     color: '#dc2626', bg: '#fef2f2' },
  { value: 'grumpy',    emoji: '😤', label: 'Grumpy',    color: '#ef4444', bg: '#fef2f2' },
  { value: 'silly',     emoji: '🤪', label: 'Silly',     color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'surprised', emoji: '😲', label: 'Surprised', color: '#0891b2', bg: '#ecfeff' },
  { value: 'confused',  emoji: '😕', label: 'Confused',  color: '#92400e', bg: '#fef3c7' },
  { value: 'sick',      emoji: '🤒', label: 'Sick',      color: '#65a30d', bg: '#f7fee7' },
]

export function moodFor(value) {
  return MOODS.find(m => m.value === value) || null
}
