"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { keycloakAuth } from "@/lib/keycloak"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, ShieldCheck, Users, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { getRecentLogs, getSecurityEvents } from "@/lib/audit-service"
import { authLogger } from "@/lib/auth-logger"
import { getCurrentUserRiskScore, initializeUserRisk, logUserActivity, type RiskData } from "@/lib/risk-service"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [securityIncidents, setSecurityIncidents] = useState<any[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [riskData, setRiskData] = useState<RiskData | null>(null)
  const [riskLoading, setRiskLoading] = useState(true)

  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      // Check authentication and get user info
      if (!keycloakAuth.isAuthenticated()) {
        router.push('/login')
        return
      }

      const userInfo = keycloakAuth.getCurrentUser()
      const userRoles = keycloakAuth.getUserRoles()
      
      setUser({
        ...userInfo,
        roles: userRoles
      })
      setLoading(false)

      // Log successful dashboard access and initialize risk score
      if (userInfo) {
        // Initialize risk score on login
        initializeUserRisk().catch(error => {
          console.warn('Failed to initialize user risk:', error)
        })

        // Log dashboard access
        logUserActivity('dashboard_access', '/dashboard').catch(error => {
          console.warn('Failed to log dashboard access:', error)
        })

        authLogger.logAuthEvent({
          action: 'dashboard_access',
          success: true
        }).catch(error => {
          console.warn('Failed to log dashboard access:', error)
        })

        // Fetch current user's risk score
        fetchUserRiskScore()
      }
    }

    // Small delay to ensure smooth transition
    checkAuthAndLoadUser()

    // Fetch real activity data
    fetchActivityData()
  }, [router])

  const fetchActivityData = async () => {
    try {
      setActivityLoading(true)
      
      // Fetch recent logs and security events from backend
      const [recentLogs, securityEvents] = await Promise.all([
        getRecentLogs(5),
        getSecurityEvents(7, 3)
      ])

      setRecentActivity(recentLogs)
      setSecurityIncidents(securityEvents)
    } catch (error) {
      console.error('Error fetching activity data:', error)
      // Keep empty arrays as fallback
      setRecentActivity([])
      setSecurityIncidents([])
    } finally {
      setActivityLoading(false)
    }
  }

  const fetchUserRiskScore = async () => {
    try {
      setRiskLoading(true)
      const currentRisk = await getCurrentUserRiskScore()
      setRiskData(currentRisk)
    } catch (error) {
      console.error('Error fetching user risk score:', error)
      setRiskData(null)
    } finally {
      setRiskLoading(false)
    }
  }

  const handleLogout = () => {
    // Log logout event before logout
    authLogger.logLogout().finally(() => {
      keycloakAuth.logout()
    })
  }

  const handleManualLogout = () => {
    // Log logout event before logout
    authLogger.logLogout().finally(() => {
      keycloakAuth.manualLogout()
    })
  }

  // Get real risk level and score from API
  const riskLevel = riskData?.riskLevel || 'medium'
  const riskScore = riskData?.riskScore || 30

  // Use real data from state
  const recentIncidents = securityIncidents.slice(0, 3)
  const recentAuditLogs = recentActivity.slice(0, 5)

  // Calculate compliance score (mock data)
  const complianceScore = 85

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.preferred_username || user?.name || 'User'}!
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "secondary" : "outline"}>
            {riskLevel === "high" ? "High Risk" : riskLevel === "medium" ? "Medium Risk" : "Low Risk"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button variant="outline" size="sm" onClick={handleManualLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Simple Logout
          </Button>
        </div>
      </div>

      {user && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User:</span> {user.preferred_username || user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Realm:</span> {process.env.NEXT_PUBLIC_KEYCLOAK_REALM}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <Badge variant="outline" className="ml-2">Authenticated</Badge>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Role(s):</span> 
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role: string) => (
                      <Badge 
                        key={role} 
                        variant={
                          role === 'admin' ? 'destructive' : 
                          role === 'manager' ? 'secondary' : 
                          'outline'
                        }
                        className="text-xs"
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">No roles assigned</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {riskLevel === "high" && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>High Risk Level Detected</AlertTitle>
          <AlertDescription>
            Your account has been flagged for suspicious activity. Please review recent logins and contact security if
            needed.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <ShieldAlert
                  className={`h-4 w-4 ${riskLevel === "high" ? "text-red-500" : riskLevel === "medium" ? "text-yellow-500" : "text-green-500"}`}
                />
              </CardHeader>
              <CardContent>
                {riskLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {riskScore}/100
                    </div>
                    <Progress
                      value={riskScore}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {riskLevel === "high"
                        ? "High risk detected. Action required."
                        : riskLevel === "medium"
                          ? "Medium risk. Monitor closely."
                          : "Low risk. No action needed."}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user ? 1 : 0}</div>
                <p className="text-xs text-muted-foreground mt-2">+2 since last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityIncidents.filter((i) => i.status === "open").length}</div>
                <p className="text-xs text-muted-foreground mt-2">Open incidents requiring attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceScore}%</div>
                <Progress value={complianceScore} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">+5% since last assessment</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Security events and potential incidents</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading security events...</span>
                  </div>
                ) : recentIncidents.length > 0 ? (
                  <div className="space-y-4">
                    {recentIncidents.map((incident: any) => (
                      <div key={incident.id} className="flex items-center">
                        <div
                          className={`mr-2 h-2 w-2 rounded-full ${
                            incident.status === "failure" || incident.risk_score > 70
                              ? "bg-red-500"
                              : incident.risk_score > 50
                                ? "bg-orange-500"
                                : "bg-yellow-500"
                          }`}
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {incident.action || incident.title || 'Security Event'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {incident.details?.username && `User: ${incident.details.username} - `}
                            {incident.status === "failure" ? "Failed" : "Suspicious"} activity from {incident.ip_address || "Unknown IP"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              incident.status === "failure"
                                ? "destructive"
                                : incident.risk_score > 70
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {incident.status === "failure" ? "Failed" : `Risk: ${incident.risk_score || 'Medium'}`}
                          </Badge>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(incident.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No security events found
                  </div>
                )}
                <div className="mt-4 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/audit">View All Events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Access key security features</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/users/management">
                    <Users className="mr-2 h-4 w-4" />
                    User Management
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/access-control">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Access Control
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/behavioral-monitoring">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Behavioral Monitoring
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/compliance-encryption">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Compliance & Encryption
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>Current security posture overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Multi-Factor Authentication</span>
                    <Badge variant="outline" className="bg-green-50">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Password Change</span>
                    <Badge variant="outline">30 days ago</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Device Trust</span>
                    <Badge variant="outline" className="bg-green-50">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Suspicious Activities</span>
                    <Badge variant="outline" className={riskLevel === "high" ? "bg-red-50" : "bg-green-50"}>
                      {riskLevel === "high" ? "Detected" : "None"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
                <CardDescription>Elements affecting your risk score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Location Consistency</span>
                      <span className="text-sm font-medium">90%</span>
                    </div>
                    <Progress value={90} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Time Pattern Consistency</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Device Trust Score</span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Behavioral Consistency</span>
                      <span className="text-sm font-medium">
                        {riskLevel === "high" ? "60%" : riskLevel === "medium" ? "75%" : "92%"}
                      </span>
                    </div>
                    <Progress value={riskLevel === "high" ? 60 : riskLevel === "medium" ? 75 : 92} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent security-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading activity...</span>
                </div>
              ) : recentAuditLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentAuditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center">
                      <div
                        className={`mr-2 h-2 w-2 rounded-full ${
                          log.status === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1).replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.status === "success" ? "Successful" : "Failed"} {log.action.replace(/_/g, " ")} from{" "}
                          {log.ip_address || log.ipAddress || "Unknown IP"}
                        </p>
                        {log.details?.username && (
                          <p className="text-xs text-muted-foreground">
                            User: {log.details.username}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity found
                </div>
              )}
              <div className="mt-4 text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/audit">View All Activity</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
