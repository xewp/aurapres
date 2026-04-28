import express from 'express'
import {
  generateContent,
  getHistory,
  getGenerationById,
  deleteGeneration,
} from '../controllers/generateController.js'
import { generateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// POST /api/generate — main generation endpoint
router.post('/', generateLimiter, generateContent)

// GET /api/generate/history — list past generations (paginated)
router.get('/history', getHistory)

// GET /api/generate/history/:id — full generation by ID
router.get('/history/:id', getGenerationById)

// DELETE /api/generate/history/:id — delete a generation
router.delete('/history/:id', deleteGeneration)

export default router
