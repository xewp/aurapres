import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 45000, // 45s — Gemini can be slow on first call
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach auth token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aurapress_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please try again.'

    // Attach clean message to error object
    error.friendlyMessage = message
    return Promise.reject(error)
  }
)

export default api
