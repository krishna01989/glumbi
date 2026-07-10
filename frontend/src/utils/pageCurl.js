/**
 * Animates a curved page-curl by updating clip-path directly on DOM refs (60fps RAF loop).
 * The fold line bows inward at mid-turn — maximal curve at 50% progress — giving the
 * organic Kindle-style flex instead of a rigid card flip.
 *
 * @param {React.RefObject} turningRef   - the div showing old content (animated clip-path)
 * @param {React.RefObject} shadowRef    - gradient div that follows the fold
 * @param {React.RefObject} highlightRef - thin bright line at the fold edge
 * @param {'forward'|'back'} direction
 * @param {() => void} onComplete        - called when animation ends
 * @returns {() => void}                 - cancel function (for useEffect cleanup)
 */
export function runPageCurl(turningRef, shadowRef, highlightRef, direction, onComplete) {
  const DURATION = 680
  const start = performance.now()
  let rafId

  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

  function frame(now) {
    const raw = Math.min((now - start) / DURATION, 1)
    const t   = ease(raw)
    // Bulge peaks at mid-animation (sin curve on raw, not eased) — natural paper flex
    const b = 7 * Math.sin(raw * Math.PI) // percentage units

    let clipPath, shadowLeft, shadowOpacity, hlLeft

    if (direction === 'forward') {
      const fx = 50 + t * 50
      clipPath = `polygon(${fx}% 0%, 100% 0%, 100% 100%, ${fx}% 100%, ${(fx - b).toFixed(2)}% 75%, ${(fx - b * 1.4).toFixed(2)}% 50%, ${(fx - b).toFixed(2)}% 25%)`
      shadowLeft    = `${(fx - 5).toFixed(1)}%`
      shadowOpacity = (0.22 * (1 - t * 0.6)).toFixed(3)
      hlLeft        = `${(fx - b * 0.55).toFixed(2)}%`
    } else {
      const fx = 50 - t * 50
      clipPath = `polygon(0% 0%, ${fx}% 0%, ${(fx + b).toFixed(2)}% 25%, ${(fx + b * 1.4).toFixed(2)}% 50%, ${(fx + b).toFixed(2)}% 75%, ${fx}% 100%, 0% 100%)`
      shadowLeft    = `${fx.toFixed(1)}%`
      shadowOpacity = (0.22 * (1 - t * 0.6)).toFixed(3)
      hlLeft        = `${(fx + b * 0.55).toFixed(2)}%`
    }

    if (turningRef.current)   turningRef.current.style.clipPath = clipPath
    if (shadowRef.current) {
      shadowRef.current.style.left    = shadowLeft
      shadowRef.current.style.opacity = shadowOpacity
    }
    if (highlightRef.current) highlightRef.current.style.left = hlLeft

    if (raw < 1) { rafId = requestAnimationFrame(frame) }
    else         { onComplete() }
  }

  rafId = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(rafId)
}
