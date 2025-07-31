// Simple Authentication System for Hospital Analytics Admin Console
export class SimpleAuth {
  private isLoggedIn: boolean = false
  private readonly ADMIN_USERNAME = 'admin'
  private readonly ADMIN_PASSWORD = 'admin'

  constructor() {
    // Check if user is already logged in on initialization
    if (typeof window !== 'undefined') {
      this.isLoggedIn = localStorage.getItem('admin_logged_in') === 'true'
    }
  }

  // Login with hardcoded credentials
  login(username: string, password: string): boolean {
    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      this.isLoggedIn = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_logged_in', 'true')
        localStorage.setItem('admin_user', JSON.stringify({
          username: 'admin',
          name: 'Hospital Admin',
          role: 'admin'
        }))
      }
      return true
    }
    return false
  }

  // Logout
  logout(): void {
    this.isLoggedIn = false
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_logged_in')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false // Not authenticated on server-side
    }
    
    return localStorage.getItem('admin_logged_in') === 'true'
  }

  // Get current user
  getCurrentUser(): any | null {
    if (typeof window === 'undefined') {
      return null // No user info on server-side
    }

    const userInfo = localStorage.getItem('admin_user')
    return userInfo ? JSON.parse(userInfo) : null
  }

  // Get user roles - always returns admin for this simple system
  getUserRoles(): string[] {
    return this.isAuthenticated() ? ['admin'] : []
  }

  // For backwards compatibility with existing components
  getUserInfo(): Promise<any> {
    return Promise.resolve(this.getCurrentUser())
  }
}

// Export singleton instance
export const auth = new SimpleAuth() 