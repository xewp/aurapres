import axios from 'axios'
import { supabase } from '../lib/supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

// Request interceptor to attach Supabase JWT
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  
  return config
})

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it's a 401 Unauthorized, maybe trigger a logout or redirect
    if (error.response?.status === 401) {
      supabase.auth.signOut()
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export default api
