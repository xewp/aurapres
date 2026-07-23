/**
 * Project Controller — HTTP handlers for project CRUD operations.
 *
 * All routes require authentication via Supabase Auth.
 * The userId is extracted from the verified JWT in auth middleware.
 */

import * as projectService from '../services/projectService.js'
import { getProjectAssets } from '../services/assetService.js'

// ──────────────────────────────────────────────
// POST /api/projects
// ──────────────────────────────────────────────
export const createProject = async (req, res) => {
  try {
    const { name, topic, niche, targetAudience, tone, scriptFormat, desiredLength } = req.body

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Topic is required.' })
    }

    const project = await projectService.createProject(req.userId, {
      name: name || topic.trim().slice(0, 60),
      topic: topic.trim(),
      niche,
      targetAudience,
      tone,
      scriptFormat,
      desiredLength,
    })

    return res.status(201).json({ success: true, data: project })
  } catch (err) {
    console.error('❌ Create project error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ──────────────────────────────────────────────
// GET /api/projects
// ──────────────────────────────────────────────
export const listProjects = async (req, res) => {
  try {
    const { page, limit, niche, status, search, favorites } = req.query

    const result = await projectService.listProjects(req.userId, {
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 20, 50),
      niche,
      status,
      search,
      favorites: favorites === 'true',
    })

    return res.status(200).json({ success: true, ...result })
  } catch (err) {
    console.error('❌ List projects error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ──────────────────────────────────────────────
// GET /api/projects/:id
// Returns project + all assets
// ──────────────────────────────────────────────
export const getProject = async (req, res) => {
  try {
    const project = await projectService.getProject(req.userId, req.params.id)
    const assets = await getProjectAssets(req.params.id)

    return res.status(200).json({
      success: true,
      data: {
        ...project,
        assets: assets.reduce((acc, asset) => {
          acc[asset.asset_type] = asset
          return acc
        }, {}),
      },
    })
  } catch (err) {
    console.error('❌ Get project error:', err.message)
    return res.status(404).json({ success: false, error: 'Project not found.' })
  }
}

// ──────────────────────────────────────────────
// PATCH /api/projects/:id
// ──────────────────────────────────────────────
export const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.userId, req.params.id, req.body)
    return res.status(200).json({ success: true, data: project })
  } catch (err) {
    console.error('❌ Update project error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ──────────────────────────────────────────────
// DELETE /api/projects/:id
// ──────────────────────────────────────────────
export const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.userId, req.params.id)
    return res.status(200).json({ success: true, message: 'Project deleted.' })
  } catch (err) {
    console.error('❌ Delete project error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ──────────────────────────────────────────────
// POST /api/projects/:id/duplicate
// ──────────────────────────────────────────────
export const duplicateProject = async (req, res) => {
  try {
    const project = await projectService.duplicateProject(req.userId, req.params.id)
    return res.status(201).json({ success: true, data: project })
  } catch (err) {
    console.error('❌ Duplicate project error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}
