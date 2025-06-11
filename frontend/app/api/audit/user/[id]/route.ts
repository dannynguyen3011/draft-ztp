import { NextResponse } from "next/server"
import { getUserAuditLogs } from "@/lib/audit-service"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { unauthorized, forbidden } from "next/navigation"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      unauthorized()
    }

    const userId = params.id

    // Users can view their own logs, managers can view any logs
    const isOwnLogs = session.user.id === userId
    const isManager = session?.user?.roles?.includes("manager")

    if (!isOwnLogs && !isManager) {
      forbidden()
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)

    // Get user audit logs
    const logs = await getUserAuditLogs(userId, page, limit)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching user audit logs:", error)
    return NextResponse.json({ error: "Failed to fetch user audit logs" }, { status: 500 })
  }
}
