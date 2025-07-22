import express from 'express';
import { 
  getUserRiskScore, 
  logActivityAndUpdateRisk, 
  initializeUserRisk,
  getAllUsersRiskSummary 
} from '../services/risk-service.js';
import jwt from 'jsonwebtoken';

// Simple role-based authorization middleware for risk routes
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'No valid authorization token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }

    const userRoles = [
      ...(decoded.realm_access?.roles || []),
      ...(Object.values(decoded.resource_access || {}).flatMap(client => client.roles || []))
    ];

    req.user = {
      id: decoded.sub,
      username: decoded.preferred_username,
      email: decoded.email,
      roles: userRoles
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authorization service error' 
    });
  }
};

const router = express.Router();

// Get current user's risk score
router.get('/my-score', requireAuth, async (req, res) => {
  try {
    const riskScore = await getUserRiskScore(req.user.id);
    
    res.json({
      success: true,
      userId: req.user.id,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting user risk score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get risk score',
      message: error.message
    });
  }
});

// Get risk score for specific user (admin/manager only)
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user has permission to view other users' risk scores
    if (req.user.id !== userId && !req.user.roles.includes('admin') && !req.user.roles.includes('manager')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view other users risk scores'
      });
    }
    
    const riskScore = await getUserRiskScore(userId);
    
    res.json({
      success: true,
      userId,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting user risk score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get risk score',
      message: error.message
    });
  }
});

// Log user activity (used by frontend for page navigation tracking)
router.post('/log-activity', requireAuth, async (req, res) => {
  try {
    const { action, page, metadata = {} } = req.body;
    
    const context = {
      username: req.user.username,
      email: req.user.email,
      roles: req.user.roles,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      page,
      success: true,
      ...metadata
    };
    
    const updatedRiskScore = await logActivityAndUpdateRisk(req.user.id, action, context);
    
    res.json({
      success: true,
      userId: req.user.id,
      action,
      riskScore: updatedRiskScore,
      riskLevel: getRiskLevel(updatedRiskScore),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log activity',
      message: error.message
    });
  }
});

// Initialize user risk on first login
router.post('/initialize', async (req, res) => {
  try {
    // Extract user info from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }
    
    const decoded = jwt.decode(token);
    const userInfo = {
      username: decoded.preferred_username,
      email: decoded.email,
      roles: [
        ...(decoded.realm_access?.roles || []),
        ...(Object.values(decoded.resource_access || {}).flatMap(client => client.roles || []))
      ],
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    const initialRiskScore = await initializeUserRisk(decoded.sub, userInfo);
    
    res.json({
      success: true,
      userId: decoded.sub,
      initialRiskScore,
      riskLevel: getRiskLevel(initialRiskScore),
      message: 'User risk initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing user risk:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize user risk',
      message: error.message
    });
  }
});

// Get all users risk summary (admin/manager only)
router.get('/summary', requireAuth, async (req, res) => {
  try {
    // Check if user has admin or manager role
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('manager')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view risk summary'
      });
    }
    
    const riskSummary = await getAllUsersRiskSummary();
    
    // Calculate statistics
    const stats = {
      totalUsers: riskSummary.length,
      lowRisk: riskSummary.filter(u => getRiskLevel(u.riskScore) === 'low').length,
      mediumRisk: riskSummary.filter(u => getRiskLevel(u.riskScore) === 'medium').length,
      highRisk: riskSummary.filter(u => getRiskLevel(u.riskScore) === 'high').length,
      averageRiskScore: riskSummary.length > 0 
        ? Math.round(riskSummary.reduce((sum, u) => sum + u.riskScore, 0) / riskSummary.length)
        : 30
    };
    
    res.json({
      success: true,
      stats,
      users: riskSummary,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting risk summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get risk summary',
      message: error.message
    });
  }
});

// Helper function to calculate risk level
function getRiskLevel(riskScore) {
  if (riskScore >= 70) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}

export default router; 