import { useEffect, useRef } from 'react'

// Tracks net engagement time (wall-clock minus idle/locked periods).
// Fires a 'session' event with durationSeconds on component unmount.
//
// condition (optional ref): if provided, only fires the event when condition.current === true.
//   Use case: Draw — only count time if the child actually stroked the canvas.
//
// Pauses automatically on:
//   - document.visibilitychange hidden (tab switch, device sleep, screen off)
//   - 'glumbi:activity-paused' event (lock modal / screen-time alert showing)
// Resumes on visible / 'glumbi:activity-resumed'.
export default function useFeatureDuration(feature, track, { minSeconds = 5, condition = null } = {}) {
  const startRef   = useRef(Date.now())  // when current active period began
  const elapsedRef = useRef(0)           // accumulated ms across all active periods
  const pausedRef  = useRef(false)       // currently paused?

  useEffect(() => {
    startRef.current = Date.now()
    elapsedRef.current = 0
    pausedRef.current = false

    function pause() {
      if (pausedRef.current) return
      elapsedRef.current += Date.now() - startRef.current
      pausedRef.current = true
    }
    function resume() {
      if (!pausedRef.current) return
      startRef.current = Date.now()
      pausedRef.current = false
    }

    function onVisibility() {
      document.hidden ? pause() : resume()
    }
    function onPause()  { pause()  }
    function onResume() { resume() }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('glumbi:activity-paused',  onPause)
    window.addEventListener('glumbi:activity-resumed', onResume)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('glumbi:activity-paused',  onPause)
      window.removeEventListener('glumbi:activity-resumed', onResume)

      if (condition && !condition.current) return

      const total = elapsedRef.current + (pausedRef.current ? 0 : Date.now() - startRef.current)
      const seconds = Math.round(total / 1000)
      if (seconds >= minSeconds) track(feature, 'session', { durationSeconds: seconds })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
