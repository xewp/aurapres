import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
    mutations: { retry: 0 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout>
        <Home />
      </RootLayout>

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
    </QueryClientProvider>
  )
}
