import { v4 as uuidv4 } from "uuid"
import { type AuditLog, AuditEventType, ResourceType } from "./db-schema"

// API client for fetching real audit logs from backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

// Convert backend log format to frontend audit log format
const convertBackendLogToAuditLog = (backendLog: any): AuditLog => {
  return {
    id: backendLog._id || backendLog.id,
    timestamp: new Date(backendLog.timestamp),
    user_id: backendLog.userId || backendLog.user_id,
    event_type: mapActionToEventType(backendLog.action),
    resource_type: mapActionToResourceType(backendLog.action),
    resource_id: backendLog.sessionId || null,
    action: backendLog.action,
    status: backendLog.success ? "success" : "failure",
    ip_address: backendLog.ipAddress || backendLog.ip_address,
    user_agent: backendLog.userAgent || backendLog.user_agent,
    details: {
      username: backendLog.username,
      email: backendLog.email,
      roles: backendLog.roles,
      riskLevel: backendLog.riskLevel,
      metadata: backendLog.metadata || {}
    },
    risk_score: mapRiskLevelToScore(backendLog.riskLevel),
  }
}

// Map action to event type
const mapActionToEventType = (action: string): AuditEventType => {
  switch (action) {
    case 'login':
    case 'logout':
      return AuditEventType.AUTHENTICATION
    case 'dashboard_access':
    case 'page_access':
      return AuditEventType.AUTHORIZATION
    case 'data_access':
    case 'document_access':
      return AuditEventType.DATA_ACCESS
    default:
      return AuditEventType.SYSTEM
  }
}

