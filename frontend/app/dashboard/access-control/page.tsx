"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Lock,
  FileText,
  Network,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  UserCog,
} from "lucide-react"

// Demo policies data
const demoPolicies = [
  {
    id: "policy-1",
    name: "Finance Department Access",
    description: "Controls access to financial systems and data",
    status: "Active",
    type: "Access Control",
    resources: ["Financial Database", "Accounting System", "Payroll System"],
    subjects: ["Finance Department", "Executive Team"],
    conditions: ["Working Hours", "Corporate Network"],
    lastUpdated: "2025-05-01",
    createdBy: "John Doe",
  },
  {
    id: "policy-2",
    name: "Customer Data Protection",
    description: "Restricts access to customer PII",
    status: "Active",
    type: "Data Protection",
    resources: ["Customer Database", "CRM System"],
    subjects: ["Sales Department", "Customer Support"],
    conditions: ["MFA Required", "Audit Logging"],
    lastUpdated: "2025-04-28",
    createdBy: "Jane Smith",
  },
  {
    id: "policy-3",
    name: "Development Environment",
    description: "Controls access to development servers and tools",
    status: "Active",
    type: "Access Control",
    resources: ["Dev Servers", "Code Repository", "CI/CD Pipeline"],
    subjects: ["Development Team", "QA Team"],
    conditions: ["VPN Required", "Working Hours"],
    lastUpdated: "2025-04-25",
    createdBy: "Mike Johnson",
  },
  {
    id: "policy-4",
    name: "Executive Access",
    description: "Special access rights for executive team",
    status: "Active",
    type: "Privilege Management",
    resources: ["All Systems", "Board Documents", "Strategic Plans"],
    subjects: ["Executive Team"],
    conditions: ["MFA Required", "Biometric Verification", "Audit Logging"],
    lastUpdated: "2025-04-20",
    createdBy: "John Doe",
  },
  {
    id: "policy-5",
    name: "Third-Party Vendor Access",
    description: "Restricted access for external vendors",
    status: "Inactive",
    type: "Access Control",
    resources: ["Support Portal", "Ticketing System"],
    subjects: ["Vendor Group"],
    conditions: ["Time-Limited", "IP Restriction", "MFA Required"],
    lastUpdated: "2025-04-15",
    createdBy: "Sarah Williams",
  },
]

// Demo network segments data
const demoSegments = [
  {
    id: "segment-1",
    name: "Corporate Network",
    description: "Main corporate network segment",
    status: "Active",
    resources: 15,
    policies: 8,
    lastUpdated: "2025-05-02",
  },
  {
    id: "segment-2",
    name: "Development Environment",
    description: "Isolated network for development activities",
    status: "Active",
    resources: 12,
    policies: 5,
    lastUpdated: "2025-04-28",
  },
  {
    id: "segment-3",
    name: "Production Environment",
    description: "Highly secured production systems",
    status: "Active",
    resources: 20,
    policies: 12,
    lastUpdated: "2025-04-25",
  },
  {
    id: "segment-4",
    name: "Guest Network",
    description: "Isolated network for visitors",
    status: "Active",
    resources: 3,
    policies: 2,
    lastUpdated: "2025-04-20",
  },
  {
    id: "segment-5",
    name: "IoT Devices",
    description: "Segmented network for IoT devices",
    status: "Inactive",
    resources: 8,
    policies: 4,
    lastUpdated: "2025-04-15",
  },
]

// Demo audit logs data
const demoAuditLogs = [
  {
    id: "log-1",
    timestamp: "2025-05-04 10:15:23",
    user: "John Doe",
    action: "Policy Update",
    resource: "Finance Department Access",
    status: "Success",
    details: "Updated conditions to include MFA requirement",
  },
  {
    id: "log-2",
    timestamp: "2025-05-04 09:30:45",
    user: "Jane Smith",
    action: "Policy Creation",
    resource: "Marketing Data Access",
    status: "Success",
    details: "Created new policy for marketing data access",
  },
  {
    id: "log-3",
    timestamp: "2025-05-03 15:22:10",
    user: "Mike Johnson",
    action: "Access Request",
    resource: "Customer Database",
    status: "Denied",
    details: "Access denied due to policy violation: Outside working hours",
  },
  {
    id: "log-4",
    timestamp: "2025-05-03 14:05:33",
    user: "Sarah Williams",
    action: "Segment Creation",
    resource: "Test Environment",
    status: "Success",
    details: "Created new network segment for testing",
  },
  {
    id: "log-5",
    timestamp: "2025-05-02 11:45:19",
    user: "Alex Brown",
    action: "Access Request",
    resource: "Financial Database",
    status: "Denied",
    details: "Access denied due to insufficient privileges",
  },
  {
    id: "log-6",
    timestamp: "2025-05-02 10:30:05",
    user: "Emily Davis",
    action: "Policy Deletion",
    resource: "Archived Data Access",
    status: "Success",
    details: "Deleted obsolete policy for archived data",
  },
  {
    id: "log-7",
    timestamp: "2025-05-01 16:20:45",
    user: "David Wilson",
    action: "Access Request",
    resource: "Code Repository",
    status: "Approved",
    details: "Temporary access granted for 24 hours",
  },
]

