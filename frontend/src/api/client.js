import axios from 'axios'

// In-memory audio token cache keyed by resource (e.g. "learn", "story:41").
// Tokens are valid for 60s; we refresh 5s early to avoid races on slow networks.
const _audioTokenCache = {}
async function getAudioToken(resource) {
  const cached = _audioTokenCache[resource]
  if (cached && cached.expiresAt > Date.now()) return cached.token
  const { data } = await api.post('/audio-token', { resource })
  _audioTokenCache[resource] = {
    token:     data.stoken,
    expiresAt: Date.now() + (data.expiresIn - 5) * 1000,
  }
  return data.stoken
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('glm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap error messages; redirect to error pages for certain HTTP statuses
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const url    = err.config?.url || ''
    const isAuthEndpoint  = url.startsWith('/auth/')
    const isDemoEndpoint  = url.startsWith('/demo/')
    const isAudioToken    = url.startsWith('/audio-token')

    const alreadyOnErrorPage = window.location.pathname.startsWith('/error/')

    if (status === 401 && !isAuthEndpoint && !isDemoEndpoint && !isAudioToken) {
      ;['glm_token','glm_role','glm_child_locked','glm_locked_child_id']
        .forEach(k => localStorage.removeItem(k))
      Object.keys(localStorage)
        .filter(k =>
          k.startsWith('glm_session_start_') ||
          k.startsWith('glm_snooze_count_') ||
          k.startsWith('glm_session_limit_') ||
          k.startsWith('glm_session_max_snooze_') ||
          k.startsWith('glm_offline_')
        )
        .forEach(k => localStorage.removeItem(k))
      if (!alreadyOnErrorPage) window.location.href = '/error/401'
      return new Promise(() => {})
    }
    if (status === 403) {
      // Feature-disabled responses carry an "error" body — surface them as normal errors
      // rather than redirecting to the error page
      const data = err.response?.data
      if (data?.error) return Promise.reject(new Error(data.error))
      if (!alreadyOnErrorPage) window.location.href = '/error/403'
      return new Promise(() => {})
    }
    if (status === 429) {
      // Refresh quota display and surface a consistent error
      if (window.__glumbiRefreshQuota) window.__glumbiRefreshQuota()
      const data = err.response?.data
      return Promise.reject(new Error(data?.error || 'Monthly limit reached. Resets on the 1st!'))
    }
    if (status === 503) {
      const data = err.response?.data
      if (data?.code === 'SIGNUP_PAUSED') return Promise.reject(new Error(data.error))
      if (!alreadyOnErrorPage) window.location.href = '/error/503'
      return new Promise(() => {})
    }
    if (status === 502) {
      if (!alreadyOnErrorPage) window.location.href = '/error/502'
      return new Promise(() => {})
    }
    // No response at all = network error / server not reachable
    if (!err.response) {
      if (!alreadyOnErrorPage) window.location.href = '/error/502'
      return new Promise(() => {})
    }
    const data = err.response?.data
    return Promise.reject(new Error(data?.error || 'Something went wrong. Please try again!'))
  }
)

export const authApi = {
  signupStatus:    ()                => api.get('/auth/signup-status').then(r => r.data),
  register:        (data)            => api.post('/auth/register', data).then(r => r.data),
  login:           (data)            => api.post('/auth/login',    data).then(r => r.data),
  google:          (idToken)         => api.post('/auth/google', { idToken }).then(r => r.data),
  forgotPassword:      (email)           => api.post('/auth/forgot-password', { email }).then(r => r.data),
  validateResetToken:  (token)           => api.get(`/auth/validate-reset-token?token=${token}`).then(r => r.data),
  resetPassword:       (token, password) => api.post('/auth/reset-password', { token, password }).then(r => r.data),
}

export const childApi = {
  getAll:   ()           => api.get('/children').then(r => r.data),
  get:      (id)         => api.get(`/children/${id}`).then(r => r.data),
  create:   (data)       => api.post('/children', data).then(r => r.data),
  update:   (id, data)   => api.put(`/children/${id}`, data).then(r => r.data),
  delete:   (id)         => api.delete(`/children/${id}`),
  checkin:    (id)       => api.post(`/children/${id}/checkin`).then(r => r.data),
  setPin:     (id, pin)  => api.put(`/children/${id}/pin`, { pin }).then(r => r.data),
  clearPin:   (id)       => api.delete(`/children/${id}/pin`).then(r => r.data),
  verifyPin:  (id, pin)  => api.post(`/children/${id}/pin/verify`, { pin }).then(r => r.data),
}

