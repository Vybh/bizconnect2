import mongoose from "mongoose";

export async function connectDB(uri) {
  const conn = await mongoose.connect(uri || process.env.MONGO_URI);
  console.info(`MongoDB connected: ${conn.connection.host}`);
}
