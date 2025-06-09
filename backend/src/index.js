// Old (CommonJS)
// const express = require('express');

// New (ESM)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupAuth, protect } from './middleware/auth.mjs';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
  res.json({ message: 'This is a public route' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
