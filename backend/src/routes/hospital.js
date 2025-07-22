import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Hospital database collections (without defining schemas since we're reading existing data)
const getCollection = (collectionName) => {
  return mongoose.connection.db.collection(collectionName);
};

/**
 * Get hospital users with filters
 */
router.get('/users', async (req, res) => {
  try {
    const { role, department, isActive, limit = 50, offset = 0 } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const usersCollection = getCollection('users');
    
    const users = await usersCollection
      .find(filter)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .toArray();

    const total = await usersCollection.countDocuments(filter);

    res.json({
      success: true,
      users,
      total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospital users',
      message: error.message
    });
  }
});

/**
 * Get user activities with filters
 */
router.get('/activities', async (req, res) => {
  try {
    const { 
      userId, 
      action, 
      startDate, 
      endDate, 
      riskLevel, 
      limit = 50, 
      offset = 0 
    } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (riskLevel) filter.riskLevel = riskLevel;
    
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const activitiesCollection = getCollection('user_activities');
    
    const activities = await activitiesCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .toArray();

    const total = await activitiesCollection.countDocuments(filter);

    res.json({
      success: true,
      activities,
      total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user activities',
      message: error.message
    });
  }
});

/**
 * Get security events with filters
 */
router.get('/security-events', async (req, res) => {
  try {
    const { 
      eventType, 
      severity, 
      startDate, 
      endDate, 
      resolved, 
      limit = 50, 
      offset = 0 
    } = req.query;
    
    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (severity) filter.severity = severity;
    if (resolved !== undefined) filter.resolved = resolved === 'true';
    
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const eventsCollection = getCollection('security_events');
    
    const events = await eventsCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .toArray();

    const total = await eventsCollection.countDocuments(filter);

    res.json({
      success: true,
      events,
      total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security events',
      message: error.message
    });
  }
});

/**
 * Get risk assessment for a specific user
 */
router.get('/risk-assessment/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const riskCollection = getCollection('risk_assessments');
    const assessment = await riskCollection
      .findOne({ userId }, { sort: { timestamp: -1 } });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Risk assessment not found'
      });
    }

    res.json({
      success: true,
      assessment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risk assessment',
      message: error.message
    });
  }
});

/**
 * Get high risk users
 */
router.get('/high-risk-users', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const riskCollection = getCollection('risk_assessments');
    const usersCollection = getCollection('users');
    
    // Get latest risk assessments for each user
    const pipeline = [
      {
        $sort: { userId: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$userId',
          latestAssessment: { $first: '$$ROOT' }
        }
      },
      {
        $match: {
          'latestAssessment.riskLevel': { $in: ['high', 'medium'] }
        }
      },
      {
        $sort: { 'latestAssessment.riskScore': -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ];

    const riskUsers = await riskCollection.aggregate(pipeline).toArray();
    
    // Get user details
    const userIds = riskUsers.map(ru => ru._id);
    const users = await usersCollection
      .find({ _id: { $in: userIds } })
      .toArray();

    const result = riskUsers.map(ru => {
      const user = users.find(u => u._id.toString() === ru._id);
      return {
        userId: ru._id,
        username: user?.username || 'Unknown',
        riskScore: ru.latestAssessment.riskScore,
        riskLevel: ru.latestAssessment.riskLevel,
        lastActivity: ru.latestAssessment.timestamp
      };
    });

    res.json({
      success: true,
      users: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch high risk users',
      message: error.message
    });
  }
});

/**
 * Get dashboard metrics
 */