export const storyApi = {
  generate:       (data)              => api.post('/stories/generate', data).then(r => r.data),
  continue:       (childId, previousStoryId) => api.post('/stories/generate', { childId, keywords: 'continue', previousStoryId }).then(r => r.data),
  getByChild:     (childId, params)   => api.get(`/stories/child/${childId}`, { params }).then(r => r.data),
  getByChildPaged:(childId, page = 0) => api.get(`/stories/child/${childId}/paged`, { params: { page } }).then(r => r.data),
  getFavorites:   (childId)           => api.get(`/stories/child/${childId}/favorites`).then(r => r.data),
  toggleFavorite: (id)                => api.patch(`/stories/${id}/favorite`).then(r => r.data),
  getSimilar:     (id)                => api.get(`/stories/${id}/similar`).then(r => r.data),
  translate:      (id, language)      => api.get(`/stories/${id}/translate?language=${language}`).then(r => r.data),
  listenUrl:      async (id, language, voice, familyVoiceId, part, branch) => {
    const base   = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const stoken = await getAudioToken(`story:${id}`)
    const v  = voice ? `&voice=${encodeURIComponent(voice)}` : ''
    const fv = familyVoiceId ? `&familyVoiceId=${familyVoiceId}` : ''
    const p  = part ? `&part=${part}` : ''
    const b  = part === 2 && branch != null ? `&branch=${branch === 1 ? 'b' : 'a'}` : ''
    return `${base}/stories/${id}/listen?language=${language}${v}${fv}${p}${b}&stoken=${stoken}`
  },
  delete:         (id)                => api.delete(`/stories/${id}`).then(r => r.data).catch(() => null),
}

export const journalApi = {
  create:         (data)     => api.post('/journal', data).then(r => r.data),
  getByChild:     (childId, params) => api.get(`/journal/child/${childId}`, { params }).then(r => r.data),
  getByChildPaged:(childId, page = 0) => api.get(`/journal/child/${childId}/paged`, { params: { page } }).then(r => r.data),
  generateAiEntry:(childId, selectedMood) => api.post(`/journal/ai-entry/child/${childId}`, selectedMood ? { selectedMood } : {}).then(r => r.data),
  delete:         (id)       => api.delete(`/journal/${id}`),
}

export const activityApi = {
  generate:       (data)            => api.post('/activities/generate', data).then(r => r.data),
  getByChild:     (childId, params) => api.get(`/activities/child/${childId}`, { params }).then(r => r.data),
  markComplete:   (id, rating)      => api.patch(`/activities/${id}/complete`, { rating }).then(r => r.data),
  delete:         (id)              => api.delete(`/activities/${id}`),
  deletePending:  (childId)         => api.delete(`/activities/child/${childId}/pending`),
  getSimilar:     (id)              => api.get(`/activities/${id}/similar`).then(r => r.data),
}

export const curiosityApi = {
  ask:            (data)            => api.post('/curiosity/ask', data).then(r => r.data),
  getByChild:     (childId, params) => api.get(`/curiosity/child/${childId}`, { params }).then(r => r.data),
  getByChildPaged:(childId, page = 0) => api.get(`/curiosity/child/${childId}/paged`, { params: { page } }).then(r => r.data),
  delete:         (id)      => api.delete(`/curiosity/${id}`),
  getSimilar: (id)      => api.get(`/curiosity/${id}/similar`).then(r => r.data),
}

export const drawApi = {
  identify: (imageData, childName, childAge, subject = '') =>
    api.post('/draw/identify', { imageData, childName, childAge: String(childAge), subject }).then(r => r.data),
  guide: (subject, childName, childAge) =>
    api.post('/draw/guide', { subject, childName, childAge: String(childAge) }).then(r => r.data),
  animate: (imageData, childName, childAge, subject = '', childId = null) =>
    api.post('/draw/animate', {
      imageData, childName, childAge: String(childAge), subject,
      ...(childId ? { childId: String(childId) } : {}),
    }).then(r => r.data),
}

export const drawSaveApi = {
  save:        (childId, imageData, title)  => api.post('/draw-saves', { childId, imageData, title }).then(r => r.data),
  update:      (id, imageData, title)       => api.put(`/draw-saves/${id}`, { imageData, title }).then(r => r.data),
  getByChild:  (childId, page = 0)          => api.get(`/draw-saves/child/${childId}`, { params: { page } }).then(r => r.data),
  getFull:     (id)                         => api.get(`/draw-saves/${id}/full`).then(r => r.data),
  delete:      (id)                         => api.delete(`/draw-saves/${id}`),
}

