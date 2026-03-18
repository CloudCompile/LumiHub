import mongoose from 'mongoose';
import { env } from '../env.ts';
import { logger } from '../utils/logger.ts';

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB connected: ${env.MONGODB_URI}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB error:', error);
});
