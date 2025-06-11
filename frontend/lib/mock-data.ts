// Mock data for dashboard components

// User data
export const users = [
  {
    id: "user-1",
    name: "John Manager",
    username: "john.manager",
    email: "john.manager@example.com",
    role: "manager",
    department: "IT Security",
    status: "active",
    lastLogin: "2023-05-12T08:30:00Z",
    riskScore: 25,
    riskLevel: "low",
  },
  {
    id: "user-2",
    name: "Sarah Manager",
    username: "sarah.manager",
    email: "sarah.manager@example.com",
    role: "manager",
    department: "Operations",
    status: "active",
    lastLogin: "2023-05-11T14:45:00Z",
    riskScore: 35,
    riskLevel: "low",
  },
  {
    id: "user-3",
    name: "Mike Member",
    username: "mike.member",
    email: "mike.member@example.com",
    role: "member",
    department: "Finance",
    status: "active",
    lastLogin: "2023-05-10T09:15:00Z",
    riskScore: 55,
    riskLevel: "medium",
  },
  {
    id: "user-4",
    name: "Lisa Member",
    username: "lisa.member",
    email: "lisa.member@example.com",
    role: "member",
    department: "HR",
    status: "inactive",
    lastLogin: "2023-05-01T11:20:00Z",
    riskScore: 30,
    riskLevel: "low",
  },
  {
    id: "user-5",
    name: "Alex Member",
    username: "alex.member",
    email: "alex.member@example.com",
    role: "member",
    department: "Marketing",
    status: "active",
    lastLogin: "2023-05-09T16:30:00Z",
    riskScore: 75,
    riskLevel: "high",
  },
]

// Risk scores data
export const riskScores = [
  { userId: "user-1", score: 25, level: "low", timestamp: "2023-05-12T08:30:00Z" },
  { userId: "user-2", score: 35, level: "low", timestamp: "2023-05-11T14:45:00Z" },
  { userId: "user-3", score: 55, level: "medium", timestamp: "2023-05-10T09:15:00Z" },
  { userId: "user-4", score: 30, level: "low", timestamp: "2023-05-01T11:20:00Z" },
  { userId: "user-5", score: 75, level: "high", timestamp: "2023-05-09T16:30:00Z" },
]

// Audit logs
export const auditLogs = [
  {
    id: "log-1",
    timestamp: "2023-05-12T08:30:00Z",
    userId: "user-1",
    action: "login",
    status: "success",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: { location: "New York, USA" },
  },
  {
    id: "log-2",
    timestamp: "2023-05-12T09:15:00Z",
    userId: "user-3",
    action: "access_document",
    status: "denied",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    details: { documentId: "doc-123", reason: "insufficient_permissions" },
  },
  {
    id: "log-3",
    timestamp: "2023-05-12T10:05:00Z",
    userId: "user-2",
    action: "update_user",
    status: "success",
    ipAddress: "192.168.1.22",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: { targetUserId: "user-4", changes: ["status"] },
  },
  {
    id: "log-4",
    timestamp: "2023-05-12T11:30:00Z",
    userId: "user-5",
    action: "download_report",
    status: "success",
    ipAddress: "192.168.1.87",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)",
    details: { reportId: "rep-456", size: "2.4MB" },
  },
  {
    id: "log-5",
    timestamp: "2023-05-12T13:45:00Z",
    userId: "user-3",
    action: "login",
    status: "failure",
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: { reason: "invalid_password", attempts: 2 },
  },
]

// Security incidents
export const securityIncidents = [
  {
    id: "inc-1",
    title: "Suspicious Login Attempt",
    severity: "high",
    status: "open",
    timestamp: "2023-05-11T23:15:00Z",
    assignedTo: "user-1",
    description: "Multiple failed login attempts from unusual location",
    affectedUsers: ["user-3"],
    details: { location: "Lagos, Nigeria", attempts: 5, ipAddress: "203.0.113.42" },
  },
  {
    id: "inc-2",
    title: "Unusual File Access Pattern",
    severity: "medium",
    status: "investigating",
    timestamp: "2023-05-10T14:30:00Z",
    assignedTo: "user-2",
    description: "User accessed 47 sensitive files within 5 minutes",
    affectedUsers: ["user-5"],
    details: { fileCount: 47, fileTypes: ["financial", "hr"], timeWindow: "5 minutes" },
  },
  {
    id: "inc-3",
    title: "Potential Data Exfiltration",
    severity: "critical",
    status: "mitigated",
    timestamp: "2023-05-09T08:45:00Z",
    assignedTo: "user-1",
    description: "Large data transfer to external storage detected",
    affectedUsers: ["user-4"],
    details: { dataSize: "1.7GB", destination: "external USB device", contentType: "customer data" },
  },
  {
    id: "inc-4",
    title: "Unauthorized Access Attempt",
    severity: "low",
    status: "resolved",
    timestamp: "2023-05-08T11:20:00Z",
    assignedTo: "user-2",
    description: "Attempt to access admin panel without proper permissions",
    affectedUsers: [],
    details: { targetSystem: "Admin Portal", userId: "user-3" },
  },
]

