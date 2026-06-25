import mongoose from 'mongoose';

export async function connectDB(mongoUri) {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(mongoUri);
}
