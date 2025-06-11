 "use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { keycloakAuth } from "@/lib/keycloak"
import { authLogger } from "@/lib/auth-logger"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        console.log('Callback URL params:', {
          code: code ? 'present' : 'missing',
          state: state ? state : 'missing',
          error: error,
          errorDescription: errorDescription
        })

        // Check for Keycloak errors first
        if (error) {
          throw new Error(`Keycloak error: ${error}. ${errorDescription || ''}`)
        }

        if (!code) {
          throw new Error('Authorization code is missing from callback URL')
        }

        if (!state) {
          throw new Error('State parameter is missing from callback URL')
        }

        setDebugInfo(`Processing auth code with state: ${state}`)

        // Exchange code for tokens
        await keycloakAuth.exchangeCodeForToken(code, state)
        
        // Get user info and store it
        const userInfo = await keycloakAuth.getUserInfo()
        localStorage.setItem('user_info', JSON.stringify(userInfo))
        
        console.log('Authentication successful:', userInfo)
        
        // Log successful login to MongoDB
        try {
          await authLogger.logLogin()
        } catch (logError) {
          console.warn('Failed to log authentication event:', logError)
        }
        
        setStatus('success')
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)

      } catch (error) {
        console.error('Callback error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
        
        // Log failed login attempt
        try {
          await authLogger.logFailedLogin(errorMessage)
        } catch (logError) {
          console.warn('Failed to log failed authentication event:', logError)
        }
        
        setError(errorMessage)
        setStatus('error')
      }
    }

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(handleCallback, 100)
    
    return () => clearTimeout(timer)
  }, [router, searchParams])

  const handleRetryLogin = () => {
    // Clear any stored state and redirect to login
    localStorage.removeItem('keycloak_state')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  Processing Authentication
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Authentication Successful
                </>
              )}
              {status === 'error' && (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  Authentication Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'loading' && (
              <div>
                <p className="text-gray-600 mb-2">
                  Exchanging authorization code for access token...
                </p>
                {debugInfo && (
                  <p className="text-xs text-gray-500">{debugInfo}</p>
                )}
              </div>
            )}
            {status === 'success' && (
              <p className="text-green-600">
                Successfully authenticated! Redirecting to dashboard...
              </p>
            )}
            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-red-600 text-sm">
                  {error}
                </p>
                <Button 
                  onClick={handleRetryLogin}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
                <details className="text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    Debug Information
                  </summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <p><strong>URL Parameters:</strong></p>
                    <p>Code: {searchParams.get('code') ? 'present' : 'missing'}</p>
                    <p>State: {searchParams.get('state') || 'missing'}</p>
                    <p>Error: {searchParams.get('error') || 'none'}</p>
                    <p>Error Description: {searchParams.get('error_description') || 'none'}</p>
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 