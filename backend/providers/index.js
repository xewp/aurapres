/**
 * Barrel export for the providers module.
 * Import everything from 'providers/index.js' in one line.
 */
export { BaseProvider } from './BaseProvider.js'
export { GeminiAdapter } from './GeminiAdapter.js'
export { MistralAdapter } from './MistralAdapter.js'
export { GroqAdapter } from './GroqAdapter.js'
export { OpenRouterAdapter } from './OpenRouterAdapter.js'
export { HuggingFaceAdapter } from './HuggingFaceAdapter.js'
export { registerProvider, getProvider, getAllProviders, getAvailableProviders, getProvidersStatus, isProviderAvailable } from './ProviderRegistry.js'
export { generate, ProviderError } from './ProviderManager.js'
export { TASK_DEFAULTS, FALLBACK_CHAIN, PROVIDER_META } from './providerConfig.js'
export { initializeProviders } from './initProviders.js'
