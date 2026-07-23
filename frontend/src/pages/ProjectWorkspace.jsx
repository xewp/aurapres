import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Sparkles, Wand2, PlayCircle, BookOpen, Check } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { downloadMarkdown } from '../utils/exportUtils'
import AssetViewer from '../components/AssetViewer'

export default function ProjectWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch project and its assets
  const { data: projectRes, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`),
    refetchInterval: (query) => {
      const status = query?.state?.data?.data?.data?.status
      return status === 'generating' || status === 'ideation' ? 3000 : false
    },
  })

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    )
  }

  if (error || !projectRes?.data?.data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-red-500 mb-4">Error loading project</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-gold px-4 py-2">
          Back to Dashboard
        </button>
      </div>
    )
  }

  const project = projectRes.data.data
  const assets = project.assets || {}
  const status = project.status

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      {/* Workspace Header */}
      <div className="h-14 border-b border-gray-800 bg-[#0A0A0F] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-gray-800" />
          <h1 className="text-white font-medium">{project.name}</h1>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            status === 'completed' ? 'bg-green-900/30 text-green-400' :
            status === 'generating' ? 'bg-blue-900/30 text-blue-400' :
            'bg-gray-800 text-gray-300'
          }`}>
            {status}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => downloadMarkdown(project, assets)}
            disabled={status !== 'completed'}
            className="px-4 py-1.5 text-sm border border-gray-700 hover:bg-gray-800 rounded-lg transition-colors text-white disabled:opacity-50"
          >
            Export Project (MD)
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-gray-800 bg-[#0A0A0F] flex flex-col overflow-y-auto hidden md:flex">
          <div className="p-4 space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
              Pre-Production
            </div>
            {['research', 'strategy', 'outline'].map(type => (
              <SidebarItem key={type} type={type} asset={assets[type]} />
            ))}

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
              Production
            </div>
            {['script', 'shorts', 'seo'].map(type => (
              <SidebarItem key={type} type={type} asset={assets[type]} />
            ))}

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
              Post-Production
            </div>
            {['thumbnail', 'broll', 'voiceover', 'summary'].map(type => (
              <SidebarItem key={type} type={type} asset={assets[type]} />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#12121A] overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto h-full">
            
            {status === 'ideation' && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-gray-800 relative">
                  <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-2xl animate-pulse" />
                  <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin relative z-10" />
                </div>
                <h2 className="text-2xl font-serif text-white mb-2">AI is Brainstorming</h2>
                <p className="text-gray-400 max-w-md">
                  We are researching your topic, analyzing the niche, and generating viral strategy concepts. This usually takes 15-30 seconds.
                </p>
              </div>
            )}

            {status === 'research_ready' && (
              <IdeationPicker project={project} strategyAsset={assets['strategy']} />
            )}

            {status === 'generating' && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-gray-800 relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-2xl animate-pulse" />
                  <Sparkles className="w-8 h-8 text-blue-400 animate-pulse relative z-10" />
                </div>
                <h2 className="text-2xl font-serif text-white mb-2">Producing Content</h2>
                <p className="text-gray-400 max-w-md mb-8">
                  Multiple AI agents are now working in parallel to write your script, design thumbnails, and optimize SEO.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left w-full max-w-2xl">
                  {['outline', 'script', 'seo', 'thumbnail', 'shorts', 'broll', 'voiceover', 'summary'].map(type => (
                    <div key={type} className={`p-3 rounded-xl border ${assets[type]?.status === 'completed' ? 'bg-green-900/20 border-green-900/50 text-green-400' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                      <div className="flex items-center justify-between">
                        <span className="capitalize text-sm font-medium">{type}</span>
                        {assets[type]?.status === 'completed' && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'completed' && (
              <div className="bg-[#1A1A24] border border-gray-800 rounded-2xl p-8">
                <h2 className="text-2xl text-white font-serif mb-4">Workspace Editor</h2>
                <p className="text-gray-400">All assets have been successfully generated.</p>
                
                {/* Simplified output for MVP */}
                <div className="mt-8 space-y-8">
                  {Object.entries(assets).map(([type, asset]) => (
                    <div key={type} className="border border-gray-800 rounded-xl overflow-hidden">
                      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                        <h3 className="font-medium text-white capitalize">{type}</h3>
                        <span className="text-xs text-gray-500">Provider: {asset.provider_used}</span>
                      </div>
                      <div className="p-6 bg-[#1A1A24]">
                        <AssetViewer content={asset.content} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ type, asset }) {
  const status = asset?.status || 'pending'
  
  return (
    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-800/50 text-gray-400">
      <span className="capitalize">{type}</span>
      {status === 'completed' && <span className="w-2 h-2 rounded-full bg-green-500" />}
      {status === 'generating' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
      {status === 'error' && <span className="w-2 h-2 rounded-full bg-red-500" />}
      {status === 'pending' && <span className="w-2 h-2 rounded-full bg-gray-700" />}
    </button>
  )
}

// ──────────────────────────────────────────────
// IDEATION PICKER COMPONENT (Step 2)
// ──────────────────────────────────────────────
function IdeationPicker({ project, strategyAsset }) {
  const [selectedTitle, setSelectedTitle] = useState('')
  const [selectedHook, setSelectedHook] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const strategy = strategyAsset?.content || {}
  const titles = strategy.viralTitles || []
  const hooks = strategy.hookIdeas || []

  // Auto-select first options if none selected
  useEffect(() => {
    if (titles.length > 0 && !selectedTitle) setSelectedTitle(titles[0])
    if (hooks.length > 0 && !selectedHook) setSelectedHook(hooks[0])
  }, [titles, hooks, selectedTitle, selectedHook])

  const handleStartGeneration = async () => {
    setLoading(true)
    try {
      await api.post(`/projects/${project.id}/generate`, {
        selectedTitle,
        selectedHook
      })
      toast.success('Production started!')
      // Status will change to 'generating' automatically on next poll
    } catch (err) {
      toast.error(err.response?.data?.error || err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1A24] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-serif text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#D4AF37]" />
          Review Strategy
        </h2>
        <p className="text-gray-400">
          We've analyzed the topic. Pick the best angle and hook to guide the rest of the production.
        </p>
      </div>

      <div className="space-y-8">
        {/* Title Selection */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">1. Select a Video Title</h3>
          <div className="space-y-3">
            {titles.map((title, i) => (
              <button
                key={i}
                onClick={() => setSelectedTitle(title)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTitle === title 
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white' 
                    : 'bg-[#12121A] border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Hook Selection */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">2. Select an Opening Hook</h3>
          <div className="space-y-3">
            {hooks.map((hook, i) => (
              <button
                key={i}
                onClick={() => setSelectedHook(hook)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedHook === hook 
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white' 
                    : 'bg-[#12121A] border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {hook}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-800 flex justify-end">
        <button
          onClick={handleStartGeneration}
          disabled={loading || !selectedTitle || !selectedHook}
          className="flex items-center gap-2 py-3 px-8 border border-transparent rounded-xl shadow-lg shadow-amber-900/20 text-base font-bold text-[#0A0A0F] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <PlayCircle className="w-5 h-5" />
          )}
          Start Full Production
        </button>
      </div>
    </div>
  )
}