export const flipbookSaveApi = {
  save:       (childId, framesJson, thumbnail, fps, frameCount, title) =>
    api.post('/draw-saves/flipbook', { childId, framesJson, thumbnail, fps, frameCount, title }).then(r => r.data),
  update:     (id, framesJson, thumbnail, fps, frameCount, title) =>
    api.put(`/draw-saves/flipbook/${id}`, { framesJson, thumbnail, fps, frameCount, title }).then(r => r.data),
  getByChild: (childId, page = 0) => api.get(`/draw-saves/flipbook/child/${childId}`, { params: { page } }).then(r => r.data),
  getFull:    (id)                 => api.get(`/draw-saves/flipbook/${id}/full`).then(r => r.data),
  delete:     (id)                 => api.delete(`/draw-saves/flipbook/${id}`),
}

export const learnApi = {
  validate:     (imageData, letter, script, childName, childAge, childId) =>
    api.post('/learn/validate', { imageData, letter, script, childName, childAge: String(childAge), ...(childId ? { childId: String(childId) } : {}) }).then(r => r.data),
  identifyWord: (imageData, script, childName, childAge, childId, targetWord) =>
    api.post('/learn/word', { imageData, script, childName, childAge: String(childAge), ...(childId ? { childId: String(childId) } : {}), ...(targetWord ? { targetWord } : {}) }).then(r => r.data),
  audioUrl: async (text, language) => {
    const base   = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const stoken = await getAudioToken('learn')
    return `${base}/learn/audio?text=${encodeURIComponent(text)}&language=${language}&stoken=${stoken}`
  },
}

export const demoApi = {
  story: (childName, keywords, turnstileToken, category = 'adventure') =>
    api.post('/demo/story', { childName, keywords, turnstileToken, category }).then(r => r.data),
}

export const readQuizApi = {
  generate:       (childId, topic)    => api.post('/readquiz/generate', { childId, topic }).then(r => r.data),
  fromStory:      (childId, storyId)  => api.post('/readquiz/from-story', { childId, storyId }).then(r => r.data),
  submit:         (id, answers)       => api.post(`/readquiz/${id}/submit`, { answers }).then(r => r.data),
  getByChild:     (childId, params)   => api.get(`/readquiz/child/${childId}`, { params }).then(r => r.data),
  getByChildPaged:(childId, page = 0) => api.get(`/readquiz/child/${childId}/paged`, { params: { page } }).then(r => r.data),
  delete:         (id)               => api.delete(`/readquiz/${id}`),
}

export const writingApi = {
  save:      (data)              => api.post('/writing', data).then(r => r.data),
  update:    (id, data)          => api.put(`/writing/${id}`, data).then(r => r.data),
  feedback:  (id)                => api.post(`/writing/${id}/feedback`).then(r => r.data),
  continue:  (id)                => api.post(`/writing/${id}/continue`).then(r => r.data),
  getByChild:     (childId, params)   => api.get(`/writing/child/${childId}`, { params }).then(r => r.data),
  getByChildPaged:(childId, page = 0) => api.get(`/writing/child/${childId}/paged`, { params: { page } }).then(r => r.data),
  delete:         (id)               => api.delete(`/writing/${id}`).then(r => r.data).catch(() => null),
}

export const userApi = {
  quota:           ()                          => api.get('/users/me/quota').then(r => r.data),
  featureCredits:  ()                          => api.get('/users/me/feature-credits').then(r => r.data),
  creditBreakdown: ()                          => api.get('/users/me/credit-breakdown').then(r => r.data),
  getProfile:              ()        => api.get('/users/me').then(r => r.data),
  updateMarketingEmails:   (enabled) => api.patch('/users/me/marketing-emails', { enabled }).then(r => r.data),
  recordConsent:           ()        => api.patch('/users/me/consent').then(r => r.data),
  withdrawConsent:         ()        => api.patch('/users/me/consent/withdraw').then(r => r.data),
  getDataSummary:          ()        => api.get('/users/me/data-summary').then(r => r.data),
  changePassword: (currentPassword, newPassword) => api.patch('/users/me/password', { currentPassword, newPassword }).then(r => r.data),
  deleteAccount:  ()                           => api.delete('/users/me'),
}

