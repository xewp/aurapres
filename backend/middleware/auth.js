/**
 * Auth Middleware — Verify Supabase JWT from Authorization header.
 *
 * Extracts the user ID from the JWT and attaches it to req.userId.
 * Protected routes use this middleware to enforce authentication.
 */

import { supabase } from '../services/supabase.js'

/**
 * Require authentication. Returns 401 if no valid token.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please sign in again.',
      })
    }

    // Attach user info to request
    req.userId = user.id
    req.userEmail = user.email
    req.user = user

    next()
  } catch (err) {
    console.error('Auth middleware error:', err.message)
    return res.status(401).json({
      success: false,
      error: 'Authentication failed.',
    })
  }
}

/**
 * Optional authentication. Attaches userId if token is valid,
 * but does NOT block the request if no token is present.
 * Useful for endpoints that behave differently for logged-in vs anonymous users.
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.userId = null
    req.user = null
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user } } = await supabase.auth.getUser(token)
    req.userId = user?.id || null
    req.userEmail = user?.email || null
    req.user = user || null
  } catch {
    req.userId = null
    req.user = null
  }

  next()
}
