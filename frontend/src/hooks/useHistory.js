import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

// Fetch history list (lightweight — no full output)
export function useHistory(page = 1) {
  return useQuery({
    queryKey: ['history', page],
    queryFn: async () => {
      const response = await api.get(`/generate/history?page=${page}&limit=10`)
      return response.data // { success, data, pagination }
    },
    staleTime: 1000 * 30, // 30 seconds
  })
}

// Fetch a single full generation
export function useGenerationById(id) {
  return useQuery({
    queryKey: ['generation', id],
    queryFn: async () => {
      const response = await api.get(`/generate/history/${id}`)
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

// Delete a generation with optimistic update
export function useDeleteGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/generate/history/${id}`)
      return response.data
    },
    onSuccess: () => {
      // Invalidate all history pages
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}
