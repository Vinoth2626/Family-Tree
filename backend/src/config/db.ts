import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

export async function connectDb(): Promise<void> {
  try {
    let mongoUri = env.mongoUri;

    if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      const memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log('Using embedded MongoDB memory server for local development.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}
