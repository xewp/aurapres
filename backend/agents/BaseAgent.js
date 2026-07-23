/**
 * BaseAgent — Abstract base class for all AI agents.
 *
 * Each agent:
 *  1. Gets its prompt from the PromptManager
 *  2. Calls the ProviderManager to generate content
 *  3. Validates the output
 *  4. Saves the result as a project asset
 *
 * Subclasses only need to define:
 *  - agentType (string)
 *  - taskType (for provider routing)
 *  - temperature
 *  - maxTokens
 */

import { generate } from '../providers/index.js'
import { getPrompt } from './promptManager.js'
import { upsertAsset, markAssetGenerating, markAssetError } from '../services/assetService.js'
import { logUsage } from '../services/usageService.js'

export class BaseAgent {
  constructor({ agentType, assetType, taskType, temperature = 0.7, maxTokens = 2048 }) {
    this.agentType = agentType
    this.assetType = assetType       // Maps to project_assets.asset_type
    this.taskType = taskType         // Maps to providerConfig task routing
    this.temperature = temperature
    this.maxTokens = maxTokens
  }

  /**
   * Run this agent for a specific project.
   *
   * @param {string} projectId - The project UUID
   * @param {object} context - Full project context (topic, niche, research, etc.)
   * @param {string} [preferredProvider] - User override
   * @returns {Promise<{ content: object, provider: string, durationMs: number }>}
   */
  async run(projectId, context, preferredProvider = null) {
    const startTime = Date.now()

    try {
      // Mark asset as generating (for real-time UI updates)
      await markAssetGenerating(projectId, this.assetType).catch(() => {})

      // Get the prompt
      const { systemPrompt, userPrompt } = await getPrompt(this.agentType, context)

      // Call the AI provider
      const result = await generate({
        taskType: this.taskType,
        systemPrompt,
        userPrompt,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        preferredProvider,
        jsonMode: true,
      })

      const durationMs = Date.now() - startTime

      // Validate the output
      if (!result.json || typeof result.json !== 'object') {
        throw new Error(`${this.agentType} returned invalid JSON`)
      }

      // Save the asset
      const asset = await upsertAsset(projectId, this.assetType, {
        content: result.json,
        providerUsed: result.provider,
        durationMs,
        status: 'completed',
      })

      // Log usage (non-blocking)
      logUsage({
        userId: context.userId || null,
        projectId,
        agentType: this.agentType,
        provider: result.provider,
        durationMs,
        success: true,
      }).catch(() => {})

      return {
        content: result.json,
        provider: result.provider,
        durationMs,
        assetId: asset?.id,
      }
    } catch (err) {
      const durationMs = Date.now() - startTime

      // Mark asset as error
      await markAssetError(projectId, this.assetType, err.message).catch(() => {})

      // Log failed usage
      logUsage({
        userId: context.userId || null,
        projectId,
        agentType: this.agentType,
        provider: 'unknown',
        durationMs,
        success: false,
        error: err.message,
      }).catch(() => {})

      throw err
    }
  }
}
