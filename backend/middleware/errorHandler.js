// Global error handler — must be registered LAST in Express middleware chain
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500

  console.error(`❌ [${req.method}] ${req.path} →`, err.message)

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// 404 handler — for unmatched routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  })
}
