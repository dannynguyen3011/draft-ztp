import type { 
  HospitalUser, 
  UserActivity, 
  SecurityEvent, 
  RiskAssessment, 
  DashboardMetrics,
  BehaviorPattern,
  SystemMetrics,
  DepartmentActivity
} from './hospital-schema'

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-backend.com' 
  : 'http://localhost:3003'

// Authentication helper
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

/**
 * Hospital User Management
 */
export async function getHospitalUsers(filters?: {
  role?: string
  department?: string
  isActive?: boolean
  limit?: number
  offset?: number
}): Promise<{ users: HospitalUser[], total: number }> {
  try {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${BACKEND_URL}/api/hospital/users?${queryParams}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch hospital users: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching hospital users:', error)
    return { users: [], total: 0 }
  }
}

/**
 * User Activity Monitoring
 */
export async function getUserActivities(filters?: {
  userId?: string
  action?: string
  startDate?: string
  endDate?: string
  riskLevel?: string
  limit?: number
  offset?: number
}): Promise<{ activities: UserActivity[], total: number }> {
  try {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${BACKEND_URL}/api/hospital/activities?${queryParams}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user activities: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching user activities:', error)
    return { activities: [], total: 0 }
  }
}

/**
 * Security Events
 */
export async function getSecurityEvents(filters?: {
  eventType?: string
  severity?: string
  startDate?: string
  endDate?: string
  resolved?: boolean
  limit?: number
  offset?: number
}): Promise<{ events: SecurityEvent[], total: number }> {
  try {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${BACKEND_URL}/api/hospital/security-events?${queryParams}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch security events: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching security events:', error)
    return { events: [], total: 0 }
  }
}

/**
 * Risk Assessment
 */
export async function getUserRiskAssessment(userId: string): Promise<RiskAssessment | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/risk-assessment/${userId}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch risk assessment: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching risk assessment:', error)
    return null
  }
}

export async function getHighRiskUsers(limit: number = 10): Promise<{
  userId: string
  username: string
  riskScore: number
  riskLevel: string
  lastActivity: Date
}[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/high-risk-users?limit=${limit}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch high risk users: ${response.status}`)
    }

    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('Error fetching high risk users:', error)
    return []
  }
}

/**
 * Dashboard Metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/dashboard-metrics`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard metrics: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      securityEvents: 0,
      riskEvents: 0,
      averageRiskScore: 0,
      departmentActivity: [],
      recentActivities: [],
      topRiskUsers: []
    }
  }
}

/**
 * Behavioral Monitoring
 */
export async function getUserBehaviorPattern(userId: string): Promise<BehaviorPattern | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/behavior-pattern/${userId}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch behavior pattern: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching behavior pattern:', error)
    return null
  }
}

export async function getAnomalousUsers(limit: number = 20): Promise<{
  userId: string
  username: string
  anomalies: number
  lastAnomaly: Date
  riskScore: number
}[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/anomalous-users?limit=${limit}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch anomalous users: ${response.status}`)
    }

    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('Error fetching anomalous users:', error)
    return []
  }
}

/**
 * Department Analytics
 */
export async function getDepartmentActivities(filters?: {
  department?: string
  startDate?: string
  endDate?: string
}): Promise<DepartmentActivity[]> {
  try {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${BACKEND_URL}/api/hospital/department-activities?${queryParams}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch department activities: ${response.status}`)
    }

    const data = await response.json()
    return data.activities || []
  } catch (error) {
    console.error('Error fetching department activities:', error)
    return []
  }
}

/**
 * System Metrics
 */
export async function getSystemMetrics(hours: number = 24): Promise<SystemMetrics[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/system-metrics?hours=${hours}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch system metrics: ${response.status}`)
    }

    const data = await response.json()
    return data.metrics || []
  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return []
  }
}

/**
 * Real-time Updates
 */
export async function subscribeToRealTimeUpdates(callback: (data: any) => void): Promise<() => void> {
  try {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll use polling
    const pollInterval = setInterval(async () => {
      try {
        const metrics = await getDashboardMetrics()
        callback({ type: 'dashboard_update', data: metrics })
      } catch (error) {
        console.error('Error in real-time update:', error)
      }
    }, 30000) // Poll every 30 seconds

    // Return unsubscribe function
    return () => clearInterval(pollInterval)
  } catch (error) {
    console.error('Error setting up real-time updates:', error)
    return () => {} // Return empty function if setup fails
  }
}

/**
 * Search and Filter Functions
 */
export async function searchUsers(query: string, filters?: {
  role?: string
  department?: string
}): Promise<HospitalUser[]> {
  try {
    const queryParams = new URLSearchParams({ search: query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${BACKEND_URL}/api/hospital/search/users?${queryParams}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.status}`)
    }

    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('Error searching users:', error)
    return []
  }
}

/**
 * Export/Report Functions
 */
export async function exportSecurityReport(filters: {
  startDate: string
  endDate: string
  format: 'csv' | 'pdf' | 'json'
}): Promise<Blob | null> {
  try {
    const queryParams = new URLSearchParams(filters)
    
    const response = await fetch(`${BACKEND_URL}/api/hospital/export/security-report?${queryParams}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to export security report: ${response.status}`)
    }

    return await response.blob()
  } catch (error) {
    console.error('Error exporting security report:', error)
    return null
  }
}

// Utility functions
export function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export function formatTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'high': return 'text-red-600'
    case 'medium': return 'text-yellow-600'
    case 'low': return 'text-green-600'
    default: return 'text-gray-600'
  }
} 