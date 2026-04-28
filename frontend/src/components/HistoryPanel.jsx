import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useHistory, useDeleteGeneration, useGenerationById } from '../hooks/useHistory'
import HistoryCard from './HistoryCard'
import { useState } from 'react'

function SkeletonCard() {
  return (
    <div className="p-4 space-y-3 rounded-2xl border border-white/5 bg-surface">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  )
}

export default function HistoryPanel({ onClose, onSelect }) {
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)

  const { data, isLoading, isError } = useHistory(page)
  const { data: fullGeneration, isLoading: loadingFull } = useGenerationById(selectedId)
  const { mutate: deleteGen, isPending: isDeleting } = useDeleteGeneration()

  const generations = data?.data || []
  const pagination = data?.pagination || {}

  const handleSelect = (generation) => {
    if (generation.output?.linkedin) {
      // Already has output data (from cache)
      onSelect(generation)
    } else {
      // Fetch full generation
      setSelectedId(generation._id)
    }
  }

  // When full generation loads, pass it upstream
  if (fullGeneration?.data && !loadingFull) {
    onSelect(fullGeneration.data)
    setSelectedId(null)
  }

  const handleDelete = (id) => {
    deleteGen(id, {
      onSuccess: () => toast.success('Deleted', { icon: '🗑' }),
      onError: () => toast.error('Delete failed'),
    })
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-sm z-50
                   bg-dark-800 border-l border-white/8 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div>
            <h2 className="text-lg font-semibold text-white">Generation History</h2>
            {pagination.total !== undefined && (
              <p className="text-xs text-white/30 mt-0.5">{pagination.total} total generations</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white
                       transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : isError ? (
            <div className="text-center py-12 text-white/30 text-sm">
              Failed to load history. Check your connection.
            </div>
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10
                             flex items-center justify-center text-2xl">
                ✦
              </div>
              <div>
                <p className="text-white/50 font-medium">No generations yet</p>
                <p className="text-white/25 text-sm mt-1">Start creating to see history here.</p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {generations.map((gen) => (
                <HistoryCard
                  key={gen._id}
                  generation={gen}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-white/8 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-ghost px-4 py-2 text-sm disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-xs text-white/30">
              {page} / {pagination.pages}
            </span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-ghost px-4 py-2 text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}
