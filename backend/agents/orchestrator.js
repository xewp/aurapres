/**
 * Parallel Generation Orchestrator
 *
 * Handles the coordinated execution of multiple AI agents.
 * Ensures dependencies (like research feeding into script) are respected
 * and uses p-limit to manage API rate limits.
 */

import pLimit from 'p-limit'
const delay = ms => new Promise(res => setTimeout(res, ms))
import {
  ResearchAgent,
  StrategyAgent,
  OutlineAgent,
  ScriptAgent,
  ShortsAgent,
  SeoAgent,
  ThumbnailAgent,
  BRollAgent,
  VoiceoverAgent,
  SummaryAgent,
} from './index.js'
import { getProject } from '../services/projectService.js'
import { getProjectAssets, markAssetError } from '../services/assetService.js'

// We limit to 1 concurrent generation per project to avoid hitting
// strict rate limits on free API tiers (like Gemini or Groq).
const limit = pLimit(1)

/**
 * STEP 2: IDEATION
 * Runs Research and Strategy agents in parallel.
 * This happens BEFORE the user selects a title/hook.
 *
 * @param {string} projectId
 * @param {string} userId
 */
export async function runIdeationPhase(projectId, userId) {
  const project = await getProject(userId, projectId)

  const context = {
    userId,
    topic: project.topic,
    niche: project.niche,
    targetAudience: project.target_audience,
    tone: project.tone,
    scriptFormat: project.script_format,
    desiredLength: project.desired_length,
  }

  // Run both in parallel
  const results = await Promise.allSettled([
    limit(() => ResearchAgent.run(projectId, context)),
    limit(() => StrategyAgent.run(projectId, context)),
  ])

  // Process results
  const researchRes = results[0].status === 'fulfilled' ? results[0].value.content : null
  const strategyRes = results[1].status === 'fulfilled' ? results[1].value.content : null

  return {
    research: researchRes,
    strategy: strategyRes,
    errors: results.filter(r => r.status === 'rejected').map(r => r.reason.message),
  }
}

/**
 * STEP 3: ASSET GENERATION (Parallel Phase)
 * Runs the remaining 8 agents after the user has selected their Title & Hook.
 * Respects data dependencies (Outline -> Script -> Everything else).
 *
 * @param {string} projectId
 * @param {string} userId
 */
export async function runGenerationPhase(projectId, userId) {
  const project = await getProject(userId, projectId)
  const existingAssets = await getProjectAssets(projectId)

  // Map existing assets for easy access
  const assets = existingAssets.reduce((acc, a) => {
    acc[a.asset_type] = a.content
    return acc
  }, {})

  if (!assets.research || !assets.strategy) {
    throw new Error('Research and Strategy must be completed before running full generation.')
  }

  const baseContext = {
    userId,
    topic: project.topic,
    niche: project.niche,
    targetAudience: project.target_audience,
    tone: project.tone,
    scriptFormat: project.script_format,
    desiredLength: project.desired_length,
    selectedTitle: project.selected_title,
    selectedHook: project.selected_hook,
    research: assets.research,
    strategy: assets.strategy,
  }

  const status = { completed: [], failed: [] }

  try {
    // 1. Generate Outline first (it needs strategy, provides structure)
    const outlineContext = { ...baseContext }
    const outlineResult = await OutlineAgent.run(projectId, outlineContext)
    status.completed.push('outline')

    // 2. Generate Script (it needs the outline)
    const scriptContext = { ...baseContext, outline: outlineResult.content }
    const scriptResult = await ScriptAgent.run(projectId, scriptContext)
    status.completed.push('script')

    // 3. Generate all dependents in parallel (they all need the script)
    const finalContext = { ...scriptContext, script: scriptResult.content }

    const finalAgents = [
      ShortsAgent,
      SeoAgent,
      ThumbnailAgent,
      BRollAgent,
      VoiceoverAgent,
      SummaryAgent,
    ]

    const parallelResults = await Promise.allSettled(
      finalAgents.map(agent => limit(async () => {
        // Add a 2-second delay before each task to prevent RPM/TPM bursts
        await delay(2000)
        return agent.run(projectId, finalContext)
      }))
    )

    // Collect status
    parallelResults.forEach((res, index) => {
      const agentType = finalAgents[index].assetType
      if (res.status === 'fulfilled') {
        status.completed.push(agentType)
      } else {
        status.failed.push({ type: agentType, error: res.reason.message })
      }
    })
  } catch (err) {
    // If outline or script fails, the whole pipeline breaks because downstream depends on them
    console.error('Critical generation pipeline failure:', err.message)
    throw new Error(`Generation pipeline failed: ${err.message}`)
  }

  return status
}

/**
 * REGENERATE SINGLE ASSET
 * Regenerates a specific asset. Grabs existing downstream dependencies if needed.
 *
 * @param {string} projectId
 * @param {string} userId
 * @param {string} assetType
 */
export async function regenerateAsset(projectId, userId, assetType) {
  const project = await getProject(userId, projectId)
  const existingAssets = await getProjectAssets(projectId)

  const assets = existingAssets.reduce((acc, a) => {
    acc[a.asset_type] = a.content
    return acc
  }, {})

  const context = {
    userId,
    topic: project.topic,
    niche: project.niche,
    targetAudience: project.target_audience,
    tone: project.tone,
    scriptFormat: project.script_format,
    desiredLength: project.desired_length,
    selectedTitle: project.selected_title,
    selectedHook: project.selected_hook,
    research: assets.research,
    strategy: assets.strategy,
    outline: assets.outline,
    script: assets.script,
  }

  // Find the right agent
  const agentMap = {
    research: ResearchAgent,
    strategy: StrategyAgent,
    outline: OutlineAgent,
    script: ScriptAgent,
    shorts: ShortsAgent,
    seo: SeoAgent,
    thumbnail: ThumbnailAgent,
    broll: BRollAgent,
    voiceover: VoiceoverAgent,
    summary: SummaryAgent,
  }

  const agent = agentMap[assetType]
  if (!agent) {
    throw new Error(`Unknown asset type: ${assetType}`)
  }

  return agent.run(projectId, context)
}
