"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { AlertCircle, CheckCircle, Clock, Filter, RefreshCw, Shield, User } from "lucide-react"
import { HospitalAuditEventType, HospitalResourceType } from "@/lib/hospital-schema"
import { getAuditLogs, getSecurityEvents, type AuditLog } from "@/lib/audit-service"

interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  pages: number
}

export default function AuditLogsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  // Filter states
  const [filters, setFilters] = useState({
    userId: "",
    eventType: "",
    resourceType: "",
    status: "",
    startDate: "",
    endDate: "",
  })

  const [showFilters, setShowFilters] = useState(false)

  // Function to fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getAuditLogs(filters, currentPage, 20)
      
      setAuditLogs(result.logs)
      setTotalLogs(result.total)
      setTotalPages(result.pages)
      setLastUpdateTime(new Date())
      
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setError('Failed to fetch audit logs. Using sample data.')

      // Generate sample data as fallback
      const sampleLogs = generateSampleAuditLogs(20)
      setAuditLogs(sampleLogs)
      setTotalLogs(60)
      setTotalPages(3)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage])

  // Function to fetch security events
  const fetchSecurityEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const events = await getSecurityEvents(filters, currentPage, 20)
      setSecurityEvents(events)
      setLastUpdateTime(new Date())
      
    } catch (err) {
      console.error('Error fetching security events:', err)
      setError('Failed to fetch security events. Using sample data.')

      // Generate sample security events as fallback
      const sampleEvents = generateSampleSecurityEvents(20)
      setSecurityEvents(sampleEvents)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage])

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login')
      return
    }

    if (user) {
      if (activeTab === "all") {
    fetchAuditLogs()
      } else if (activeTab === "security") {
    fetchSecurityEvents()
      }
    }
  }, [user, authLoading, router, activeTab, fetchAuditLogs, fetchSecurityEvents])

  // Generate sample audit logs for fallback
  const generateSampleAuditLogs = (count: number): AuditLog[] => {
    const eventTypes = Object.values(HospitalAuditEventType)
    const resourceTypes = Object.values(HospitalResourceType)
    const statuses = ["success", "failure"] as const
    const sampleUsers = [
      { id: "user-1", username: "huy" },
      { id: "user-2", username: "duc" },
      { id: "user-3", username: "admin" },
      { id: "user-4", username: "manager1" },
      { id: null, username: null }
    ]

    return Array.from({ length: count }, (_, i) => {
      const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)]
      return {
        id: `log-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id,
        username: user.username,
        event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        resource_type: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
        resource_id: Math.random() > 0.3 ? `resource-${Math.floor(Math.random() * 10)}` : null,
        action: ["login", "logout", "view", "update", "delete", "create"][Math.floor(Math.random() * 6)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: { sample: "data", username: user.username },
        risk_score: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : null,
      }
    })
  }

  // Generate sample security events for fallback
  const generateSampleSecurityEvents = (count: number): AuditLog[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `security-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: `user-${Math.floor(Math.random() * 4) + 1}`,
      username: ["huy", "duc", "admin", "manager1"][Math.floor(Math.random() * 4)],
      event_type: HospitalAuditEventType.SECURITY_EVENT,
      resource_type: HospitalResourceType.USER,
      resource_id: null,
      action: ["failed_login", "suspicious_activity", "brute_force"][Math.floor(Math.random() * 3)],
      status: "failure" as const,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      details: { reason: "suspicious_location" },
        risk_score: 70 + Math.floor(Math.random() * 30),
    }))
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      userId: "",
      eventType: "",
      resourceType: "",
      status: "",
      startDate: "",
      endDate: "",
    })
    setCurrentPage(1)
  }

  // Handle manual refresh
  const handleRefresh = () => {
    if (activeTab === "all") {
    fetchAuditLogs()
    } else if (activeTab === "security") {
      fetchSecurityEvents()
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>
      case "failure":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failure</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Get risk badge
  const getRiskBadge = (riskScore: number | null) => {
    if (riskScore === null) return null
    
    if (riskScore >= 70) {
      return <Badge variant="destructive">High Risk ({riskScore})</Badge>
    } else if (riskScore >= 40) {
      return <Badge variant="outline" className="border-yellow-400 text-yellow-700">Medium Risk ({riskScore})</Badge>
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Low Risk ({riskScore})</Badge>
    }
  }

  // Get event type icon helper function
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case HospitalAuditEventType.AUTHENTICATION:
        return <User className="h-4 w-4" />
      case HospitalAuditEventType.SECURITY_EVENT:
        return <Shield className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Audit Logs</CardTitle>
            <CardDescription>Narrow down results by applying filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Filter by user ID"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={filters.eventType} onValueChange={(value) => handleFilterChange("eventType", value)}>
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value={HospitalAuditEventType.AUTHENTICATION}>Authentication</SelectItem>
                    <SelectItem value={HospitalAuditEventType.AUTHORIZATION}>Authorization</SelectItem>
                    <SelectItem value={HospitalAuditEventType.USER_MANAGEMENT}>User Management</SelectItem>
                    <SelectItem value={HospitalAuditEventType.DATA_ACCESS}>Data Access</SelectItem>
                    <SelectItem value={HospitalAuditEventType.SYSTEM_ACCESS}>System</SelectItem>
                    <SelectItem value={HospitalAuditEventType.SECURITY_EVENT}>Security</SelectItem>
                    <SelectItem value={HospitalAuditEventType.PATIENT_RECORD_ACCESS}>Patient Records</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resourceType">Resource Type</Label>
                <Select
                  value={filters.resourceType}
                  onValueChange={(value) => handleFilterChange("resourceType", value)}
                >
                  <SelectTrigger id="resourceType">
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value={HospitalResourceType.USER}>User</SelectItem>
                                          <SelectItem value={HospitalResourceType.PATIENT}>Patient</SelectItem>
                      <SelectItem value={HospitalResourceType.MEDICAL_RECORD}>Medical Record</SelectItem>
                      <SelectItem value={HospitalResourceType.DEPARTMENT}>Department</SelectItem>
                      <SelectItem value={HospitalResourceType.SYSTEM}>System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Reset
              </Button>
              <Button onClick={handleRefresh}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Audit Logs</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log History</CardTitle>
              <CardDescription>
                Showing {auditLogs.length} of {totalLogs} total logs • Page {currentPage} of {totalPages}
                {lastUpdateTime && (
                  <span className="text-xs opacity-75">
                    (Last update: {lastUpdateTime.toLocaleTimeString()})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, index) => (
                      <TableRow key={`${log.id}-${new Date(log.timestamp).getTime()}-${index}`}>
                        <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(log.event_type)}
                            <span className="capitalize">{log.event_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {log.username || log.details?.username || "Unknown User"}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.user_id ? log.user_id.substring(0, 8) + "..." : "Anonymous"}
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          <span className="capitalize">{log.resource_type}</span>
                          {log.resource_id && (
                            <span className="text-xs text-muted-foreground ml-1">({log.resource_id})</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{log.ip_address || "N/A"}</TableCell>
                        <TableCell>
                          {log.risk_score !== null && log.risk_score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12">
                                <div className="h-2 w-full rounded-full bg-muted">
                                  <div
                                    className={`h-2 rounded-full ${
                                      log.risk_score > 75
                                        ? "bg-red-500"
                                        : log.risk_score > 40
                                          ? "bg-amber-500"
                                          : "bg-green-500"
                                    }`}
                                    style={{ width: `${Math.min(log.risk_score, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-medium">{log.risk_score}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum = currentPage - 2 + i
                      if (pageNum < 1) pageNum += Math.min(5, totalPages)
                      if (pageNum > totalPages) pageNum -= Math.min(5, totalPages)

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink isActive={currentPage === pageNum} onClick={() => setCurrentPage(pageNum)}>
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                High-risk activities and security incidents
                {lastUpdateTime && (
                  <span className="text-xs opacity-75">
                    (Last update: {lastUpdateTime.toLocaleTimeString()})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.length > 0 ? (
                    securityEvents.map((event, index) => (
                      <TableRow key={`security-${event.id}-${new Date(event.timestamp).getTime()}-${index}`}>
                        <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(event.event_type)}
                            <span className="capitalize">{event.event_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{event.user_id || "Anonymous"}</TableCell>
                        <TableCell>{event.action}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>{event.ip_address || "N/A"}</TableCell>
                        <TableCell>
                          {event.risk_score !== null && event.risk_score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12">
                                <div className="h-2 w-full rounded-full bg-muted">
                                  <div
                                    className={`h-2 rounded-full ${
                                      event.risk_score > 75
                                        ? "bg-red-500"
                                        : event.risk_score > 40
                                          ? "bg-amber-500"
                                          : "bg-green-500"
                                    }`}
                                    style={{ width: `${Math.min(event.risk_score, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-medium">{event.risk_score}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(event.details, null, 2)}</pre>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No security events found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
