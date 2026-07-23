/**
 * Provider Configuration — Task defaults, fallback chain, and model specs.
 *
 * This is the ONLY file you edit to change provider routing.
 * No code changes needed in controllers, adapters, or the frontend.
 */

// ─── Task → Default Provider mapping ────────────
// Keys match the `taskType` values used in API requests.
// Values are provider names matching the registered adapter names.
export const TASK_DEFAULTS = {
  // Content generation tasks
  research: 'gemini',       // Gemini's huge context window excels at research
  script: 'mistral',        // Mistral's structured output is great for scripts
  seo: 'gemini',            // Gemini understands SEO context deeply
  titles: 'groq',           // Groq's speed is perfect for quick title generation
  hooks: 'groq',            // Fast, punchy generations
  thumbnails: 'mistral',    // Good at translating concepts to visual descriptions
  storytelling: 'openrouter', // Access to creative models like Claude/Llama
  expansion: 'gemini',      // Long context for expanding existing content
  grammar: 'mistral',       // Strong multilingual/grammar capabilities
  translation: 'mistral',   // Multilingual strength
  summarization: 'gemini',  // Native long-document summarization
  creative: 'openrouter',   // Best stylistic writing via model diversity
  reasoning: 'gemini',      // Strong logical breakdown
  json: 'mistral',          // Reliable JSON mode adherence

  // Default fallback for unknown task types
  default: 'gemini',
}

// ─── Fallback chain ─────────────────────────────
// Ordered list of providers to try when the primary fails.
// The ProviderManager walks this list after the task default.
export const FALLBACK_CHAIN = [
  'gemini',
  'groq',
  'mistral',
  'openrouter',
  'huggingface',
]

// ─── Provider metadata ──────────────────────────
// Used by the /api/providers endpoint and the frontend settings page.
export const PROVIDER_META = {
  gemini: {
    name: 'gemini',
    label: 'Google Gemini',
    envKey: 'GEMINI_API_KEY',
    website: 'https://aistudio.google.com/apikey',
    freeTier: '15 RPM · 1M TPM · 1.5K RPD',
    bestFor: ['Research', 'Long Context', 'SEO', 'Summarization'],
    contextWindow: '1M+ tokens',
    speed: 'Medium',
  },
  mistral: {
    name: 'mistral',
    label: 'Mistral AI',
    envKey: 'MISTRAL_API_KEY',
    website: 'https://console.mistral.ai/api-keys',
    freeTier: 'Free tier with strict RPM',
    bestFor: ['Script Writing', 'JSON', 'Grammar', 'Translation'],
    contextWindow: '32k–128k tokens',
    speed: 'Fast',
  },
  groq: {
    name: 'groq',
    label: 'Groq',
    envKey: 'GROQ_API_KEY',
    website: 'https://console.groq.com/keys',
    freeTier: '30 RPM · 30K TPM · 14.4K RPD',
    bestFor: ['Fast Responses', 'Titles', 'Hooks', 'Real-time'],
    contextWindow: '8k–32k tokens',
    speed: 'Fastest',
  },
  openrouter: {
    name: 'openrouter',
    label: 'OpenRouter',
    envKey: 'OPENROUTER_API_KEY',
    website: 'https://openrouter.ai/keys',
    freeTier: 'Free models available (Llama 3, etc.)',
    bestFor: ['Creative Writing', 'Fallback', 'Model Variety'],
    contextWindow: 'Varies by model',
    speed: 'Medium',
  },
  huggingface: {
    name: 'huggingface',
    label: 'Hugging Face',
    envKey: 'HUGGINGFACE_API_KEY',
    website: 'https://huggingface.co/settings/tokens',
    freeTier: 'Rate-limited serverless inference',
    bestFor: ['Image Prompts', 'Niche Models', 'Open Source'],
    contextWindow: 'Varies by model',
    speed: 'Slow–Medium',
  },
}
