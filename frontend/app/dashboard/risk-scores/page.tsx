"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/useAuth"
import { getRiskSummary, type RiskSummary } from "@/lib/risk-service"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Cell } from "recharts"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface RiskScore {
  id: string
  user_id: string
  username: string
  score: number
  risk_level: "low" | "medium" | "high"
  factors: string[]
  timestamp: string
}

export default function RiskScoresDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [riskScores, setRiskScores] = useState<RiskScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    const fetchRiskScores = async () => {
      try {
        setLoading(true)
        
        // Fetch real risk summary from API
        const riskSummary = await getRiskSummary()
        
        if (riskSummary && riskSummary.users) {
          // Convert backend format to frontend format
          const formattedRiskScores = riskSummary.users.map((user) => ({
            id: `risk-${user.userId}`,
            user_id: user.userId,
            username: user.username,
            score: user.riskScore,
            risk_level: user.riskScore >= 70 ? "high" as const : user.riskScore >= 40 ? "medium" as const : "low" as const,
            factors: ["Based on recent activity"], // Simplified for now
            timestamp: user.lastActivity,
          }))
          
          setRiskScores(formattedRiskScores)
        } else {
          // Fallback to empty array if no data
          setRiskScores([])
        }
      } catch (error) {
        console.error("Error fetching risk scores:", error)
        // Fallback to empty array on error
        setRiskScores([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchRiskScores()
    }
  }, [user, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading risk scores...</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Prepare data for charts
  const riskLevelCounts = {
    low: riskScores.filter((score) => score.risk_level === "low").length,
    medium: riskScores.filter((score) => score.risk_level === "medium").length,
    high: riskScores.filter((score) => score.risk_level === "high").length,
  }

  const riskLevelData = [
    { name: "Low", value: riskLevelCounts.low, color: "#10b981" },
    { name: "Medium", value: riskLevelCounts.medium, color: "#f59e0b" },
    { name: "High", value: riskLevelCounts.high, color: "#ef4444" },
  ]

  const userScoreData = riskScores.map((score) => ({
    name: score.username,
    score: score.score,
    riskLevel: score.risk_level,
  }))

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Risk Score Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Risk Scores</TabsTrigger>
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Low Risk Users
                </CardTitle>
                <CardDescription>Users with low risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{riskLevelCounts.low}</div>
                <p className="text-sm text-muted-foreground">
                  {Math.round((riskLevelCounts.low / riskScores.length) * 100)}% of users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Medium Risk Users
                </CardTitle>
                <CardDescription>Users with medium risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{riskLevelCounts.medium}</div>
                <p className="text-sm text-muted-foreground">
                  {Math.round((riskLevelCounts.medium / riskScores.length) * 100)}% of users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-500" />
                  High Risk Users
                </CardTitle>
                <CardDescription>Users with high risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{riskLevelCounts.high}</div>
                <p className="text-sm text-muted-foreground">
                  {Math.round((riskLevelCounts.high / riskScores.length) * 100)}% of users
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
              <CardDescription>Distribution of user risk levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    value: {
                      label: "Users",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskLevelData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" name="Users">
                        {riskLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Risk Scores</CardTitle>
              <CardDescription>Risk scores for all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    score: {
                      label: "Risk Score",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="score" fill="var(--color-score)" name="Risk Score">
                        {userScoreData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.riskLevel === "high"
                                ? "#ef4444"
                                : entry.riskLevel === "medium"
                                  ? "#f59e0b"
                                  : "#10b981"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {riskScores.map((score) => (
              <Card key={score.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{score.username}</CardTitle>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        score.risk_level === "high"
                          ? "bg-red-100 text-red-800"
                          : score.risk_level === "medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {score.risk_level.toUpperCase()}
                    </div>
                  </div>
                  <CardDescription>{formatDate(score.timestamp)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Score</span>
                      <span className="text-sm font-medium">{score.score}/100</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${
                          score.risk_level === "high"
                            ? "bg-red-500"
                            : score.risk_level === "medium"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${score.score}%` }}
                      />
                    </div>
                    <div className="pt-2">
                      <span className="text-sm font-medium">Risk Factors:</span>
                      <ul className="mt-1 list-disc pl-5 text-sm">
                        {score.factors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="factors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Risk Factors</CardTitle>
              <CardDescription>Analysis of risk factors across all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Location Anomalies</h3>
                  <p className="text-sm text-muted-foreground">
                    Users logging in from unusual or new locations may indicate account compromise. Currently, 1 user
                    has been flagged for location anomalies.
                  </p>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-[20%] rounded-full bg-amber-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Time-based Anomalies</h3>
                  <p className="text-sm text-muted-foreground">
                    Logins during unusual hours may indicate suspicious activity. Currently, 3 users have been flagged
                    for time-based anomalies.
                  </p>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-[60%] rounded-full bg-amber-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Device Anomalies</h3>
                  <p className="text-sm text-muted-foreground">
                    Logins from new or unrecognized devices may require additional verification. Currently, 2 users have
                    been flagged for device anomalies.
                  </p>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-[40%] rounded-full bg-amber-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Failed Authentication Attempts</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple failed login attempts may indicate brute force attacks. Currently, 1 user has been flagged
                    for multiple failed attempts.
                  </p>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-[20%] rounded-full bg-red-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
