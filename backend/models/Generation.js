import mongoose from 'mongoose'

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ipHash: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    voice: {
      type: String,
      enum: ['professional', 'hype', 'minimalist'],
      required: true,
    },
    output: {
      linkedin: { type: String, default: '' },
      twitter: { type: [String], default: [] },
      blog: {
        title: { type: String, default: '' },
        intro: { type: String, default: '' },
        sections: [
          {
            heading: { type: String },
            bullets: [{ type: String }],
          },
        ],
      },
    },
    tokensUsed: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Index for efficient history queries
generationSchema.index({ ipHash: 1, createdAt: -1 })
generationSchema.index({ userId: 1, createdAt: -1 })

const Generation = mongoose.model('Generation', generationSchema)
export default Generation
