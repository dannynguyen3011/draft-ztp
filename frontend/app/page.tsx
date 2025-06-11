"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, UserCheck, Activity, Bell } from "lucide-react"
import { keycloakAuth } from "@/lib/keycloak"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (keycloakAuth.isAuthenticated()) {
      router.push('/dashboard')
    } else {
      // If not authenticated, redirect to login
      router.push('/login')
    }
  }, [router])

  // This page will redirect, but show landing page briefly
  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-center px-4">
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">ZeroTrust Platform</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="hover:text-foreground/80 transition-colors">
                Dashboard
              </Link>
              <Link href="/users" className="hover:text-foreground/80 transition-colors">
                Users
              </Link>
              <Link href="/policies" className="hover:text-foreground/80 transition-colors">
                Policies
              </Link>
              <Link href="/analytics" className="hover:text-foreground/80 transition-colors">
                Analytics
              </Link>
            </nav>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Link href="/login">Login</Link>
          </Button>
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
            <Button>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </section>

        <section className="w-full max-w-5xl">
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
