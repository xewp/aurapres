import { useMutation } from '@tanstack/react-query'
import api from '../services/api'

export function useGenerate() {
  return useMutation({
    mutationFn: async ({ topic, voice, provider }) => {
      const response = await api.post('/generate', { topic, voice, provider })
      return response.data // { success, data, generationId, provider, durationMs }
    },
  })
}
