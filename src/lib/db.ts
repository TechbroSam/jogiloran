// src/lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedConnection: Promise<typeof mongoose> | null = null;

async function dbConnect() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!cachedConnection) {
    cachedConnection = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });
  }

  try {
    await cachedConnection;
  } catch (e) {
    cachedConnection = null;
    throw e;
  }

  return cachedConnection;
}

export default dbConnect;