/**
 * Project Routes — CRUD + duplicate operations.
 *
 * All routes are protected by requireAuth middleware.
 */

import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  duplicateProject,
} from '../controllers/projectController.js'
import * as agentController from '../controllers/agentController.js'

const router = express.Router()

// All project routes require authentication
router.use(requireAuth)

// POST   /api/projects          — Create a new project
router.post('/', createProject)

// GET    /api/projects          — List projects (with filters/search)
router.get('/', listProjects)

// GET    /api/projects/:id      — Get a single project + assets
router.get('/:id', getProject)

// PATCH  /api/projects/:id      — Update project fields
router.patch('/:id', updateProject)

// DELETE /api/projects/:id      — Delete a project
router.delete('/:id', deleteProject)

// POST   /api/projects/:id/duplicate — Duplicate a project
router.post('/:id/duplicate', duplicateProject)

// ──────────────────────────────────────────────
// Agent Orchestration Routes
// ──────────────────────────────────────────────

// POST   /api/projects/:id/ideate    — Trigger Research & Strategy
router.post('/:id/ideate', agentController.ideateProject)

// POST   /api/projects/:id/generate  — Trigger full 10-part generation
router.post('/:id/generate', agentController.generateProject)

// POST   /api/projects/:id/asset/:type/regenerate — Regenerate a single asset
router.post('/:id/asset/:type/regenerate', agentController.regenerateAsset)

export default router
