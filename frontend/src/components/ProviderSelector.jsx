import { motion, AnimatePresence } from 'framer-motion'
import { useProviders } from '../hooks/useProviders'

/**
 * Provider icons — small colored indicators for each provider.
 * Using simple CSS-styled elements instead of SVGs for consistency.
 */
const PROVIDER_ICONS = {
  gemini:      { emoji: '✦', color: '#4285F4', label: 'Gemini' },
  mistral:     { emoji: '🌀', color: '#FF7000', label: 'Mistral' },
  groq:        { emoji: '⚡', color: '#F55036', label: 'Groq' },
  openrouter:  { emoji: '🔀', color: '#8B5CF6', label: 'OpenRouter' },
  huggingface: { emoji: '🤗', color: '#FFD21E', label: 'Hugging Face' },
}

export default function ProviderSelector({ selected, onChange }) {
  const { data, isLoading } = useProviders()

  // Only show providers that are configured (have an API key on the backend)
  const available = data?.data?.filter((p) => p.configured) || []

  if (isLoading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white/60 tracking-wide uppercase">
          AI Provider
        </label>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-10 w-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // If only one provider, don't show the selector — just show a subtle badge
  if (available.length <= 1) {
    const single = available[0]
    if (!single) return null
    const icon = PROVIDER_ICONS[single.name] || { emoji: '🤖', color: '#888' }
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/5">
        <span className="text-sm">{icon.emoji}</span>
        <span className="text-xs text-white/40">
          Powered by <span className="text-white/60 font-medium">{single.label}</span>
        </span>
        {single.healthy && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-auto" />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/60 tracking-wide uppercase">
        AI Provider
      </label>

      <div className="flex flex-wrap gap-2">
        {/* Auto option — let the system decide */}
        <ProviderPill
          name="auto"
          emoji="🤖"
          label="Auto"
          color="#D4AF37"
          healthy={true}
          isActive={!selected || selected === 'auto'}
          onClick={() => onChange(null)}
          speedLabel={null}
        />

        {available.map((provider) => {
          const icon = PROVIDER_ICONS[provider.name] || { emoji: '🤖', color: '#888' }
          return (
            <ProviderPill
              key={provider.name}
              name={provider.name}
              emoji={icon.emoji}
              label={provider.label || icon.label}
              color={icon.color}
              healthy={provider.healthy}
              isActive={selected === provider.name}
              onClick={() => onChange(provider.name)}
              speedLabel={provider.speed}
            />
          )
        })}
      </div>
    </div>
  )
}

function ProviderPill({ name, emoji, label, color, healthy, isActive, onClick, speedLabel }) {
  return (
    <motion.button
      id={`provider-${name}`}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-xl
        border transition-all duration-300 cursor-pointer text-sm
        ${isActive
          ? 'border-gold/60 bg-gold/10 shadow-gold'
          : 'border-white/8 bg-dark-800 hover:border-white/20 hover:bg-dark-700'
        }
        ${!healthy ? 'opacity-50' : ''}
      `}
    >
      {/* Active indicator ring */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="provider-active-ring"
            className="absolute inset-0 rounded-xl border border-gold/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>

      <span className="text-base">{emoji}</span>

      <span className={`font-medium ${isActive ? 'text-gold' : 'text-white/80'}`}>
        {label}
      </span>

      {/* Health dot */}
      {name !== 'auto' && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            healthy ? 'bg-emerald-400' : 'bg-red-400'
          }`}
        />
      )}

      {/* Speed badge */}
      {speedLabel && isActive && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40"
        >
          {speedLabel}
        </motion.span>
      )}
    </motion.button>
  )
}
