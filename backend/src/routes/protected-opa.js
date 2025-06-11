import express from 'express';
import { authorize, filterData, requireRoles, auditMiddleware } from '../middleware/opa-auth.js';

const router = express.Router();

// Apply audit middleware to all routes
router.use(auditMiddleware);

// Dashboard routes
router.get('/dashboard', 
  authorize('dashboard', 'read'), 
  (req, res) => {
    res.json({
      message: 'Dashboard data',
      user: req.user.username,
      permissions: req.authResult
    });
  }
);

// Analytics routes (manager only)
router.get('/analytics', 
  authorize('analytics', 'read'),
  filterData('analytics'),
  (req, res) => {
    const analyticsData = [
      { type: 'public', metric: 'page_views', value: 1234 },
      { type: 'sensitive', metric: 'revenue', value: 50000 },
      { type: 'public', metric: 'user_sessions', value: 456 }
    ];
    res.json(analyticsData);
  }
);

// Audit logs (manager only)
router.get('/audit', 
  authorize('audit', 'read'),
  filterData('audit'),
  (req, res) => {
    const auditLogs = [
      { 
        id: 1, 
        action: 'login', 
        user: 'john.doe', 
        timestamp: '2024-01-01T10:00:00Z',
        type: 'authentication'
      },
      { 
        id: 2, 
        action: 'data_access', 
        user: 'jane.smith', 
        timestamp: '2024-01-01T11:00:00Z',
        type: 'audit_logs'
      }
    ];
    res.json(auditLogs);
  }
);

// User management
router.get('/users', 
  authorize('users', 'read'),
  filterData('users'),
  (req, res) => {
    const users = [
      { 
        id: 1, 
        username: 'john.doe', 
        email: 'john@company.com',
        role: 'employee',
        type: 'public'
      },
      { 
        id: 2, 
        username: 'jane.smith', 
        email: 'jane@company.com',
        role: 'manager',
        salary: 75000,
        type: 'salary'
      }
    ];
    res.json(users);
  }
);

router.post('/users', 
  authorize('users', 'write'),
  (req, res) => {
    // Create user logic
    res.json({ 
      message: 'User created successfully',
      user: req.body 
    });
  }
);

router.delete('/users/:id', 
  authorize('users', 'delete'),
  (req, res) => {
    // Delete user logic
    res.json({ 
      message: `User ${req.params.id} deleted successfully` 
    });
  }
);

// Policy management
router.get('/policies', 
  authorize('policies', 'read'),
  (req, res) => {
    const policies = [
      {
        id: 1,
        name: 'Finance Access Policy',
        description: 'Controls access to financial data',
        rules: ['manager_only', 'business_hours']
      },
      {
        id: 2,
        name: 'HR Data Policy',
        description: 'Controls access to HR information',
        rules: ['hr_role', 'office_location']
      }
    ];
    res.json(policies);
  }
);

router.post('/policies', 
  authorize('policies', 'write'),
  (req, res) => {
    // Create policy logic
    res.json({ 
      message: 'Policy created successfully',
      policy: req.body 
    });
  }
);

// Meeting management
router.get('/meetings', 
  authorize('meetings', 'read'),
  (req, res) => {
    const meetings = [
      {
        id: 1,
        title: 'Team Standup',
        participants: ['john.doe', 'jane.smith'],
        scheduled: '2024-01-01T09:00:00Z'
      },
      {
        id: 2,
        title: 'Board Meeting',
        participants: ['ceo', 'cfo', 'jane.smith'],
        scheduled: '2024-01-01T14:00:00Z',
        confidential: true
      }
    ];
    res.json(meetings);
  }
);

router.post('/meetings', 
  authorize('meetings', 'write'),
  (req, res) => {
    // Create meeting logic
    res.json({ 
      message: 'Meeting created successfully',
      meeting: req.body 
    });
  }
);

// Reports (context-aware access)
router.get('/reports', 
  authorize('reports', 'read'),
  filterData('reports'),
  (req, res) => {
    const reports = [
      {
        id: 1,
        title: 'Monthly Sales Report',
        type: 'public',
        data: { revenue: 100000, customers: 150 }
      },
      {
        id: 2,
        title: 'Executive Summary',
        type: 'confidential',
        data: { profit_margin: 25, strategic_initiatives: ['expansion', 'acquisition'] }
      }
    ];
    res.json(reports);
  }
);

// Permissions endpoint - get user permissions for a resource
router.get('/permissions/:resource', 
  requireRoles(['employee', 'manager']), // Basic auth check
  async (req, res) => {
    try {
      const { resource } = req.params;
      const token = req.headers.authorization?.split(' ')[1];
      
      const permissions = await opaClient.getUserPermissions({
        token,
        resource
      });
      
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get permissions',
        message: error.message 
      });
    }
  }
);

// Health check for authorization system
router.get('/health', async (req, res) => {
  try {
    const opaHealth = await opaClient.healthCheck();
    
    res.json({
      status: 'healthy',
      services: {
        opa: opaHealth ? 'healthy' : 'unhealthy',
        keycloak: 'healthy' // Assume healthy for demo
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 