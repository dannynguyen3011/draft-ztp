// Old (CommonJS)
// const express = require('express');

// New (ESM)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { setupAuth, protect } from './middleware/auth.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logRouter from './routes/log.js';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: join(__dirname, '../.env') });

// Debug: Log environment variables and path
console.log('Environment variables loaded from:', join(__dirname, '../.env'));
console.log('PORT:', process.env.PORT);
console.log('KEYCLOAK_URL:', process.env.KEYCLOAK_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/zerotrust";

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  }
}

const app = express();
// Use port 3003 directly to avoid conflicts
const port = process.env.PORT || 3003;

console.log(`Attempting to start server on port: ${port}`);

// Middleware - Allow both ports 3000 and 3002 for development
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3002'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Initialize Keycloak
const keycloak = setupAuth(app);

// Routes
app.use('/api/log', logRouter);

// Protected route example
app.get('/api/protected', protect(keycloak), (req, res) => {
  res.json({ message: 'This is a protected route', user: req.kauth.grant.access_token.content });
});

// Public route example
app.get('/api/public', (req, res) => {
  res.json({ 
    message: 'This is a public route',
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server with MongoDB connection
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectMongoDB();
    
    // Start Express server
    app.listen(port, () => {
      console.log(`✅ Backend server running on port ${port}`);
      console.log(`🌐 API available at: http://localhost:${port}`);
      console.log(`🔓 Public endpoint: http://localhost:${port}/api/public`);
      console.log(`🔒 Protected endpoint: http://localhost:${port}/api/protected`);
      console.log(`📝 Logging endpoint: http://localhost:${port}/api/log`);
      console.log(`💚 Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
