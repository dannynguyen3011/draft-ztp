// Direct Keycloak Integration (No NextAuth)
export class KeycloakAuth {
  private keycloakUrl: string
  private realm: string
  private clientId: string
  private redirectUri: string

  constructor() {
    this.keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'
    this.realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'demo'
    this.clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'demo-client'
    // Handle SSR - only set redirectUri when window is available
    this.redirectUri = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback' // fallback for SSR
  }

  // Generate login URL with proper state handling
  getLoginUrl(state: string): string {
    // Ensure we have the correct redirectUri when this is called (client-side)
    if (typeof window !== 'undefined') {
      this.redirectUri = `${window.location.origin}/auth/callback`
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: state, // Use the provided state
    })

    return `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/auth?${params}`
  }

  // Redirect to Keycloak login
  login(): void {
    if (typeof window === 'undefined') {
      console.error('Login can only be called on client-side')
      return
    }

    // Generate state and store it BEFORE creating the URL
    const state = this.generateState()
    localStorage.setItem('keycloak_state', state)
    
    // Get login URL with the same state
    const loginUrl = this.getLoginUrl(state)
    

    window.location.href = loginUrl
  }

  // Exchange code for token
  async exchangeCodeForToken(code: string, state: string): Promise<any> {
    if (typeof window === 'undefined') {
      throw new Error('Token exchange can only be performed on client-side')
    }

    const storedState = localStorage.getItem('keycloak_state')
    
    if (!storedState) {
      throw new Error('No stored state found. Please try logging in again.')
    }

    if (state !== storedState) {
      throw new Error(`Invalid state parameter. Expected: ${storedState}, Received: ${state}`)
    }

    // Update redirectUri to current origin
    this.redirectUri = `${window.location.origin}/auth/callback`

    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code: code,
        redirect_uri: this.redirectUri,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token exchange failed:', errorText)
      throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText}`)
    }

    const tokens = await response.json()
    
    // Store tokens
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    localStorage.setItem('id_token', tokens.id_token)
    
    // Clear state
    localStorage.removeItem('keycloak_state')
    
    return tokens
  }

  // Get user info from token
  async getUserInfo(): Promise<any> {
    if (typeof window === 'undefined') {
      throw new Error('User info can only be retrieved on client-side')
    }

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      throw new Error('No access token found')
    }

    const userInfoUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`
    
    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get user info')
    }

    return response.json()
  }

  // Logout
  logout(): void {
    if (typeof window === 'undefined') {
      console.error('Logout can only be called on client-side')
      return
    }

    const idToken = localStorage.getItem('id_token')
    
    // Clear local storage first
    this.clearLocalStorage()

    // Navigate to main page immediately to prevent flash
    window.location.href = '/'

    // Then try Keycloak logout in background (won't cause redirect flash)
    try {
      if (idToken) {
        // Do a background logout to Keycloak without redirect
        this.backgroundKeycloakLogout(idToken)
      }
    } catch (error) {
      console.error('Background Keycloak logout failed:', error)
    }
  }

  // Clear all authentication data from local storage
  private clearLocalStorage(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('keycloak_state')
  }

  // Keycloak server logout
  private keycloakLogout(idToken: string | null): void {
    const logoutUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout`
    const params = new URLSearchParams()

    // Use root URL as redirect URI to match Keycloak client config
    const redirectUri = `${window.location.origin}/`
    params.append('post_logout_redirect_uri', redirectUri)

    if (idToken) {
      params.append('id_token_hint', idToken)
    }


    window.location.href = `${logoutUrl}?${params}`
  }

  // Background Keycloak logout (without redirect)
  private backgroundKeycloakLogout(idToken: string): void {
    const logoutUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout`
    const params = new URLSearchParams()

    if (idToken) {
      params.append('id_token_hint', idToken)
    }

    // Use fetch to logout in background without redirect
    fetch(`${logoutUrl}?${params}`, {
      method: 'GET',
      mode: 'no-cors' // Prevent CORS issues
    }).catch(error => {
      console.warn('Background Keycloak logout failed:', error)
    })
  }

  // Simple logout (just redirect to main page)
  private simpleLogout(): void {

    window.location.href = '/'
  }

  // Manual logout (for testing) - just clears storage and redirects
  manualLogout(): void {
    if (typeof window === 'undefined') {
      console.error('Manual logout can only be called on client-side')
      return
    }

    this.clearLocalStorage()
    this.simpleLogout()
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false // Not authenticated on server-side
    }

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) return false

    try {
      // Basic token validation (decode JWT payload)
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const now = Date.now() / 1000
      
      // Check if token is expired
      if (payload.exp && payload.exp < now) {
        this.logout()
        return false
      }

      return true
    } catch (error) {
      console.error('Token validation error:', error)
      this.logout()
      return false
    }
  }

  // Get current user
  getCurrentUser(): any | null {
    if (typeof window === 'undefined') {
      return null // No user info on server-side
    }

    const userInfo = localStorage.getItem('user_info')
    return userInfo ? JSON.parse(userInfo) : null
  }

  // Get user roles from JWT token
  getUserRoles(): string[] {
    if (typeof window === 'undefined') {
      return []
    }

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) return []

    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      
      // Extract realm roles
      const realmRoles = payload.realm_access?.roles || []
      
      // Extract client roles
      const clientRoles: string[] = []
      if (payload.resource_access) {
        Object.values(payload.resource_access).forEach((client: any) => {
          if (client.roles) {
            clientRoles.push(...client.roles)
          }
        })
      }
      
      // Combine and filter out default Keycloak roles
      const allRoles = [...realmRoles, ...clientRoles]
      const userRoles = allRoles.filter(role => 
        !['offline_access', 'uma_authorization', 'default-roles-demo'].includes(role)
      )
      
      return userRoles
    } catch (error) {
      console.error('Error extracting roles from token:', error)
      return []
    }
  }

  // Generate random state for CSRF protection
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}

// Export singleton instance - but only create when needed
let keycloakAuthInstance: KeycloakAuth | null = null

export const keycloakAuth = new Proxy({} as KeycloakAuth, {
  get(target, prop) {
    if (!keycloakAuthInstance) {
      keycloakAuthInstance = new KeycloakAuth()
    }
    return (keycloakAuthInstance as any)[prop]
  }
}) 