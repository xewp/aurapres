import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { connectDB } from './config/db.js'
import generateRoutes from './routes/generateRoutes.js'
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ──────────────────────────────────────────────
// Body Parsing
// ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AuraPress API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  })
})

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use('/api/generate', generateRoutes)

// ──────────────────────────────────────────────
// Error Handling (must be last)
// ──────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 AuraPress API running on http://localhost:${PORT}`)
    console.log(`📡 Environment: ${process.env.NODE_ENV}`)
  })
}

startServer()
