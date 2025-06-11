import fetch from 'node-fetch';

class OPAClient {
  constructor(opaUrl = 'http://localhost:8181') {
    this.opaUrl = opaUrl;
    this.policyPath = '/v1/data/zerotrust/authz';
  }

  /**
   * Check if user is authorized for a specific action
   * @param {Object} authRequest - Authorization request
   * @param {string} authRequest.token - JWT token
   * @param {string} authRequest.resource - Resource being accessed
   * @param {string} authRequest.action - Action being performed
   * @param {Object} authRequest.context - Additional context
   * @returns {Promise<Object>} Authorization decision
   */
  async authorize(authRequest) {
    try {
      const input = {
        token: authRequest.token,
        resource: authRequest.resource,
        action: authRequest.action,
        jwt_secret: process.env.JWT_SECRET || 'your-jwt-secret',
        client_id: process.env.KEYCLOAK_CLIENT_ID || 'demo-client',
        risk_score: authRequest.context?.riskScore || 0,
        location: authRequest.context?.location || 'unknown',
        mfa_verified: authRequest.context?.mfaVerified || false,
        vpn_connected: authRequest.context?.vpnConnected || false
      };

      const response = await fetch(`${this.opaUrl}${this.policyPath}/allow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input })
      });

      if (!response.ok) {
        throw new Error(`OPA request failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        allowed: result.result || false,
        decision: result
      };
    } catch (error) {
      console.error('OPA authorization error:', error);
      return {
        allowed: false,
        error: error.message
      };
    }
  }

  /**
   * Filter data based on user permissions
   * @param {Object} filterRequest - Data filter request
   * @returns {Promise<Object>} Filtered data
   */
  async filterData(filterRequest) {
    try {
      const input = {
        token: filterRequest.token,
        resource: filterRequest.resource,
        data: filterRequest.data,
        jwt_secret: process.env.JWT_SECRET || 'your-jwt-secret',
        client_id: process.env.KEYCLOAK_CLIENT_ID || 'demo-client'
      };

      const response = await fetch(`${this.opaUrl}${this.policyPath}/filter_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input })
      });

      if (!response.ok) {
        throw new Error(`OPA filter request failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        filteredData: result.result || [],
        decision: result
      };
    } catch (error) {
      console.error('OPA data filtering error:', error);
      return {
        filteredData: [],
        error: error.message
      };
    }
  }

  /**
   * Batch authorization check for multiple resources
   * @param {Array} authRequests - Array of authorization requests
   * @returns {Promise<Array>} Array of authorization decisions
   */
  async batchAuthorize(authRequests) {
    const decisions = await Promise.all(
      authRequests.map(request => this.authorize(request))
    );
    return decisions;
  }

  /**
   * Get user permissions for a resource
   * @param {Object} permissionRequest - Permission request
   * @returns {Promise<Object>} User permissions
   */
  async getUserPermissions(permissionRequest) {
    try {
      const input = {
        token: permissionRequest.token,
        resource: permissionRequest.resource,
        jwt_secret: process.env.JWT_SECRET || 'your-jwt-secret',
        client_id: process.env.KEYCLOAK_CLIENT_ID || 'demo-client'
      };

      // Check each permission type
      const permissions = {};
      const actions = ['read', 'write', 'delete'];
      
      for (const action of actions) {
        const authResult = await this.authorize({
          ...permissionRequest,
          action
        });
        permissions[action] = authResult.allowed;
      }

      return {
        permissions,
        resource: permissionRequest.resource
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return {
        permissions: { read: false, write: false, delete: false },
        error: error.message
      };
    }
  }

  /**
   * Health check for OPA service
   * @returns {Promise<boolean>} OPA service health status
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.opaUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('OPA health check failed:', error);
      return false;
    }
  }
}

export default OPAClient;

// Singleton instance
export const opaClient = new OPAClient(); 