export const voiceApi = {
  list:   ()                      => api.get('/voices').then(r => r.data),
  create: (file, name)            => {
    const form = new FormData()
    form.append('file', file)
    form.append('name', name)
    return api.post('/voices', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },
  rename: (id, name)              => api.patch(`/voices/${id}/name`, { name }).then(r => r.data),
  delete: (id)                    => api.delete(`/voices/${id}`),
}

export const notificationApi = {
  getAll:      (page = 0, size = 20) => api.get('/notifications', { params: { page, size } }).then(r => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then(r => r.data),
  markAllRead: () => api.put('/notifications/mark-read'),
}

export const memoryApi = {
  generateFlashcards:      (childId, topic) => api.post('/memory/flashcards', { childId, topic }).then(r => r.data),
  getFlashcards:           (childId) => api.get(`/memory/flashcards/child/${childId}`).then(r => r.data),
  getFlashcardsPaged:      (childId, page = 0) => api.get(`/memory/flashcards/child/${childId}/paged`, { params: { page } }).then(r => r.data),
  deleteFlashcards:        (id) => api.delete(`/memory/flashcards/${id}`),
  getWordOfDay:            (childId) => api.get(`/memory/word-of-day/child/${childId}`).then(r => r.data),
  getWordOfDayHistory:     (childId) => api.get(`/memory/word-of-day/child/${childId}/history`).then(r => r.data),
  getWordOfDayHistoryPaged:(childId, page = 0) => api.get(`/memory/word-of-day/child/${childId}/history/paged`, { params: { page } }).then(r => r.data),
  generateMatch:           (childId, theme) => api.post('/memory/match', { childId, theme }).then(r => r.data),
  getMatches:              (childId) => api.get(`/memory/match/child/${childId}`).then(r => r.data),
  getMatchesPaged:         (childId, page = 0) => api.get(`/memory/match/child/${childId}/paged`, { params: { page } }).then(r => r.data),
  deleteMatch:             (id) => api.delete(`/memory/match/${id}`),
}

export const traceApi = {
  generate: (childId, childName, childAge, difficulty) =>
    api.post('/trace/generate', { childId: String(childId), childName, childAge: String(childAge), difficulty }).then(r => r.data),
}
export const mazeApi = traceApi

export const riddleApi = {
  generate: (childId, childName, childAge) =>
    api.post('/riddle/generate', { childId: String(childId), childName, childAge: String(childAge) }).then(r => r.data),
}

export const timelineApi = {
  getPage: (childId, page, size, from, to, type) =>
    api.get(`/timeline/${childId}`, { params: { page, size, from, to, ...(type && type !== 'all' ? { type } : {}) } }).then(r => r.data),
}

export const analyticsApi = {
  batchEvents:      (events)           => api.post('/analytics/events/batch', { events }).then(r => r.data),
  getChildAnalytics:(childId, days=90) => api.get(`/analytics/child/${childId}`, { params: { days, tz: Intl.DateTimeFormat().resolvedOptions().timeZone } }).then(r => r.data),
  getAdminAnalytics:(from, to)         => api.get('/analytics/admin', { params: from ? { from, to } : {} }).then(r => r.data),
}

export const adminApi = {
  getStats:          (from, to)     => api.get('/admin/stats', { params: from ? { from, to } : {} }).then(r => r.data),
  getUsers:          ()             => api.get('/admin/users').then(r => r.data),
  getUsersPaginated: (search, page, size = 20) => api.get('/admin/users', { params: { role: 'USER', search, page, size } }).then(r => r.data),
  revealEmail:       (id)           => api.get(`/admin/users/${id}/email`).then(r => r.data),
  deleteUser:        (id)           => api.delete(`/admin/users/${id}`),
  changeRole:        (id, role)     => api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),
  resetPassword:     (id, password) => api.patch(`/admin/users/${id}/password`, { password }).then(r => r.data),
  runNotifications:  ()             => api.post('/admin/notifications/run').then(r => r.data),
  createAdmin:       (email, password) => api.post('/admin/admins', { email, password }).then(r => r.data),
  createSuperAdmin:  (email, password) => api.post('/admin/super-admins', { email, password }).then(r => r.data),
  promoteToSuperAdmin: (id)            => api.patch(`/admin/users/${id}/role`, { role: 'SUPER_ADMIN' }).then(r => r.data),
  demoteToAdmin:     (id)              => api.patch(`/admin/users/${id}/role`, { role: 'ADMIN' }).then(r => r.data),
  holdUser:          (id, reason)   => api.patch(`/admin/users/${id}/hold`, { reason }).then(r => r.data),
  releaseUser:       (id)           => api.patch(`/admin/users/${id}/release`).then(r => r.data),
  resetQuota:          (id)                   => api.patch(`/admin/users/${id}/quota/reset`).then(r => r.data),
  setQuota:            (id, limit)            => api.patch(`/admin/users/${id}/quota`, { limit }).then(r => r.data),
  schedulerStatus:           ()             => api.get('/admin/scheduler/status').then(r => r.data),
  schedulerHistory:          (id)           => api.get(`/admin/scheduler/${id}/history`).then(r => r.data),
  runScheduler:              (id)           => api.post(`/admin/scheduler/${id}`).then(r => r.data),
  runNotifications:          ()             => api.post('/admin/notifications/run').then(r => r.data),
  listFeatureConfigs:        ()                          => api.get('/admin/feature-config').then(r => r.data),
  updateFeatureConfig:       (featureName, cost)         => api.put(`/admin/feature-config/${featureName}`, { creditCost: cost }).then(r => r.data),
  setFeatureEnabled:         (featureName, enabled)      => api.put(`/admin/feature-config/${featureName}/enabled`, { enabled }).then(r => r.data),
  getQuotaDefaults:          ()                          => api.get('/admin/quota/default').then(r => r.data),
  updateQuotaDefault:        (credits)                   => api.put('/admin/quota/default', { defaultMonthlyCredits: credits }).then(r => r.data),
  listPromoCampaigns:        (params)                    => api.get('/admin/promo-campaigns', { params }).then(r => r.data),
  createPromoCampaign:       (payload)                   => api.post('/admin/promo-campaigns', payload).then(r => r.data),
  updatePromoCampaign:       (campaignId, payload)       => api.put(`/admin/promo-campaigns/${campaignId}`, payload).then(r => r.data),
  activatePromoCampaign:     (campaignId)                => api.post(`/admin/promo-campaigns/${campaignId}/activate`).then(r => r.data),
  rerunPromoCampaign:        (campaignId)                => api.post(`/admin/promo-campaigns/${campaignId}/rerun`).then(r => r.data),
  deletePromoCampaign:       (campaignId)                => api.delete(`/admin/promo-campaigns/${campaignId}`).then(r => r.data),
  getCampaignGrants:         (campaignId)                => api.get(`/admin/promo-campaigns/${campaignId}/grants`).then(r => r.data),
  getUserPromoGrants:        (userId)                    => api.get(`/admin/users/${userId}/promo-grants`).then(r => r.data),
  manualGrantToUser:         (userId, payload)           => api.post(`/admin/users/${userId}/promo-grants`, payload).then(r => r.data),
  getUserFeatureOverrides:   (userId)                    => api.get(`/admin/users/${userId}/feature-overrides`).then(r => r.data),
  setUserFeatureOverride:    (userId, featureName, enabled) => api.put(`/admin/users/${userId}/feature-overrides/${featureName}`, { enabled }).then(r => r.data),
  resetUserFeatureOverride:  (userId, featureName)       => api.put(`/admin/users/${userId}/feature-overrides/${featureName}`, {}).then(r => r.data),
  listAgents:                ()                          => api.get('/admin/agents').then(r => r.data),
  setAgentEnabled:           (id, enabled)               => api.put(`/admin/agents/${id}/enabled`, { enabled }).then(r => r.data),
  sendAnnouncement:          (payload)                   => api.post('/admin/announcements/send', payload).then(r => r.data),
  sendConsentBackfill:       ()                          => api.post('/admin/consent-backfill/send').then(r => r.data),
  consentBackfillHistory:    ()                          => api.get('/admin/consent-backfill/history').then(r => r.data),
  getVendors:                ()                          => api.get('/admin/vendors').then(r => r.data),
  setVendorEnabled:          (vendor, enabled)           => api.patch(`/admin/vendors/${vendor}`, { enabled }).then(r => r.data),
  getAdminAlerts:            ()                          => api.get('/admin/alerts').then(r => r.data),
  markAdminAlertsRead:       ()                          => api.post('/admin/alerts/mark-read').then(r => r.data),
  getSignupEnabled:          ()                          => api.get('/admin/settings/signup').then(r => r.data),
  setSignupEnabled:          (enabled)                   => api.put('/admin/settings/signup', { enabled }).then(r => r.data),
}
