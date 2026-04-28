import { motion } from 'framer-motion'
import { fadeUpVariant } from '../utils/motion'
import CopyButton from './CopyButton'

const cardConfigs = {
  linkedin: {
    id: 'linkedin-card',
    title: 'LinkedIn Post',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#0A66C2"/>
        <path d="M5 8.5H7V15H5V8.5ZM6 5C6.55228 5 7 5.44772 7 6C7 6.55228 6.55228 7 6 7C5.44772 7 5 6.55228 5 6C5 5.44772 5.44772 5 6 5Z" fill="white"/>
        <path d="M9 8.5H10.9V9.4H10.93C11.18 8.95 11.75 8.45 12.6 8.45C14.45 8.45 14.8 9.65 14.8 11.2V15H12.8V11.6C12.8 10.85 12.79 9.9 11.8 9.9C10.8 9.9 10.65 10.7 10.65 11.55V15H8.65L9 8.5Z" fill="white"/>
      </svg>
    ),
    accent: 'border-blue-500/20 hover:border-blue-500/40',
    accentGlow: 'hover:shadow-[0_0_20px_rgba(10,102,194,0.15)]',
    renderContent: (content) => (
      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    ),
    getCopyText: (content) => content,
  },
  twitter: {
    id: 'twitter-card',
    title: 'Twitter / X Thread',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#000"/>
        <path d="M11.47 9.03L15.7 4H14.67L11.01 8.37L8.05 4H4.5L8.95 10.64L4.5 16H5.53L9.41 11.37L12.55 16H16.1L11.47 9.03Z" fill="white"/>
      </svg>
    ),
    accent: 'border-white/10 hover:border-white/20',
    accentGlow: '',
    renderContent: (content) => (
      <div className="space-y-3">
        {content.map((tweet, i) => (
          <div key={i} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 border border-gold/20
                             flex items-center justify-center text-xs font-bold text-gold">
              {i + 1}
            </span>
            <p className="text-white/80 text-sm leading-relaxed flex-1">{tweet}</p>
          </div>
        ))}
      </div>
    ),
    getCopyText: (content) => content.join('\n\n'),
  },
  blog: {
    id: 'blog-card',
    title: 'Blog Outline',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="url(#blogGrad)"/>
        <path d="M5 7H15M5 10H12M5 13H9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="blogGrad" x1="0" y1="0" x2="20" y2="20">
            <stop stopColor="#D4AF37"/>
            <stop offset="1" stopColor="#8B7520"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    accent: 'border-gold/20 hover:border-gold/40',
    accentGlow: 'hover:shadow-gold',
    renderContent: (content) => (
      <div className="space-y-4">
        <div>
          <h4 className="text-gold font-semibold text-sm mb-1">Title</h4>
          <p className="text-white font-medium leading-snug">{content.title}</p>
        </div>
        <div>
          <h4 className="text-gold font-semibold text-sm mb-1">Intro</h4>
          <p className="text-white/70 text-sm leading-relaxed">{content.intro}</p>
        </div>
        {content.sections?.map((section, i) => (
          <div key={i}>
            <h4 className="text-white/90 font-semibold text-sm mb-1.5">{section.heading}</h4>
            <ul className="space-y-1">
              {section.bullets?.map((bullet, j) => (
                <li key={j} className="flex gap-2 text-sm text-white/60">
                  <span className="text-gold/60 flex-shrink-0 mt-0.5">▸</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
    getCopyText: (content) => {
      const sections = content.sections?.map(s =>
        `## ${s.heading}\n${s.bullets?.map(b => `- ${b}`).join('\n')}`
      ).join('\n\n')
      return `# ${content.title}\n\n${content.intro}\n\n${sections}`
    },
  },
}

export default function OutputCard({ type, content, index = 0 }) {
  const config = cardConfigs[type]
  if (!config) return null

  const hasContent = content !== null && content !== undefined

  return (
    <motion.div
      id={config.id}
      variants={fadeUpVariant}
      custom={index}
      initial="hidden"
      animate="visible"
      className={`
        card-surface flex flex-col gap-4 transition-all duration-300
        ${config.accent} ${config.accentGlow}
      `}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {config.icon}
          <span className="font-semibold text-white/90">{config.title}</span>
        </div>
        <CopyButton text={hasContent ? config.getCopyText(content) : null} />
      </div>

      {/* Divider */}
      <div className="divider-gold !my-0" />

      {/* Content Area */}
      <div className="flex-1 min-h-[180px] max-h-[420px] overflow-y-auto pr-1">
        {hasContent ? (
          config.renderContent(content)
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10
                           flex items-center justify-center text-white/20 text-xl">
              ✦
            </div>
            <p className="text-white/25 text-sm">
              Enter a topic and generate content to see results here.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
