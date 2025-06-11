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
    
    console.log("Authentication log recorded:", {
      username,
      userId,
      action,
      timestamp: new Date().toISOString(),
      roles,
      success
    });

    res.status(200).json({ 
      success: true, 
      message: 'Log recorded successfully',
      logId: logEntry._id
    });

  } catch (err) {
    console.error('Error logging authentication data:', err);
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
    console.error('Error retrieving logs:', err);
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
    console.error('Error getting user activity summary:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error retrieving user activity',
      message: err.message 
    });
  }
});

export default router; 