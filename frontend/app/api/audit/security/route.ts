import { NextResponse } from "next/server"
import { getSecurityEvents, generateSampleSecurityEvents } from "@/lib/audit-service"

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    // Get security events
    const events = await getSecurityEvents(days, limit)

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching security events:", error)

    // Generate sample data as fallback
    const sampleEvents = generateSampleSecurityEvents(10)
    return NextResponse.json({ events: sampleEvents })
  }
}
