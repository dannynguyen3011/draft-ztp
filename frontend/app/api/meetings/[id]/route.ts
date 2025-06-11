import { NextResponse } from "next/server"
import { getMeetingDetails } from "@/lib/db-service"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const meetingId = params.id

    // Get the authenticated user from the session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = session.user.id

    // Get meeting details based on user role
    const meetingDetails = await getMeetingDetails(meetingId, userId)

    return NextResponse.json(meetingDetails)
  } catch (error: any) {
    console.error("Error fetching meeting details:", error)

    return NextResponse.json({ error: error.message || "Failed to fetch meeting details" }, { status: 500 })
  }
}
