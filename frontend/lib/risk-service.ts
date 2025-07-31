// Frontend Risk Service - simplified for Hospital Analytics Admin Console
import { auth } from './auth';

// Risk assessment types
export interface RiskData {
  userId: string;
  username: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: string;
  riskFactors: string[];
  recommendations: string[];
}

export interface UserActivity {
  id: string;
  action: string;
  resource: string;
  timestamp: string;
  riskScore: number;
  metadata?: Record<string, any>;
}

// Risk calculation thresholds
const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 70,
  HIGH: 100
};

class RiskService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Log user activity with risk assessment - simplified for admin console
  async logUserActivity(action: string, resource: string, metadata: Record<string, any> = {}): Promise<void> {
    // For admin console, just log to console - don't track admin navigation
    console.log('Admin console activity (not tracked):', { action, resource, metadata });
  }

  // Get current user's risk assessment - simplified for admin
  async getCurrentUserRiskScore(): Promise<RiskData | null> {
    if (!auth.isAuthenticated()) {
      return null;
    }

    try {
      // For admin console, return mock data since we don't need complex risk scoring
      const user = auth.getCurrentUser();
      return {
        userId: 'admin',
        username: user?.username || 'admin',
        riskScore: 15, // Low risk for admin
        riskLevel: 'low',
        lastActivity: new Date().toISOString(),
        riskFactors: [],
        recommendations: ['Continue monitoring hospital user activities']
      };
    } catch (error) {
      console.error('Failed to get user risk score:', error);
      return null;
    }
  }

  // Initialize risk assessment for user - simplified
  async initializeUserRisk(): Promise<RiskData | null> {
    if (!auth.isAuthenticated()) {
      return null;
    }

    try {
      const user = auth.getCurrentUser();
      
      // For admin console, just return success without backend call
      return {
        userId: 'admin',
        username: user?.username || 'admin',
        riskScore: 10, // Very low risk for admin user
        riskLevel: 'low',
        lastActivity: new Date().toISOString(),
        riskFactors: [],
        recommendations: ['Hospital admin console access initialized']
      };
    } catch (error) {
      console.error('Failed to initialize user risk:', error);
      return null;
    }
  }

  // Calculate risk score based on activity patterns - simplified
  calculateRiskScore(activities: UserActivity[]): number {
    if (!activities.length) return 10; // Very low risk for no activity

    // For admin console, most activities are considered low risk
    const baseScore = 10;
    const recentActivities = activities.filter(
      a => new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // Slight increase for high activity volume
    const activityMultiplier = Math.min(recentActivities.length * 2, 20);
    
    return Math.min(baseScore + activityMultiplier, 100);
  }

  // Get risk level from score
  getRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score <= RISK_THRESHOLDS.LOW) return 'low';
    if (score <= RISK_THRESHOLDS.MEDIUM) return 'medium';
    return 'high';
  }

  // Log high-risk activity - simplified for admin console
  async logHighRiskActivity(action: string, resource: string, reason: string): Promise<void> {
    // For admin console, we don't need to track high-risk activities
    // Just log to console for debugging
    console.log('High-risk activity logged:', { action, resource, reason });
  }

  // Get user activities for risk assessment - simplified
  async getUserActivities(username?: string, limit: number = 50): Promise<UserActivity[]> {
    if (!auth.isAuthenticated()) {
      return [];
    }

    try {
      // For admin console, return empty array since we don't need complex activity tracking
      return [];
    } catch (error) {
      console.error('Failed to get user activities:', error);
      return [];
    }
  }

  // Generate risk recommendations
  generateRecommendations(riskData: RiskData): string[] {
    const recommendations: string[] = [];

    if (riskData.riskLevel === 'high') {
      recommendations.push('Immediate security review required');
      recommendations.push('Consider implementing additional authentication factors');
    } else if (riskData.riskLevel === 'medium') {
      recommendations.push('Monitor user activity closely');
      recommendations.push('Review recent access patterns');
    } else {
      recommendations.push('Continue regular monitoring');
      recommendations.push('Maintain current security protocols');
    }

    return recommendations;
  }
}

// Export singleton instance
export const riskService = new RiskService();

// Export helper functions for backward compatibility
export const logUserActivity = riskService.logUserActivity.bind(riskService);
export const getCurrentUserRiskScore = riskService.getCurrentUserRiskScore.bind(riskService);
export const initializeUserRisk = riskService.initializeUserRisk.bind(riskService); 