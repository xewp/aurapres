import crypto from 'crypto'

/**
 * Hash an IP address with SHA-256 so we never store raw IPs.
 * Deterministic — same IP always produces the same hash.
 */
export function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + 'aurapress_salt').digest('hex')
}

/**
 * Get the real client IP, handling proxies (Render, Vercel, etc.)
 */
export function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  )
}
