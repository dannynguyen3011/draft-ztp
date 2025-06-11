import type { User, RiskScore, Meeting, MeetingParticipant } from "./db-schema"

// Sample users with different roles
export const sampleUsers: User[] = [
  {
    id: "user-1",
    username: "john.manager",
    email: "john.manager@example.com",
    password_hash: "$2a$10$XQtJ5vMq5XB8xv5mSj5zXO5cOzR0wUGzx4G7HVnNUQHR9jR1m3Yx6", // password: manager123
    role: "manager",
    created_at: new Date("2023-01-01"),
    last_login: new Date("2023-04-15"),
  },
  {
    id: "user-2",
    username: "sarah.manager",
    email: "sarah.manager@example.com",
    password_hash: "$2a$10$XQtJ5vMq5XB8xv5mSj5zXO5cOzR0wUGzx4G7HVnNUQHR9jR1m3Yx6", // password: manager123
    role: "manager",
    created_at: new Date("2023-01-15"),
    last_login: new Date("2023-04-10"),
  },
  {
    id: "user-3",
    username: "mike.member",
    email: "mike.member@example.com",
    password_hash: "$2a$10$5H0PFPAEDYYMfUMGHXDyxuBhT3rOB9Jk5y5DZzwCgHm4.UdpUjkJO", // password: member123
    role: "member",
    created_at: new Date("2023-02-01"),
    last_login: new Date("2023-04-12"),
  },
  {
    id: "user-4",
    username: "lisa.member",
    email: "lisa.member@example.com",
    password_hash: "$2a$10$5H0PFPAEDYYMfUMGHXDyxuBhT3rOB9Jk5y5DZzwCgHm4.UdpUjkJO", // password: member123
    role: "member",
    created_at: new Date("2023-02-15"),
    last_login: new Date("2023-04-14"),
  },
  {
    id: "user-5",
    username: "alex.member",
    email: "alex.member@example.com",
    password_hash: "$2a$10$5H0PFPAEDYYMfUMGHXDyxuBhT3rOB9Jk5y5DZzwCgHm4.UdpUjkJO", // password: member123
    role: "member",
    created_at: new Date("2023-03-01"),
    last_login: new Date("2023-04-13"),
  },
]

// Sample risk scores for users
export const sampleRiskScores: RiskScore[] = [
  {
    id: "risk-1",
    user_id: "user-1",
    score: 25,
    risk_level: "low",
    factors: ["regular login pattern", "known device", "known location"],
    timestamp: new Date("2023-04-15T10:30:00Z"),
  },
  {
    id: "risk-2",
    user_id: "user-2",
    score: 35,
    risk_level: "low",
    factors: ["regular login pattern", "known device", "unusual time"],
    timestamp: new Date("2023-04-10T22:15:00Z"),
  },
  {
    id: "risk-3",
    user_id: "user-3",
    score: 55,
    risk_level: "medium",
    factors: ["new device", "known location", "unusual time"],
    timestamp: new Date("2023-04-12T03:45:00Z"),
  },
  {
    id: "risk-4",
    user_id: "user-4",
    score: 30,
    risk_level: "low",
    factors: ["regular login pattern", "known device", "known location"],
    timestamp: new Date("2023-04-14T14:20:00Z"),
  },
  {
    id: "risk-5",
    user_id: "user-5",
    score: 75,
    risk_level: "high",
    factors: ["new device", "new location", "unusual time", "multiple failed attempts"],
    timestamp: new Date("2023-04-13T01:10:00Z"),
  },
]

