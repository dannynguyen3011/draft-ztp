import express from 'express';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

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
  riskScore: { type: Number, min: 0, max: 100, default: 0 },
  success: { type: Boolean, default: true },
  metadata: {
    realm: String,
    clientId: String,
    tokenType: String
  },
  // ML Prediction fields
  mlPredicted: { type: Boolean, default: false },
  mlRiskScore: { type: Number, min: 0, max: 100, default: null },
  mlRiskLevel: { type: String, default: null },
  mlPredictedAt: { type: Date, default: null },
  mlFeatures: {
    ip_region: String,
    device_type: String,
    user_role: String,
    action: String,
    hour: Number,
    sessionPeriod: Number
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

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Endpoint to trigger ML prediction for all logs
router.post('/predict-all', async (req, res) => {
  try {
    const { limit = 1000, skipPredicted = true } = req.body;
    
    console.log('🧠 Starting batch ML prediction for audit logs...');
    
    // Build query - skip already predicted logs if requested
    let query = {};
    if (skipPredicted) {
      query.mlPredicted = { $ne: true };
    }
    
    // Fetch logs for prediction
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    console.log(`📊 Found ${logs.length} logs to process`);
    
    if (logs.length === 0) {
      return res.json({
        success: true,
        message: 'No logs found for prediction',
        processed: 0,
        updated: 0
      });
    }
    
    // Prepare logs for ML service
    const logsForPrediction = logs.map(log => ({
      _id: log._id.toString(),
      username: log.username,
      userId: log.userId,
      email: log.email,
      roles: log.roles,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.timestamp,
      action: log.action,
      sessionId: log.sessionId,
      sessionPeriod: 15, // Default session period
      metadata: log.metadata
    }));
    
    // Call ML service
    console.log('🔮 Calling ML service for predictions...');
    const mlResponse = await fetch(`${ML_SERVICE_URL}/predict-audit-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logsForPrediction)
    });
    
    if (!mlResponse.ok) {
      throw new Error(`ML service error: ${mlResponse.status} ${mlResponse.statusText}`);
    }
    
    const mlResults = await mlResponse.json();
    console.log(`✅ ML service processed ${mlResults.total_processed} logs`);
    
    // Update logs in MongoDB with predictions
    let updateCount = 0;
    for (const prediction of mlResults.predictions) {
      try {
        const updateData = {
          mlPredicted: true,
          mlRiskScore: Math.round(prediction.risk_score * 100), // Convert to percentage
          mlRiskLevel: prediction.risk_level,
          mlPredictedAt: new Date(),
          riskScore: Math.round(prediction.risk_score * 100), // Update main risk score too
          riskLevel: prediction.risk_level,
          mlFeatures: prediction.mapped_features
        };
        
        await Log.findByIdAndUpdate(prediction.log_id, updateData);
        updateCount++;
      } catch (updateError) {
        console.error(`Error updating log ${prediction.log_id}:`, updateError.message);
      }
    }
    
    console.log(`📝 Updated ${updateCount} logs in MongoDB`);
    
    res.json({
      success: true,
      message: 'Batch ML prediction completed',
      processed: mlResults.total_processed,
      updated: updateCount,
      ml_predicted: mlResults.ml_predicted_count,
      fallback: mlResults.fallback_count,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('❌ Batch ML prediction failed:', error);
    res.status(500).json({
      success: false,
      error: 'Batch ML prediction failed',
      message: error.message
    });
  }
});

// Endpoint to get prediction status
router.get('/prediction-status', async (req, res) => {
  try {
    const totalLogs = await Log.countDocuments({});
    const predictedLogs = await Log.countDocuments({ mlPredicted: true });
    const unpredictedLogs = totalLogs - predictedLogs;
    
    // Get recent predictions
    const recentPredictions = await Log.find({ mlPredicted: true })
      .sort({ mlPredictedAt: -1 })
      .limit(10)
      .select('username action mlRiskScore mlRiskLevel mlPredictedAt');
    
    res.json({
      success: true,
      status: {
        totalLogs,
        predictedLogs,
        unpredictedLogs,
        percentagePredicted: totalLogs > 0 ? Math.round((predictedLogs / totalLogs) * 100) : 0
      },
      recentPredictions,
      lastUpdate: predictedLogs > 0 ? recentPredictions[0]?.mlPredictedAt : null
    });
    
  } catch (error) {
    console.error('Error getting prediction status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get prediction status',
      message: error.message
    });
  }
});

// Endpoint to reset ML predictions (for testing)
router.post('/reset-predictions', async (req, res) => {
  try {
    const result = await Log.updateMany(
      {},
      {
        $unset: {
          mlPredicted: 1,
          mlRiskScore: 1,
          mlRiskLevel: 1,
          mlPredictedAt: 1,
          mlFeatures: 1
        },
        $set: {
          riskScore: 0 // Reset to default
        }
      }
    );
    
    res.json({
      success: true,
      message: 'ML predictions reset successfully',
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error resetting predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset predictions',
      message: error.message
    });
  }
});

export default router; 