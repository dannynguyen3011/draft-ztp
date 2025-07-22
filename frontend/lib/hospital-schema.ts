// Hospital Database Schema Types
// These types represent the data structure from the hospital web application

export interface HospitalUser {
  _id: string
  username: string
  email: string
  role: 'doctor' | 'nurse' | 'admin' | 'patient' | 'staff'
  firstName: string
  lastName: string
  department?: string
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
  permissions: string[]
}

export interface PatientRecord {
  _id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'male' | 'female' | 'other'
  contactInfo: {
    phone?: string
    email?: string
    address?: string
  }
  medicalHistory: {
    allergies: string[]
    medications: string[]
    conditions: string[]
  }
  createdAt: Date
  updatedAt: Date
  assignedDoctor?: string
  status: 'active' | 'discharged' | 'transferred'
}

export interface MedicalRecord {
  _id: string
  patientId: string
  doctorId: string
  visitDate: Date
  diagnosis: string
  treatment: string
  prescription?: string[]
  notes?: string
  followUpDate?: Date
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface UserActivity {
  _id: string
  userId: string
  username: string
  action: string
  resource: string
  resourceId?: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  success: boolean
  details?: {
    method?: string
    endpoint?: string
    statusCode?: number
    duration?: number
    additionalInfo?: any
  }
  riskLevel: 'low' | 'medium' | 'high'
  riskScore: number
}

export interface SecurityEvent {
  _id: string
  userId?: string
  eventType: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'unauthorized_access' | 'data_breach' | 'policy_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: Date
  ipAddress: string
  userAgent?: string
  location?: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  metadata?: any
}

export interface DepartmentActivity {
  _id: string
  department: string
  date: Date
  metrics: {
    totalUsers: number
    activeUsers: number
    totalActivities: number
    riskEvents: number
    averageRiskScore: number
    topActivities: {
      action: string
      count: number
    }[]
  }
}

export interface SystemMetrics {
  _id: string
  timestamp: Date
  metrics: {
    totalUsers: number
    activeUsers: number
    totalPatients: number
    totalRecords: number
    systemLoad: number
    responseTime: number
    errorRate: number
    securityEvents: number
  }
  performance: {
    dbQueryTime: number
    apiResponseTime: number
    memoryUsage: number
    cpuUsage: number
  }
}

// Audit Event Types for Hospital System
export enum HospitalAuditEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SYSTEM_ACCESS = 'system_access',
  SECURITY_EVENT = 'security_event',
  PATIENT_RECORD_ACCESS = 'patient_record_access',
  MEDICAL_RECORD_UPDATE = 'medical_record_update',
  USER_MANAGEMENT = 'user_management',
  CONFIGURATION_CHANGE = 'configuration_change'
}

// Resource Types in Hospital System
export enum HospitalResourceType {
  USER = 'user',
  PATIENT = 'patient',
  MEDICAL_RECORD = 'medical_record',
  DEPARTMENT = 'department',
  SYSTEM = 'system',
  APPOINTMENT = 'appointment',
  PRESCRIPTION = 'prescription',
  LAB_RESULT = 'lab_result',
  BILLING = 'billing'
}

// Risk Assessment Data
export interface RiskAssessment {
  _id: string
  userId: string
  timestamp: Date
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  factors: {
    timeOfAccess: number
    locationRisk: number
    behaviorPattern: number
    dataAccessed: number
    accessFrequency: number
  }
  recommendations: string[]
}

// Analytics Dashboard Data
export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  securityEvents: number
  riskEvents: number
  averageRiskScore: number
  departmentActivity: {
    department: string
    activityCount: number
    riskScore: number
  }[]
  recentActivities: UserActivity[]
  topRiskUsers: {
    userId: string
    username: string
    riskScore: number
    lastActivity: Date
  }[]
}

// Behavioral Monitoring Data
export interface BehaviorPattern {
  _id: string
  userId: string
  pattern: {
    loginTimes: number[]
    accessPatterns: string[]
    frequentActions: string[]
    locationHistory: string[]
    deviceFingerprints: string[]
  }
  baseline: {
    normalLoginHours: number[]
    typicalActions: string[]
    usualLocations: string[]
  }
  anomalies: {
    timestamp: Date
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }[]
  lastUpdated: Date
}

// Export utility types
export type HospitalCollection = 
  | 'users'
  | 'patients' 
  | 'medical_records'
  | 'user_activities'
  | 'security_events'
  | 'department_activities'
  | 'system_metrics'
  | 'risk_assessments'
  | 'behavior_patterns';

export type UserRole = HospitalUser['role'];
export type EventType = keyof typeof HospitalAuditEventType;
export type ResourceType = keyof typeof HospitalResourceType; 