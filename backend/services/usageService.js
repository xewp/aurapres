/**
 * Usage Log Service — Track AI requests for analytics and future billing.
 */

import { supabase } from './supabase.js'

/**
 * Log an AI generation request (fire-and-forget, non-blocking).
 */
export async function logUsage({
  userId = null,
  projectId = null,
  agentType,
  provider,
  model = null,
  tokensUsed = 0,
  durationMs = 0,
  statusCode = 200,
  success = true,
  error = null,
}) {
  try {
    await supabase.from('usage_logs').insert({
      user_id: userId,
      project_id: projectId,
      agent_type: agentType,
      provider,
      model,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
      status_code: statusCode,
      success,
      error,
    })
  } catch (err) {
    // Never let logging failures crash the main flow
    console.error('Usage log error (non-fatal):', err.message)
  }
}

/**
 * Get usage summary for a user (future analytics dashboard).
 */
export async function getUserUsageSummary(userId, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('usage_logs')
    .select('provider, agent_type, tokens_used, duration_ms, success')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())

  if (error) throw new Error(`Failed to fetch usage: ${error.message}`)

  // Aggregate
  const summary = {
    totalRequests: data.length,
    totalTokens: data.reduce((sum, r) => sum + (r.tokens_used || 0), 0),
    byProvider: {},
    byAgent: {},
    successRate: data.length > 0
      ? (data.filter((r) => r.success).length / data.length * 100).toFixed(1)
      : '100',
  }

  for (const row of data) {
    summary.byProvider[row.provider] = (summary.byProvider[row.provider] || 0) + 1
    summary.byAgent[row.agent_type] = (summary.byAgent[row.agent_type] || 0) + 1
  }

  return summary
}
