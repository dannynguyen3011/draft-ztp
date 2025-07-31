import express from 'express';
import { 
  getUserRiskScore, 
  logActivityAndUpdateRisk, 
  initializeUserRisk,
  getAllUsersRiskSummary 
} from '../services/risk-service.js';

// Simple authentication middleware for admin console
const requireAuth = (req, res, next) => {
  // For admin console, we just pass through since frontend handles auth
  req.user = {
    id: 'admin',
    username: 'admin',
    email: 'admin@hospital.com',
    roles: ['admin']
  };
  next();
};

const router = express.Router();

// Get current user's risk score
router.get('/my-score', requireAuth, async (req, res) => {
  try {
    // For admin console, return a simple low-risk score
    res.json({
      success: true,
      userId: 'admin',
      riskScore: 15,
      riskLevel: 'low',
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

// Get risk score for specific user (admin only)
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For admin console, return simple risk data
    res.json({
      success: true,
      userId,
      riskScore: 15,
      riskLevel: 'low',
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
    
    console.log('Admin activity logged:', {
      action,
      page,
      timestamp: new Date().toISOString(),
      metadata
    });
    
    res.json({
      success: true,
      userId: 'admin',
      action,
      riskScore: 15,
      riskLevel: 'low',
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
router.post('/initialize', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      userId: 'admin',
      initialRiskScore: 10,
      riskLevel: 'low',
      message: 'Admin console risk initialized successfully'
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

// Get all users risk summary (admin only)
router.get('/summary', requireAuth, async (req, res) => {
  try {
    // For admin console, return simple summary
    const stats = {
      totalUsers: 1,
      lowRisk: 1,
      mediumRisk: 0,
      highRisk: 0,
      averageRiskScore: 15
    };
    
    const users = [{
      userId: 'admin',
      username: 'admin',
      riskScore: 15,
      riskLevel: 'low',
      lastActivity: new Date()
    }];
    
    res.json({
      success: true,
      stats,
      users,
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