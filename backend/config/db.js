import mongoose from 'mongoose'

let isConnected = false

export const connectDB = async () => {
  if (isConnected) return

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`)
    process.exit(1)
  }
}
