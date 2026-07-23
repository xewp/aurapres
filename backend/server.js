import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { initializeProviders } from './providers/index.js'
import projectRoutes from './routes/projectRoutes.js'
import providerRoutes from './routes/providerRoutes.js'
import nicheRoutes from './routes/nicheRoutes.js'
import promptRoutes from './routes/promptRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 5000

// ──────────────────────────────────────────────
// Trust proxy (required for rate limiter on Render/Railway)
// ──────────────────────────────────────────────
app.set('trust proxy', 1)

// ──────────────────────────────────────────────
// Security & Logging Middleware
// ──────────────────────────────────────────────
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))

// ──────────────────────────────────────────────
// CORS
// ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl) in development
      if (!origin && process.env.NODE_ENV === 'development') return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`CORS: Origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ──────────────────────────────────────────────
// Body Parsing
// ──────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }))
app.use(express.urlencoded({ extended: true, limit: '50kb' }))

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'StoryForge AI API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  })
})

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use('/api/projects', projectRoutes)
app.use('/api/providers', providerRoutes)
app.use('/api/niches', nicheRoutes)
app.use('/api/prompts', promptRoutes)

// ──────────────────────────────────────────────
// Error Handling (must be last)
// ──────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const startServer = async () => {
  // Initialize AI provider adapters from environment variables
  initializeProviders()

  app.listen(PORT, () => {
    console.log(`🚀 StoryForge AI API running on http://localhost:${PORT}`)
    console.log(`📡 Environment: ${process.env.NODE_ENV}`)
  })
}

startServer()
