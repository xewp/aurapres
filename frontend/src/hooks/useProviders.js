import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

/**
 * Hook to fetch available AI providers and their status from the backend.
 * Used by the ProviderSelector component and any provider-aware UI.
 */
export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await api.get('/providers')
      return response.data // { success, data: [...providers], fallbackChain }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes — providers don't change often
    retry: 1,
  })
}
