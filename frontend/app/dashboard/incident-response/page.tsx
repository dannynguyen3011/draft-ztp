"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, FileText, Filter, Search, Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function IncidentResponsePage() {
  const [activeTab, setActiveTab] = useState("incidents")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  // Demo data for incidents
  const incidentsData = [
    {
      id: "INC-2025-001",
      title: "Suspicious Login Attempt",
      severity: "medium",
      status: "investigating",
      assignee: "Security Team",
      created: "2025-05-07 08:23:45",
      updated: "2025-05-07 09:15:22",
      description: "Multiple failed login attempts from unusual location for user john.manager",
      affectedUsers: ["john.manager"],
      affectedSystems: ["Authentication System"],
      source: "Authentication Logs",
    },
    {
      id: "INC-2025-002",
      title: "Unauthorized Data Access",
      severity: "high",
      status: "open",
      assignee: "John Manager",
      created: "2025-05-07 09:45:12",
      updated: "2025-05-07 09:45:12",
      description: "Attempt to access restricted financial data by user mike.member",
      affectedUsers: ["mike.member"],
      affectedSystems: ["Financial Database"],
      source: "Database Access Logs",
    },
    {
      id: "INC-2025-003",
      title: "Malware Detection",
      severity: "critical",
      status: "mitigating",
      assignee: "Security Team",
      created: "2025-05-07 10:15:30",
      updated: "2025-05-07 11:30:15",
      description: "Potential malware detected on marketing department workstation",
      affectedUsers: ["alex.marketing"],
      affectedSystems: ["Marketing Workstation"],
      source: "Endpoint Protection",
    },
    {
      id: "INC-2025-004",
      title: "Phishing Email Detected",
      severity: "medium",
      status: "resolved",
      assignee: "Security Team",
      created: "2025-05-06 14:22:10",
      updated: "2025-05-06 16:45:33",
      description: "Phishing campaign targeting finance department identified and blocked",
      affectedUsers: ["finance.team"],
      affectedSystems: ["Email System"],
      source: "Email Gateway",
    },
    {
      id: "INC-2025-005",
      title: "Excessive Failed Authentication",
      severity: "low",
      status: "closed",
      assignee: "John Manager",
      created: "2025-05-05 09:10:22",
      updated: "2025-05-05 10:45:18",
      description: "Multiple users reporting password issues after system update",
      affectedUsers: ["multiple"],
      affectedSystems: ["Authentication System"],
      source: "Help Desk Reports",
    },
  ]

  // Demo data for playbooks
  const playbooksData = [
    {
      id: "PB-001",
      title: "Suspicious Login Response",
      description: "Steps to investigate and respond to suspicious login attempts",
      lastUpdated: "2025-04-15",
      owner: "Security Team",
      status: "active",
    },
    {
      id: "PB-002",
      title: "Data Breach Response",
      description: "Comprehensive response plan for potential data breaches",
      lastUpdated: "2025-04-22",
      owner: "CISO Office",
      status: "active",
    },
    {
      id: "PB-003",
      title: "Malware Containment",
      description: "Procedures for containing and remediating malware infections",
      lastUpdated: "2025-05-01",
      owner: "IT Security",
      status: "under review",
    },
    {
      id: "PB-004",
      title: "Phishing Attack Response",
      description: "Steps to address phishing campaigns targeting the organization",
      lastUpdated: "2025-03-28",
      owner: "Security Team",
      status: "active",
    },
  ]

  // Demo data for reports
  const reportsData = [
    {
      id: "RPT-2025-Q2-001",
      title: "Security Incident Summary - Q2 2025",
      type: "Quarterly",
      generated: "2025-05-01",
      status: "final",
    },
    {
      id: "RPT-2025-04-001",
      title: "Monthly Incident Analysis - April 2025",
      type: "Monthly",
      generated: "2025-05-03",
      status: "draft",
    },
    {
      id: "RPT-INC-003",
      title: "Incident Post-Mortem: Malware Detection",
      type: "Post-Incident",
      generated: "2025-05-07",
      status: "in progress",
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incident Response</h1>
          <p className="text-muted-foreground">Manage and respond to security incidents</p>
        </div>
        <Button>Create New Incident</Button>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
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

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Incidents</CardTitle>
              <CardDescription>Current security incidents requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search incidents..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="mitigating">Mitigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
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
                  <div>ID</div>
                  <div>Title</div>
                  <div>Severity</div>
                  <div>Status</div>
                  <div>Assignee</div>
                  <div></div>
                </div>
                <div className="divide-y">
                  {incidentsData
                    .filter(
                      (incident) =>
                        (statusFilter === "all" || incident.status === statusFilter) &&
                        (severityFilter === "all" || incident.severity === severityFilter) &&
                        (searchQuery === "" ||
                          incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          incident.id.toLowerCase().includes(searchQuery.toLowerCase())),
                    )
                    .map((incident) => (
                      <div key={incident.id} className="grid grid-cols-6 items-center p-2 text-sm">
                        <div className="font-medium">{incident.id}</div>
                        <div className="truncate">{incident.title}</div>
                        <div>
                          <Badge
                            variant={
                              incident.severity === "low"
                                ? "outline"
                                : incident.severity === "medium"
                                  ? "secondary"
                                  : incident.severity === "high"
                                    ? "destructive"
                                    : "destructive"
                            }
                          >
                            {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <Badge
                            variant={
                              incident.status === "resolved" || incident.status === "closed"
                                ? "outline"
                                : incident.status === "investigating"
                                  ? "secondary"
                                  : incident.status === "mitigating"
                                    ? "secondary"
                                    : "default"
                            }
                          >
                            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="truncate">{incident.assignee}</div>
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Incident Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                      <span className="text-sm">Critical</span>
                    </div>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                      <span className="text-sm">High</span>
                    </div>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Medium</span>
                    </div>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Low</span>
                    </div>
                    <span className="text-sm font-medium">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4 text-destructive" />
                      <span className="text-sm">Open</span>
                    </div>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Search className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="text-sm">Investigating</span>
                    </div>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Mitigating</span>
                    </div>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-sm">Resolved/Closed</span>
                    </div>
                    <span className="text-sm font-medium">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Time to Detect</span>
                    <span className="text-sm font-medium">15 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Time to Respond</span>
                    <span className="text-sm font-medium">32 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Time to Resolve</span>
                    <span className="text-sm font-medium">4.2 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Incident Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authentication System</span>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Endpoint Protection</span>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Gateway</span>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Monitoring</span>
                    <span className="text-sm font-medium">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="playbooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Response Playbooks</CardTitle>
              <CardDescription>Standardized procedures for handling security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search playbooks..." className="pl-8" />
                </div>
                <Button>Create Playbook</Button>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-4 bg-muted p-2 text-xs font-medium">
                  <div>ID</div>
                  <div>Title</div>
                  <div>Last Updated</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {playbooksData.map((playbook) => (
                    <div key={playbook.id} className="grid grid-cols-4 items-center p-2 text-sm">
                      <div className="font-medium">{playbook.id}</div>
                      <div className="truncate">{playbook.title}</div>
                      <div>{playbook.lastUpdated}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant={playbook.status === "active" ? "outline" : "secondary"}>
                          {playbook.status.charAt(0).toUpperCase() + playbook.status.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          View
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
                <CardTitle>Featured Playbook</CardTitle>
                <CardDescription>Data Breach Response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive response plan for potential data breaches, including containment, investigation,
                      notification, and recovery procedures.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Key Steps</h3>
                    <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                      <li>Initial assessment and containment</li>
                      <li>Evidence preservation and investigation</li>
                      <li>Impact analysis and classification</li>
                      <li>Notification and reporting</li>
                      <li>Recovery and post-incident review</li>
                    </ul>
                  </div>
                  <Button variant="outline" size="sm">
                    View Full Playbook
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Playbook Effectiveness</CardTitle>
                <CardDescription>Performance metrics for incident response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Resolution Time</span>
                      <span className="text-sm font-medium">-42%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Incident Recurrence Rate</span>
                      <span className="text-sm font-medium">-68%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Consistency</span>
                      <span className="text-sm font-medium">+87%</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      Standardized playbooks have significantly improved incident response metrics across all measured
                      categories.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Reports</CardTitle>
              <CardDescription>Analysis and documentation of security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search reports..." className="pl-8" />
                </div>
                <Button>Generate Report</Button>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-muted p-2 text-xs font-medium">
                  <div>ID</div>
                  <div>Title</div>
                  <div>Type</div>
                  <div>Generated</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {reportsData.map((report) => (
                    <div key={report.id} className="grid grid-cols-5 items-center p-2 text-sm">
                      <div className="font-medium">{report.id}</div>
                      <div className="truncate">{report.title}</div>
                      <div>{report.type}</div>
                      <div>{report.generated}</div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            report.status === "final" ? "outline" : report.status === "draft" ? "secondary" : "default"
                          }
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incident Metrics</CardTitle>
              <CardDescription>Key performance indicators for security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Total Incidents (YTD)</h3>
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-xs text-muted-foreground">+12% from previous year</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Avg. Time to Resolve</h3>
                  <p className="text-2xl font-bold">4.8 hrs</p>
                  <p className="text-xs text-muted-foreground">-22% from previous year</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Critical Incidents</h3>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-muted-foreground">-40% from previous year</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Recurring Incidents</h3>
                  <p className="text-2xl font-bold">8%</p>
                  <p className="text-xs text-muted-foreground">-15% from previous year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
