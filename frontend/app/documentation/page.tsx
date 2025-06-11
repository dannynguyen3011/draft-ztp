import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNavbar } from "@/components/top-navbar"
import { FileText, Shield, Users, Lock, Activity, AlertTriangle } from "lucide-react"

export default function DocumentationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
              <p className="text-muted-foreground">Learn how to use the ZeroTrust Platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Getting Started
                  </CardTitle>
                  <CardDescription>Learn the basics of the ZeroTrust Platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/documentation/introduction" className="text-blue-600 hover:underline">
                        Introduction to Zero Trust
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/setup" className="text-blue-600 hover:underline">
                        Platform Setup Guide
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/quickstart" className="text-blue-600 hover:underline">
                        Quick Start Tutorial
                      </Link>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/documentation/getting-started">View All</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>Learn how to manage users and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/documentation/user-creation" className="text-blue-600 hover:underline">
                        Creating and Managing Users
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/roles" className="text-blue-600 hover:underline">
                        Role-Based Access Control
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/mfa" className="text-blue-600 hover:underline">
                        Multi-Factor Authentication
                      </Link>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/documentation/user-management">View All</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Access Control
                  </CardTitle>
                  <CardDescription>Learn about access policies and controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/documentation/policies" className="text-blue-600 hover:underline">
                        Creating Access Policies
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/network-segmentation" className="text-blue-600 hover:underline">
                        Network Segmentation
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/least-privilege" className="text-blue-600 hover:underline">
                        Principle of Least Privilege
                      </Link>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/documentation/access-control">View All</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Behavioral Monitoring
                  </CardTitle>
                  <CardDescription>Learn about user behavior analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/documentation/behavior-analytics" className="text-blue-600 hover:underline">
                        User Behavior Analytics
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/anomaly-detection" className="text-blue-600 hover:underline">
                        Anomaly Detection
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/risk-scoring" className="text-blue-600 hover:underline">
                        Risk Scoring
                      </Link>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/documentation/behavioral-monitoring">View All</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Incident Response
                  </CardTitle>
                  <CardDescription>Learn about security incident management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/documentation/incident-detection" className="text-blue-600 hover:underline">
                        Incident Detection
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/response-playbooks" className="text-blue-600 hover:underline">
                        Response Playbooks
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/post-incident" className="text-blue-600 hover:underline">
                        Post-Incident Analysis
                      </Link>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/documentation/incident-response">View All</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    API Reference
                  </CardTitle>
                  <CardDescription>Technical reference for developers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/documentation/api-overview" className="text-blue-600 hover:underline">
                        API Overview
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/authentication-api" className="text-blue-600 hover:underline">
                        Authentication API
                      </Link>
                    </li>
                    <li>
                      <Link href="/documentation/user-api" className="text-blue-600 hover:underline">
                        User Management API
                      </Link>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/documentation/api">View All</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
