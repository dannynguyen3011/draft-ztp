"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Clock, FileText, Filter, MapPin, MoreHorizontal, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function BehavioralMonitoringPage() {
  const [anomalies, setAnomalies] = useState([
    {
      id: 1,
      user: "jane.smith@example.com",
      type: "Login Pattern",
      description: "Multiple logins from different geographic locations",
      severity: "High",
      time: "10 minutes ago",
      status: "Investigating",
    },
    {
      id: 2,
      user: "john.doe@example.com",
      type: "Data Access",
      description: "Unusual access to sensitive financial documents",
      severity: "Medium",
      time: "1 hour ago",
      status: "Reviewing",
    },
    {
      id: 3,
      user: "admin@example.com",
      type: "Privilege Escalation",
      description: "Attempted to access admin controls without proper authorization",
      severity: "Critical",
      time: "30 minutes ago",
      status: "Escalated",
    },
    {
      id: 4,
      user: "guest.user@example.com",
      type: "Resource Usage",
      description: "Excessive API calls to customer data endpoints",
      severity: "Low",
      time: "2 hours ago",
      status: "Resolved",
    },
    {
      id: 5,
      user: "dev.team@example.com",
      type: "Session Behavior",
      description: "Unusual working hours and access patterns",
      severity: "Medium",
      time: "4 hours ago",
      status: "Monitoring",
    },
  ])

  const [userProfiles, setUserProfiles] = useState([
    {
      id: 1,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Finance Manager",
      riskScore: 87,
      lastActivity: "10 minutes ago",
      location: "New York, USA",
      deviceCount: 3,
      commonPatterns: "Weekday access, 9am-5pm EST, Finance applications",
    },
    {
      id: 2,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Sales Representative",
      riskScore: 42,
      lastActivity: "1 hour ago",
      location: "Chicago, USA",
      deviceCount: 2,
      commonPatterns: "Variable hours, CRM access, Mobile usage",
    },
    {
      id: 3,
      name: "Admin User",
      email: "admin@example.com",
      role: "System Administrator",
      riskScore: 65,
      lastActivity: "30 minutes ago",
      location: "Remote",
      deviceCount: 4,
      commonPatterns: "24/7 access, System configuration, Multiple IPs",
    },
  ])

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Behavioral Monitoring</h1>
          <p className="text-muted-foreground">Monitor user behavior patterns and detect anomalies</p>
        </div>
      </div>

      <Tabs defaultValue="anomalies" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="user-profiles">User Profiles</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Anomalies</CardTitle>
              <CardDescription>Detected unusual patterns and potential security risks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search anomalies..." className="pl-8" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-6 bg-muted p-2 text-xs font-medium">
                  <div>User</div>
                  <div>Type</div>
                  <div>Severity</div>
                  <div>Status</div>
                  <div>Time</div>
                  <div></div>
                </div>
                <div className="divide-y">
                  {anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="grid grid-cols-6 items-center p-2 text-sm">
                      <div className="truncate">{anomaly.user}</div>
                      <div className="truncate">{anomaly.type}</div>
                      <div>
                        <Badge
                          variant={
                            anomaly.severity === "Low"
                              ? "outline"
                              : anomaly.severity === "Medium"
                                ? "secondary"
                                : anomaly.severity === "High"
                                  ? "destructive"
                                  : "destructive"
                          }
                        >
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <div>
                        <Badge
                          variant={
                            anomaly.status === "Resolved"
                              ? "outline"
                              : anomaly.status === "Monitoring"
                                ? "secondary"
                                : anomaly.status === "Reviewing"
                                  ? "secondary"
                                  : "default"
                          }
                        >
                          {anomaly.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{anomaly.time}</span>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Distribution</CardTitle>
                <CardDescription>By type and severity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] rounded-md bg-muted flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Login and access locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] rounded-md bg-muted flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Behavioral Profiles</CardTitle>
              <CardDescription>Established patterns and risk assessments for users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-8" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {userProfiles.map((profile) => (
                  <Card key={profile.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{profile.name}</h3>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            profile.riskScore > 70 ? "destructive" : profile.riskScore > 40 ? "secondary" : "outline"
                          }
                        >
                          Risk Score: {profile.riskScore}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground">Role</p>
                            <p className="font-medium">{profile.role}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Activity</p>
                            <p className="font-medium">{profile.lastActivity}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{profile.location}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Devices</p>
                            <p className="font-medium">{profile.deviceCount} active devices</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Common Patterns</p>
                          <p className="font-medium">{profile.commonPatterns}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          View Full Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Behavioral Analytics Overview</CardTitle>
                <CardDescription>Trends and patterns across the organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] rounded-md bg-muted flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login Time Distribution</CardTitle>
                <CardDescription>When users access the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] rounded-md bg-muted flex items-center justify-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Access Patterns</CardTitle>
                <CardDescription>Most accessed resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] rounded-md bg-muted flex items-center justify-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anomaly Trend</CardTitle>
                <CardDescription>Detection rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] rounded-md bg-muted flex items-center justify-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
