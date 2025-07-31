import { auth } from './auth'
import { useState, useEffect } from 'react'

export interface AuthState {
  isAuthenticated: boolean
  user: any | null
  roles: string[]
  loading: boolean
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    roles: [],
    loading: true
  })

  useEffect(() => {
    const checkAuth = () => {
      if (auth.isAuthenticated()) {
        const currentUser = auth.getCurrentUser()
        const userRoles = auth.getUserRoles()
        
        setAuthState({
          isAuthenticated: true,
          user: currentUser,
          roles: userRoles,
          loading: false
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          roles: [],
          loading: false
        })
      }
    }

    checkAuth()
  }, [])

  return authState
} 