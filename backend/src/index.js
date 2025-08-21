// Old (CommonJS)
// const express = require('express');

// New (ESM)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { simpleAuth, protect, protectWithRoles } from './middleware/auth.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logRouter from './routes/log.js';
import protectedOpaRouter from './routes/protected-opa.js';
import riskRouter from './routes/risk.js';
import hospitalRouter from './routes/hospital.js';
import { opaClient } from './lib/opa-client.js';
import jwt from 'jsonwebtoken';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: join(__dirname, '../.env') });



// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vqh04092004:admin@cluster0.nnhndae.mongodb.net/hospital_analytics?retryWrites=true&w=majority&ssl=true&authSource=admin";

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to Hospital MongoDB Atlas Database");
    console.log("📊 Database: hospital_analytics");
  } catch (err) {
    console.error("❌ Hospital MongoDB connection error:", err);
    process.exit(1);
  }
}

const app = express();
// Use port 3003 directly to avoid conflicts
const port = process.env.PORT || 3003;



// Middleware - Allow both frontend ports for development
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3001',
  'http://localhost:3000', // Hospital web app
  'http://localhost:3001', // Admin console
  'http://localhost:3002'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Use simple authentication middleware
app.use(simpleAuth);

// Routes
app.use('/api/logs', logRouter);
app.use('/api/protected', protectedOpaRouter);
app.use('/api/risk', riskRouter);
app.use('/api/hospital', hospitalRouter); // New hospital routes

// Protected route example
app.get('/api/protected', protect(), (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    user: { username: 'admin', role: 'admin' } 
  });
});

// Public route example
app.get('/api/public', (req, res) => {
  res.json({ 
    message: 'Zero Trust Platform - Hospital Analytics Admin Console',
    port: port,
    timestamp: new Date().toISOString(),
    database: 'hospital_analytics (MongoDB Atlas)'
  });
});

// Authorization check endpoint
app.post('/api/check-authorization', async (req, res) => {
  try {
    const { resource, action, context } = req.body;
    
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        allowed: false, 
        reason: 'No valid authorization token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Decode JWT token to extract user roles
    let userRoles = [];
    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      // Extract realm roles
      const realmRoles = payload.realm_access?.roles || [];
      
      // Filter out default Keycloak roles and keep only our application roles
      userRoles = realmRoles.filter(role => 
        ['admin', 'manager', 'employee', 'doctor', 'nurse', 'staff'].includes(role)
      );

      // Check token expiration
      const now = Date.now() / 1000;
      if (payload.exp && payload.exp < now) {
        return res.status(401).json({ 
          allowed: false, 
          reason: 'Token expired' 
        });
      }

    } catch (decodeError) {
      return res.status(401).json({ 
        allowed: false, 
        reason: 'Invalid token format' 
      });
    }

    // Role-based authorization for hospital admin console
    const rolePermissions = {
      admin: {
        dashboard: ['read', 'write'],
        analytics: ['read', 'write'],
        audit: ['read', 'write'],
        users: ['read', 'write', 'delete'],
        policies: ['read', 'write', 'delete'],
        integrations: ['read', 'write', 'delete'],
        meetings: ['read', 'write', 'delete'],
        reports: ['read', 'write'],
        hospital: ['read', 'write'], // Full hospital data access
        risk: ['read', 'write']
      },
      manager: {
        dashboard: ['read', 'write'],
        analytics: ['read'],
        audit: ['read'],
        users: ['read', 'write'],
        policies: ['read', 'write'],
        integrations: ['read', 'write'],
        meetings: ['read', 'write', 'delete'],
        reports: ['read', 'write'],
        hospital: ['read'], // Read-only hospital data access
        risk: ['read', 'write']
      },
      employee: {
        dashboard: ['read'],
        analytics: [],
        audit: [],
        users: [],
        policies: ['read'],
        integrations: [],
        meetings: ['read', 'write'],
        reports: [],
        hospital: [], // No hospital data access
        risk: ['read']
      },
      // Hospital-specific roles
      doctor: {
        dashboard: ['read'],
        analytics: ['read'],
        audit: ['read'],
        users: ['read'],
        hospital: ['read'], // Read hospital data
        risk: ['read']
      },
      nurse: {
        dashboard: ['read'],
        analytics: [],
        audit: [],
        users: ['read'],
        hospital: ['read'], // Limited hospital data access
        risk: ['read']
      },
      staff: {
        dashboard: ['read'],
        analytics: [],
        audit: [],
        users: [],
        hospital: [], // No hospital data access
        risk: []
      }
    };

    // Check if user has permission
    let allowed = false;
    for (const role of userRoles) {
      if (rolePermissions[role] && 
          rolePermissions[role][resource] && 
          rolePermissions[role][resource].includes(action)) {
        allowed = true;
        break;
      }
    }

    if (!allowed) {
      return res.status(403).json({ 
        allowed: false,
        reason: 'Access denied by policy'
      });
    }

    // Return successful authorization
    res.json({
      allowed: true,
      reason: 'Access granted'
    });

  } catch (error) {
    res.status(500).json({ 
      allowed: false,
      reason: 'Authorization service error'
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Test database access
    let dbTest = false;
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      dbTest = collections.length > 0;
    } catch (error) {
      dbTest = false;
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: 'hospital_analytics',
        type: 'MongoDB Atlas',
        accessible: dbTest
      },
      services: {
        keycloak: 'configured',
        opa: 'configured',
        hospital_api: 'active'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server with MongoDB connection
async function startServer() {
  try {
    // Connect to Hospital MongoDB Atlas first
    await connectMongoDB();
    
    // Start Express server
    app.listen(port, () => {
      console.log(`🏥 Hospital Analytics Admin Console`);
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🔗 API available at: http://localhost:${port}`);
      console.log(`🏥 Hospital API: http://localhost:${port}/api/hospital`);
      console.log(`💚 Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    process.exit(1);
  }
}

// Start the server
startServer();
