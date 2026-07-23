import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Wand2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function NewProject() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [niches, setNiches] = useState([])
  
  const [formData, setFormData] = useState({
    topic: '',
    niche: 'general',
    targetAudience: '',
    tone: 'professional',
    scriptFormat: 'educational',
    desiredLength: '8-12 minutes'
  })

  useEffect(() => {
    // Fetch niche presets
    api.get('/niches').then(res => {
      if (res.data.success) setNiches(res.data.data)
    }).catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Create the project
      const { data } = await api.post('/projects', formData)
      const projectId = data.data.id

      // 2. Automatically trigger Ideation (Step 2)
      await api.post(`/projects/${projectId}/ideate`)
      
      toast.success('Project created! AI is brainstorming ideas...')
      
      // 3. Navigate to workspace
      navigate(`/projects/${projectId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-[#12121A] border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="mb-8 relative z-10">
          <h1 className="text-3xl font-bold font-serif text-white flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-[#D4AF37]" />
            New Content Project
          </h1>
          <p className="text-gray-400 mt-2">
            Tell the AI about your idea. It will research the topic and propose viral angles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What is the main topic? <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.topic}
              onChange={e => setFormData({...formData, topic: e.target.value})}
              placeholder="e.g. How artificial intelligence is changing the software engineering industry..."
              className="w-full p-4 bg-[#1A1A24] border border-gray-700/50 rounded-xl text-white focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content Niche</label>
              <select
                value={formData.niche}
                onChange={e => setFormData({...formData, niche: e.target.value})}
                className="w-full p-3 bg-[#1A1A24] border border-gray-700/50 rounded-xl text-white focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="general">General</option>
                {niches.map(n => (
                  <option key={n.slug} value={n.slug}>{n.emoji} {n.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                placeholder="e.g. Beginner programmers"
                className="w-full p-3 bg-[#1A1A24] border border-gray-700/50 rounded-xl text-white focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tone of Voice</label>
              <select
                value={formData.tone}
                onChange={e => setFormData({...formData, tone: e.target.value})}
                className="w-full p-3 bg-[#1A1A24] border border-gray-700/50 rounded-xl text-white focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="professional">Professional & Authoritative</option>
                <option value="casual">Casual & Friendly</option>
                <option value="dramatic">Dramatic & Cinematic</option>
                <option value="hype">High Energy & Urgent</option>
                <option value="minimalist">Concise & Direct</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
              <select
                value={formData.scriptFormat}
                onChange={e => setFormData({...formData, scriptFormat: e.target.value})}
                className="w-full p-3 bg-[#1A1A24] border border-gray-700/50 rounded-xl text-white focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="storytelling">Storytelling / Narrative</option>
                <option value="educational">Educational / Step-by-Step</option>
                <option value="documentary">Documentary / Journalistic</option>
                <option value="case_study">Case Study</option>
                <option value="top_list">Top List / Ranking</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <button
              type="submit"
              disabled={loading || !formData.topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-amber-900/20 text-base font-bold text-[#0A0A0F] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Start Project & Brainstorm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
