import { GoogleGenerativeAI } from '@google/generative-ai'
import Generation from '../models/Generation.js'
import UsageLog from '../models/UsageLog.js'
import { buildPrompt, parseGeminiOutput } from '../utils/promptBuilder.js'
import { hashIp, getClientIp } from '../utils/ipHash.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ──────────────────────────────────────────────
// POST /api/generate
// ──────────────────────────────────────────────
export const generateContent = async (req, res) => {
  const startTime = Date.now()
  const ip = getClientIp(req)
  const ipHash = hashIp(ip)

  const { topic, voice } = req.body

  // Validate inputs
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Topic is required.' })
  }
  if (topic.trim().length > 200) {
    return res.status(400).json({ success: false, error: 'Topic must be under 200 characters.' })
  }
  const validVoices = ['professional', 'hype', 'minimalist']
  if (!voice || !validVoices.includes(voice)) {
    return res.status(400).json({ success: false, error: 'Invalid voice. Must be professional, hype, or minimalist.' })
  }

  // Helper: call Gemini with up to 2 retries on 429
  const callGeminiWithRetry = async (prompt, temperature, maxRetries = 2) => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature,
        maxOutputTokens: 2048,
      },
    })
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt)
        return result.response.text()
      } catch (err) {
        const is429 = err.message?.includes('429') || err.message?.includes('quota')
        if (is429 && attempt < maxRetries) {
          const delay = (attempt + 1) * 8000 // 8s, 16s
          console.warn(`⚠️ Gemini 429 — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})`)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
        throw err
      }
    }
  }

  try {
    // Call Gemini
    const temperature = voice === 'hype' ? 0.9 : voice === 'minimalist' ? 0.4 : 0.7
    const prompt = buildPrompt(topic.trim(), voice)
    const rawText = await callGeminiWithRetry(prompt, temperature)

    // Parse response
    let parsed
    try {
      parsed = parseGeminiOutput(rawText)
    } catch (parseErr) {
      console.error('❌ Gemini parse error:', parseErr.message)
      console.error('Raw output:', rawText.slice(0, 500))
      return res.status(500).json({
        success: false,
        error: 'AI returned an unexpected format. Please try again.',
      })
    }

    // Validate parsed structure
    if (!parsed.linkedin || !parsed.twitter || !parsed.blog) {
      return res.status(500).json({
        success: false,
        error: 'AI output was incomplete. Please try again.',
      })
    }

    const durationMs = Date.now() - startTime

    // Save generation to DB (non-blocking)
    const generationDoc = await Generation.create({
      ipHash,
      userId: req.user?._id || null,
      topic: topic.trim(),
      voice,
      output: parsed,
      durationMs,
    })

    // Log usage (non-blocking, fire and forget)
    UsageLog.create({
      ipHash,
      userId: req.user?._id || null,
      endpoint: '/api/generate',
      statusCode: 200,
      durationMs,
      success: true,
    }).catch(() => {}) // don't let logging failure break the response

    return res.status(200).json({
      success: true,
      data: parsed,
      generationId: generationDoc._id,
      durationMs,
    })
  } catch (err) {
    const durationMs = Date.now() - startTime
    console.error('❌ Generate error:', err.message)

    // Log failed attempt
    UsageLog.create({
      ipHash,
      endpoint: '/api/generate',
      statusCode: 500,
      durationMs,
      success: false,
      error: err.message,
    }).catch(() => {})

    // Handle Gemini-specific errors
    if (err.message?.includes('API_KEY')) {
      return res.status(500).json({ success: false, error: 'AI service configuration error.' })
    }
    if (err.message?.includes('quota') || err.message?.includes('429')) {
      return res.status(429).json({ success: false, error: 'AI quota exceeded. Please try again later.' })
    }

    return res.status(500).json({
      success: false,
      error: 'Generation failed. Please try again.',
    })
  }
}

// ──────────────────────────────────────────────
// GET /api/generate/history
// ──────────────────────────────────────────────
export const getHistory = async (req, res) => {
  const ip = getClientIp(req)
  const ipHash = hashIp(ip)

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(20, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    // Get by userId if logged in, else by ipHash
    const filter = req.user?._id
      ? { userId: req.user._id }
      : { ipHash }

    const [generations, total] = await Promise.all([
      Generation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-output.linkedin -output.twitter -output.blog.sections') // Keep list lightweight
        .lean(),
      Generation.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      data: generations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('❌ History error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch history.' })
  }
}

// ──────────────────────────────────────────────
// GET /api/generate/history/:id
// Get a single full generation by ID
// ──────────────────────────────────────────────
export const getGenerationById = async (req, res) => {
  const ip = getClientIp(req)
  const ipHash = hashIp(ip)

  try {
    const generation = await Generation.findById(req.params.id).lean()

    if (!generation) {
      return res.status(404).json({ success: false, error: 'Generation not found.' })
    }

    // Security: only owner or same IP can access
    const isOwner = req.user?._id?.toString() === generation.userId?.toString()
    const sameIp = generation.ipHash === ipHash
    if (!isOwner && !sameIp) {
      return res.status(403).json({ success: false, error: 'Access denied.' })
    }

    return res.status(200).json({ success: true, data: generation })
  } catch (err) {
    console.error('❌ Get generation error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch generation.' })
  }
}

// ──────────────────────────────────────────────
// DELETE /api/generate/history/:id
// ──────────────────────────────────────────────
export const deleteGeneration = async (req, res) => {
  const ip = getClientIp(req)
  const ipHash = hashIp(ip)

  try {
    const generation = await Generation.findById(req.params.id)
    if (!generation) {
      return res.status(404).json({ success: false, error: 'Generation not found.' })
    }

    const isOwner = req.user?._id?.toString() === generation.userId?.toString()
    const sameIp = generation.ipHash === ipHash
    if (!isOwner && !sameIp) {
      return res.status(403).json({ success: false, error: 'Access denied.' })
    }

    await generation.deleteOne()
    return res.status(200).json({ success: true, message: 'Deleted successfully.' })
  } catch (err) {
    console.error('❌ Delete error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to delete generation.' })
  }
}
