/**
 * Agent Instances — Export initialized instances of all 10 AI Agents.
 */

import { BaseAgent } from './BaseAgent.js'

export const ResearchAgent = new BaseAgent({
  agentType: 'research_agent',
  assetType: 'research',
  taskType: 'research',
  temperature: 0.7,
  maxTokens: 3000,
})

export const StrategyAgent = new BaseAgent({
  agentType: 'strategy_agent',
  assetType: 'strategy',
  taskType: 'strategy', // maps to defaults in providerConfig
  temperature: 0.8,
  maxTokens: 2000,
})

export const OutlineAgent = new BaseAgent({
  agentType: 'outline_agent',
  assetType: 'outline',
  taskType: 'script', // Structuring
  temperature: 0.6,
  maxTokens: 2500,
})

export const ScriptAgent = new BaseAgent({
  agentType: 'script_agent',
  assetType: 'script',
  taskType: 'script', // Mistral excelling here
  temperature: 0.8,
  maxTokens: 8000, // Long-form script needs high limit
})

export const ShortsAgent = new BaseAgent({
  agentType: 'shorts_agent',
  assetType: 'shorts',
  taskType: 'script',
  temperature: 0.8,
  maxTokens: 3000,
})

export const SeoAgent = new BaseAgent({
  agentType: 'seo_agent',
  assetType: 'seo',
  taskType: 'seo',
  temperature: 0.7,
  maxTokens: 2000,
})

export const ThumbnailAgent = new BaseAgent({
  agentType: 'thumbnail_agent',
  assetType: 'thumbnail',
  taskType: 'thumbnails', // Visual description
  temperature: 0.8,
  maxTokens: 1500,
})

export const BRollAgent = new BaseAgent({
  agentType: 'broll_agent',
  assetType: 'broll',
  taskType: 'reasoning',
  temperature: 0.7,
  maxTokens: 3000,
})

export const VoiceoverAgent = new BaseAgent({
  agentType: 'voiceover_agent',
  assetType: 'voiceover',
  taskType: 'script',
  temperature: 0.7,
  maxTokens: 2000,
})

export const SummaryAgent = new BaseAgent({
  agentType: 'summary_agent',
  assetType: 'summary',
  taskType: 'summarization',
  temperature: 0.6,
  maxTokens: 1500,
})
