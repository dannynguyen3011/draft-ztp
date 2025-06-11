import { useState, useEffect } from 'react'
import { keycloakAuth } from './keycloak'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (keycloakAuth.isAuthenticated()) {
      const currentUser = keycloakAuth.getCurrentUser()
      setUser({
        ...currentUser,
        roles: ['manager'], // Mock role for demo
        riskLevel: 'low' // Mock risk level
      })
    }
    setIsLoading(false)
  }, [])

  const riskLevel = user?.riskLevel || 'low'

  return {
    user,
    isLoading,
    riskLevel
  }
} 