import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getPrompts, updatePrompt, resetPrompt } from '../controllers/promptController.js'

const router = express.Router()

// All prompt routes require authentication
router.use(requireAuth)

// GET    /api/prompts              — List all active prompts for the user
router.get('/', getPrompts)

// PUT    /api/prompts/:agentType   — Update a custom prompt
router.put('/:agentType', updatePrompt)

// DELETE /api/prompts/:agentType   — Reset prompt to system default
router.delete('/:agentType', resetPrompt)

export default router
