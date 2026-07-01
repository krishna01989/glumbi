import axios from 'axios'

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
    const isAuthEndpoint = url.startsWith('/auth/')
    const isDemoEndpoint = url.startsWith('/demo/')

    if (status === 401 && !isAuthEndpoint && !isDemoEndpoint) {
      localStorage.removeItem('glm_token')
      localStorage.removeItem('glm_role')
      window.location.href = '/error/401'
      return new Promise(() => {})
    }
    if (status === 403) {
      window.location.href = '/error/403'
      return new Promise(() => {})
    }
    if (status === 502 || status === 503) {
      window.location.href = `/error/${status}`
      return new Promise(() => {})
    }
    return Promise.reject(new Error(err.response?.data?.error || 'Something went wrong. Please try again!'))
  }
)

export const authApi = {
  register: (data)    => api.post('/auth/register', data).then(r => r.data),
  login:    (data)    => api.post('/auth/login',    data).then(r => r.data),
  google:   (idToken) => api.post('/auth/google', { idToken }).then(r => r.data),
}

export const childApi = {
  getAll: ()             => api.get('/children').then(r => r.data),
  get:    (id)           => api.get(`/children/${id}`).then(r => r.data),
  create: (data)         => api.post('/children', data).then(r => r.data),
  update: (id, data)     => api.put(`/children/${id}`, data).then(r => r.data),
  delete: (id)           => api.delete(`/children/${id}`),
}

export const storyApi = {
  generate:       (data)              => api.post('/stories/generate', data).then(r => r.data),
  getByChild:     (childId, params)   => api.get(`/stories/child/${childId}`, { params }).then(r => r.data),
  getFavorites:   (childId)           => api.get(`/stories/child/${childId}/favorites`).then(r => r.data),
  toggleFavorite: (id)                => api.patch(`/stories/${id}/favorite`).then(r => r.data),
  translate:      (id, language)      => api.get(`/stories/${id}/translate?language=${language}`).then(r => r.data),
  listenUrl:      (id, language)      => {
    const token = localStorage.getItem('glm_token')
    return `http://localhost:8080/api/stories/${id}/listen?language=${language}&token=${token}`
  },
  delete:         (id)                => api.delete(`/stories/${id}`),
}

export const journalApi = {
  create:     (data)           => api.post('/journal', data).then(r => r.data),
  getByChild: (childId, params) => api.get(`/journal/child/${childId}`, { params }).then(r => r.data),
  delete:     (id)      => api.delete(`/journal/${id}`),
}

export const activityApi = {
  generate:       (data)            => api.post('/activities/generate', data).then(r => r.data),
  getByChild:     (childId, params) => api.get(`/activities/child/${childId}`, { params }).then(r => r.data),
  markComplete:   (id, rating)      => api.patch(`/activities/${id}/complete`, { rating }).then(r => r.data),
  delete:         (id)              => api.delete(`/activities/${id}`),
  deletePending:  (childId)         => api.delete(`/activities/child/${childId}/pending`),
}

export const curiosityApi = {
  ask:        (data)            => api.post('/curiosity/ask', data).then(r => r.data),
  getByChild: (childId, params) => api.get(`/curiosity/child/${childId}`, { params }).then(r => r.data),
  delete:     (id)      => api.delete(`/curiosity/${id}`),
}

export const drawApi = {
  identify: (imageData, childName, childAge) =>
    api.post('/draw/identify', { imageData, childName, childAge: String(childAge) }).then(r => r.data),
}

export const demoApi = {
  story: (childName, keywords, turnstileToken) =>
    api.post('/demo/story', { childName, keywords, turnstileToken }).then(r => r.data),
}

export const readQuizApi = {
  generate:  (childId, topic)    => api.post('/readquiz/generate', { childId, topic }).then(r => r.data),
  submit:    (id, answers)       => api.post(`/readquiz/${id}/submit`, { answers }).then(r => r.data),
  getByChild:(childId, params)   => api.get(`/readquiz/child/${childId}`, { params }).then(r => r.data),
  delete:    (id)               => api.delete(`/readquiz/${id}`),
}

export const writingApi = {
  save:      (data)              => api.post('/writing', data).then(r => r.data),
  update:    (id, data)          => api.put(`/writing/${id}`, data).then(r => r.data),
  feedback:  (id)                => api.post(`/writing/${id}/feedback`).then(r => r.data),
  getByChild:(childId, params)   => api.get(`/writing/child/${childId}`, { params }).then(r => r.data),
  delete:    (id)               => api.delete(`/writing/${id}`),
}

export const userApi = {
  quota: () => api.get('/users/me/quota').then(r => r.data),
}

export const adminApi = {
  getUsers:      ()              => api.get('/admin/users').then(r => r.data),
  deleteUser:    (id)            => api.delete(`/admin/users/${id}`),
  changeRole:    (id, role)      => api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),
  resetPassword: (id, password)  => api.patch(`/admin/users/${id}/password`, { password }).then(r => r.data),
}
