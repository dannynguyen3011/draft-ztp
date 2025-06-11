import { opaClient } from '../lib/opa-client.js';
import jwt from 'jsonwebtoken';

/**
 * Enhanced authorization middleware using OPA + Keycloak
 * @param {string} resource - Resource being accessed
 * @param {string} action - Action being performed
 * @param {Object} options - Additional options
 */
export const authorize = (resource, action, options = {}) => {
  return async (req, res, next) => {
    try {
      // Extract JWT token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'No valid authorization token provided' 
        });
      }

      const token = authHeader.split(' ')[1];

      // Get additional context information
      const context = {
        riskScore: await getRiskScore(req),
        location: getLocation(req),
        mfaVerified: req.headers['x-mfa-verified'] === 'true',
        vpnConnected: req.headers['x-vpn-connected'] === 'true',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      };

      // Make authorization request to OPA
      const authRequest = {
        token,
        resource,
        action,
        context
      };

      const authResult = await opaClient.authorize(authRequest);

      if (!authResult.allowed) {
        // Log unauthorized access attempt
        console.warn('Unauthorized access attempt:', {
          resource,
          action,
          context,
          reason: authResult.error || 'Access denied by policy'
        });

        return res.status(403).json({ 
          error: 'Access denied',
          reason: authResult.error || 'Insufficient permissions'
        });
      }

      // Decode token to get user info (for context in next middleware)
      const decoded = jwt.decode(token);
      req.user = {
        id: decoded.sub,
        username: decoded.preferred_username,
        email: decoded.email,
        roles: [
          ...(decoded.realm_access?.roles || []),
          ...(Object.values(decoded.resource_access || {}).flatMap(client => client.roles || []))
        ],
        context
      };

      // Store authorization result for potential data filtering
      req.authResult = authResult;

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      res.status(500).json({ 
        error: 'Authorization service error',
        message: error.message
      });
    }
  };
};

/**
 * Data filtering middleware using OPA
 * @param {string} resource - Resource type for filtering
 */
export const filterData = (resource) => {
  return async (req, res, next) => {
    try {
      const originalSend = res.json;
      
      res.json = async function(data) {
        if (!req.user || !data) {
          return originalSend.call(this, data);
        }

        // Apply OPA data filtering
        const filterRequest = {
          token: req.headers.authorization?.split(' ')[1],
          resource,
          data: Array.isArray(data) ? data : [data]
        };

        const filterResult = await opaClient.filterData(filterRequest);
        
        if (filterResult.error) {
          console.warn('Data filtering error:', filterResult.error);
          return originalSend.call(this, data); // Return original data on error
        }

        const filteredData = filterResult.filteredData;
        return originalSend.call(this, Array.isArray(data) ? filteredData : filteredData[0]);
      };

      next();
    } catch (error) {
      console.error('Data filtering middleware error:', error);
      next(); // Continue without filtering on error
    }
  };
};

/**
 * Role-based middleware for backward compatibility
 * @param {Array<string>} requiredRoles - Required roles
 */
export const requireRoles = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No valid authorization token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      
      const userRoles = [
        ...(decoded.realm_access?.roles || []),
        ...(Object.values(decoded.resource_access || {}).flatMap(client => client.roles || []))
      ];

      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredRoles,
          current: userRoles
        });
      }

      req.user = {
        id: decoded.sub,
        username: decoded.preferred_username,
        email: decoded.email,
        roles: userRoles
      };

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ error: 'Authorization service error' });
    }
  };
};

/**
 * Get user risk score (mock implementation)
 * @param {Object} req - Express request object
 * @returns {Promise<number>} Risk score (0-100)
 */
async function getRiskScore(req) {
  // In a real implementation, this would query your risk assessment service
  // For now, return a mock score based on various factors
  
  const baseScore = 30;
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip;
  
  let riskScore = baseScore;
  
  // Increase risk for unusual user agents
  if (!userAgent.includes('Chrome') && !userAgent.includes('Firefox') && !userAgent.includes('Safari')) {
    riskScore += 20;
  }
  
  // Increase risk for non-office IP ranges (simplified)
  if (!ipAddress.startsWith('192.168.') && !ipAddress.startsWith('10.')) {
    riskScore += 15;
  }
  
  // Add time-based risk (higher risk outside business hours)
  const hour = new Date().getHours();
  if (hour < 9 || hour > 17) {
    riskScore += 10;
  }
  
  return Math.min(riskScore, 100);
}

/**
 * Determine user location (mock implementation)
 * @param {Object} req - Express request object
 * @returns {string} Location identifier
 */
function getLocation(req) {
  const ipAddress = req.ip;
  
  // Simplified location detection based on IP
  if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
    return 'office';
  }
  
  return 'remote';
}

/**
 * Audit middleware to log all authorization decisions
 */
export const auditMiddleware = (req, res, next) => {
  const originalSend = res.json;
  const startTime = Date.now();
  
  res.json = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log audit information
    const auditLog = {
      timestamp: new Date().toISOString(),
      user: req.user?.username || 'anonymous',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      authorized: res.statusCode < 400
    };
    
    console.log('Audit Log:', JSON.stringify(auditLog));
    
    return originalSend.call(this, data);
  };
  
  next();
}; 