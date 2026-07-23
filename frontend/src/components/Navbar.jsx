import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Gold logo icon SVG
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path
      d="M14 2L17.5 9.5L26 11L20 17L21.5 26L14 22L6.5 26L8 17L2 11L10.5 9.5L14 2Z"
      fill="url(#goldGrad)"
      stroke="#D4AF37"
      strokeWidth="0.5"
    />
    <defs>
      <linearGradient id="goldGrad" x1="2" y1="2" x2="26" y2="26">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#F5E27A" />
      </linearGradient>
    </defs>
  </svg>
)

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(10, 10, 15, 0.85)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate(user ? '/dashboard' : '/')}
          >
            <div className="animate-float">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold tracking-tight font-serif">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">StoryForge</span>
              <span className="text-white ml-1">AI</span>
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-400 hidden sm:block">
                  {user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0A0F] text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
