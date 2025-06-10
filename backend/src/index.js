// Old (CommonJS)
// const express = require('express');

// New (ESM)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupAuth, protect } from './middleware/auth.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: join(__dirname, '../.env') });

// Debug: Log environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('KEYCLOAK_URL:', process.env.KEYCLOAK_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

const app = express();
// Use port 3003 directly to avoid conflicts
const port = process.env.PORT || 3003;

console.log(`Attempting to start server on port: ${port}`);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());

// Initialize Keycloak
const keycloak = setupAuth(app);

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

app.listen(port, () => {
  console.log(`✅ Backend server running on port ${port}`);
  console.log(`🌐 API available at: http://localhost:${port}`);
  console.log(`🔓 Public endpoint: http://localhost:${port}/api/public`);
  console.log(`🔒 Protected endpoint: http://localhost:${port}/api/protected`);
});
