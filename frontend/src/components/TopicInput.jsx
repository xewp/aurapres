import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const MAX_CHARS = 150

export default function TopicInput({ value, onChange, onSubmit, isLoading }) {
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)
  const charCount = value.length
  const isOverLimit = charCount > MAX_CHARS
  const isEmpty = charCount === 0

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isEmpty && !isOverLimit && !isLoading) onSubmit()
    }
  }

  return (
    <div className="space-y-3">
      <label htmlFor="topic-input" className="block text-sm font-medium text-white/60 tracking-wide uppercase">
        Your Topic
      </label>

      <div
        className={`
          relative rounded-2xl transition-all duration-300
          ${focused ? 'shadow-gold' : ''}
        `}
      >
        <textarea
          id="topic-input"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={isLoading}
          placeholder="e.g. The future of the MERN stack in 2026..."
          className={`
            input-gold text-base leading-relaxed
            ${isOverLimit ? 'ring-2 ring-red-500 border-red-500/50' : ''}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {/* Focused glow border overlay */}
        {focused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl pointer-events-none border border-gold/40"
          />
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-white/30">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono text-xs">Enter</kbd> to generate
        </p>
        <div className="flex items-center gap-2">
          {isOverLimit && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-red-400"
            >
              Too long!
            </motion.span>
          )}
          <span className={`text-xs font-mono tabular-nums transition-colors duration-200
            ${isOverLimit ? 'text-red-400' : charCount > MAX_CHARS * 0.8 ? 'text-yellow-400/70' : 'text-white/30'}`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  )
}
