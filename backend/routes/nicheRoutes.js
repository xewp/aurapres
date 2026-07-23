/**
 * Niche Preset Routes — Public read-only access to niche configurations.
 */

import express from 'express'
import { supabase } from '../services/supabase.js'

const router = express.Router()

// GET /api/niches — List all active niche presets
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('niche_presets')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return res.status(200).json({ success: true, data })
  } catch (err) {
    console.error('❌ Niche presets error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch niche presets.' })
  }
})

export default router
