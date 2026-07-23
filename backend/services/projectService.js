/**
 * Project Service — Supabase CRUD for the projects table.
 *
 * All methods accept a userId for RLS-compatible queries.
 * The service layer is the ONLY place that talks to the database.
 */

import { supabase } from './supabase.js'

// ──────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────
export async function createProject(userId, projectData) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: projectData.name,
      topic: projectData.topic,
      niche: projectData.niche || 'general',
      target_audience: projectData.targetAudience || '',
      tone: projectData.tone || 'professional',
      script_format: projectData.scriptFormat || 'storytelling',
      desired_length: projectData.desiredLength || '8-12 minutes',
      status: 'idea',
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create project: ${error.message}`)
  return data
}

// ──────────────────────────────────────────────
// READ (List with filters)
// ──────────────────────────────────────────────
export async function listProjects(userId, { page = 1, limit = 20, niche, status, search, favorites } = {}) {
  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (niche && niche !== 'all') query = query.eq('niche', niche)
  if (status && status !== 'all') query = query.eq('status', status)
  if (favorites) query = query.eq('is_favorite', true)
  if (search) query = query.ilike('name', `%${search}%`)

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to list projects: ${error.message}`)
  return {
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    },
  }
}

// ──────────────────────────────────────────────
// READ (Single)
// ──────────────────────────────────────────────
export async function getProject(userId, projectId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (error) throw new Error(`Project not found: ${error.message}`)
  return data
}

// ──────────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────────
export async function updateProject(userId, projectId, updates) {
  // Only allow safe fields to be updated
  const allowedFields = [
    'name', 'topic', 'niche', 'target_audience', 'tone',
    'script_format', 'desired_length', 'status',
    'is_favorite', 'is_archived',
    'selected_title', 'selected_hook',
  ]

  const safeUpdates = {}
  for (const key of allowedFields) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key]
  }

  const { data, error } = await supabase
    .from('projects')
    .update(safeUpdates)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update project: ${error.message}`)
  return data
}

// ──────────────────────────────────────────────
// DELETE
// ──────────────────────────────────────────────
export async function deleteProject(userId, projectId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to delete project: ${error.message}`)
  return { success: true }
}

// ──────────────────────────────────────────────
// DUPLICATE
// ──────────────────────────────────────────────
export async function duplicateProject(userId, projectId) {
  const original = await getProject(userId, projectId)

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: `${original.name} (Copy)`,
      topic: original.topic,
      niche: original.niche,
      target_audience: original.target_audience,
      tone: original.tone,
      script_format: original.script_format,
      desired_length: original.desired_length,
      status: 'idea',
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to duplicate project: ${error.message}`)
  return data
}