// Map action to resource type
const mapActionToResourceType = (action: string): ResourceType => {
  switch (action) {
    case 'login':
    case 'logout':
      return ResourceType.USER
    case 'dashboard_access':
    case 'page_access':
      return ResourceType.SYSTEM
    case 'data_access':
    case 'document_access':
      return ResourceType.DOCUMENT
    default:
      return ResourceType.SYSTEM
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

// Get audit logs with pagination and filtering from backend
export async function getAuditLogs({
  page = 1,
  limit = 20,
  user_id = null,
  event_type = null,
  resource_type = null,
  start_date = null,
  end_date = null,
  status = null,
}: {
  page?: number
  limit?: number
  user_id?: string | null
  event_type?: AuditEventType | null
  resource_type?: ResourceType | null
  start_date?: Date | null
  end_date?: Date | null
  status?: "success" | "failure" | null
} = {}): Promise<{ logs: AuditLog[]; total: number; pages: number }> {
  try {
    // Build query parameters for backend API
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    })

    if (user_id) queryParams.append('userId', user_id)
    if (start_date) queryParams.append('startDate', start_date.toISOString())
    if (end_date) queryParams.append('endDate', end_date.toISOString())
    
    // Map status to success/failure for backend
    if (status === 'success') queryParams.append('success', 'true')
    if (status === 'failure') queryParams.append('success', 'false')

    const response = await fetch(`${BACKEND_URL}/api/log?${queryParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.logs) {
      // Convert backend logs to frontend format
      const auditLogs = data.logs.map(convertBackendLogToAuditLog)
      
      return {
        logs: auditLogs,
        total: data.pagination?.total || auditLogs.length,
        pages: Math.ceil((data.pagination?.total || auditLogs.length) / limit),
      }
    } else {
      throw new Error('Invalid response format from backend')
    }
  } catch (error) {
    console.error("Error fetching audit logs from backend:", error)
    
    // Fallback to sample data if backend is unavailable
    const sampleLogs = generateSampleAuditLogs(limit)
    return {
      logs: sampleLogs,
      total: 60,
      pages: 3,
    }
  }
}

// Get security events (authentication and authorization activities) from backend
export async function getSecurityEvents(days = 7, limit = 50): Promise<AuditLog[]> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })

    const response = await fetch(`${BACKEND_URL}/api/log?${queryParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.logs) {
      // Convert all logs and show security-relevant activities
      const allLogs = data.logs.map(convertBackendLogToAuditLog)
      
      // For dashboard security events, show recent authentication and authorization activities
      const securityRelevantEvents = allLogs.filter((log: any) => 
        log.event_type === AuditEventType.AUTHENTICATION || 
        log.event_type === AuditEventType.AUTHORIZATION ||
        log.event_type === AuditEventType.SECURITY ||
        (log.status === "failure") ||
        (log.risk_score !== null && log.risk_score >= 50)
      )
      
      return securityRelevantEvents.slice(0, limit)
    } else {
      throw new Error('Invalid response format from backend')
    }
  } catch (error) {
    console.error("Error fetching security events from backend:", error)
    
    // Fallback to sample data
    return generateSampleSecurityEvents(limit)
  }
}

// Get user audit logs from backend
export async function getUserAuditLogs(userId: string, page = 1, limit = 20): Promise<AuditLog[]> {
  try {
    const queryParams = new URLSearchParams({
      userId: userId,
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    })

    const response = await fetch(`${BACKEND_URL}/api/log?${queryParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.logs) {
      return data.logs.map(convertBackendLogToAuditLog)
    } else {
      throw new Error('Invalid response format from backend')
    }
  } catch (error) {
    console.error("Error fetching user audit logs from backend:", error)
    return []
  }
}

// Get recent logs for dashboard (using backend data)
export async function getRecentLogs(limit = 5): Promise<AuditLog[]> {
  try {
    const result = await getAuditLogs({ page: 1, limit })
    return result.logs
  } catch (error) {
    console.error("Error fetching recent logs:", error)
    return []
  }
}

// In-memory storage for real-time updates only
const realtimeAuditLogs: AuditLog[] = []

// Event emitter for real-time updates
type AuditEventListener = (log: AuditLog) => void
const auditEventListeners: AuditEventListener[] = []

// Interface for creating an audit log entry
export interface CreateAuditLogParams {
  user_id?: string | null
  event_type: AuditEventType
  resource_type: ResourceType
  resource_id?: string | null
  action: string
  status: "success" | "failure"
  ip_address?: string | null
  user_agent?: string | null
  details?: Record<string, any>
  risk_score?: number | null
}

// Create a new audit log entry (for real-time updates)
export async function createAuditLog(params: CreateAuditLogParams): Promise<AuditLog | null> {
  try {
    const {
      user_id = null,
      event_type,
      resource_type,
      resource_id = null,
      action,
      status,
      ip_address = null,
      user_agent = null,
      details = {},
      risk_score = null,
    } = params

    const id = uuidv4()
    const timestamp = new Date()

    // Create the audit log entry
    const auditLog: AuditLog = {
      id,
      timestamp,
      user_id,
      event_type,
      resource_type,
      resource_id,
      action,
      status,
      ip_address,
      user_agent,
      details,
      risk_score,
    }

    // Store in realtime memory for immediate UI updates
    realtimeAuditLogs.unshift(auditLog)
    
    // Limit realtime logs
    if (realtimeAuditLogs.length > 100) {
      realtimeAuditLogs.pop()
    }

    console.log("Real-time audit log created:", id)

    // Notify listeners for real-time updates
    notifyAuditEventListeners(auditLog)

    return auditLog
  } catch (error) {
    console.error("Error creating real-time audit log:", error)
    return null
  }
}

// Function to notify all listeners of a new audit log
function notifyAuditEventListeners(log: AuditLog) {
  auditEventListeners.forEach((listener) => {
    try {
      listener(log)
    } catch (error) {
      console.error("Error in audit event listener:", error)
    }
  })
}

// Register a listener for real-time audit log updates
export function onAuditEvent(listener: AuditEventListener): () => void {
  auditEventListeners.push(listener)

  // Return a function to unregister the listener
  return () => {
    const index = auditEventListeners.indexOf(listener)
    if (index !== -1) {
      auditEventListeners.splice(index, 1)
    }
  }
}

// Generate sample audit logs for testing
export function generateSampleAuditLogs(count: number): AuditLog[] {
  const eventTypes = Object.values(AuditEventType)
  const resourceTypes = Object.values(ResourceType)
  const statuses = ["success", "failure"] as const
  const userIds = ["user-1", "user-2", "user-3", "user-4", null]

  const sampleLogs = Array.from({ length: count }, (_, i) => ({
    id: `log-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    user_id: userIds[Math.floor(Math.random() * userIds.length)],
    event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    resource_type: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
    resource_id: Math.random() > 0.3 ? `resource-${Math.floor(Math.random() * 10)}` : null,
    action: ["login", "logout", "view", "update", "delete", "create"][Math.floor(Math.random() * 6)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: { sample: "data" },
    risk_score: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : null,
  }))

  // Add sample logs to in-memory storage
  realtimeAuditLogs.push(...sampleLogs)

  return sampleLogs
}

// Generate sample security events
export function generateSampleSecurityEvents(count: number): AuditLog[] {
  const sampleEvents = Array.from({ length: count }, (_, i) => ({
    id: `security-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    user_id: ["user-1", "user-2", "user-3", "user-4", null][Math.floor(Math.random() * 5)],
    event_type: [AuditEventType.AUTHENTICATION, AuditEventType.SECURITY][Math.floor(Math.random() * 2)],
    resource_type: ResourceType.USER,
    resource_id: Math.random() > 0.3 ? `resource-${Math.floor(Math.random() * 10)}` : null,
    action: ["failed_login", "suspicious_activity", "brute_force_attempt"][Math.floor(Math.random() * 3)],
    status: "failure" as const,
    ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: { reason: "suspicious_location" },
    risk_score: 70 + Math.floor(Math.random() * 30),
  }))

  // Add sample events to in-memory storage
  realtimeAuditLogs.push(...sampleEvents)

  return sampleEvents
}

// Initialize with some sample data
generateSampleAuditLogs(50)
generateSampleSecurityEvents(20)
