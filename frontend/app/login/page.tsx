"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2 } from "lucide-react"
import { keycloakAuth } from "@/lib/keycloak"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run after component is mounted (client-side)
    if (!mounted) return

    // If already authenticated, redirect to dashboard
    if (keycloakAuth.isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router, mounted])

  const handleLogin = () => {
    if (!mounted) return
    keycloakAuth.login()
  }

  // Show loading during SSR/hydration
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <span>ZeroTrust</span>
          </h1>
          <p className="text-gray-600 mt-2">Secure Authentication Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In with Keycloak</CardTitle>
            <CardDescription>
              Click the button below to authenticate with Keycloak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogin}
              className="w-full"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Login with Keycloak
            </Button>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Direct Integration:</h3>
              <p className="text-xs text-gray-600">
                This uses direct Keycloak OIDC flow without NextAuth
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Keycloak URL: {process.env.NEXT_PUBLIC_KEYCLOAK_URL}
              </p>
              <p className="text-xs text-gray-600">
                Realm: {process.env.NEXT_PUBLIC_KEYCLOAK_REALM}
              </p>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
