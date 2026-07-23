/**
 * Prompt Service — Supabase CRUD for the prompts table.
 *
 * Supports:
 *  - System defaults (user_id IS NULL)
 *  - User-customized prompts
 *  - Duplicate, restore defaults, import/export
 */

import { supabase } from './supabase.js'

// ──────────────────────────────────────────────
// GET active prompt for a specific agent
// Priority: user custom > system default
// ──────────────────────────────────────────────
export async function getActivePrompt(userId, agentType) {
  // First try user's custom prompt
  if (userId) {
    const { data: userPrompt } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_type', agentType)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (userPrompt) return userPrompt
  }

  // Fall back to system default
  const { data: systemPrompt, error } = await supabase
    .from('prompts')
    .select('*')
    .is('user_id', null)
    .eq('agent_type', agentType)
    .eq('is_default', true)
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch prompt: ${error.message}`)
  }
  return systemPrompt || null
}

// ──────────────────────────────────────────────
// LIST all prompts visible to a user
// (system defaults + their own custom ones)
// ──────────────────────────────────────────────
export async function listPrompts(userId) {
  let query = supabase
    .from('prompts')
    .select('*')
    .order('agent_type', { ascending: true })

  // Fetch system defaults + user's own
  if (userId) {
    query = query.or(`user_id.is.null,user_id.eq.${userId}`)
  } else {
    query = query.is('user_id', null)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to list prompts: ${error.message}`)
  return data || []
}

// ──────────────────────────────────────────────
// SAVE a custom prompt (create or update)
// ──────────────────────────────────────────────
export async function saveCustomPrompt(userId, agentType, promptText, name = 'Custom') {
  // Check if user already has a custom prompt for this agent
  const { data: existing } = await supabase
    .from('prompts')
    .select('id')
    .eq('user_id', userId)
    .eq('agent_type', agentType)
    .limit(1)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('prompts')
      .update({ system_prompt: promptText, name, is_active: true })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update prompt: ${error.message}`)
    return data
  }

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: userId,
      agent_type: agentType,
      name,
      system_prompt: promptText,
      is_active: true,
      is_default: false,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create prompt: ${error.message}`)
  return data
}

// ──────────────────────────────────────────────
// DELETE a custom prompt (restore to system default)
// ──────────────────────────────────────────────
export async function deleteCustomPrompt(userId, promptId) {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId)
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to delete prompt: ${error.message}`)
  return { success: true }
}
