import { motion } from 'framer-motion'

const voices = [
  {
    id: 'professional',
    label: 'Professional',
    icon: '💼',
    description: 'Formal & authoritative',
  },
  {
    id: 'hype',
    label: 'Hype',
    icon: '🔥',
    description: 'Viral & energetic',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    icon: '✦',
    description: 'Clear & concise',
  },
]

export default function VoiceToggle({ selected, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/60 tracking-wide uppercase">
        Brand Voice
      </label>
      <div className="grid grid-cols-3 gap-3">
        {voices.map((voice) => {
          const isActive = selected === voice.id
          return (
            <motion.button
              key={voice.id}
              id={`voice-${voice.id}`}
              onClick={() => onChange(voice.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`
                relative flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl
                border transition-all duration-300 cursor-pointer text-center
                ${isActive
                  ? 'border-gold/60 bg-gold/10 shadow-gold'
                  : 'border-white/8 bg-dark-800 hover:border-white/20 hover:bg-dark-700'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="voice-active-pill"
                  className="absolute inset-0 rounded-xl border border-gold/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span className="text-2xl">{voice.icon}</span>

              <span className={`text-sm font-semibold ${isActive ? 'text-gold' : 'text-white/80'}`}>
                {voice.label}
              </span>

              <span className={`text-xs leading-tight ${isActive ? 'text-gold/60' : 'text-white/30'}`}>
                {voice.description}
              </span>

              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold animate-pulse"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
