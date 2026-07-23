/**
 * ProviderManager — Intelligent routing, retry, and fallback orchestrator.
 *
 * This is the ONLY module controllers should import for AI generation.
 * It handles:
 *  1. Task → Provider routing (based on defaults or user preferences)
 *  2. Retry with exponential backoff on transient errors (429, 500+)
 *  3. Automatic fallback to secondary/tertiary providers
 *  4. Health tracking (marks providers unhealthy after repeated failures)
 *
 * The frontend and controllers never know which provider actually served a request.
 */

import { getProvider, getAvailableProviders } from './ProviderRegistry.js'
import { TASK_DEFAULTS, FALLBACK_CHAIN } from './providerConfig.js'

// ─── Retry configuration ─────────────────────────
const MAX_RETRIES = 2
const BASE_DELAY_MS = 2000 // 2s, 4s, 8s with exponential backoff
const JITTER_MAX_MS = 1000

/**
 * Generate content using the best available provider for a given task.
 *
 * @param {object} params
 * @param {string} params.taskType        - e.g. 'research', 'script', 'seo', 'titles'
 * @param {string} params.systemPrompt    - System instructions
 * @param {string} params.userPrompt      - User input
 * @param {number} [params.temperature]   - 0-1
 * @param {number} [params.maxTokens]     - Max output tokens
 * @param {string} [params.preferredProvider] - User override (from settings)
 * @param {boolean} [params.jsonMode]     - If true, parse response as JSON
 *
 * @returns {Promise<{ text: string, json?: object, provider: string, latencyMs: number }>}
 */
export async function generate({
  taskType,
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxTokens = 2048,
  preferredProvider = null,
  jsonMode = false,
}) {
  // 1. Build the provider priority list for this request
  const providerChain = _buildProviderChain(taskType, preferredProvider)

  if (providerChain.length === 0) {
    throw new ProviderError(
      'No AI providers are configured. Please add at least one API key to your .env file.',
      'NO_PROVIDERS',
      null
    )
  }

  const errors = []

  // 2. Try each provider in the chain
  for (const providerName of providerChain) {
    const provider = getProvider(providerName)
    if (!provider || !provider.apiKey) continue
    // Skip providers marked unhealthy (but still try if it's the last resort)
    if (!provider.isHealthy() && providerName !== providerChain[providerChain.length - 1]) {
      continue
    }

    try {
      const result = await _callWithRetry(provider, {
        systemPrompt,
        userPrompt,
        temperature,
        maxTokens,
        jsonMode,
      })
      return result
    } catch (err) {
      errors.push({ provider: providerName, error: err.message })
      console.warn(`⚠️ Provider "${providerName}" failed: ${err.message}. Trying next...`)
      // Continue to next provider in the chain
    }
  }

  // 3. All providers failed
  throw new ProviderError(
    `All AI providers failed. Tried: ${providerChain.join(', ')}. Errors: ${errors.map((e) => `${e.provider}: ${e.error}`).join(' | ')}`,
    'ALL_PROVIDERS_FAILED',
    errors
  )
}

/**
 * Build the ordered list of providers to try for a given task.
 *
 * Priority order:
 *  1. User's preferred provider (if specified and available)
 *  2. Task-specific default from providerConfig
 *  3. Global fallback chain
 */
function _buildProviderChain(taskType, preferredProvider) {
  const chain = []
  const seen = new Set()

  const addIfAvailable = (name) => {
    if (name && !seen.has(name)) {
      const p = getProvider(name)
      if (p && p.apiKey) {
        chain.push(name)
        seen.add(name)
      }
    }
  }

  // 1. User preference
  addIfAvailable(preferredProvider)

  // 2. Task default
  const taskDefault = TASK_DEFAULTS[taskType]
  if (taskDefault) {
    addIfAvailable(taskDefault)
  }

  // 3. Fallback chain
  for (const name of FALLBACK_CHAIN) {
    addIfAvailable(name)
  }

  return chain
}

/**
 * Call a single provider with retry + exponential backoff.
 */
async function _callWithRetry(provider, { systemPrompt, userPrompt, temperature, maxTokens, jsonMode }) {
  let lastError = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const start = Date.now()

      let text
      let json = undefined

      if (jsonMode) {
        json = await provider.generateJSON({ systemPrompt, userPrompt, temperature, maxTokens })
        text = JSON.stringify(json)
      } else {
        text = await provider.generateText({ systemPrompt, userPrompt, temperature, maxTokens })
      }

      const latencyMs = Date.now() - start

      return {
        text,
        json,
        provider: provider.name,
        latencyMs,
      }
    } catch (err) {
      lastError = err
      const isRetryable = _isRetryableError(err)

      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * JITTER_MAX_MS
        console.warn(
          `⚠️ [${provider.name}] Retryable error (attempt ${attempt + 1}/${MAX_RETRIES}): ${err.message}. Retrying in ${Math.round(delay)}ms...`
        )
        await new Promise((r) => setTimeout(r, delay))
      } else {
        provider.markUnhealthy(err)
        throw err
      }
    }
  }

  // Should not reach here, but just in case
  throw lastError
}

/**
 * Determine if an error is transient and worth retrying.
 */
function _isRetryableError(err) {
  const msg = err.message || ''
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('timeout') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT')
  )
}

/**
 * Custom error class for provider failures.
 */
export class ProviderError extends Error {
  constructor(message, code, details = null) {
    super(message)
    this.name = 'ProviderError'
    this.code = code
    this.details = details
  }
}
