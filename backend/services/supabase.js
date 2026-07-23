/**
 * Supabase Client Service
 *
 * Creates and exports a single Supabase client instance
 * configured from environment variables.
 *
 * Usage:
 *   import { supabase } from '../services/supabase.js'
 *   const { data, error } = await supabase.from('projects').select()
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.')
  console.warn('   Get your keys from: https://supabase.com/dashboard/project/_/settings/api')
  console.warn('   The server will start, but database operations will fail.')
}

/**
 * Server-side Supabase client using the service_role key.
 * This bypasses Row Level Security — use carefully.
 * For user-scoped queries, use createUserClient().
 */
let supabase = null
try {
  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
} catch (err) {
  console.error('❌ Failed to initialize Supabase client:', err.message)
}

/**
 * Create a Supabase client scoped to a specific user's JWT.
 * This client respects Row Level Security policies.
 *
 * @param {string} accessToken - The user's Supabase access token from the frontend
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createUserClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export { supabase }
