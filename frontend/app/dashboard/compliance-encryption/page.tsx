"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Lock, FileText, AlertTriangle, FileCheck } from "lucide-react"

export default function ComplianceEncryptionPage() {
  const [activeTab, setActiveTab] = useState("encryption")

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance & Encryption</h1>
          <p className="text-muted-foreground">Manage compliance, encryption, and data protection settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
            <TabsTrigger
              value="encryption"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Encryption Settings</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Audit Logging</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="dlp"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Data Loss Prevention</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                <span>Compliance Reports</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encryption" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Encryption Settings</CardTitle>
                <CardDescription>Configure encryption algorithms and key management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="data-encryption">Data Encryption Algorithm</Label>
                    <Select defaultValue="aes-256">
                      <SelectTrigger id="data-encryption">
                        <SelectValue placeholder="Select encryption algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aes-256">AES-256</SelectItem>
                        <SelectItem value="aes-128">AES-128</SelectItem>
                        <SelectItem value="chacha20">ChaCha20-Poly1305</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-encryption">Key Encryption Algorithm</Label>
                    <Select defaultValue="rsa-4096">
                      <SelectTrigger id="key-encryption">
                        <SelectValue placeholder="Select key encryption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rsa-4096">RSA-4096</SelectItem>
                        <SelectItem value="rsa-2048">RSA-2048</SelectItem>
                        <SelectItem value="ecc-p256">ECC P-256</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key-rotation">Key Rotation Period (days)</Label>
                  <Input id="key-rotation" type="number" defaultValue="90" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="at-rest" defaultChecked />
                  <Label htmlFor="at-rest">Enable encryption at rest</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="in-transit" defaultChecked />
                  <Label htmlFor="in-transit">Enable encryption in transit</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="key-backup" defaultChecked />
                  <Label htmlFor="key-backup">Enable key backup</Label>
                </div>

                <Button>Save Encryption Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logging</CardTitle>
                <CardDescription>Configure audit logging settings and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="log-destination">Log Destination</Label>
                    <Select defaultValue="elk">
                      <SelectTrigger id="log-destination">
                        <SelectValue placeholder="Select log destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elk">ELK Stack</SelectItem>
                        <SelectItem value="splunk">Splunk</SelectItem>
                        <SelectItem value="datadog">Datadog</SelectItem>
                        <SelectItem value="cloudwatch">AWS CloudWatch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="log-retention">Log Retention Period (days)</Label>
                    <Input id="log-retention" type="number" defaultValue="365" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elk-url">ELK Stack URL</Label>
                  <Input id="elk-url" placeholder="https://elk.example.com:9200" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter your API key" />
                </div>

                <div className="space-y-2">
                  <Label>Log Events</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="auth-events" defaultChecked />
                      <Label htmlFor="auth-events">Authentication events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="admin-events" defaultChecked />
                      <Label htmlFor="admin-events">Administrative actions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="data-access" defaultChecked />
                      <Label htmlFor="data-access">Data access events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="system-events" defaultChecked />
                      <Label htmlFor="system-events">System events</Label>
                    </div>
                  </div>
                </div>

                <Button>Save Audit Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dlp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Loss Prevention</CardTitle>
                <CardDescription>Configure DLP policies to prevent sensitive data leakage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Enabled DLP Policies</Label>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Credit Card Detection</TableCell>
                          <TableCell>PCI DSS</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>SSN Detection</TableCell>
                          <TableCell>PII</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Healthcare Information</TableCell>
                          <TableCell>HIPAA</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Monitoring
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Source Code Detection</TableCell>
                          <TableCell>Custom</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Disabled
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dlp-action">Default Action</Label>
                    <Select defaultValue="block">
                      <SelectTrigger id="dlp-action">
                        <SelectValue placeholder="Select default action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="block">Block and Alert</SelectItem>
                        <SelectItem value="alert">Alert Only</SelectItem>
                        <SelectItem value="log">Log Only</SelectItem>
                        <SelectItem value="redact">Redact Sensitive Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scan-frequency">Scan Frequency</Label>
                    <Select defaultValue="realtime">
                      <SelectTrigger id="scan-frequency">
                        <SelectValue placeholder="Select scan frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button>Add New DLP Policy</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>Generate and view compliance reports for various frameworks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="compliance-framework">Compliance Framework</Label>
                    <Select defaultValue="soc2">
                      <SelectTrigger id="compliance-framework">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soc2">SOC 2</SelectItem>
                        <SelectItem value="hipaa">HIPAA</SelectItem>
                        <SelectItem value="gdpr">GDPR</SelectItem>
                        <SelectItem value="pci">PCI DSS</SelectItem>
                        <SelectItem value="iso27001">ISO 27001</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-period">Report Period</Label>
                    <Select defaultValue="last-quarter">
                      <SelectTrigger id="report-period">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="last-quarter">Last Quarter</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Framework</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>SOC 2 Compliance Report</TableCell>
                        <TableCell>SOC 2</TableCell>
                        <TableCell>2023-10-01</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Compliant
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>GDPR Data Processing Audit</TableCell>
                        <TableCell>GDPR</TableCell>
                        <TableCell>2023-09-15</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Partial
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>PCI DSS Compliance Check</TableCell>
                        <TableCell>PCI DSS</TableCell>
                        <TableCell>2023-08-22</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Non-compliant
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-2">
                  <Button>Generate Report</Button>
                  <Button variant="outline">Schedule Reports</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
