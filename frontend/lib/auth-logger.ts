// Auth Logger - simplified for admin console (no tracking)
import { auth } from './auth';

class AuthLogger {
  async logAuthEvent(event: {
    action: string;
    success: boolean;
    riskLevel?: string;
    metadata?: Record<string, any>;
  }) {
    // For admin console, just log to console - don't track admin activities
    console.log('Admin auth event (not tracked):', event);
  }

  async logLoginAttempt(success: boolean, metadata: Record<string, any> = {}) {
    this.logAuthEvent({
      action: 'login_attempt',
      success,
      metadata
    });
  }

  async logLogout(metadata: Record<string, any> = {}) {
    this.logAuthEvent({
      action: 'logout',
      success: true,
      metadata
    });
  }

  async logPageAccess(page: string, metadata: Record<string, any> = {}) {
    // Admin console page access - no tracking needed
    console.log('Admin page access (not tracked):', { page, metadata });
  }
}

export const authLogger = new AuthLogger(); 