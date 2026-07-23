import { BaseProvider } from './BaseProvider.js'

/**
 * MistralAdapter — Adapter for Mistral AI's API.
 *
 * Best for: Script Writing, JSON Generation, Grammar, Translation, Code.
 * Free tier: Strict RPM but decent allowance.
 * Context: 32k-128k tokens.
 *
 * Uses fetch directly against the OpenAI-compatible REST API
 * to avoid adding the @mistralai/mistralai SDK as a hard dependency.
 */
export class MistralAdapter extends BaseProvider {
  constructor({ apiKey, options = {} }) {
    super({
      name: 'mistral',
      label: 'Mistral AI',
      apiKey,
      options,
    })
    this._baseUrl = options.baseUrl || 'https://api.mistral.ai/v1'
    this._defaultModel = options.model || 'mistral-small-latest'
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
        throw new Error(`Mistral API ${response.status}: ${errBody}`)
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