// Behavioral monitoring data
export const behavioralData = [
  {
    userId: "user-1",
    normalPatterns: {
      loginTimes: ["08:00-09:00", "13:00-14:00"],
      commonLocations: ["New York, USA"],
      deviceTypes: ["Windows Desktop", "iPhone"],
      averageSessionDuration: 6.5, // hours
      commonActivities: ["document access", "user management", "reporting"],
    },
    recentActivity: [
      {
        timestamp: "2023-05-12T08:30:00Z",
        action: "login",
        details: { location: "New York, USA", device: "Windows Desktop" },
      },
      { timestamp: "2023-05-12T09:15:00Z", action: "access_document", details: { documentId: "doc-456" } },
      {
        timestamp: "2023-05-12T10:30:00Z",
        action: "user_management",
        details: { action: "update_role", targetUser: "user-5" },
      },
    ],
    anomalies: [],
  },
  {
    userId: "user-3",
    normalPatterns: {
      loginTimes: ["09:00-10:00", "16:00-17:00"],
      commonLocations: ["Boston, USA"],
      deviceTypes: ["MacBook Pro", "Android Phone"],
      averageSessionDuration: 7.2, // hours
      commonActivities: ["financial reporting", "document access", "data analysis"],
    },
    recentActivity: [
      {
        timestamp: "2023-05-10T09:15:00Z",
        action: "login",
        details: { location: "Boston, USA", device: "MacBook Pro" },
      },
      { timestamp: "2023-05-10T11:30:00Z", action: "access_document", details: { documentId: "doc-789" } },
      { timestamp: "2023-05-10T14:45:00Z", action: "data_analysis", details: { reportId: "fin-q2" } },
    ],
    anomalies: [
      {
        timestamp: "2023-05-11T23:15:00Z",
        action: "login_attempt",
        severity: "high",
        details: {
          location: "Lagos, Nigeria",
          device: "Unknown",
          ipAddress: "203.0.113.42",
          reason: "Unusual location and time",
        },
      },
    ],
  },
  {
    userId: "user-5",
    normalPatterns: {
      loginTimes: ["08:30-09:30", "17:00-18:00"],
      commonLocations: ["Chicago, USA"],
      deviceTypes: ["Windows Laptop", "iPhone"],
      averageSessionDuration: 8.1, // hours
      commonActivities: ["marketing assets", "document access", "social media"],
    },
    recentActivity: [
      {
        timestamp: "2023-05-09T08:45:00Z",
        action: "login",
        details: { location: "Chicago, USA", device: "Windows Laptop" },
      },
      { timestamp: "2023-05-09T10:15:00Z", action: "access_document", details: { documentId: "doc-123" } },
      { timestamp: "2023-05-09T14:30:00Z", action: "file_access", details: { fileCount: 47, timeWindow: "5 minutes" } },
    ],
    anomalies: [
      {
        timestamp: "2023-05-09T14:30:00Z",
        action: "file_access",
        severity: "medium",
        details: {
          fileCount: 47,
          fileTypes: ["financial", "hr"],
          timeWindow: "5 minutes",
          reason: "Unusual access pattern and file types",
        },
      },
    ],
  },
]

