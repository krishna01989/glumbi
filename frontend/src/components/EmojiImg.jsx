import { useState } from 'react'

export function emojiToUrl(emoji) {
  return `https://openmoji.org/data/color/svg/${
    [...emoji]
      .map(c => c.codePointAt(0))
      .filter(cp => cp !== 0xFE0F && cp !== 0xFE0E)
      .map(cp => cp.toString(16).toUpperCase())
      .join('-')
  }.svg`
}

export default function EmojiImg({ emoji, size, style }) {
  const [err, setErr] = useState(false)
  if (err) return <span style={{ fontSize: size, lineHeight: 1, ...style }}>{emoji}</span>
  return (
    <img
      src={emojiToUrl(emoji)}
      width={size}
      height={size}
      alt={emoji}
      onError={() => setErr(true)}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0, ...style }}
    />
  )
}
