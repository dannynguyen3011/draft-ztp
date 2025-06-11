"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle, Clock, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react"

interface UserStatus {
  id: string
  username: string
  email: string
  role: string
  lastLogin: string
  riskScore: number
  riskLevel: "low" | "medium" | "high"
  status: "active" | "inactive" | "locked"
  loginAttempts: number
  successfulLogins: number
}

export default function UsersPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [users, setUsers] = useState<UserStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // For demo purposes, we'll allow all authenticated users to view this page
    // In a real app, you'd check roles from Keycloak token
    
    const fetchUsers = async () => {
      try {
        setLoading(true)
        // In a real app, this would fetch from your API
        // For demo purposes, we'll use sample data

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Sample user data
        const sampleUsers: UserStatus[] = [
          {
            id: "user-1",
            username: "john.manager",
            email: "john.manager@example.com",
            role: "manager",
            lastLogin: "2023-04-15T10:30:00Z",
            riskScore: 25,
            riskLevel: "low",
            status: "active",
            loginAttempts: 5,
            successfulLogins: 5,
          },
          {
            id: "user-2",
            username: "sarah.manager",
            email: "sarah.manager@example.com",
            role: "manager",
            lastLogin: "2023-04-10T22:15:00Z",
            riskScore: 35,
            riskLevel: "low",
            status: "active",
            loginAttempts: 8,
            successfulLogins: 7,
          },
          {
            id: "user-3",
            username: "mike.member",
            email: "mike.member@example.com",
            role: "member",
            lastLogin: "2023-04-12T03:45:00Z",
            riskScore: 55,
            riskLevel: "medium",
            status: "active",
            loginAttempts: 12,
            successfulLogins: 10,
          },
          {
            id: "user-4",
            username: "lisa.member",
            email: "lisa.member@example.com",
            role: "member",
            lastLogin: "2023-04-14T14:20:00Z",
            riskScore: 30,
            riskLevel: "low",
            status: "active",
            loginAttempts: 6,
            successfulLogins: 6,
          },
          {
            id: "user-5",
            username: "alex.member",
            email: "alex.member@example.com",
            role: "member",
            lastLogin: "2023-04-13T01:10:00Z",
            riskScore: 75,
            riskLevel: "high",
            status: "locked",
            loginAttempts: 15,
            successfulLogins: 10,
          },
        ]

        setUsers(sampleUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchUsers()
    }
  }, [user, isLoading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p className="text-lg">Loading user data...</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      default:
        return "success"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "locked":
        return "destructive"
      case "inactive":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getLoginSuccessRate = (user: UserStatus) => {
    if (user.loginAttempts === 0) return "N/A"
    const rate = (user.successfulLogins / user.loginAttempts) * 100
    return `${rate.toFixed(0)}%`
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Risk Management</h1>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Risk Overview</CardTitle>
          <CardDescription>Monitor and manage user risk levels across your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Risk Users</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.riskLevel === "low").length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk Users</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.riskLevel === "medium").length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk Users</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.riskLevel === "high").length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Status Table</CardTitle>
          <CardDescription>Detailed view of all users and their current risk status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login Success</TableHead>
                <TableHead>Risk Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>
                      {user.username}
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(user.lastLogin)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${
                              user.riskLevel === "high"
                                ? "bg-red-500"
                                : user.riskLevel === "medium"
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${user.riskScore}%` }}
                          />
                        </div>
                      </div>
                      <span>{user.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(user.riskLevel)}>{user.riskLevel.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>{user.status.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{getLoginSuccessRate(user)}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.successfulLogins}/{user.loginAttempts}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.successfulLogins >= 3 ? (
                      <div className="flex items-center text-green-600">
                        <ArrowDownCircle className="mr-1 h-4 w-4" />
                        Decreasing
                      </div>
                    ) : user.loginAttempts > user.successfulLogins + 2 ? (
                      <div className="flex items-center text-red-600">
                        <ArrowUpCircle className="mr-1 h-4 w-4" />
                        Increasing
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Stable</div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
