/**
 * Agent Controller — HTTP handlers for triggering AI agents via the orchestrator.
 */

import * as orchestrator from '../agents/orchestrator.js'
import * as projectService from '../services/projectService.js'

// ──────────────────────────────────────────────
// POST /api/projects/:id/ideate
// Triggers Research & Strategy in parallel
// ──────────────────────────────────────────────
export const ideateProject = async (req, res) => {
  try {
    const { id } = req.params

    // Ensure project exists and belongs to user
    await projectService.getProject(req.userId, id)

    // Update project status to 'ideation'
    await projectService.updateProject(req.userId, id, { status: 'ideation' })

    // Run ideation (non-blocking if we want immediate return, but typically we await to give initial feedback)
    // For MVP, we await it so the frontend can immediately show the results.
    const result = await orchestrator.runIdeationPhase(id, req.userId)

    // Update project status so the frontend knows it's time for Step 2 (Picker)
    await projectService.updateProject(req.userId, id, { status: 'research_ready' })

    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    console.error('❌ Ideation error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ──────────────────────────────────────────────
// POST /api/projects/:id/generate
// Triggers Outline -> Script -> [All other assets]
// ──────────────────────────────────────────────
export const generateProject = async (req, res) => {
  try {
    const { id } = req.params
    const { selectedTitle, selectedHook } = req.body

    // Save selections before running
    await projectService.updateProject(req.userId, id, {
      selected_title: selectedTitle,
      selected_hook: selectedHook,
      status: 'generating',
    })

    // Start generation (We DO NOT await this entirely for the HTTP response,
    // we want to return a 202 Accepted so the frontend can poll or rely on websockets/status updates)
    // However, for MVP, if you want a simpler architecture, we can await it.
    // Given 8 parallel calls, it might take 20-30 seconds.
    // Let's run it asynchronously and return 202.

    orchestrator.runGenerationPhase(id, req.userId)
      .then(async () => {
        await projectService.updateProject(req.userId, id, { status: 'completed' })
      })
      .catch(async (err) => {
        console.error(`Generation failed for project ${id}:`, err)
        await projectService.updateProject(req.userId, id, { status: 'error' })
      })

    return res.status(202).json({
      success: true,
      message: 'Generation started. Poll /api/projects/:id to check asset status.',
    })
  } catch (err) {
    console.error('❌ Generation start error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ──────────────────────────────────────────────
// POST /api/projects/:id/asset/:type/regenerate
// ──────────────────────────────────────────────
export const regenerateAsset = async (req, res) => {
  try {
    const { id, type } = req.params

    // Verify ownership
    await projectService.getProject(req.userId, id)

    // Trigger regeneration
    const result = await orchestrator.regenerateAsset(id, req.userId, type)

    return res.status(200).json({ success: true, data: result.content })
  } catch (err) {
    console.error(`❌ Regenerate asset [${req.params.type}] error:`, err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}
