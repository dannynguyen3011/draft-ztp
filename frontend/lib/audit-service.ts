import { v4 as uuidv4 } from "uuid"
import { type UserActivity, HospitalAuditEventType, HospitalResourceType } from "./hospital-schema"

// API client for fetching real audit logs from backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

// Audit log interface for frontend
export interface AuditLog {
  id: string
  timestamp: string | Date
  user_id: string | null
  username?: string | null
  event_type: string
  resource_type: string
  resource_id: string | null
  action: string
  status: "success" | "failure"
  ip_address: string | null
  user_agent: string | null
  details: Record<string, any>
  risk_score: number | null
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  pages: number
}

// Convert backend log format to frontend audit log format
const convertBackendLogToAuditLog = (backendLog: any): AuditLog => {
  // Ensure unique ID by combining MongoDB _id with timestamp if needed
  const uniqueId = backendLog._id || backendLog.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const converted = {
    id: uniqueId,
    timestamp: new Date(backendLog.timestamp),
    user_id: backendLog.userId || backendLog.user_id,
    username: backendLog.user || backendLog.username,
    event_type: mapActionToEventType(backendLog.action),
    resource_type: mapActionToResourceType(backendLog.action),
    resource_id: backendLog.sessionId || null,
    action: backendLog.action,
    status: "success" as "success" | "failure", // Default to success since these are logged activities
    ip_address: backendLog.ipAddress || backendLog.ip_address,
    user_agent: backendLog.userAgent || backendLog.user_agent,
    details: {
      username: backendLog.user || backendLog.username,
      userId: backendLog.userId,
      email: backendLog.email,
      roles: backendLog.roles,
      riskLevel: backendLog.risk || backendLog.riskLevel,
      riskScore: backendLog.riskScore,
      sessionId: backendLog.sessionId,
      sessionPeriod: backendLog.sessionPeriod,
      metadata: backendLog.metadata,
      createdAt: backendLog.createdAt,
      updatedAt: backendLog.updatedAt
    },
    // Backend already converts riskScore from 0-1 to 0-100 scale
    risk_score: (backendLog.riskScore !== null && backendLog.riskScore !== undefined) ? backendLog.riskScore : 
                (backendLog.risk_score !== null && backendLog.risk_score !== undefined) ? backendLog.risk_score : null,
  }
  
  return converted
}

// Map action to event type
const mapActionToEventType = (action: string): string => {
  switch (action) {
    case 'login':
    case 'logout':
      return 'AUTHENTICATION'
    case 'dashboard_access':
    case 'page_access':
      return 'AUTHORIZATION'
    case 'data_access':
    case 'document_access':
      return 'DATA_ACCESS'
    default:
      return 'SYSTEM'
  }
}

// Map action to resource type
const mapActionToResourceType = (action: string): string => {
  switch (action) {
    case 'login':
    case 'logout':
      return 'USER'
    case 'dashboard_access':
    case 'page_access':
      return 'SYSTEM'
    case 'data_access':
    case 'document_access':
      return 'DOCUMENT'
    default:
      return 'SYSTEM'
  }
}

// Map risk level to score
const mapRiskLevelToScore = (riskLevel: string): number | null => {
  switch (riskLevel?.toLowerCase()) {
    case 'low': return 25
    case 'medium': return 55
    case 'high': return 75
    case 'critical': return 95
    default: return null
  }
}

// Fetch activities from the hospital MongoDB
export async function getActivities(filters: Record<string, any> = {}, page: number = 1, limit: number = 50): Promise<UserActivity[]> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })

    const response = await fetch(`${BACKEND_URL}/api/hospital/activities?${queryParams}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success && data.data) {
      return data.data.map((activity: any) => ({
        id: activity._id || activity.id,
        user_id: activity.userId,
        username: activity.user || activity.username,
        email: activity.email,
        roles: activity.roles,
        action: activity.action,
        resource: 'system',
        timestamp: activity.timestamp,
        ip_address: activity.ipAddress,
        user_agent: activity.userAgent,
        risk_score: activity.riskScore || activity.risk_score, // Already converted to 0-100 in backend
        risk_level: activity.risk || activity.riskLevel,
        details: {
          sessionId: activity.sessionId,
          sessionPeriod: activity.sessionPeriod,
          userId: activity.userId,
          metadata: activity.metadata,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt
        }
      }))
    }

    return []
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}

// Fetch audit logs from MongoDB hospital database
export async function getAuditLogs(filters = {}, page = 1, limit = 50): Promise<AuditLogsResponse> {
  try {
    const activities = await getActivities(filters, page, limit)
    
    const auditLogs = activities.map(activity => convertBackendLogToAuditLog(activity))
    
    return {
      logs: auditLogs,
      total: auditLogs.length,
      pages: Math.ceil(auditLogs.length / limit)
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return {
      logs: [],
      total: 0,
      pages: 0
    }
  }
}

// Fetch security events from MongoDB
export async function getSecurityEvents(filters = {}, page = 1, limit = 50): Promise<AuditLog[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/security-events?page=${page}&limit=${limit}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch security events: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success && data.data) {
      return data.data.map((event: any) => convertBackendLogToAuditLog(event))
    }

    return []
  } catch (error) {
    console.error('Error fetching security events:', error)
    return []
  }
}

// Log audit event
export async function onAuditEvent(event: {
  action: string
  resource?: string
  details?: Record<string, any>
  status?: "success" | "failure"
}) {
  try {
    // For hospital admin console, we just log to console since MongoDB handles the real logging
    console.log('Audit event:', event)
  } catch (error) {
    console.warn('Failed to log audit event:', error)
  }
}
