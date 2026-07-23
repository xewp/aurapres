// Framer Motion reusable animation variants for StoryForge AI

export const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

export const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const scaleInVariant = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
}

export const slideInLeftVariant = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const glowVariant = {
  idle: { boxShadow: '0 0 0px #D4AF37' },
  active: {
    boxShadow: [
      '0 0 12px #D4AF37',
      '0 0 32px #D4AF37, 0 0 60px #D4AF3755',
      '0 0 12px #D4AF37',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
}
