// composables/useRateLimit.js
// Tracks a 429 from the validation API and counts down until requests can resume.
import { ref, computed, onUnmounted } from 'vue'
import { RateLimitError } from '@/services/api'

export function useRateLimit() {
  const resumeAt = ref(0)
  const now = ref(Date.now())
  let timer = null

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const secondsRemaining = computed(() =>
    Math.max(0, Math.ceil((resumeAt.value - now.value) / 1000))
  )
  const isRateLimited = computed(() => secondsRemaining.value > 0)

  const rateLimitMessage = computed(() =>
    `You've hit the validation rate limit (10/min without signing in, 60/min signed in or with an API key). ` +
    `Validation resumes in ${secondsRemaining.value}s.`
  )

  /**
   * Start the countdown if `error` is a rate-limit error.
   * Returns true when it was one, so callers can skip their normal error handling.
   */
  const handleRateLimit = (error) => {
    if (!(error instanceof RateLimitError)) return false

    resumeAt.value = Date.now() + error.retryAfter * 1000
    now.value = Date.now()
    stopTimer()
    timer = setInterval(() => {
      now.value = Date.now()
      if (now.value >= resumeAt.value) stopTimer()
    }, 1000)
    return true
  }

  onUnmounted(stopTimer)

  return { isRateLimited, secondsRemaining, rateLimitMessage, handleRateLimit }
}
