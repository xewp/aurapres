import { BaseProvider } from './BaseProvider.js'

/**
 * HuggingFaceAdapter — Adapter for Hugging Face Inference API.
 *
 * Best for: Image prompt generation, niche tasks, open-source models.
 * Free tier: Rate-limited serverless inference.
 * Context: Varies by model.
 *
 * Uses the HF Inference API (OpenAI-compatible text generation endpoint).
 */
export class HuggingFaceAdapter extends BaseProvider {
  constructor({ apiKey, options = {} }) {
    super({
      name: 'huggingface',
      label: 'Hugging Face',
      apiKey,
      options,
    })
    this._baseUrl = options.baseUrl || 'https://router.huggingface.co/novita/v3/openai'
    this._defaultModel = options.model || 'deepseek-ai/DeepSeek-V3-0324'
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
        throw new Error(`HuggingFace API ${response.status}: ${errBody}`)
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
        || data?.[0]?.generated_text
        || ''

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
