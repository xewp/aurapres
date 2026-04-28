/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
    },
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0A0A0F',
          800: '#12121A',
          700: '#1A1A26',
          600: '#222233',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F5E27A',
          dim: '#8B7520',
          glow: '#D4AF3733',
        },
        surface: '#16161F',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 20px #D4AF3744',
        'gold-lg': '0 0 40px #D4AF3766',
        'gold-xl': '0 0 60px #D4AF3788',
        surface: '0 4px 32px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37, #F5E27A)',
        'gold-gradient-r': 'linear-gradient(90deg, #D4AF37, #F5E27A)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)',
        'surface-gradient': 'linear-gradient(145deg, #16161F, #1A1A26)',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        shimmer: 'shimmer 1.8s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 12px #D4AF37, 0 0 24px #D4AF3744' },
          '50%': { boxShadow: '0 0 32px #D4AF37, 0 0 60px #D4AF3755, 0 0 80px #D4AF3733' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        borderGlow: {
          '0%,100%': { borderColor: '#D4AF3744' },
          '50%': { borderColor: '#D4AF37' },
        },
      },
    },
  },
  safelist: [
    'ring-2', 'ring-gold', 'shadow-gold', 'shadow-gold-lg',
    'animate-glow-pulse', 'animate-fade-up', 'bg-gold-gradient',
    'text-gold', 'border-gold',
  ],
  plugins: [],
}
