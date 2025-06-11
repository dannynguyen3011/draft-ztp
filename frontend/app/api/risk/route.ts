import { NextResponse } from "next/server"
import { assessBehavioralAnomaly } from "@/lib/risk-assessment"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, action, resource, context } = body

    // Assess if the user's behavior is anomalous
    const assessmentResult = await assessBehavioralAnomaly(username, action, resource, context)

    return NextResponse.json(assessmentResult)
  } catch (error) {
    console.error("Risk assessment error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during risk assessment",
      },
      { status: 500 },
    )
  }
}
