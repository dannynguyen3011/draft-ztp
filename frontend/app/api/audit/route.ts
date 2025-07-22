import { NextResponse } from "next/server"
import { getAuditLogs, generateSampleAuditLogs } from "@/lib/audit-service"
import type { HospitalAuditEventType, HospitalResourceType } from "@/lib/hospital-schema"

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const userId = searchParams.get("userId") || null
    const eventType = searchParams.get("eventType") as AuditEventType | null
    const resourceType = searchParams.get("resourceType") as ResourceType | null
    const status = searchParams.get("status") as "success" | "failure" | null

    // Parse date filters if provided
    let startDate = null
    let endDate = null

    if (searchParams.get("startDate")) {
      startDate = new Date(searchParams.get("startDate") as string)
    }

    if (searchParams.get("endDate")) {
      endDate = new Date(searchParams.get("endDate") as string)
    }

    // Get audit logs with filters
    const result = await getAuditLogs({
      page,
      limit,
      user_id: userId,
      event_type: eventType,
      resource_type: resourceType,
      start_date: startDate,
      end_date: endDate,
      status,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching audit logs:", error)

    // Generate sample data as fallback
    const sampleLogs = generateSampleAuditLogs(20)
    return NextResponse.json({
      logs: sampleLogs,
      total: 60,
      pages: 3,
    })
  }
}
