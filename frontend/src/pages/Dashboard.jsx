import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FolderKanban, Star, Clock, MoreVertical, LayoutGrid, LayoutList, Library } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')

  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => api.get(`/projects?search=${search}`),
  })

  const projects = projectsRes?.data?.data || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-white tracking-wide">
            Your Studio
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your content pipelines and active projects
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/prompts')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#12121A] border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold rounded-xl transition-all"
          >
            <Library className="w-5 h-5" />
            Prompt Library
          </button>
          <button
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0A0F] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-900/20"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#12121A] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#12121A] p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-[#12121A] border border-gray-800/50 rounded-2xl">
          <FolderKanban className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
          <p className="text-gray-400 mb-6">Create your first project to start producing content.</p>
          <button
            onClick={() => navigate('/projects/new')}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-[#12121A] border border-gray-800/80 rounded-2xl p-5 hover:border-[#D4AF37]/50 hover:bg-[#161622] transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle top glow on hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/0 to-transparent group-hover:via-[#D4AF37]/50 transition-all duration-500" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                    {project.niche}
                  </span>
                  {project.is_favorite && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                </div>
                <button className="text-gray-600 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors" onClick={e => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                {project.name}
              </h3>
              
              <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">
                {project.topic}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
                <span className={`px-2 py-1 rounded-md capitalize ${
                  project.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                  project.status === 'generating' ? 'bg-blue-900/30 text-blue-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
