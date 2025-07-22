"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, Shield, AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import { AuthorizedComponent } from "@/components/AuthorizedComponent"
import { logUserActivity, getCurrentUserRiskScore, clearRiskCache, type RiskData } from "@/lib/risk-service"
import { keycloakAuth } from "@/lib/keycloak"

export default function WorkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [riskData, setRiskData] = useState<RiskData | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'normal' | 'classified' | null>(null)

  const user = keycloakAuth.getCurrentUser()
  const userRoles = keycloakAuth.getUserRoles()

  // Check if user is employee (employees should have 'employee' or 'member' role, not admin/manager)
  const isEmployee = userRoles.includes('employee') || userRoles.includes('member')
  
  // Fetch initial risk score
  useEffect(() => {
    const fetchInitialRiskScore = async () => {
      try {
        const risk = await getCurrentUserRiskScore()
        setRiskData(risk)
      } catch (error) {
        console.error('Error fetching initial risk score:', error)
      }
    }

    if (isEmployee) {
      fetchInitialRiskScore()
    }
  }, [isEmployee])
  
  const handleDataAccess = async (dataType: 'normal' | 'classified') => {
    try {
      setActionLoading(dataType)
      setLoading(true)

      if (dataType === 'normal') {
        // Log normal data access - no risk increase
        await logUserActivity('normal_data_access', '/dashboard/work', {
          dataType: 'normal',
          description: 'Accessed normal data - no risk increase'
        })
        setLastAction('normal')
      } else {
        // Log classified data access - risk score set to 75
        await logUserActivity('classified_data_access', '/dashboard/work', {
          dataType: 'classified',
          description: 'Accessed classified data - high risk action',
          forceRiskScore: 75 // This will be handled by the backend
        })
        setLastAction('classified')
      }

      // Clear risk cache and fetch updated risk score
      clearRiskCache()
      const updatedRisk = await getCurrentUserRiskScore()
      setRiskData(updatedRisk)

    } catch (error) {
      console.error(`Error handling ${dataType} data access:`, error)
    } finally {
      setLoading(false)
      setActionLoading(null)
    }
  }

  // Get current risk display
  const currentRiskScore = riskData?.riskScore || 30
  const currentRiskLevel = riskData?.riskLevel || 'medium'

  return (
    <AuthorizedComponent 
      resource="work" 
      action="read"
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
            <p className="text-gray-600 max-w-md">
              This work area is restricted to employees only. Managers and administrators cannot access this page.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      }
    >
      {!isEmployee ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Employee Access Only</h2>
            <p className="text-gray-600 max-w-md">
              This work area is restricted to employees only. Your current role ({userRoles.join(', ')}) does not have access to this section.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="container py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Work Area</h1>
              <p className="text-muted-foreground">Access data and resources for your daily work</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Current Risk Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Current Risk Status
              </CardTitle>
              <CardDescription>Your current security risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">{currentRiskScore}/100</div>
                  <Badge variant={
                    currentRiskLevel === "high" ? "destructive" : 
                    currentRiskLevel === "medium" ? "secondary" : "outline"
                  }>
                    {currentRiskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
                <div className="w-32">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${
                        currentRiskLevel === "high"
                          ? "bg-red-500"
                          : currentRiskLevel === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${currentRiskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Action Alert */}
          {lastAction && (
            <Alert className={`mb-6 ${lastAction === 'classified' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              {lastAction === 'classified' ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle>
                {lastAction === 'classified' ? 'Classified Data Accessed' : 'Normal Data Accessed'}
              </AlertTitle>
              <AlertDescription>
                {lastAction === 'classified' 
                  ? 'Your risk score has been increased to 75 due to accessing classified information.'
                  : 'Normal data access completed. Your risk score remains unchanged.'
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Data Access Buttons */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Normal Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Normal Data
                </CardTitle>
                <CardDescription>
                  Access regular work data and resources. No security risk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    No risk increase
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Standard access logging
                  </div>
                  <Button 
                    onClick={() => handleDataAccess('normal')}
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    {actionLoading === 'normal' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accessing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Access Normal Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Classified Data */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Classified Data
                </CardTitle>
                <CardDescription>
                  Access sensitive classified information. High security risk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Risk score increases to 75
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    High-security logging
                  </div>
                  <Button 
                    onClick={() => handleDataAccess('classified')}
                    disabled={loading}
                    className="w-full"
                    variant="destructive"
                  >
                    {actionLoading === 'classified' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accessing...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Access Classified Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Normal data access is logged but does not affect your risk score</p>
                <p>• Classified data access will immediately increase your risk score to 75</p>
                <p>• All data access is monitored and audited for security purposes</p>
                <p>• High risk scores may trigger additional security measures</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthorizedComponent>
  )
} 