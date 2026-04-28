import { motion } from 'framer-motion'
import { formatDistanceToNow } from '../utils/dateUtils'

const voiceBadgeClass = {
  professional: 'badge-professional',
  hype: 'badge-hype',
  minimalist: 'badge-minimalist',
}

const voiceIcon = {
  professional: '💼',
  hype: '🔥',
  minimalist: '✦',
}

export default function HistoryCard({ generation, onSelect, onDelete, isDeleting }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, height: 0 }}
      transition={{ duration: 0.25 }}
      className="group card-surface border-l-2 border-l-gold/30 hover:border-l-gold
                 cursor-pointer transition-all duration-200 p-4 space-y-3"
      onClick={() => onSelect(generation)}
    >
      {/* Topic */}
      <p className="text-white/90 text-sm font-medium leading-snug line-clamp-2">
        {generation.topic}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={voiceBadgeClass[generation.voice]}>
            {voiceIcon[generation.voice]} {generation.voice}
          </span>
          <span className="text-xs text-white/30">
            {formatDistanceToNow(generation.createdAt)}
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(generation._id)
          }}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400"
          title="Delete"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 3H11M5 3V2H8V3M4 3L4.5 11H8.5L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
