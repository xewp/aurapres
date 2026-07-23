import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, RotateCcw, Save, Loader2, Library } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Prompts() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingAgent, setEditingAgent] = useState(null)
  const [editText, setEditText] = useState('')

  const { data: promptsRes, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => api.get('/prompts')
  })

  const updateMutation = useMutation({
    mutationFn: ({ agentType, systemPrompt }) => api.put(`/prompts/${agentType}`, { systemPrompt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      setEditingAgent(null)
      toast.success('Prompt updated successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message)
    }
  })

  const resetMutation = useMutation({
    mutationFn: (agentType) => api.delete(`/prompts/${agentType}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      toast.success('Reset to system default')
    }
  })

  const prompts = promptsRes?.data?.data || []

  const handleEdit = (prompt) => {
    setEditingAgent(prompt.agentType)
    setEditText(prompt.systemPrompt)
  }

  const handleSave = (agentType) => {
    if (!editText.trim()) {
      toast.error('Prompt cannot be empty')
      return
    }
    updateMutation.mutate({ agentType, systemPrompt: editText })
  }

  const handleReset = (agentType) => {
    if (confirm('Are you sure you want to reset this prompt to the system default? Your custom changes will be lost.')) {
      resetMutation.mutate(agentType)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-serif text-white flex items-center gap-3">
            <Library className="w-8 h-8 text-[#D4AF37]" />
            Prompt Library
          </h1>
          <p className="text-gray-400 mt-1">
            Customize the system instructions for each AI Agent.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      ) : (
        <div className="space-y-6">
          {prompts.map((prompt) => (
            <div key={prompt.agentType} className="bg-[#12121A] border border-gray-800 rounded-2xl overflow-hidden transition-all hover:border-gray-700">
              <div className="bg-[#1A1A24] px-6 py-4 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white capitalize">
                    {prompt.agentType.replace('_', ' ')}
                  </h3>
                  {prompt.isCustom ? (
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-amber-900/30 text-amber-500 border border-amber-900/50">
                      Custom
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                      System Default
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {editingAgent === prompt.agentType ? (
                    <>
                      <button
                        onClick={() => setEditingAgent(null)}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(prompt.agentType)}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37] text-black text-sm font-semibold rounded-lg hover:bg-[#E5C158] transition-colors disabled:opacity-50"
                      >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      {prompt.isCustom && (
                        <button
                          onClick={() => handleReset(prompt.agentType)}
                          disabled={resetMutation.isPending}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors bg-gray-900 rounded-lg"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(prompt)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-800"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6">
                {editingAgent === prompt.agentType ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full h-64 p-4 bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl text-gray-300 font-mono text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors resize-y"
                    placeholder="Enter system prompt instructions..."
                  />
                ) : (
                  <pre className="text-gray-400 font-mono text-sm whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                    {prompt.systemPrompt}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
