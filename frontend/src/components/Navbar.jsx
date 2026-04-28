import { motion } from 'framer-motion'
import { fadeUpVariant } from '../utils/motion'

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
          <div className="flex items-center gap-3">
            <div className="animate-float">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gold-gradient">Aura</span>
              <span className="text-white">Press</span>
            </span>
          </div>

          {/* Center badge */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-medium text-gold/80 tracking-wide">
              AI Content Engine
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 hidden sm:block">
              Powered by Gemini
            </span>
            <button className="btn-gold text-sm px-4 py-2">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
