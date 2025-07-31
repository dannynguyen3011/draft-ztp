"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Hospital, Activity, Users, BarChart3 } from "lucide-react"
import { auth } from "@/lib/auth"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (auth.isAuthenticated()) {
        const currentUser = auth.getCurrentUser()
        setUser(currentUser)
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogin = () => {
    router.push('/login')
  }

  const handleLogout = () => {
    auth.logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Hospital className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Hospital className="h-16 w-16 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900">Hospital Analytics</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced user behavior monitoring and risk assessment console for hospital management systems
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>User Monitoring</CardTitle>
              <CardDescription>
                Track and analyze user behavior patterns across hospital systems
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Monitor security events and user activities in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                AI-powered risk scoring and behavioral anomaly detection
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Welcome back, <span className="font-semibold">{user.name}</span>!
              </p>
              <div className="space-x-4">
                <Button onClick={() => router.push('/dashboard')} size="lg">
                  Go to Dashboard
                </Button>
                <Button onClick={handleLogout} variant="outline" size="lg">
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Access the hospital analytics admin console
              </p>
              <Button onClick={handleLogin} size="lg" className="px-8">
                <Hospital className="mr-2 h-5 w-5" />
                Login to Admin Console
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