export default function AccessControlPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("policies")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPolicyType, setSelectedPolicyType] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isAddPolicyDialogOpen, setIsAddPolicyDialogOpen] = useState(false)
  const [isEditPolicyDialogOpen, setIsEditPolicyDialogOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
  const [isAddSegmentDialogOpen, setIsAddSegmentDialogOpen] = useState(false)

  // Filter policies based on search query and filters
  const filteredPolicies = demoPolicies.filter((policy) => {
    const matchesSearch =
      searchQuery === "" ||
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedPolicyType === null || policy.type === selectedPolicyType
    const matchesStatus = selectedStatus === null || policy.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleEditPolicy = (policy: any) => {
    setSelectedPolicy(policy)
    setIsEditPolicyDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </Badge>
        )
      case "Inactive":
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            <Clock className="mr-1 h-3 w-3" /> Inactive
          </Badge>
        )
      case "Success":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Success
          </Badge>
        )
      case "Denied":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Denied
          </Badge>
        )
      case "Approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Access Control</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/users/management">
              <UserCog className="mr-2 h-4 w-4" />
              User Management
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="policies">Access Policies</TabsTrigger>
          <TabsTrigger value="segments">Network Segmentation</TabsTrigger>
          <TabsTrigger value="audit">Policy Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Policies</CardTitle>
              <CardDescription>Manage and configure access control policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search policies..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Dialog open={isAddPolicyDialogOpen} onOpenChange={setIsAddPolicyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Policy
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Create New Access Policy</DialogTitle>
                        <DialogDescription>Define a new access control policy for your organization</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="policy-name" className="text-right">
                            Policy Name
                          </Label>
                          <Input id="policy-name" placeholder="HR Data Access Policy" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="policy-description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="policy-description"
                            placeholder="Controls access to HR systems and employee data"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="policy-type" className="text-right">
                            Policy Type
                          </Label>
                          <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select policy type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="access-control">Access Control</SelectItem>
                              <SelectItem value="data-protection">Data Protection</SelectItem>
                              <SelectItem value="privilege-management">Privilege Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label htmlFor="policy-resources" className="text-right pt-2">
                            Resources
                          </Label>
                          <div className="col-span-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="resource-hr-database" />
                              <label
                                htmlFor="resource-hr-database"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                HR Database
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="resource-employee-records" />
                              <label
                                htmlFor="resource-employee-records"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Employee Records
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="resource-payroll-system" />
                              <label
                                htmlFor="resource-payroll-system"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Payroll System
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label htmlFor="policy-subjects" className="text-right pt-2">
                            Subjects
                          </Label>
                          <div className="col-span-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="subject-hr-department" />
                              <label
                                htmlFor="subject-hr-department"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                HR Department
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="subject-managers" />
                              <label
                                htmlFor="subject-managers"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Managers
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="subject-executive-team" />
                              <label
                                htmlFor="subject-executive-team"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Executive Team
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label htmlFor="policy-conditions" className="text-right pt-2">
                            Conditions
                          </Label>
                          <div className="col-span-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="condition-working-hours" />
                              <label
                                htmlFor="condition-working-hours"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Working Hours (8AM-6PM)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="condition-corporate-network" />
                              <label
                                htmlFor="condition-corporate-network"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Corporate Network
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="condition-mfa" />
                              <label
                                htmlFor="condition-mfa"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                MFA Required
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="condition-audit" />
                              <label
                                htmlFor="condition-audit"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Audit Logging
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddPolicyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsAddPolicyDialogOpen(false)}>Create Policy</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {showFilters && (
                  <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="policy-type-filter">Policy Type</Label>
                      <Select
                        value={selectedPolicyType || ""}
                        onValueChange={(value) => setSelectedPolicyType(value === "" ? null : value)}
                      >
                        <SelectTrigger id="policy-type-filter">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Access Control">Access Control</SelectItem>
                          <SelectItem value="Data Protection">Data Protection</SelectItem>
                          <SelectItem value="Privilege Management">Privilege Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status-filter">Status</Label>
                      <Select
                        value={selectedStatus || ""}
                        onValueChange={(value) => setSelectedStatus(value === "" ? null : value)}
                      >
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resources</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-sm text-muted-foreground">{policy.description}</div>
                        </TableCell>
                        <TableCell>{policy.type}</TableCell>
                        <TableCell>{getStatusBadge(policy.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {policy.resources.map((resource, index) => (
                              <Badge key={index} variant="outline">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {policy.subjects.map((subject, index) => (
                              <Badge key={index} variant="outline">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{policy.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditPolicy(policy)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Edit Policy
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                View Affected Users
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {policy.status === "Active" ? (
                                  <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Deactivate Policy
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activate Policy
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Delete Policy
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>Network Segmentation</CardTitle>
              <CardDescription>Manage network segments and access rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <Dialog open={isAddSegmentDialogOpen} onOpenChange={setIsAddSegmentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Network className="mr-2 h-4 w-4" />
                        Add Segment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Network Segment</DialogTitle>
                        <DialogDescription>Define a new network segment for micro-segmentation</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="segment-name" className="text-right">
                            Segment Name
                          </Label>
                          <Input id="segment-name" placeholder="Finance Network" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="segment-description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="segment-description"
                            placeholder="Isolated network for finance department"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddSegmentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsAddSegmentDialogOpen(false)}>Create Segment</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resources</TableHead>
                      <TableHead>Policies</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoSegments.map((segment) => (
                      <TableRow key={segment.id}>
                        <TableCell>
                          <div className="font-medium">{segment.name}</div>
                          <div className="text-sm text-muted-foreground">{segment.description}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(segment.status)}</TableCell>
                        <TableCell>{segment.resources}</TableCell>
                        <TableCell>{segment.policies}</TableCell>
                        <TableCell>{segment.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Edit Segment
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Network className="mr-2 h-4 w-4" />
                                View Resources
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {segment.status === "Active" ? (
                                  <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Deactivate Segment
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activate Segment
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Delete Segment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Policy Audit Logs</CardTitle>
              <CardDescription>View and analyze policy-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
