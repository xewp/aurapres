import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseProvider } from './BaseProvider.js'

/**
 * GeminiAdapter — Adapter for Google's Gemini API.
 *
 * Best for: Research, Long Context, Summarization, SEO.
 * Free tier: 15 RPM, 1M TPM, 1.5K RPD.
 * Context: Up to 1M+ tokens.
 */
export class GeminiAdapter extends BaseProvider {
  constructor({ apiKey, options = {} }) {
    super({
      name: 'gemini',
      label: 'Google Gemini',
      apiKey,
      options,
    })
    this._client = new GoogleGenerativeAI(apiKey)
    this._defaultModel = options.model || 'gemini-2.0-flash'
  }

  async generateText({ systemPrompt, userPrompt, temperature = 0.7, maxTokens = 2048 }) {
    const start = Date.now()
    try {
      const model = this._client.getGenerativeModel({
        model: this._defaultModel,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      })

      // Gemini uses a single prompt string or contents array.
      // We combine system + user into the prompt for simplicity
      // (Gemini 2.0+ supports systemInstruction but the SDK handling varies).
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${userPrompt}`
        : userPrompt

      const result = await model.generateContent(fullPrompt)
      const text = result.response.text()

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
