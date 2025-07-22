// Frontend Risk Service - manages user risk scores and interactions with backend
import { keycloakAuth } from './keycloak';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

export interface RiskData {
  userId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface RiskSummary {
  stats: {
    totalUsers: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    averageRiskScore: number;
  };
  users: Array<{
    userId: string;
    username: string;
    roles: string[];
    riskScore: number;
    lastActivity: string;
  }>;
}

// Cache for risk scores to reduce API calls
const riskCache = new Map<string, { data: RiskData; expiry: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

/**
 * Get current user's risk score
 */
export async function getCurrentUserRiskScore(): Promise<RiskData | null> {
  try {
    if (!keycloakAuth.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      throw new Error('No access token available');
    }

    const user = keycloakAuth.getCurrentUser();
    const userId = user?.sub || user?.id;
    
    if (!userId) {
      throw new Error('User ID not available');
    }

    // Check cache first
    const cached = riskCache.get(userId);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const response = await fetch(`${BACKEND_URL}/api/risk/my-score`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch risk score: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      const riskData: RiskData = {
        userId: data.userId,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        timestamp: data.timestamp
      };

      // Cache the result
      riskCache.set(userId, {
        data: riskData,
        expiry: Date.now() + CACHE_DURATION
      });

      return riskData;
    }

    return null;
  } catch (error) {
    console.error('Error fetching current user risk score:', error);
    return null;
  }
}

/**
 * Get risk score for a specific user (admin/manager only)
 */
export async function getUserRiskScore(userId: string): Promise<RiskData | null> {
  try {
    if (!keycloakAuth.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${BACKEND_URL}/api/risk/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Insufficient permissions to view user risk score');
      }
      throw new Error(`Failed to fetch user risk score: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        userId: data.userId,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        timestamp: data.timestamp
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user risk score:', error);
    return null;
  }
}

/**
 * Log user activity (page navigation, actions, etc.)
 */
export async function logUserActivity(action: string, page?: string, metadata?: any): Promise<RiskData | null> {
  try {
    if (!keycloakAuth.isAuthenticated()) {
      // Fail silently for activity logging
      return null;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      // Fail silently for activity logging
      return null;
    }

    const user = keycloakAuth.getCurrentUser();
    const userId = user?.sub || user?.id;
    
    if (!userId) {
      return null;
    }

    // Check user roles to determine if this should affect risk
    const userRoles = keycloakAuth.getUserRoles();
    const isPrivilegedUser = userRoles.includes('admin') || userRoles.includes('manager');

    // Don't log sensitive page access for admin/manager users
    if (isPrivilegedUser && action === 'page_access' && page) {
      const sensitivePaths = [
        '/dashboard/users/management',
        '/dashboard/policies',
        '/dashboard/access-control',
        '/dashboard/audit',
        '/dashboard/behavioral-monitoring'
      ];
      
      if (sensitivePaths.some(path => page.includes(path))) {
        // Still log the activity but it won't increase risk

      }
    }

    const response = await fetch(`${BACKEND_URL}/api/risk/log-activity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        page,
        metadata
      })
    });

    if (!response.ok) {
      // Log warning but don't throw error for activity logging

      return null;
    }

    const data = await response.json();
    
    if (data.success) {
      const riskData: RiskData = {
        userId: data.userId,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        timestamp: data.timestamp
      };

      // Update cache
      riskCache.set(userId, {
        data: riskData,
        expiry: Date.now() + CACHE_DURATION
      });

      return riskData;
    }

    return null;
  } catch (error) {

    return null;
  }
}

/**
 * Initialize user risk score on first login
 */
export async function initializeUserRisk(): Promise<RiskData | null> {
  try {
    if (!keycloakAuth.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${BACKEND_URL}/api/risk/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize user risk: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        userId: data.userId,
        riskScore: data.initialRiskScore,
        riskLevel: data.riskLevel,
        timestamp: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {

    return null;
  }
}

/**
 * Get risk summary for all users (admin/manager only)
 */
export async function getRiskSummary(): Promise<RiskSummary | null> {
  try {
    if (!keycloakAuth.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${BACKEND_URL}/api/risk/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Insufficient permissions to view risk summary');
      }
      throw new Error(`Failed to fetch risk summary: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        stats: data.stats,
        users: data.users
      };
    }

    return null;
  } catch (error) {

    return null;
  }
}

/**
 * Calculate risk level from score
 */
export function calculateRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore >= 70) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}

/**
 * Get risk color for UI display
 */
export function getRiskColor(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'high': return 'red';
    case 'medium': return 'orange';
    case 'low': return 'green';
    default: return 'gray';
  }
}

/**
 * Clear risk cache (useful when user logs out)
 */
export function clearRiskCache(): void {
  riskCache.clear();
} 