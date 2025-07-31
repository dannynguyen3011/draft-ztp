// Service to fetch real user data from backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

export interface User {
  id: string;
  userId: string;
  username: string;
  name: string; // Display name (same as username)
  email: string;
  roles: string[];
  role: string; // Primary role for display
  department: string;
  lastActive: string;
  totalActivities: number;
  riskScore: number;
  status: 'active' | 'inactive';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  count: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  highRisk: number;
}

// Fetch all users from backend (MongoDB hospital data)
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/users`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data: UsersResponse = await response.json();
    
    if (data.success && data.data) {
      return data.data.map(user => ({
        ...user,
        // Ensure all fields are properly mapped
        userId: user.id || user.userId,
        username: user.name || user.username,
        role: getUserRole(user.roles || []), // Ensure roles is always an array
        riskLevel: user.riskLevel || 'low',
        roles: user.roles || [] // Ensure roles is always an array
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}

// Fetch user statistics from backend
export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/users/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user stats: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return {
      total: 0,
      active: 0,
      inactive: 0,
      highRisk: 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      highRisk: 0
    };
  }
}

// Helper function to determine primary role
function getUserRole(roles: string[]): string {
  // Handle undefined or null roles
  if (!roles || !Array.isArray(roles)) {
    return 'User';
  }
  
  if (roles.includes('admin')) return 'Admin';
  if (roles.includes('manager')) return 'Manager';
  if (roles.includes('doctor')) return 'Doctor';
  if (roles.includes('nurse')) return 'Nurse';
  if (roles.includes('employee')) return 'Employee';
  return 'User';
}

// Get users filtered by risk level
export async function getUsersByRisk(riskLevel: 'low' | 'medium' | 'high'): Promise<User[]> {
  const users = await getUsers();
  return users.filter(user => user.riskLevel === riskLevel);
}

// Get high-risk users (for security monitoring)
export async function getHighRiskUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/hospital/high-risk-users`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch high-risk users: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching high-risk users:', error);
    return [];
  }
}

// Get active users (logged in within last week)
export async function getActiveUsers(): Promise<User[]> {
  const users = await getUsers();
  return users.filter(user => user.status === 'active');
} 