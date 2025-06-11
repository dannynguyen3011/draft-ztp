"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, AlertTriangle, XCircle, FileText, AlertCircle, ArrowUpRight } from "lucide-react"

export default function CompliancePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("gdpr")

  // Demo data for compliance reports
  const complianceData = {
    gdpr: {
      complianceScore: 87,
      lastAssessment: "2025-04-28",
      nextAssessment: "2025-07-28",
      requirements: [
        { id: 1, name: "Data Processing Records", status: "compliant", score: 100 },
        { id: 2, name: "Consent Management", status: "compliant", score: 95 },
        { id: 3, name: "Data Subject Rights", status: "compliant", score: 90 },
        { id: 4, name: "Data Breach Notification", status: "attention", score: 75 },
        { id: 5, name: "Data Protection Impact Assessment", status: "attention", score: 70 },
        { id: 6, name: "Cross-Border Data Transfers", status: "non-compliant", score: 60 },
      ],
      recentEvents: [
        {
          id: 1,
          type: "Data Access",
          user: "john.manager",
          resource: "Customer Database",
          timestamp: "2025-05-04 09:15:23",
          status: "Authorized",
        },
        {
          id: 2,
          type: "Consent Update",
          user: "sarah.manager",
          resource: "Marketing Preferences",
          timestamp: "2025-05-03 14:22:45",
          status: "Authorized",
        },
        {
          id: 3,
          type: "Data Export",
          user: "mike.member",
          resource: "User Profiles",
          timestamp: "2025-05-02 11:05:17",
          status: "Flagged",
        },
      ],
    },
    hipaa: {
      complianceScore: 92,
      lastAssessment: "2025-04-15",
      nextAssessment: "2025-07-15",
      requirements: [
        { id: 1, name: "Access Controls", status: "compliant", score: 95 },
        { id: 2, name: "Audit Controls", status: "compliant", score: 100 },
        { id: 3, name: "Integrity Controls", status: "compliant", score: 90 },
        { id: 4, name: "Transmission Security", status: "compliant", score: 95 },
        { id: 5, name: "Business Associate Agreements", status: "attention", score: 80 },
        { id: 6, name: "Contingency Planning", status: "compliant", score: 90 },
      ],
      recentEvents: [
        {
          id: 1,
          type: "PHI Access",
          user: "dr.smith",
          resource: "Patient Records",
          timestamp: "2025-05-04 10:30:12",
          status: "Authorized",
        },
        {
          id: 2,
          type: "PHI Export",
          user: "nurse.johnson",
          resource: "Treatment Plans",
          timestamp: "2025-05-03 15:45:33",
          status: "Authorized",
        },
        {
          id: 3,
          type: "PHI Access",
          user: "admin.user",
          resource: "Billing Records",
          timestamp: "2025-05-02 09:12:05",
          status: "Flagged",
        },
      ],
    },
    nist: {
      complianceScore: 84,
      lastAssessment: "2025-04-20",
      nextAssessment: "2025-07-20",
      requirements: [
        { id: 1, name: "Access Control (AC)", status: "compliant", score: 90 },
        { id: 2, name: "Awareness and Training (AT)", status: "compliant", score: 95 },
        { id: 3, name: "Audit and Accountability (AU)", status: "compliant", score: 85 },
        { id: 4, name: "Risk Assessment (RA)", status: "attention", score: 75 },
        { id: 5, name: "System and Communications Protection (SC)", status: "attention", score: 70 },
        { id: 6, name: "System and Information Integrity (SI)", status: "non-compliant", score: 65 },
      ],
      recentEvents: [
        {
          id: 1,
          type: "Configuration Change",
          user: "admin.user",
          resource: "Firewall Rules",
          timestamp: "2025-05-04 11:20:45",
          status: "Authorized",
        },
        {
          id: 2,
          type: "System Access",
          user: "john.manager",
          resource: "Admin Console",
          timestamp: "2025-05-03 16:30:22",
          status: "Authorized",
        },
        {
          id: 3,
          type: "Privilege Escalation",
          user: "mike.member",
          resource: "Database Server",
          timestamp: "2025-05-02 14:15:37",
          status: "Flagged",
        },
      ],
    },
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Compliant
          </Badge>
        )
      case "attention":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="mr-1 h-3 w-3" /> Needs Attention
          </Badge>
        )
      case "non-compliant":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Non-Compliant
          </Badge>
        )
      case "Authorized":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Authorized
          </Badge>
        )
      case "Flagged":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="mr-1 h-3 w-3" /> Flagged
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="mr-1 h-3 w-3" /> {status}
          </Badge>
        )
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-amber-500"
    return "bg-red-500"
  }

  const activeData = complianceData[activeTab as keyof typeof complianceData]

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compliance Reports</h1>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">GDPR Compliance</CardTitle>
            <CardDescription>General Data Protection Regulation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 mb-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{complianceData.gdpr.complianceScore}%</span>
                </div>
                <svg className="h-24 w-24" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="0"
                  />
                  <circle
                    className="stroke-green-500 fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * complianceData.gdpr.complianceScore) / 100}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("gdpr")}>
                View Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">HIPAA Compliance</CardTitle>
            <CardDescription>Health Insurance Portability and Accountability Act</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 mb-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{complianceData.hipaa.complianceScore}%</span>
                </div>
                <svg className="h-24 w-24" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="0"
                  />
                  <circle
                    className="stroke-green-500 fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * complianceData.hipaa.complianceScore) / 100}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("hipaa")}>
                View Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">NIST Compliance</CardTitle>
            <CardDescription>National Institute of Standards and Technology</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 mb-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{complianceData.nist.complianceScore}%</span>
                </div>
                <svg className="h-24 w-24" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="0"
                  />
                  <circle
                    className="stroke-amber-500 fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * complianceData.nist.complianceScore) / 100}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("nist")}>
                View Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="gdpr">GDPR Report</TabsTrigger>
          <TabsTrigger value="hipaa">HIPAA Report</TabsTrigger>
          <TabsTrigger value="nist">NIST Report</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>
                  Last assessment: {activeData.lastAssessment} • Next assessment: {activeData.nextAssessment}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Compliance Score</span>
                      <span className="text-sm font-medium">{activeData.complianceScore}%</span>
                    </div>
                    <Progress
                      value={activeData.complianceScore}
                      className={getScoreColor(activeData.complianceScore)}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Compliance Requirements</h3>
                    <div className="space-y-2">
                      {activeData.requirements.map((req) => (
                        <div key={req.id} className="grid grid-cols-[1fr,auto,auto] gap-2 items-center">
                          <span className="text-sm">{req.name}</span>
                          <span className="text-sm font-medium">{req.score}%</span>
                          {getStatusBadge(req.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Compliance Events</CardTitle>
                <CardDescription>Last 7 days of activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeData.recentEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>{event.user}</TableCell>
                        <TableCell>{event.resource}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    View Full Compliance Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Compliance Recommendations</CardTitle>
              <CardDescription>Actions to improve compliance posture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeTab === "gdpr" && (
                  <>
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Update Data Breach Notification Procedures</h4>
                        <p className="text-sm text-muted-foreground">
                          Current procedures do not fully comply with the 72-hour notification requirement. Update
                          procedures to ensure timely notification of data breaches to supervisory authorities.
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Implement Cross-Border Data Transfer Safeguards</h4>
                        <p className="text-sm text-muted-foreground">
                          Current cross-border data transfers lack appropriate safeguards. Implement Standard
                          Contractual Clauses (SCCs) or other appropriate safeguards for all cross-border data
                          transfers.
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "hipaa" && (
                  <>
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Update Business Associate Agreements</h4>
                        <p className="text-sm text-muted-foreground">
                          Some Business Associate Agreements (BAAs) are outdated or missing required provisions. Review
                          and update all BAAs to ensure compliance with current HIPAA requirements.
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Maintain Current Audit Controls</h4>
                        <p className="text-sm text-muted-foreground">
                          Current audit controls are fully compliant with HIPAA requirements. Continue to monitor and
                          maintain these controls to ensure ongoing compliance.
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "nist" && (
                  <>
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Enhance Risk Assessment Procedures</h4>
                        <p className="text-sm text-muted-foreground">
                          Current risk assessment procedures do not fully address all NIST requirements. Implement more
                          comprehensive risk assessment procedures that align with NIST SP 800-30.
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Improve System and Information Integrity</h4>
                        <p className="text-sm text-muted-foreground">
                          Current system and information integrity controls do not meet NIST requirements. Implement
                          flaw remediation, malicious code protection, and system monitoring as per NIST SP 800-53.
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
