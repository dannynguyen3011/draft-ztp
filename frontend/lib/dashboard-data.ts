// This file provides mock data for the dashboard
// In a real application, this would fetch data from APIs

// Mock login attempts data
const mockLoginAttempts = [
  {
    user: "john.doe@example.com",
    time: "Today, 10:23 AM",
    location: "New York, USA",
    device: "MacBook Pro",
    success: true,
    risk: "low",
  },
  {
    user: "sarah.smith@example.com",
    time: "Today, 9:45 AM",
    location: "Chicago, USA",
    device: "iPhone 13",
    success: true,
    risk: "low",
  },
  {
    user: "admin@example.com",
    time: "Today, 8:30 AM",
    location: "San Francisco, USA",
    device: "Windows PC",
    success: true,
    risk: "low",
  },
  {
    user: "unknown@example.com",
    time: "Today, 7:15 AM",
    location: "Moscow, Russia",
    device: "Android Device",
    success: false,
    risk: "high",
  },
  {
    user: "john.doe@example.com",
    time: "Yesterday, 11:52 PM",
    location: "Beijing, China",
    device: "Unknown Device",
    success: false,
    risk: "high",
  },
  {
    user: "michael.johnson@example.com",
    time: "Yesterday, 4:30 PM",
    location: "London, UK",
    device: "iPad Pro",
    success: true,
    risk: "medium",
  },
  {
    user: "emily.wilson@example.com",
    time: "Yesterday, 2:15 PM",
    location: "Toronto, Canada",
    device: "Samsung Galaxy",
    success: true,
    risk: "low",
  },
]

// Mock active users data
const mockActiveUsers = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Developer",
    sessionStart: "Today, 10:23 AM",
    lastActivity: "2 minutes ago",
    riskScore: 15,
  },
  {
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    role: "Marketing",
    sessionStart: "Today, 9:45 AM",
    lastActivity: "5 minutes ago",
    riskScore: 22,
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator",
    sessionStart: "Today, 8:30 AM",
    lastActivity: "Just now",
    riskScore: 45,
  },
  {
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    role: "Sales",
    sessionStart: "Today, 11:15 AM",
    lastActivity: "1 minute ago",
    riskScore: 18,
  },
]

// Function to get security score
export async function getSecurityScore(): Promise<number> {
  // In a real app, this would calculate a security score based on various factors
  // For demo purposes, we'll return a fixed score
  return 78
}

// Function to get recent login attempts
export async function getRecentLoginAttempts(): Promise<any[]> {
  // In a real app, this would fetch login attempts from an API
  // For demo purposes, we'll return mock data

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockLoginAttempts
}

// Function to get active users
export async function getActiveUsers(): Promise<any[]> {
  // In a real app, this would fetch active users from an API
  // For demo purposes, we'll return mock data

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockActiveUsers
}
