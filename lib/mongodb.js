const mongoose = require('mongoose');

// Cache connection to reuse in serverless environment
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      cached.promise = null; // Reset on error
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
