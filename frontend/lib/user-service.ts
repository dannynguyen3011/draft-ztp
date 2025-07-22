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
  lastLogin: string;
  totalLogins: number;
  failedLogins: number;
  averageRiskScore: number;
  riskScore: number; // Alias for averageRiskScore
  status: 'active' | 'inactive';
  riskLevel: 'low' | 'medium' | 'high';
  loginSuccessRate: number;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
  total: number;
}

// Fetch all users from backend
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/log/users`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data: UsersResponse = await response.json();
    
    if (data.success && data.users) {
      return data.users.map(user => ({
        ...user,
        // Map backend roles to frontend format
        role: getUserRole(user.roles),
        name: user.username, // Use username as display name
        riskScore: user.averageRiskScore
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}

// Helper function to determine primary role
function getUserRole(roles: string[]): string {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('manager')) return 'manager';
  return 'member';
}

// Get users filtered by risk level
export async function getUsersByRisk(riskLevel: 'low' | 'medium' | 'high'): Promise<User[]> {
  const users = await getUsers();
  return users.filter(user => user.riskLevel === riskLevel);
}

// Get high-risk users (for security monitoring)
export async function getHighRiskUsers(): Promise<User[]> {
  return getUsersByRisk('high');
}

// Get active users (logged in within last week)
export async function getActiveUsers(): Promise<User[]> {
  const users = await getUsers();
  return users.filter(user => user.status === 'active');
}

// Get user statistics
export async function getUserStats() {
  const users = await getUsers();
  
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    lowRisk: users.filter(u => u.riskLevel === 'low').length,
    mediumRisk: users.filter(u => u.riskLevel === 'medium').length,
    highRisk: users.filter(u => u.riskLevel === 'high').length,
    averageLoginSuccess: users.length > 0 
      ? Math.round(users.reduce((sum, u) => sum + u.loginSuccessRate, 0) / users.length)
      : 0
  };
  
  return stats;
} 