import { BaseProvider } from './BaseProvider.js'

/**
 * OpenRouterAdapter — Adapter for OpenRouter's model aggregation API.
 *
 * Best for: Fallbacks, accessing multiple models (Claude, Llama, etc.),
 * creative writing, testing different models.
 *
 * Free tier: Free models available (Llama 3, etc.)
 * Context: Varies by model.
 *
 * OpenRouter uses the OpenAI chat completions format.
 * The model field selects which upstream provider to use.
 */
export class OpenRouterAdapter extends BaseProvider {
  constructor({ apiKey, options = {} }) {
    super({
      name: 'openrouter',
      label: 'OpenRouter',
      apiKey,
      options,
    })
    this._baseUrl = options.baseUrl || 'https://openrouter.ai/api/v1'
    // Default to a free model; user can override per-task
    this._defaultModel = options.model || 'meta-llama/llama-3.3-70b-instruct:free'
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
          'HTTP-Referer': this.options.siteUrl || 'https://storyforge.ai',
          'X-Title': this.options.siteName || 'StoryForge AI',
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
        throw new Error(`OpenRouter API ${response.status}: ${errBody}`)
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
