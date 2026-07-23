/**
 * Provider Initialization — Bootstrap all configured providers at server startup.
 *
 * This module reads API keys from process.env, instantiates the adapters,
 * and registers them with the ProviderRegistry.
 *
 * Called once from server.js during startup.
 * To add a new provider: import the adapter, add a block below, done.
 */

import { registerProvider } from './ProviderRegistry.js'
import { GeminiAdapter } from './GeminiAdapter.js'
import { MistralAdapter } from './MistralAdapter.js'
import { GroqAdapter } from './GroqAdapter.js'
import { OpenRouterAdapter } from './OpenRouterAdapter.js'
import { HuggingFaceAdapter } from './HuggingFaceAdapter.js'

export function initializeProviders() {
  console.log('\n🔌 Initializing AI Providers...')

  let configuredCount = 0

  // ── Gemini ──────────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    registerProvider(
      new GeminiAdapter({
        apiKey: process.env.GEMINI_API_KEY,
        options: { model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' },
      })
    )
    configuredCount++
  } else {
    console.warn('⚠️ GEMINI_API_KEY not set — Gemini provider disabled.')
  }

  // ── Mistral ─────────────────────────────────────
  if (process.env.MISTRAL_API_KEY) {
    registerProvider(
      new MistralAdapter({
        apiKey: process.env.MISTRAL_API_KEY,
        options: { model: process.env.MISTRAL_MODEL || 'mistral-small-latest' },
      })
    )
    configuredCount++
  } else {
    console.warn('⚠️ MISTRAL_API_KEY not set — Mistral provider disabled.')
  }

  // ── Groq ────────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    registerProvider(
      new GroqAdapter({
        apiKey: process.env.GROQ_API_KEY,
        options: { model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile' },
      })
    )
    configuredCount++
  } else {
    console.warn('⚠️ GROQ_API_KEY not set — Groq provider disabled.')
  }

  // ── OpenRouter ──────────────────────────────────
  if (process.env.OPENROUTER_API_KEY) {
    registerProvider(
      new OpenRouterAdapter({
        apiKey: process.env.OPENROUTER_API_KEY,
        options: {
          model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
          siteUrl: process.env.CLIENT_URL || 'https://storyforge.ai',
          siteName: 'StoryForge AI',
        },
      })
    )
    configuredCount++
  } else {
    console.warn('⚠️ OPENROUTER_API_KEY not set — OpenRouter provider disabled.')
  }

  // ── Hugging Face ────────────────────────────────
  if (process.env.HUGGINGFACE_API_KEY) {
    registerProvider(
      new HuggingFaceAdapter({
        apiKey: process.env.HUGGINGFACE_API_KEY,
        options: { model: process.env.HUGGINGFACE_MODEL || 'deepseek-ai/DeepSeek-V3-0324' },
      })
    )
    configuredCount++
  } else {
    console.warn('⚠️ HUGGINGFACE_API_KEY not set — Hugging Face provider disabled.')
  }

  console.log(`🔌 ${configuredCount} AI provider(s) configured.\n`)

  if (configuredCount === 0) {
    console.error('❌ WARNING: No AI providers are configured! Add at least one API key to .env.')
  }

  return configuredCount
}
