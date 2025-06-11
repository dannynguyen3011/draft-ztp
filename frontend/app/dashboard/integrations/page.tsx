"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Network, Shield, Cloud, Puzzle } from "lucide-react"

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("api-gateway")

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Configure integrations with other systems and services</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
            <TabsTrigger
              value="api-gateway"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                <span>API Gateway</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="identity-provider"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Identity Provider</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="cloud-integration"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span>Cloud Integration</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="plugin-management"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <Puzzle className="h-4 w-4" />
                <span>Plugin Management</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-gateway" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Gateway Configuration</CardTitle>
                <CardDescription>Configure API gateways to secure and manage API traffic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gateway-type">Gateway Type</Label>
                    <Select defaultValue="kong">
                      <SelectTrigger id="gateway-type">
                        <SelectValue placeholder="Select gateway type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kong">Kong</SelectItem>
                        <SelectItem value="nginx">NGINX</SelectItem>
                        <SelectItem value="apigee">Apigee</SelectItem>
                        <SelectItem value="aws">AWS API Gateway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gateway-url">Gateway URL</Label>
                    <Input id="gateway-url" placeholder="https://api-gateway.example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter your API key" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="rate-limiting" />
                  <Label htmlFor="rate-limiting">Enable rate limiting</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="request-validation" />
                  <Label htmlFor="request-validation">Enable request validation</Label>
                </div>

                <Button>Save API Gateway Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identity-provider" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Identity Provider Integration</CardTitle>
                <CardDescription>
                  Configure integration with identity providers using OAuth 2.0 and OpenID Connect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="idp-type">Identity Provider</Label>
                    <Select defaultValue="auth0">
                      <SelectTrigger id="idp-type">
                        <SelectValue placeholder="Select identity provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auth0">Auth0</SelectItem>
                        <SelectItem value="okta">Okta</SelectItem>
                        <SelectItem value="azure-ad">Azure AD</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="custom">Custom OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-url">Tenant URL</Label>
                    <Input id="tenant-url" placeholder="https://your-tenant.auth0.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="client-id">Client ID</Label>
                    <Input id="client-id" placeholder="Enter client ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-secret">Client Secret</Label>
                    <Input id="client-secret" type="password" placeholder="Enter client secret" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callback-url">Callback URL</Label>
                  <Input id="callback-url" placeholder="https://your-app.com/callback" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-pkce" defaultChecked />
                  <Label htmlFor="enable-pkce">Enable PKCE (Proof Key for Code Exchange)</Label>
                </div>

                <Button>Save Identity Provider Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cloud-integration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cloud and On-Premises Integration</CardTitle>
                <CardDescription>
                  Configure hybrid deployments across cloud and on-premises environments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cloud-provider">Cloud Provider</Label>
                    <Select defaultValue="aws">
                      <SelectTrigger id="cloud-provider">
                        <SelectValue placeholder="Select cloud provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">AWS</SelectItem>
                        <SelectItem value="azure">Azure</SelectItem>
                        <SelectItem value="gcp">Google Cloud</SelectItem>
                        <SelectItem value="ibm">IBM Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select defaultValue="us-east-1">
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                        <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                        <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                        <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vpn-endpoint">VPN Endpoint</Label>
                  <Input id="vpn-endpoint" placeholder="vpn.example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input id="api-endpoint" placeholder="https://api.example.com" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-vpn" />
                  <Label htmlFor="enable-vpn">Enable VPN Connection</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-encryption" defaultChecked />
                  <Label htmlFor="enable-encryption">Enable End-to-End Encryption</Label>
                </div>

                <Button>Save Cloud Integration Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plugin-management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plugin Management</CardTitle>
                <CardDescription>Manage plugins and extensions for your ZeroTrust platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Advanced MFA Plugin</h3>
                          <p className="text-sm text-muted-foreground">v2.1.0</p>
                        </div>
                      </div>
                      <Switch id="mfa-plugin" defaultChecked />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Adds support for hardware tokens, biometric authentication, and push notifications.
                    </p>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Network Monitoring Plugin</h3>
                          <p className="text-sm text-muted-foreground">v1.3.2</p>
                        </div>
                      </div>
                      <Switch id="network-plugin" defaultChecked />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Real-time network traffic analysis and anomaly detection.
                    </p>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Cloud Security Scanner</h3>
                          <p className="text-sm text-muted-foreground">v3.0.1</p>
                        </div>
                      </div>
                      <Switch id="cloud-scanner" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Scans cloud resources for security vulnerabilities and misconfigurations.
                    </p>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Puzzle className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">Custom Integration Framework</h3>
                          <p className="text-sm text-muted-foreground">v1.5.0</p>
                        </div>
                      </div>
                      <Switch id="custom-integration" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Build and deploy custom integrations with third-party security tools.
                    </p>
                  </div>

                  <Button>Install New Plugin</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
