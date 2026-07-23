import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import TopicInput from '../components/TopicInput'
import VoiceToggle from '../components/VoiceToggle'
import ProviderSelector from '../components/ProviderSelector'
import OutputCard from '../components/OutputCard'
import ThinkingState from '../components/ThinkingState'
import HistoryPanel from '../components/HistoryPanel'
import ProviderBadge from '../components/ProviderBadge'
import { staggerContainer, fadeUpVariant } from '../utils/motion'
import { useGenerate } from '../hooks/useGenerate'

const EXAMPLE_TOPICS = [
  'The future of the MERN stack in 2026',
  'Why most developers never get hired',
  'How AI will change software engineering',
  'Building a SaaS product as a solo developer',
]

export default function Home() {
  const [topic, setTopic] = useState('')
  const [voice, setVoice] = useState('professional')
  const [provider, setProvider] = useState(null) // null = auto
  const [outputs, setOutputs] = useState(null)
  const [usedProvider, setUsedProvider] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const { mutate: generate, isPending: isLoading } = useGenerate()

  const handleGenerate = () => {
    if (!topic.trim() || topic.length > 150 || isLoading) return

    generate(
      { topic: topic.trim(), voice, provider },
      {
        onSuccess: (res) => {
          setOutputs(res.data)
          setUsedProvider(res.provider || null)
          toast.success(
            <span className="flex items-center gap-2">
              Content generated!
              {res.provider && (
                <span className="text-xs text-white/40">via {res.provider}</span>
              )}
            </span>,
            {
              icon: '✦',
              style: { borderLeft: '3px solid #D4AF37' },
            }
          )
          // Scroll to outputs
          setTimeout(() => {
            document.getElementById('outputs-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        },
        onError: (err) => {
          toast.error(err.friendlyMessage || 'Generation failed. Please try again.')
        },
      }
    )
  }

  // Reload a past generation from history
  const handleHistorySelect = (generation) => {
    setTopic(generation.topic)
    setVoice(generation.voice)
    setOutputs(generation.output)
    setUsedProvider(generation.providerUsed || null)
    setShowHistory(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast('Past generation loaded', { icon: '↩' })
  }

  return (
    <div className="min-h-screen pt-20">
      {/* ─── Hero Section ───────────────────────────────── */}
      <section className="section-padding text-center max-w-5xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Badge */}
          <motion.div variants={fadeUpVariant} custom={0} className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                             bg-gold/8 border border-gold/20 text-gold/80 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Multi-AI Content Engine
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUpVariant}
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
          >
            <span className="text-gold-gradient">One Topic.</span>
            <br />
            <span className="text-white">Three Platforms.</span>
            <br />
            <span className="text-white/40">Instantly.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUpVariant}
            custom={2}
            className="text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light"
          >
            StoryForge AI transforms any topic into a LinkedIn post, Twitter thread, and
            blog outline instantly.
          </motion.p>

          {/* Example topics */}
          <motion.div
            variants={fadeUpVariant}
            custom={3}
            className="flex flex-wrap justify-center gap-2 pt-2"
          >
            {EXAMPLE_TOPICS.map((example) => (
              <button
                key={example}
                onClick={() => setTopic(example)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10
                           text-white/50 text-xs hover:bg-gold/8 hover:border-gold/30
                           hover:text-gold/80 transition-all duration-200"
              >
                {example}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Generator Card ─────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="card-glow space-y-6"
        >
          <TopicInput
            value={topic}
            onChange={setTopic}
            onSubmit={handleGenerate}
            isLoading={isLoading}
          />

          <div className="divider-gold" />

          <VoiceToggle selected={voice} onChange={setVoice} />

          <div className="divider-gold" />

          {/* AI Provider Selection */}
          <ProviderSelector selected={provider} onChange={setProvider} />

          {/* Actions row */}
          <div className="flex gap-3">
            <motion.button
              id="generate-btn"
              onClick={handleGenerate}
              disabled={!topic.trim() || topic.length > 150 || isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold flex-1 py-4 text-base font-bold tracking-wide"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 rounded-full border-2 border-dark/40 border-t-dark animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✦</span>
                  Generate All Three
                  <span>✦</span>
                </span>
              )}
            </motion.button>

            {/* History button */}
            <motion.button
              id="history-btn"
              onClick={() => setShowHistory(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ghost px-4 py-4 flex items-center gap-2 text-sm"
              title="View history"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V8L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span className="hidden sm:inline">History</span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ─── Output Section ─────────────────────────────── */}
      <section
        id="outputs-section"
        className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto"
      >
        {/* Provider used indicator */}
        {outputs && usedProvider && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="text-xs text-white/30">Generated with</span>
            <ProviderBadge provider={usedProvider} />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <ThinkingState key="thinking" />
          ) : outputs ? (
            <motion.div
              key="outputs"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <OutputCard type="linkedin" content={outputs.linkedin} index={0} />
              <OutputCard type="twitter" content={outputs.twitter} index={1} />
              <OutputCard type="blog" content={outputs.blog} index={2} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <OutputCard type="linkedin" content={null} index={0} />
              <OutputCard type="twitter" content={null} index={1} />
              <OutputCard type="blog" content={null} index={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─── History Panel ──────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <HistoryPanel
            onClose={() => setShowHistory(false)}
            onSelect={handleHistorySelect}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
