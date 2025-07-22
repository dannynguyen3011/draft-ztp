import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Mongoose Schema for logs
const logSchema = new mongoose.Schema({
  username: String,
  userId: String,
  email: String,
  roles: [String],
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  action: String,
  sessionId: String,
  riskLevel: String,
  riskScore: { type: Number, min: 0, max: 100, default: 30 },
  success: { type: Boolean, default: true },
  metadata: {
    realm: String,
    clientId: String,
    tokenType: String
  }
});

const Log = mongoose.model('Log', logSchema);

// Endpoint to receive logs
router.post('/', async (req, res) => {
  try {
    const { 
      username, 
      userId, 
      email,
      roles, 
      userAgent, 
      action,
      sessionId,
      riskLevel,
      success,
      metadata
    } = req.body;

    // Extract IP address from request
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     '127.0.0.1';

    const logEntry = new Log({
      username,
      userId,
      email,
      roles: Array.isArray(roles) ? roles : [roles].filter(Boolean),
      ipAddress,
      userAgent,
      timestamp: new Date(),
      action: action || 'login',
      sessionId,
      riskLevel: riskLevel || 'medium',
      success: success !== undefined ? success : true,
      metadata: metadata || {}
    });

    await logEntry.save();
    


    res.status(200).json({ 
      success: true, 
      message: 'Log recorded successfully',
      logId: logEntry._id
    });

  } catch (err) {

    res.status(500).json({ 
      success: false, 
      error: 'Error logging data',
      message: err.message 
    });
  }
});

// Endpoint to retrieve logs (for admin/audit purposes)
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      userId, 
      action, 
      startDate, 
      endDate 
    } = req.query;

    let query = {};
    
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Log.countDocuments(query);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (err) {

    res.status(500).json({ 
      success: false, 
      error: 'Error retrieving logs',
      message: err.message 
    });
  }
});

// Endpoint to get user activity summary
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await Log.find({
      userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    const summary = {
      totalLogins: logs.filter(log => log.action === 'login' && log.success).length,
      failedLogins: logs.filter(log => log.action === 'login' && !log.success).length,
      lastLogin: logs.find(log => log.action === 'login' && log.success)?.timestamp,
      uniqueIPs: [...new Set(logs.map(log => log.ipAddress))].length,
      riskLevels: logs.reduce((acc, log) => {
        acc[log.riskLevel] = (acc[log.riskLevel] || 0) + 1;
        return acc;
      }, {}),
      recentActivity: logs.slice(0, 10)
    };

    res.json({
      success: true,
      userId,
      period: `${days} days`,
      summary
    });

  } catch (err) {

    res.status(500).json({ 
      success: false, 
      error: 'Error retrieving user activity',
      message: err.message 
    });
  }
});

// Endpoint to get all unique users from logs
router.get('/users', async (req, res) => {
  try {
    // Get unique users from logs using MongoDB aggregation
    const users = await Log.aggregate([
      {
        $match: {
          username: { $exists: true, $ne: null },
          userId: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$username' },
          email: { $first: '$email' },
          roles: { $first: '$roles' },
          lastLogin: { $max: '$timestamp' },
          totalLogins: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$action', 'login'] }, { $eq: ['$success', true] }] },
                1,
                0
              ]
            }
          },
          failedLogins: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$action', 'login'] }, { $eq: ['$success', false] }] },
                1,
                0
              ]
            }
          },
          averageRiskScore: { 
            $avg: { 
              $cond: [
                { $ne: ['$riskScore', null] },
                '$riskScore',
                { $cond: [{ $eq: ['$riskLevel', 'low'] }, 25, { $cond: [{ $eq: ['$riskLevel', 'medium'] }, 55, { $cond: [{ $eq: ['$riskLevel', 'high'] }, 75, 30] }] }] }
              ]
            }
          },
          recentActivities: { $push: { action: '$action', timestamp: '$timestamp', success: '$success' } }
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          userId: '$_id',
          username: 1,
          email: 1,
          roles: 1,
          lastLogin: 1,
          totalLogins: 1,
          failedLogins: 1,
          averageRiskScore: { 
            $round: [
              { $ifNull: ['$averageRiskScore', 30] }, 
              0
            ] 
          },
          status: {
            $cond: [
              { $gte: ['$lastLogin', { $subtract: [new Date(), 7 * 24 * 60 * 60 * 1000] }] },
              'active',
              'inactive'
            ]
          },
          riskLevel: {
            $cond: [
              { $gte: ['$averageRiskScore', 70] },
              'high',
              { $cond: [{ $gte: ['$averageRiskScore', 40] }, 'medium', 'low'] }
            ]
          },
          loginSuccessRate: {
            $cond: [
              { $gt: [{ $add: ['$totalLogins', '$failedLogins'] }, 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalLogins', { $add: ['$totalLogins', '$failedLogins'] }] },
                      100
                    ]
                  },
                  0
                ]
              },
              100
            ]
          }
        }
      },
      {
        $sort: { lastLogin: -1 }
      }
    ]);

    res.json({
      success: true,
      users,
      total: users.length
    });

  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error retrieving users',
      message: err.message 
    });
  }
});

export default router; 