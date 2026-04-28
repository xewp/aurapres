import { motion } from 'framer-motion'

export default function ThinkingState() {
  return (
    <motion.div
      id="thinking-state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 gap-8"
    >
      {/* Orb */}
      <div className="relative">
        {/* Outer rings */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border border-gold/30"
          style={{ margin: '-20px' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute inset-0 rounded-full border border-gold/20"
          style={{ margin: '-10px' }}
        />

        {/* Core orb */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px #D4AF37, 0 0 40px #D4AF3744',
              '0 0 40px #D4AF37, 0 0 80px #D4AF3766, 0 0 120px #D4AF3733',
              '0 0 20px #D4AF37, 0 0 40px #D4AF3744',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center"
        >
          {/* Inner spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full border-2 border-dark/40 border-t-dark"
          />
        </motion.div>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <motion.p
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="text-lg font-semibold text-gold"
        >
          AuraPress is generating...
        </motion.p>
        <p className="text-sm text-white/30">
          Crafting 3 outputs simultaneously with Gemini AI
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-gold"
          />
        ))}
      </div>
    </motion.div>
  )
}
