import mongoose from 'mongoose'

const usageLogSchema = new mongoose.Schema(
  {
    ipHash: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    endpoint: { type: String },
    statusCode: { type: Number },
    durationMs: { type: Number },
    success: { type: Boolean, default: true },
    error: { type: String, default: null },
  },
  { timestamps: true }
)

// TTL index — auto-delete logs after 30 days
usageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

const UsageLog = mongoose.model('UsageLog', usageLogSchema)
export default UsageLog
