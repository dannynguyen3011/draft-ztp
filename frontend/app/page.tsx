"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, UserCheck, Activity, Bell, User, LogOut } from "lucide-react"
import { keycloakAuth } from "@/lib/keycloak"
import PageTracker from "@/components/PageTracker"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check if user is authenticated but don't redirect
    // Just update the UI to show user status
    if (keycloakAuth.isAuthenticated()) {
      const currentUser = keycloakAuth.getCurrentUser()
      setUser(currentUser)
    }
  }, [mounted])

  const handleLogin = () => {
    router.push('/login')
  }

  const handleDashboard = () => {
    router.push('/dashboard')
  }

  const handleLogout = () => {
    keycloakAuth.logout()
  }

  // Don't render during SSR
  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-center px-4">
      <PageTracker />
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">ZeroTrust Platform</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {user ? (
                <>
                  <Link href="/dashboard" className="hover:text-foreground/80 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/documentation" className="hover:text-foreground/80 transition-colors">
                    Documentation
                  </Link>
                </>
              ) : (
                <>
                  <Link href="#features" className="hover:text-foreground/80 transition-colors">
                    Features
                  </Link>
                  <Link href="#about" className="hover:text-foreground/80 transition-colors">
                    About
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.preferred_username || user.name || 'User'}
                </span>
                <Button variant="outline" size="sm" onClick={handleDashboard}>
                  <User className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleLogin}>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 w-full space-y-16">
        <section className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            Unified Zero Trust and Identity Security Platform
          </h1>
          <p className="mt-4 text-muted-foreground md:text-xl max-w-xl mx-auto">
            Continuously verify every access request, monitor user behavior in real time, and enforce granular access controls.
          </p>
          <div className="mt-6 space-x-4">
            {user ? (
              <>
                <Button onClick={handleDashboard}>Go to Dashboard</Button>
                <Button variant="outline" onClick={() => router.push('/documentation')}>
                  View Documentation
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleLogin}>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </>
            )}
          </div>
        </section>

        <section id="features" className="w-full max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Core Zero Trust Principles</h2>
          <p className="text-muted-foreground mb-8">
            Our platform implements the core principles of Zero Trust architecture to protect your organization from modern threats.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Verify Identity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Strict identity verification for every access request</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <UserCheck className="inline h-4 w-4 mr-2" />
                  Least Privilege
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Grant minimal access required for the task</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Activity className="inline h-4 w-4 mr-2" />
                  Continuous Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Real-time monitoring of all user activities</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Bell className="inline h-4 w-4 mr-2" />
                  Automated Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Immediate response to suspicious activities</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6">
        <div className="text-center text-sm text-muted-foreground">
          © 2025 Zero Trust Platform. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
