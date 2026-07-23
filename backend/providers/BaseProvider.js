/**
 * BaseProvider — Abstract interface for all AI provider adapters.
 *
 * Every concrete adapter (Gemini, Mistral, Groq, etc.) extends this class
 * and implements the abstract methods. The ProviderManager and controllers
 * ONLY interact with this interface, never with provider SDKs directly.
 *
 * Design decision: Using a class-based approach with method stubs
 * instead of TypeScript interfaces because the project uses plain JS.
 * Each method throws if not overridden, acting as a compile-time-like guard.
 */
export class BaseProvider {
  /**
   * @param {object} config
   * @param {string} config.name     - Machine-readable provider id (e.g. 'gemini')
   * @param {string} config.label    - Human-readable display name (e.g. 'Google Gemini')
   * @param {string} config.apiKey   - The API key (from env)
   * @param {object} [config.options] - Provider-specific extra options
   */
  constructor({ name, label, apiKey, options = {} }) {
    if (new.target === BaseProvider) {
      throw new Error('BaseProvider is abstract — do not instantiate directly.')
    }
    this.name = name
    this.label = label
    this.apiKey = apiKey
    this.options = options
    this._healthy = true
    this._lastError = null
    this._lastLatency = null
  }

  // ─── Core abstract methods ──────────────────────

  /**
   * Generate text from a prompt.
   * @param {object} params
   * @param {string} params.systemPrompt  - System instructions
   * @param {string} params.userPrompt    - User input
   * @param {number} [params.temperature] - Creativity (0-1)
   * @param {number} [params.maxTokens]   - Max output tokens
   * @returns {Promise<string>} Raw text response
   */
  async generateText(/* params */) {
    throw new Error(`${this.name}: generateText() not implemented.`)
  }

  /**
   * Generate and parse a JSON object from a prompt.
   * Uses generateText internally, then parses + validates.
   * @param {object} params  - Same as generateText
   * @returns {Promise<object>} Parsed JSON object
   */
  async generateJSON(params) {
    const raw = await this.generateText(params)
    return this._parseJSON(raw)
  }

  // ─── Health / status ────────────────────────────

  /**
   * Test if this provider is currently reachable.
   * Subclasses can override for custom health checks.
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      await this.generateText({
        systemPrompt: 'You are a test assistant.',
        userPrompt: 'Respond with exactly: {"status":"ok"}',
        temperature: 0,
        maxTokens: 20,
      })
      this._healthy = true
      this._lastError = null
      return true
    } catch (err) {
      this._healthy = false
      this._lastError = err.message
      return false
    }
  }

  /** @returns {boolean} */
  isHealthy() {
    return this._healthy
  }

  /** Mark provider as unhealthy (called by ProviderManager on failures). */
  markUnhealthy(error) {
    this._healthy = false
    this._lastError = error?.message || String(error)
  }

  /** Mark provider as healthy again (called after successful recovery). */
  markHealthy() {
    this._healthy = true
    this._lastError = null
  }

  /** @returns {object} Serializable status for the /api/providers endpoint. */
  getStatus() {
    return {
      name: this.name,
      label: this.label,
      healthy: this._healthy,
      lastError: this._lastError,
      lastLatency: this._lastLatency,
      configured: !!this.apiKey,
    }
  }

  // ─── Shared utilities ───────────────────────────

  /**
   * Parse raw AI text output into JSON.
   * Handles common issues: markdown fences, leading/trailing text.
   * @param {string} raw
   * @returns {object}
   */
  _parseJSON(raw) {
    let text = raw.trim()

    // Strip markdown code fences
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    text = text.replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    // Extract JSON object between first { and last }
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start !== -1 && end > start) {
      text = text.slice(start, end + 1)
    }

    // Try array if no object found
    if (!text.startsWith('{')) {
      const arrStart = text.indexOf('[')
      const arrEnd = text.lastIndexOf(']')
      if (arrStart !== -1 && arrEnd > arrStart) {
        text = text.slice(arrStart, arrEnd + 1)
      }
    }

    return JSON.parse(text)
  }

  /**
   * Record latency for monitoring.
   * @param {number} ms
   */
  _recordLatency(ms) {
    this._lastLatency = ms
  }
}
