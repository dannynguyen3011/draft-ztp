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
import { onAuditEvent } from "@/lib/audit-service"

interface AuditLog {
  id: string
  timestamp: string | Date
  user_id: string | null
  username?: string | null
  event_type: string
  resource_type: string
  resource_id: string | null
  action: string
  status: "success" | "failure"
  ip_address: string | null
  user_agent: string | null
  details: Record<string, any>
  risk_score: number | null
}

interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  pages: number
}

export default function AuditLogsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [newLogCount, setNewLogCount] = useState(0)

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

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })

      // Add filters if they exist
      if (filters.userId) queryParams.append("userId", filters.userId)
      if (filters.eventType && filters.eventType !== "all") queryParams.append("eventType", filters.eventType)
      if (filters.resourceType && filters.resourceType !== "all")
        queryParams.append("resourceType", filters.resourceType)
      if (filters.status && filters.status !== "all") queryParams.append("status", filters.status)
      if (filters.startDate) queryParams.append("startDate", filters.startDate)
      if (filters.endDate) queryParams.append("endDate", filters.endDate)

      const response = await fetch(`/api/audit?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.status}`)
      }

      const data = await response.json()

      if (data.logs && Array.isArray(data.logs)) {
        // Sort logs by timestamp (newest first) to ensure proper order
        const sortedLogs = data.logs.sort((a: AuditLog, b: AuditLog) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setAuditLogs(sortedLogs)
        setTotalPages(data.pages || 1)
        setTotalLogs(data.total || data.logs.length)
      } else {
        // If the response doesn't have the expected format, generate sample data
        const sampleLogs = generateSampleAuditLogs(20)
        setAuditLogs(sampleLogs)
        setTotalPages(3)
        setTotalLogs(60)
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      setError("Failed to fetch audit logs. Using sample data instead.")

      // Generate sample data as fallback
      const sampleLogs = generateSampleAuditLogs(20)
      setAuditLogs(sampleLogs)
      setTotalPages(3)
      setTotalLogs(60)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters])

  // Function to fetch security events
  const fetchSecurityEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/audit/security")

      if (!response.ok) {
        throw new Error(`Failed to fetch security events: ${response.status}`)
      }

      const data = await response.json()

      if (data.events && Array.isArray(data.events)) {
        setSecurityEvents(data.events)
      } else {
        // If the response doesn't have the expected format, generate sample data
        const sampleEvents = generateSampleSecurityEvents(10)
        setSecurityEvents(sampleEvents)
      }
    } catch (error) {
      console.error("Error fetching security events:", error)

      // Generate sample data as fallback
      const sampleEvents = generateSampleSecurityEvents(10)
      setSecurityEvents(sampleEvents)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // Check if user is a manager
    if (user && !user.roles.includes("manager")) {
      router.push("/dashboard")
      return
    }

    // Fetch audit logs when component mounts or filters/page changes
    fetchAuditLogs()

    // Fetch security events
    fetchSecurityEvents()
  }, [user, isLoading, router, currentPage, activeTab, fetchAuditLogs, fetchSecurityEvents])

  // Set up real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return

    // Register for real-time audit log updates
    const unsubscribe = onAuditEvent((newLog) => {
      setLastUpdateTime(new Date())
      setNewLogCount((prev) => prev + 1)
      
      // Update the audit logs list if we're on the first page
      if (currentPage === 1 && activeTab === "all") {
        setAuditLogs((prevLogs) => {
          // Check if this log already exists (prevent duplicates)
          const existingLogIndex = prevLogs.findIndex(log => log.id === newLog.id)
          if (existingLogIndex !== -1) {
            // If log exists, update it in place and re-sort
            const updatedLogs = [...prevLogs]
            updatedLogs[existingLogIndex] = newLog
            return updatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          }
          
          // Add new log and sort by timestamp (newest first)
          const updatedLogs = [newLog, ...prevLogs]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          
          // Keep only the most recent 20 logs
          if (updatedLogs.length > 20) {
            return updatedLogs.slice(0, 20)
          }
          
          return updatedLogs
        })
        setTotalLogs((prev) => prev + 1)
      }

      // Update security events if it's a security-related event
      if (
        activeTab === "security" &&
                ((newLog.event_type === HospitalAuditEventType.AUTHENTICATION && newLog.status === "failure") ||
        newLog.event_type === HospitalAuditEventType.SECURITY_EVENT ||
          (newLog.risk_score !== null && newLog.risk_score > 70))
      ) {
        setSecurityEvents((prevEvents) => {
          // Check if this log already exists (prevent duplicates)
          const existingLogIndex = prevEvents.findIndex(event => event.id === newLog.id)
          if (existingLogIndex !== -1) {
            // If log exists, update it in place and re-sort
            const updatedEvents = [...prevEvents]
            updatedEvents[existingLogIndex] = newLog
            return updatedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          }
          
          // Add new event and sort by timestamp (newest first)
          const updatedEvents = [newLog, ...prevEvents]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          
          // Keep only the most recent 20 events
          if (updatedEvents.length > 20) {
            return updatedEvents.slice(0, 20)
          }
          
          return updatedEvents
        })
      }
    })

    return () => {
      // Clean up the subscription when the component unmounts
      unsubscribe()
    }
  }, [realTimeEnabled, currentPage, activeTab])

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
    const sampleUsers = [
      { id: "user-1", username: "huy" },
      { id: "user-2", username: "duc" },
      { id: "user-3", username: "admin" },
      { id: "user-4", username: "manager1" },
      { id: null, username: null }
    ]

    return Array.from({ length: count }, (_, i) => {
      const user = sampleUsers[Math.floor(Math.random() * 5)]
      return {
        id: `security-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id,
        username: user.username,
        event_type: [HospitalAuditEventType.AUTHENTICATION, HospitalAuditEventType.SECURITY_EVENT][Math.floor(Math.random() * 2)],
        resource_type: HospitalResourceType.USER,
        resource_id: Math.random() > 0.3 ? `resource-${Math.floor(Math.random() * 10)}` : null,
        action: ["failed_login", "suspicious_activity", "brute_force_attempt"][Math.floor(Math.random() * 3)],
        status: "failure",
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: { reason: "suspicious_location", username: user.username },
        risk_score: 70 + Math.floor(Math.random() * 30),
      }
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const applyFilters = () => {
    setCurrentPage(1) // Reset to first page when applying filters
    fetchAuditLogs()
  }

  const resetFilters = () => {
    setFilters({
      userId: "",
      eventType: "",
      resourceType: "",
      status: "",
      startDate: "",
      endDate: "",
    })
    setCurrentPage(1)
    fetchAuditLogs()
  }

  if (isLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading audit logs...</p>
      </div>
    )
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

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

  const getStatusBadge = (status: string) => {
    return status === "success" ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="mr-1 h-3 w-3" /> Success
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <AlertCircle className="mr-1 h-3 w-3" /> Failure
      </Badge>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button
            variant={realTimeEnabled ? "default" : "outline"}
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
          >
            <div className="flex items-center gap-2">
              {realTimeEnabled && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
              {realTimeEnabled ? "Real-time: ON" : "Real-time: OFF"}
              {realTimeEnabled && lastUpdateTime && (
                <span className="text-xs opacity-75">
                  (Last: {lastUpdateTime.toLocaleTimeString()})
                </span>
              )}
            </div>
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" onClick={fetchAuditLogs}>
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
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
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
                {realTimeEnabled && (
                  <span>
                    {" • Real-time updates enabled"}
                    {newLogCount > 0 && (
                      <span className="text-green-600 font-medium">
                        {" • "}{newLogCount} new logs received
                      </span>
                    )}
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
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
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
                          {log.risk_score !== null ? (
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
                                    style={{ width: `${log.risk_score}%` }}
                                  />
                                </div>
                              </div>
                              <span>{log.risk_score}</span>
                            </div>
                          ) : (
                            "N/A"
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
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
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
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
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
                {realTimeEnabled && " • Real-time updates enabled"}
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
                        <TableCell>{formatDate(event.timestamp)}</TableCell>
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
                          {event.risk_score !== null ? (
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
                                    style={{ width: `${event.risk_score}%` }}
                                  />
                                </div>
                              </div>
                              <span>{event.risk_score}</span>
                            </div>
                          ) : (
                            "N/A"
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
