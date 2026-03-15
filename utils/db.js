// utils/db.js
// Connects to MongoDB once on startup and reuses the connection.
// Import this in main.js before loading any commands or events.

const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  if (connected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