// Access control policies
export const accessPolicies = [
  {
    id: "policy-1",
    name: "Finance Department Access",
    description: "Controls access to financial documents and systems",
    appliesTo: ["Finance"],
    resources: ["financial-docs", "accounting-system", "payroll-system"],
    conditions: {
      timeRestrictions: "Business hours only (9AM-5PM)",
      locationRestrictions: "Office network only",
      deviceRestrictions: "Company devices only",
      riskScoreThreshold: 60,
    },
    createdBy: "user-1",
    createdAt: "2023-04-15T10:00:00Z",
    updatedAt: "2023-05-01T14:30:00Z",
  },
  {
    id: "policy-2",
    name: "HR Document Access",
    description: "Controls access to sensitive HR documents",
    appliesTo: ["HR", "Management"],
    resources: ["hr-docs", "employee-records", "compensation-data"],
    conditions: {
      timeRestrictions: "Business hours only (9AM-5PM)",
      locationRestrictions: "Office network only",
      deviceRestrictions: "Company devices only",
      riskScoreThreshold: 50,
    },
    createdBy: "user-2",
    createdAt: "2023-04-10T11:15:00Z",
    updatedAt: "2023-04-28T09:45:00Z",
  },
  {
    id: "policy-3",
    name: "Customer Data Access",
    description: "Controls access to customer information",
    appliesTo: ["Sales", "Customer Support", "Marketing"],
    resources: ["crm-system", "customer-records", "support-tickets"],
    conditions: {
      timeRestrictions: "24/7 access",
      locationRestrictions: "Any location with MFA",
      deviceRestrictions: "Company devices preferred",
      riskScoreThreshold: 70,
    },
    createdBy: "user-1",
    createdAt: "2023-04-05T15:30:00Z",
    updatedAt: "2023-05-05T10:20:00Z",
  },
  {
    id: "policy-4",
    name: "Admin Panel Access",
    description: "Controls access to administrative functions",
    appliesTo: ["IT Security", "Management"],
    resources: ["admin-panel", "system-configuration", "user-management"],
    conditions: {
      timeRestrictions: "Business hours only (9AM-5PM)",
      locationRestrictions: "Office network only",
      deviceRestrictions: "Company devices only",
      riskScoreThreshold: 40,
    },
    createdBy: "user-2",
    createdAt: "2023-03-20T09:00:00Z",
    updatedAt: "2023-04-15T16:45:00Z",
  },
]

// Compliance frameworks
export const complianceFrameworks = [
  {
    id: "comp-1",
    name: "GDPR",
    description: "General Data Protection Regulation",
    status: "Compliant",
    lastAssessment: "2023-04-01T00:00:00Z",
    nextAssessment: "2023-07-01T00:00:00Z",
    requirements: [
      { id: "gdpr-1", name: "Data Protection Officer", status: "Implemented" },
      { id: "gdpr-2", name: "Data Processing Register", status: "Implemented" },
      { id: "gdpr-3", name: "Privacy Notices", status: "Implemented" },
      { id: "gdpr-4", name: "Data Subject Rights Process", status: "Implemented" },
      { id: "gdpr-5", name: "Data Breach Notification Process", status: "Implemented" },
    ],
  },
  {
    id: "comp-2",
    name: "SOC 2",
    description: "Service Organization Control 2",
    status: "In Progress",
    lastAssessment: "2023-03-15T00:00:00Z",
    nextAssessment: "2023-06-15T00:00:00Z",
    requirements: [
      { id: "soc2-1", name: "Security Policies", status: "Implemented" },
      { id: "soc2-2", name: "Access Controls", status: "Implemented" },
      { id: "soc2-3", name: "Risk Management", status: "In Progress" },
      { id: "soc2-4", name: "Vendor Management", status: "In Progress" },
      { id: "soc2-5", name: "Incident Response", status: "Implemented" },
    ],
  },
  {
    id: "comp-3",
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act",
    status: "Compliant",
    lastAssessment: "2023-02-01T00:00:00Z",
    nextAssessment: "2023-08-01T00:00:00Z",
    requirements: [
      { id: "hipaa-1", name: "Privacy Rule Compliance", status: "Implemented" },
      { id: "hipaa-2", name: "Security Rule Compliance", status: "Implemented" },
      { id: "hipaa-3", name: "Breach Notification Rule", status: "Implemented" },
      { id: "hipaa-4", name: "Business Associate Agreements", status: "Implemented" },
      { id: "hipaa-5", name: "Training Program", status: "Implemented" },
    ],
  },
]

