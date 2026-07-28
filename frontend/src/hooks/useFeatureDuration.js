import { useRef } from 'react'
import { useEffect } from 'react'

// Tracks net engagement time (wall-clock minus idle/locked periods).
// Fires a 'session' event with durationSeconds on component unmount,
// but ONLY if markActive() was called at least once during the mount.
//
// markActive() is idempotent — calling it multiple times never resets
// or restarts the session, it simply ensures one fires on unmount.
//
// Pauses automatically on:
//   - document.visibilitychange hidden (tab switch, device sleep, screen off)
//   - 'glumbi:activity-paused' event (lock modal / screen-time alert showing)
// Resumes on visible / 'glumbi:activity-resumed'.
export default function useFeatureDuration(feature, track, { minSeconds = 5 } = {}) {
  const startRef     = useRef(Date.now())
  const elapsedRef   = useRef(0)
  const pauseReasons = useRef(new Set())
  const hasEngaged   = useRef(false)

  // Returned to the feature — call once on any genuine interaction.
  // Safe to call multiple times; second+ calls are no-ops.
  function markActive() {
    hasEngaged.current = true
  }

  useEffect(() => {
    startRef.current = Date.now()
    elapsedRef.current = 0
    pauseReasons.current.clear()
    hasEngaged.current = false

    function pause(reason) {
      if (pauseReasons.current.has(reason)) return
      if (pauseReasons.current.size === 0) {
        elapsedRef.current += Date.now() - startRef.current
      }
      pauseReasons.current.add(reason)
    }
    function resume(reason) {
      pauseReasons.current.delete(reason)
      if (pauseReasons.current.size === 0) {
        startRef.current = Date.now()
      }
    }

    function onVisibility() {
      document.hidden ? pause('hidden') : resume('hidden')
    }
    function onPause()  { pause('overlay')  }
    function onResume() { resume('overlay') }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('glumbi:activity-paused',  onPause)
    window.addEventListener('glumbi:activity-resumed', onResume)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('glumbi:activity-paused',  onPause)
      window.removeEventListener('glumbi:activity-resumed', onResume)

      if (!hasEngaged.current) return

      const total = elapsedRef.current + (pauseReasons.current.size > 0 ? 0 : Date.now() - startRef.current)
      const seconds = Math.round(total / 1000)
      if (seconds >= minSeconds) track(feature, 'session', { durationSeconds: seconds })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { markActive }
}
