/**
 * Asset Service — Supabase CRUD for the project_assets table.
 *
 * Each asset represents one part of the 10-part content package
 * (research, strategy, outline, script, shorts, seo, thumbnail,
 *  broll, voiceover, summary).
 */

import { supabase } from './supabase.js'

// The 10 asset types that make up a complete project
export const ASSET_TYPES = [
  'research',
  'strategy',
  'outline',
  'script',
  'shorts',
  'seo',
  'thumbnail',
  'broll',
  'voiceover',
  'summary',
]

// ──────────────────────────────────────────────
// CREATE or UPDATE an asset (upsert by project + type)
// ──────────────────────────────────────────────
export async function upsertAsset(projectId, assetType, assetData) {
  // Check if asset already exists for this project/type
  const { data: existing } = await supabase
    .from('project_assets')
    .select('id, version')
    .eq('project_id', projectId)
    .eq('asset_type', assetType)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    // Update existing asset
    const { data, error } = await supabase
      .from('project_assets')
      .update({
        content: assetData.content,
        provider_used: assetData.providerUsed || null,
        model_used: assetData.modelUsed || null,
        tokens_used: assetData.tokensUsed || 0,
        duration_ms: assetData.durationMs || 0,
        status: assetData.status || 'completed',
        error_message: assetData.errorMessage || null,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update asset: ${error.message}`)
    return data
  }

  // Create new asset
  const { data, error } = await supabase
    .from('project_assets')
    .insert({
      project_id: projectId,
      asset_type: assetType,
      content: assetData.content || {},
      provider_used: assetData.providerUsed || null,
      model_used: assetData.modelUsed || null,
      tokens_used: assetData.tokensUsed || 0,
      duration_ms: assetData.durationMs || 0,
      status: assetData.status || 'completed',
      error_message: assetData.errorMessage || null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create asset: ${error.message}`)
  return data
}

// ──────────────────────────────────────────────
// GET all assets for a project
// ──────────────────────────────────────────────
export async function getProjectAssets(projectId) {
  const { data, error } = await supabase
    .from('project_assets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch assets: ${error.message}`)
  return data || []
}

// ──────────────────────────────────────────────
// GET a single asset by type
// ──────────────────────────────────────────────
export async function getAssetByType(projectId, assetType) {
  const { data, error } = await supabase
    .from('project_assets')
    .select('*')
    .eq('project_id', projectId)
    .eq('asset_type', assetType)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch asset: ${error.message}`)
  }
  return data || null
}

// ──────────────────────────────────────────────
// Mark an asset as "generating" (loading state)
// ──────────────────────────────────────────────
export async function markAssetGenerating(projectId, assetType) {
  return upsertAsset(projectId, assetType, {
    content: {},
    status: 'generating',
  })
}

// ──────────────────────────────────────────────
// Mark an asset as "error"
// ──────────────────────────────────────────────
export async function markAssetError(projectId, assetType, errorMessage) {
  return upsertAsset(projectId, assetType, {
    content: {},
    status: 'error',
    errorMessage,
  })
}