// Sample meetings
export const sampleMeetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "Q1 Performance Review",
    description: "Review of Q1 performance metrics and goals for Q2",
    start_time: new Date("2023-04-10T10:00:00Z"),
    end_time: new Date("2023-04-10T11:30:00Z"),
    created_by: "user-1",
    summary:
      "Discussed Q1 results (15% above target). Set Q2 goals focusing on market expansion and product improvements.",
  },
  {
    id: "meeting-2",
    title: "Product Roadmap Planning",
    description: "Planning session for product features in the next 6 months",
    start_time: new Date("2023-04-12T14:00:00Z"),
    end_time: new Date("2023-04-12T16:00:00Z"),
    created_by: "user-2",
    summary: "Prioritized 5 key features for next release. Timeline set for June launch. Assigned development teams.",
  },
  {
    id: "meeting-3",
    title: "Security Protocol Review",
    description: "Review and update of security protocols and procedures",
    start_time: new Date("2023-04-14T09:00:00Z"),
    end_time: new Date("2023-04-14T10:30:00Z"),
    created_by: "user-1",
    summary: "Updated access control policies. Implemented new MFA requirements. Scheduled security training for May.",
  },
]

// Sample meeting participants
export const sampleMeetingParticipants: MeetingParticipant[] = [
  // Meeting 1 participants
  {
    id: "participant-1",
    meeting_id: "meeting-1",
    user_id: "user-1",
    join_time: new Date("2023-04-10T09:55:00Z"),
    leave_time: new Date("2023-04-10T11:30:00Z"),
    duration_minutes: 95,
  },
  {
    id: "participant-2",
    meeting_id: "meeting-1",
    user_id: "user-2",
    join_time: new Date("2023-04-10T10:00:00Z"),
    leave_time: new Date("2023-04-10T11:30:00Z"),
    duration_minutes: 90,
  },
  {
    id: "participant-3",
    meeting_id: "meeting-1",
    user_id: "user-3",
    join_time: new Date("2023-04-10T10:05:00Z"),
    leave_time: new Date("2023-04-10T11:25:00Z"),
    duration_minutes: 80,
  },
  {
    id: "participant-4",
    meeting_id: "meeting-1",
    user_id: "user-4",
    join_time: new Date("2023-04-10T10:10:00Z"),
    leave_time: new Date("2023-04-10T11:30:00Z"),
    duration_minutes: 80,
  },

  // Meeting 2 participants
  {
    id: "participant-5",
    meeting_id: "meeting-2",
    user_id: "user-2",
    join_time: new Date("2023-04-12T13:55:00Z"),
    leave_time: new Date("2023-04-12T16:00:00Z"),
    duration_minutes: 125,
  },
  {
    id: "participant-6",
    meeting_id: "meeting-2",
    user_id: "user-3",
    join_time: new Date("2023-04-12T14:00:00Z"),
    leave_time: new Date("2023-04-12T16:00:00Z"),
    duration_minutes: 120,
  },
  {
    id: "participant-7",
    meeting_id: "meeting-2",
    user_id: "user-5",
    join_time: new Date("2023-04-12T14:05:00Z"),
    leave_time: new Date("2023-04-12T15:45:00Z"),
    duration_minutes: 100,
  },

  // Meeting 3 participants
  {
    id: "participant-8",
    meeting_id: "meeting-3",
    user_id: "user-1",
    join_time: new Date("2023-04-14T08:55:00Z"),
    leave_time: new Date("2023-04-14T10:30:00Z"),
    duration_minutes: 95,
  },
  {
    id: "participant-9",
    meeting_id: "meeting-3",
    user_id: "user-2",
    join_time: new Date("2023-04-14T09:00:00Z"),
    leave_time: new Date("2023-04-14T10:30:00Z"),
    duration_minutes: 90,
  },
  {
    id: "participant-10",
    meeting_id: "meeting-3",
    user_id: "user-4",
    join_time: new Date("2023-04-14T09:10:00Z"),
    leave_time: new Date("2023-04-14T10:25:00Z"),
    duration_minutes: 75,
  },
  {
    id: "participant-11",
    meeting_id: "meeting-3",
    user_id: "user-5",
    join_time: new Date("2023-04-14T09:15:00Z"),
    leave_time: new Date("2023-04-14T10:30:00Z"),
    duration_minutes: 75,
  },
]
