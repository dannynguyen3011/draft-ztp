// This file defines the database schema for our PostgreSQL database

export type User = {
  id: string
  username: string
  email: string
  password_hash: string // In production, store hashed passwords only
  role: "manager" | "member"
  created_at: Date
  last_login: Date
}

export type RiskScore = {
  id: string
  user_id: string
  score: number // 0-100
  risk_level: "low" | "medium" | "high"
  factors: string[] // Factors that contributed to the risk score
  timestamp: Date
}

export type Meeting = {
  id: string
  title: string
  description: string
  start_time: Date
  end_time: Date
  created_by: string // User ID
  summary: string
}

export type MeetingParticipant = {
  id: string
  meeting_id: string
  user_id: string
  join_time: Date
  leave_time: Date | null
  duration_minutes: number | null
}

// New schema for audit logs
export type AuditLog = {
  id: string
  timestamp: Date
  user_id: string | null // Can be null for anonymous/system events
  event_type: AuditEventType
  resource_type: ResourceType
  resource_id: string | null
  action: string
  status: "success" | "failure"
  ip_address: string | null
  user_agent: string | null
  details: Record<string, any> // Additional context about the event
  risk_score: number | null
}

// Enum for audit event types
export enum AuditEventType {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  USER_MANAGEMENT = "user_management",
  DATA_ACCESS = "data_access",
  SYSTEM = "system",
  SECURITY = "security",
  MFA = "mfa",
}

// Enum for resource types
export enum ResourceType {
  USER = "user",
  MEETING = "meeting",
  SYSTEM = "system",
  DOCUMENT = "document",
  SETTING = "setting",
}
