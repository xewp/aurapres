import { BaseProvider } from './BaseProvider.js'

/**
 * GroqAdapter — Adapter for Groq's LPU inference API.
 *
 * Best for: Fast Responses, Titles, Hooks, Real-time generation.
 * Free tier: 30 RPM, 30K TPM, 14.4K RPD.
 * Context: 8k-32k tokens.
 * Speed: 2000+ tokens/sec (fastest available).
 *
 * Uses the OpenAI-compatible REST endpoint directly.
 */
export class GroqAdapter extends BaseProvider {
  constructor({ apiKey, options = {} }) {
    super({
      name: 'groq',
      label: 'Groq',
      apiKey,
      options,
    })
    this._baseUrl = options.baseUrl || 'https://api.groq.com/openai/v1'
    this._defaultModel = options.model || 'llama-3.3-70b-versatile'
  }

  async generateText({ systemPrompt, userPrompt, temperature = 0.7, maxTokens = 2048 }) {
    const start = Date.now()
    try {
      const messages = []
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      messages.push({ role: 'user', content: userPrompt })

      const response = await fetch(`${this._baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this._defaultModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`Groq API ${response.status}: ${errBody}`)
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ''

      this._recordLatency(Date.now() - start)
      this.markHealthy()
      return text
    } catch (err) {
      this._recordLatency(Date.now() - start)
      this.markUnhealthy(err)
      throw err
    }
  }
}