router.get('/dashboard-metrics', async (req, res) => {
  try {
    const usersCollection = getCollection('users');
    const activitiesCollection = getCollection('user_activities');
    const eventsCollection = getCollection('security_events');
    const riskCollection = getCollection('risk_assessments');

    // Calculate metrics
    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({ isActive: true });
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const securityEvents = await eventsCollection.countDocuments({
      timestamp: { $gte: last24Hours }
    });
    
    const riskEvents = await eventsCollection.countDocuments({
      timestamp: { $gte: last24Hours },
      severity: { $in: ['high', 'critical'] }
    });

    // Calculate average risk score
    const avgRiskPipeline = [
      {
        $sort: { userId: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$userId',
          latestRiskScore: { $first: '$riskScore' }
        }
      },
      {
        $group: {
          _id: null,
          averageRiskScore: { $avg: '$latestRiskScore' }
        }
      }
    ];
    
    const avgRiskResult = await riskCollection.aggregate(avgRiskPipeline).toArray();
    const averageRiskScore = avgRiskResult[0]?.averageRiskScore || 0;

    // Get department activity
    const departmentPipeline = [
      {
        $match: { timestamp: { $gte: last24Hours } }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user.department',
          activityCount: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' }
        }
      },
      {
        $sort: { activityCount: -1 }
      }
    ];

    const departmentActivity = await activitiesCollection.aggregate(departmentPipeline).toArray();

    // Get recent activities
    const recentActivities = await activitiesCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    // Get top risk users (simplified)
    const topRiskUsers = await riskCollection.aggregate([
      {
        $sort: { userId: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$userId',
          latestAssessment: { $first: '$$ROOT' }
        }
      },
      {
        $sort: { 'latestAssessment.riskScore': -1 }
      },
      {
        $limit: 5
      }
    ]).toArray();

    res.json({
      success: true,
      totalUsers,
      activeUsers,
      securityEvents,
      riskEvents,
      averageRiskScore: Math.round(averageRiskScore),
      departmentActivity: departmentActivity.map(dept => ({
        department: dept._id || 'Unknown',
        activityCount: dept.activityCount,
        riskScore: Math.round(dept.avgRiskScore || 0)
      })),
      recentActivities,
      topRiskUsers: topRiskUsers.map(ru => ({
        userId: ru._id,
        username: 'User-' + ru._id, // Placeholder - would need to lookup
        riskScore: ru.latestAssessment.riskScore,
        lastActivity: ru.latestAssessment.timestamp
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics',
      message: error.message
    });
  }
});

/**
 * Get behavior pattern for a user
 */
router.get('/behavior-pattern/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const behaviorCollection = getCollection('behavior_patterns');
    const pattern = await behaviorCollection.findOne({ userId });

    if (!pattern) {
      return res.status(404).json({
        success: false,
        error: 'Behavior pattern not found'
      });
    }

    res.json({
      success: true,
      pattern
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch behavior pattern',
      message: error.message
    });
  }
});

/**
 * Get anomalous users
 */
router.get('/anomalous-users', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const behaviorCollection = getCollection('behavior_patterns');
    const usersCollection = getCollection('users');
    
    const anomalousPatterns = await behaviorCollection
      .find({
        'anomalies.0': { $exists: true } // Has at least one anomaly
      })
      .sort({ 'anomalies.timestamp': -1 })
      .limit(parseInt(limit))
      .toArray();

    const result = [];
    for (const pattern of anomalousPatterns) {
      const user = await usersCollection.findOne({ _id: pattern.userId });
      if (user) {
        result.push({
          userId: pattern.userId,
          username: user.username,
          anomalies: pattern.anomalies.length,
          lastAnomaly: pattern.anomalies[0]?.timestamp,
          riskScore: 50 // Placeholder - would calculate based on anomalies
        });
      }
    }

    res.json({
      success: true,
      users: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch anomalous users',
      message: error.message
    });
  }
});

/**
 * Get department activities
 */
router.get('/department-activities', async (req, res) => {
  try {
    const { department, startDate, endDate } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const deptCollection = getCollection('department_activities');
    const activities = await deptCollection
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    res.json({
      success: true,
      activities
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department activities',
      message: error.message
    });
  }
});

/**
 * Get system metrics
 */
router.get('/system-metrics', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    
    const startTime = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    
    const metricsCollection = getCollection('system_metrics');
    const metrics = await metricsCollection
      .find({
        timestamp: { $gte: startTime }
      })
      .sort({ timestamp: -1 })
      .toArray();

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system metrics',
      message: error.message
    });
  }
});

/**
 * Search users
 */
router.get('/search/users', async (req, res) => {
  try {
    const { search, role, department } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const usersCollection = getCollection('users');
    const users = await usersCollection
      .find(filter)
      .limit(20)
      .toArray();

    res.json({
      success: true,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
      message: error.message
    });
  }
});

/**
 * Export security report
 */
router.get('/export/security-report', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const filter = {};
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const eventsCollection = getCollection('security_events');
    const events = await eventsCollection.find(filter).toArray();

    if (format === 'json') {
      res.json({
        success: true,
        reportDate: new Date(),
        period: { startDate, endDate },
        totalEvents: events.length,
        events
      });
    } else {
      // For CSV/PDF, you would implement proper formatting here
      res.status(400).json({
        success: false,
        error: 'Only JSON format is currently supported'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export security report',
      message: error.message
    });
  }
});

export default router; 