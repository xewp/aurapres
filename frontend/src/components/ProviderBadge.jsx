import { motion } from 'framer-motion'

/**
 * Small badge that shows which AI provider generated a particular output.
 * Displayed in the output card footer and in history cards.
 */

const PROVIDER_STYLES = {
  gemini:      { emoji: '✦', label: 'Gemini', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  mistral:     { emoji: '🌀', label: 'Mistral', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  groq:        { emoji: '⚡', label: 'Groq', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  openrouter:  { emoji: '🔀', label: 'OpenRouter', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  huggingface: { emoji: '🤗', label: 'HuggingFace', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
}

export default function ProviderBadge({ provider, showLabel = true, size = 'sm' }) {
  if (!provider) return null

  const style = PROVIDER_STYLES[provider] || {
    emoji: '🤖',
    label: provider,
    bg: 'bg-white/5',
    text: 'text-white/60',
    border: 'border-white/10',
  }

  const sizeClasses = size === 'xs'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center rounded-full font-medium
        ${style.bg} ${style.text} border ${style.border}
        ${sizeClasses}
      `}
    >
      <span>{style.emoji}</span>
      {showLabel && <span>{style.label}</span>}
    </motion.span>
  )
}
