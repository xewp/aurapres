import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import RootLayout from './layouts/RootLayout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import NewProject from './pages/NewProject'
import ProjectWorkspace from './pages/ProjectWorkspace'
import Prompts from './pages/Prompts'
import Home from './pages/Home' // Temporary fallback or could be deleted later

import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
    mutations: { retry: 0 },
  },
})

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null // Or a full screen spinner
  if (!user) return <Navigate to="/auth" />
  return <RootLayout>{children}</RootLayout>
}

// Auth Route Wrapper (Redirect to dashboard if already logged in)
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
            <Route path="/prompts" element={<ProtectedRoute><Prompts /></ProtectedRoute>} />
            
            {/* Keeping old Home for now so it doesn't break entirely if someone navigates there */}
            <Route path="/legacy" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          </Routes>
        </Router>

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#16161F',
              color: '#fff',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#D4AF37', secondary: '#0A0A0F' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0A0A0F' },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
