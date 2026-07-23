/**
 * ProviderRegistry — Central registry for all AI provider adapters.
 *
 * Acts as a plugin system: providers register themselves at startup,
 * and the rest of the application queries the registry without knowing
 * which concrete adapters exist.
 *
 * Design: Singleton pattern. One registry per server process.
 */

/** @type {Map<string, import('./BaseProvider.js').BaseProvider>} */
const providers = new Map()

/**
 * Register a provider adapter instance.
 * @param {import('./BaseProvider.js').BaseProvider} provider
 */
export function registerProvider(provider) {
  if (!provider?.name) {
    throw new Error('Cannot register provider without a name.')
  }
  if (providers.has(provider.name)) {
    console.warn(`⚠️ Provider "${provider.name}" is already registered. Overwriting.`)
  }
  providers.set(provider.name, provider)
  console.log(`✅ Provider registered: ${provider.label} (${provider.name})`)
}

/**
 * Get a provider by name.
 * @param {string} name
 * @returns {import('./BaseProvider.js').BaseProvider | undefined}
 */
export function getProvider(name) {
  return providers.get(name)
}

/**
 * Get all registered providers.
 * @returns {import('./BaseProvider.js').BaseProvider[]}
 */
export function getAllProviders() {
  return Array.from(providers.values())
}

/**
 * Get all configured (have API key) and healthy providers.
 * @returns {import('./BaseProvider.js').BaseProvider[]}
 */
export function getAvailableProviders() {
  return getAllProviders().filter((p) => p.apiKey && p.isHealthy())
}

/**
 * Get status of all providers (for /api/providers endpoint).
 * @returns {object[]}
 */
export function getProvidersStatus() {
  return getAllProviders().map((p) => p.getStatus())
}

/**
 * Check if a provider exists and is configured.
 * @param {string} name
 * @returns {boolean}
 */
export function isProviderAvailable(name) {
  const p = providers.get(name)
  return !!(p && p.apiKey)
}