// Integration configurations
export const integrations = [
  {
    id: "int-1",
    name: "Okta SSO",
    type: "Identity Provider",
    status: "Active",
    lastSync: "2023-05-12T06:00:00Z",
    configuration: {
      apiEndpoint: "https://example.okta.com/api/v1",
      features: ["SSO", "MFA", "Directory Sync"],
      userCount: 250,
    },
  },
  {
    id: "int-2",
    name: "AWS CloudTrail",
    type: "Cloud Provider",
    status: "Active",
    lastSync: "2023-05-12T07:15:00Z",
    configuration: {
      region: "us-east-1",
      features: ["Audit Logs", "Resource Monitoring"],
      resourceCount: 120,
    },
  },
  {
    id: "int-3",
    name: "Slack",
    type: "Communication",
    status: "Active",
    lastSync: "2023-05-12T08:30:00Z",
    configuration: {
      workspace: "example-workspace",
      features: ["Notifications", "Incident Alerts"],
      channelCount: 15,
    },
  },
  {
    id: "int-4",
    name: "Jira",
    type: "Ticketing",
    status: "Inactive",
    lastSync: "2023-05-10T09:45:00Z",
    configuration: {
      instance: "example.atlassian.net",
      features: ["Incident Tracking", "Task Management"],
      projectCount: 8,
    },
  },
]

// Knowledge base articles for incident response
export const knowledgeBaseArticles = [
  {
    id: "kb-1",
    title: "Responding to Phishing Attacks",
    category: "Security Incidents",
    author: "John Manager",
    createdAt: "2023-04-10T00:00:00Z",
    updatedAt: "2023-05-05T00:00:00Z",
    content: "This guide outlines the steps to take when responding to phishing attacks...",
    tags: ["phishing", "email security", "incident response"],
  },
  {
    id: "kb-2",
    title: "Data Breach Response Protocol",
    category: "Security Incidents",
    author: "Sarah Manager",
    createdAt: "2023-03-15T00:00:00Z",
    updatedAt: "2023-04-20T00:00:00Z",
    content: "Follow these steps when responding to a potential data breach...",
    tags: ["data breach", "incident response", "compliance"],
  },
  {
    id: "kb-3",
    title: "Ransomware Mitigation Guide",
    category: "Security Incidents",
    author: "John Manager",
    createdAt: "2023-02-28T00:00:00Z",
    updatedAt: "2023-04-15T00:00:00Z",
    content: "This guide provides steps to mitigate and respond to ransomware attacks...",
    tags: ["ransomware", "incident response", "data recovery"],
  },
  {
    id: "kb-4",
    title: "Suspicious Login Investigation",
    category: "User Access",
    author: "Mike Member",
    createdAt: "2023-04-05T00:00:00Z",
    updatedAt: "2023-05-01T00:00:00Z",
    content: "Follow this process to investigate suspicious login attempts...",
    tags: ["authentication", "suspicious activity", "investigation"],
  },
  {
    id: "kb-5",
    title: "Zero Trust Implementation Guide",
    category: "Best Practices",
    author: "Sarah Manager",
    createdAt: "2023-01-20T00:00:00Z",
    updatedAt: "2023-03-10T00:00:00Z",
    content: "This comprehensive guide outlines how to implement zero trust architecture...",
    tags: ["zero trust", "implementation", "security architecture"],
  },
]

// FAQs for support
export const faqs = [
  {
    id: "faq-1",
    question: "What is Zero Trust Authentication?",
    answer:
      "Zero Trust Authentication is a security model that requires strict identity verification for every person and device trying to access resources, regardless of whether they are inside or outside the network perimeter.",
    category: "General",
  },
  {
    id: "faq-2",
    question: "How does risk-based authentication work?",
    answer:
      "Risk-based authentication analyzes various factors such as user location, device, time of access, and behavior patterns to calculate a risk score. This score determines the level of authentication required or whether access should be denied.",
    category: "Authentication",
  },
  {
    id: "faq-3",
    question: "What should I do if I get locked out of my account?",
    answer:
      "If you're locked out of your account, please contact your system administrator or the IT help desk. They can verify your identity through alternative means and reset your access.",
    category: "Account Access",
  },
  {
    id: "faq-4",
    question: "How often should I rotate my password?",
    answer:
      "Under our Zero Trust policy, we recommend changing your password every 90 days. However, using strong, unique passwords and enabling multi-factor authentication is more important than frequent rotation.",
    category: "Password Management",
  },
  {
    id: "faq-5",
    question: "What information is collected for behavioral monitoring?",
    answer:
      "Our behavioral monitoring system collects data such as login times, locations, devices used, resources accessed, and patterns of system usage. This information is used solely for security purposes to detect anomalous behavior.",
    category: "Privacy",
  },
]
