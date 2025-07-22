// Auth Logger Utility for sending authentication events to MongoDB
import { keycloakAuth } from './keycloak';

interface AuthLogData {
  username?: string;
  userId?: string;
  email?: string;
  roles?: string[];
  action?: string;
  sessionId?: string;
  riskLevel?: string;
  success?: boolean;
  metadata?: {
    realm?: string;
    clientId?: string;
    tokenType?: string;
    error?: string;
    [key: string]: any;
  };
}

class AuthLogger {
  private backendUrl: string;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';
  }

  // Get client information for logging
  private getClientInfo() {
    if (typeof window === 'undefined') return {};

    return {
      ipAddress: '', // Will be filled by backend from request IP
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }

  // Get user information from Keycloak token
  private getUserInfo() {
    try {
      const user = keycloakAuth.getCurrentUser();
      const roles = keycloakAuth.getUserRoles();
      
      return {
        username: user?.preferred_username || user?.name,
        userId: user?.sub || user?.id,
        email: user?.email,
        roles: roles,
        metadata: {
          realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
          clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
          tokenType: 'access_token'
        }
      };
    } catch (error) {
      console.error('Error getting user info for logging:', error);
      return {};
    }
  }

  // Calculate risk level based on various factors
  private calculateRiskLevel(user: any): string {
    if (!user) return 'high';
    
    // Simple risk calculation based on email and user type
    if (user.email?.includes('admin')) return 'low';
    if (user.email?.includes('test')) return 'high';
    return 'medium';
  }

  // Log authentication event
  async logAuthEvent(eventData: Partial<AuthLogData> = {}) {
    try {
      if (typeof window === 'undefined') {
        console.warn('Auth logging is only available on client-side');
        return;
      }

      const userInfo = this.getUserInfo();
      const clientInfo = this.getClientInfo();
      
      const logData = {
        ...userInfo,
        ...clientInfo,
        action: 'login',
        success: true,
        riskLevel: this.calculateRiskLevel(userInfo),
        sessionId: this.generateSessionId(),
        ...eventData // Override with provided data
      };

      const response = await fetch(`${this.backendUrl}/api/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        throw new Error(`Logging failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Authentication event logged:', {
        logId: result.logId,
        action: logData.action,
        username: logData.username,
        success: logData.success
      });

      return result;

    } catch (error) {

      // Don't throw error to avoid breaking the authentication flow
      return null;
    }
  }

  // Log successful login
  async logLogin() {
    return this.logAuthEvent({
      action: 'login',
      success: true
    });
  }

  // Log failed login
  async logFailedLogin(error?: string) {
    return this.logAuthEvent({
      action: 'login',
      success: false,
      metadata: {
        ...this.getUserInfo().metadata,
        error: error || 'Login failed'
      }
    });
  }

  // Log logout
  async logLogout() {
    return this.logAuthEvent({
      action: 'logout',
      success: true
    });
  }

  // Log token refresh
  async logTokenRefresh() {
    return this.logAuthEvent({
      action: 'token_refresh',
      success: true
    });
  }

  // Log session timeout
  async logSessionTimeout() {
    return this.logAuthEvent({
      action: 'session_timeout',
      success: false
    });
  }

  // Generate session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Get user activity summary (for admin/audit purposes)
  async getUserActivity(userId: string, days: number = 30) {
    try {
      const response = await fetch(`${this.backendUrl}/api/log/user/${userId}?days=${days}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user activity: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user activity:', error);
      return null;
    }
  }

  // Get recent logs (for admin/audit purposes)
  async getRecentLogs(options: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });

      const response = await fetch(`${this.backendUrl}/api/log?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get logs: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting logs:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authLogger = new AuthLogger(); 