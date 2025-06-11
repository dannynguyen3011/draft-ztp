import { v4 as uuidv4 } from "uuid"
import { type AuditLog, AuditEventType, ResourceType } from "./db-schema"

// In-memory storage for audit logs (for preview/demo environment)
const inMemoryAuditLogs: AuditLog[] = []

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

// Create a new audit log entry
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

    // Store in memory
    inMemoryAuditLogs.unshift(auditLog) // Add to the beginning for newest first

    // Limit the size of in-memory logs to prevent memory issues
    if (inMemoryAuditLogs.length > 1000) {
      inMemoryAuditLogs.pop() // Remove oldest log
    }

    console.log("Audit log created:", id)

    // Notify listeners for real-time updates
    notifyAuditEventListeners(auditLog)

    return auditLog
  } catch (error) {
    console.error("Error creating audit log:", error)
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

// Get audit logs with pagination and filtering
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
    // Filter logs based on criteria
    let filteredLogs = [...inMemoryAuditLogs]

    if (user_id) {
      filteredLogs = filteredLogs.filter((log) => log.user_id === user_id)
    }

    if (event_type) {
      filteredLogs = filteredLogs.filter((log) => log.event_type === event_type)
    }

    if (resource_type) {
      filteredLogs = filteredLogs.filter((log) => log.resource_type === resource_type)
    }

    if (start_date) {
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= start_date)
    }

    if (end_date) {
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= end_date)
    }

    if (status) {
      filteredLogs = filteredLogs.filter((log) => log.status === status)
    }

    // Calculate pagination
    const total = filteredLogs.length
    const pages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    return {
      logs: paginatedLogs,
      total,
      pages,
    }
  } catch (error) {
    console.error("Error getting audit logs:", error)
    return { logs: [], total: 0, pages: 0 }
  }
}

// Get security events (failed logins, high risk activities)
export async function getSecurityEvents(days = 7, limit = 50): Promise<AuditLog[]> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Filter for security events
    const securityEvents = inMemoryAuditLogs.filter((log) => {
      return (
        ((log.event_type === AuditEventType.AUTHENTICATION && log.status === "failure") ||
          log.event_type === AuditEventType.SECURITY ||
          (log.risk_score !== null && log.risk_score > 70)) &&
        new Date(log.timestamp) >= startDate
      )
    })

    // Apply limit
    return securityEvents.slice(0, limit)
  } catch (error) {
    console.error("Error getting security events:", error)
    return []
  }
}

// Get user audit logs
export async function getUserAuditLogs(userId: string, page = 1, limit = 20): Promise<AuditLog[]> {
  try {
    // Filter logs for the specific user
    const userLogs = inMemoryAuditLogs.filter((log) => log.user_id === userId)

    // Apply pagination
    const offset = (page - 1) * limit
    return userLogs.slice(offset, offset + limit)
  } catch (error) {
    console.error("Error getting user audit logs:", error)
    return []
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
  inMemoryAuditLogs.push(...sampleLogs)

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
  inMemoryAuditLogs.push(...sampleEvents)

  return sampleEvents
}

// Initialize with some sample data
generateSampleAuditLogs(50)
generateSampleSecurityEvents(20)
