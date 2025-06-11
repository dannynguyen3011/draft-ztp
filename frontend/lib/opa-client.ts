import React from 'react';

interface AuthorizationRequest {
  resource: string;
  action: string;
  context?: {
    riskScore?: number;
    location?: string;
    mfaVerified?: boolean;
    vpnConnected?: boolean;
  };
}

interface AuthorizationResponse {
  allowed: boolean;
  reason?: string;
  error?: string;
}

interface PermissionsResponse {
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  resource: string;
}

class FrontendOPAClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if user is authorized for a specific action
   */
  async checkAuthorization(request: AuthorizationRequest): Promise<AuthorizationResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { allowed: false, reason: 'No authentication token' };
      }

      const response = await fetch(`${this.baseUrl}/auth/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        return { allowed: false, error };
      }

      return await response.json();
    } catch (error) {
      console.error('Authorization check failed:', error);
      return { allowed: false, error: 'Authorization service unavailable' };
    }
  }

  /**
   * Get user permissions for a resource
   */
  async getUserPermissions(resource: string): Promise<PermissionsResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return {
          permissions: { read: false, write: false, delete: false },
          resource
        };
      }

      const response = await fetch(`${this.baseUrl}/permissions/${resource}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get permissions');
      }

      return await response.json();
    } catch (error) {
      console.error('Get permissions failed:', error);
      return {
        permissions: { read: false, write: false, delete: false },
        resource
      };
    }
  }

  /**
   * Batch check multiple permissions
   */
  async batchCheckPermissions(requests: AuthorizationRequest[]): Promise<AuthorizationResponse[]> {
    return Promise.all(
      requests.map(request => this.checkAuthorization(request))
    );
  }

  /**
   * Get current user context for authorization
   */
  private async getUserContext() {
    return {
      riskScore: await this.getRiskScore(),
      location: this.getLocation(),
      mfaVerified: this.isMFAVerified(),
      vpnConnected: this.isVPNConnected(),
    };
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Get user risk score (mock implementation)
   */
  private async getRiskScore(): Promise<number> {
    // In a real implementation, this would call your risk assessment service
    const baseScore = 30;
    
    // Add factors based on browser/environment
    let riskScore = baseScore;
    
    // Check for unusual patterns
    const hour = new Date().getHours();
    if (hour < 9 || hour > 17) {
      riskScore += 10; // Higher risk outside business hours
    }
    
    return Math.min(riskScore, 100);
  }

  /**
   * Get user location (mock implementation)
   */
  private getLocation(): string {
    // In a real implementation, this would use geolocation or IP-based detection
    return 'office'; // Default to office for demo
  }

  /**
   * Check if MFA is verified
   */
  private isMFAVerified(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('mfa_verified') === 'true';
  }

  /**
   * Check if VPN is connected
   */
  private isVPNConnected(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('vpn_connected') === 'true';
  }
}

// Singleton instance
export const opaClient = new FrontendOPAClient();

// React hooks for authorization
export function useAuthorization(resource: string, action: string) {
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await opaClient.checkAuthorization({
          resource,
          action,
        });

        setIsAuthorized(result.allowed);
        if (!result.allowed && result.reason) {
          setError(result.reason);
        }
      } catch (err) {
        setError('Authorization check failed');
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [resource, action]);

  return { isAuthorized, isLoading, error };
}

export function usePermissions(resource: string) {
  const [permissions, setPermissions] = React.useState<PermissionsResponse['permissions'] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getPermissions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await opaClient.getUserPermissions(resource);
        setPermissions(result.permissions);
      } catch (err) {
        setError('Failed to get permissions');
        setPermissions({ read: false, write: false, delete: false });
      } finally {
        setIsLoading(false);
      }
    };

    getPermissions();
  }, [resource]);

  return { permissions, isLoading, error };
} 