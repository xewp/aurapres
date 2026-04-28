import { useMutation } from '@tanstack/react-query'
import api from '../services/api'

export function useGenerate() {
  return useMutation({
    mutationFn: async ({ topic, voice }) => {
      const response = await api.post('/generate', { topic, voice })
      return response.data // { success, data, generationId, durationMs }
    },
  })
}
