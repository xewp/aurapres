/**
 * Provider Routes — API for provider status, health checks, and metadata.
 *
 * GET  /api/providers          — List all registered providers + status
 * GET  /api/providers/config   — Get task → provider defaults
 * POST /api/providers/:name/test — Test a specific provider's connectivity
 */

import express from 'express'
import {
  getProvidersStatus,
  getProvider,
  isProviderAvailable,
  TASK_DEFAULTS,
  PROVIDER_META,
  FALLBACK_CHAIN,
} from '../providers/index.js'

const router = express.Router()

// ──────────────────────────────────────────────
// GET /api/providers — List all providers with status
// ──────────────────────────────────────────────
router.get('/', (req, res) => {
  const status = getProvidersStatus()

  // Enrich with metadata
  const enriched = status.map((s) => ({
    ...s,
    ...(PROVIDER_META[s.name] || {}),
  }))

  return res.status(200).json({
    success: true,
    data: enriched,
    fallbackChain: FALLBACK_CHAIN,
  })
})

// ──────────────────────────────────────────────
// GET /api/providers/config — Task → provider mapping
// ──────────────────────────────────────────────
router.get('/config', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      taskDefaults: TASK_DEFAULTS,
      fallbackChain: FALLBACK_CHAIN,
      providerMeta: PROVIDER_META,
    },
  })
})

// ──────────────────────────────────────────────
// POST /api/providers/:name/test — Health check a specific provider
// ──────────────────────────────────────────────
router.post('/:name/test', async (req, res) => {
  const { name } = req.params

  if (!isProviderAvailable(name)) {
    return res.status(404).json({
      success: false,
      error: `Provider "${name}" is not configured. Add its API key to .env.`,
    })
  }

  const provider = getProvider(name)

  try {
    const start = Date.now()
    const healthy = await provider.healthCheck()
    const latencyMs = Date.now() - start

    return res.status(200).json({
      success: true,
      data: {
        provider: name,
        healthy,
        latencyMs,
        message: healthy ? 'Provider is responding.' : 'Provider health check failed.',
      },
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Health check failed: ${err.message}`,
    })
  }
})

export default router
