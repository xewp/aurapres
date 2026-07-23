import Navbar from '../components/Navbar'

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Navbar />
      <main className="pt-16 flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/20 text-sm">
              Built with
            </span>
            <span className="text-gold/60 text-sm font-medium">Multi-AI Architecture</span>
            <span className="text-white/20 text-sm">·</span>
            <span className="text-white/20 text-sm">StoryForge AI © 2026</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <span>React + Vite</span>
            <span>·</span>
            <span>Tailwind v3</span>
            <span>·</span>
            <span>Framer Motion</span>
            <span>·</span>
            <span>Node.js</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
