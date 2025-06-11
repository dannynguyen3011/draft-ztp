import type { User, RiskScore, Meeting, MeetingParticipant } from "./db-schema"

// In-memory storage for demo/preview environment
const inMemoryStorage = {
  users: [] as User[],
  riskScores: [] as RiskScore[],
  meetings: [] as Meeting[],
  meetingParticipants: [] as MeetingParticipant[],
}

// User functions
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const user = inMemoryStorage.users.find((u) => u.username === username)
    return user || null
  } catch (error) {
    console.error("Error getting user by username:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = inMemoryStorage.users.find((u) => u.id === id)
    return user || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Risk score functions
export async function getLatestRiskScore(userId: string): Promise<RiskScore | null> {
  try {
    const scores = inMemoryStorage.riskScores
      .filter((score) => score.user_id === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return scores.length > 0 ? scores[0] : null
  } catch (error) {
    console.error("Error getting latest risk score:", error)
    return null
  }
}

export async function addRiskScore(riskScore: Omit<RiskScore, "id">): Promise<RiskScore | null> {
  try {
    const id = `risk-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newRiskScore = { id, ...riskScore }

    inMemoryStorage.riskScores.push(newRiskScore)
    return newRiskScore
  } catch (error) {
    console.error("Error adding risk score:", error)
    return null
  }
}

// Meeting functions
export async function getMeetingById(id: string): Promise<Meeting | null> {
  try {
    const meeting = inMemoryStorage.meetings.find((m) => m.id === id)
    return meeting || null
  } catch (error) {
    console.error("Error getting meeting by ID:", error)
    return null
  }
}

export async function getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
  try {
    return inMemoryStorage.meetingParticipants.filter((p) => p.meeting_id === meetingId)
  } catch (error) {
    console.error("Error getting meeting participants:", error)
    return []
  }
}

export async function getUserMeetings(userId: string): Promise<Meeting[]> {
  try {
    const participantMeetingIds = inMemoryStorage.meetingParticipants
      .filter((p) => p.user_id === userId)
      .map((p) => p.meeting_id)

    return inMemoryStorage.meetings
      .filter((m) => participantMeetingIds.includes(m.id))
      .sort((a, b) => b.start_time.getTime() - a.start_time.getTime())
  } catch (error) {
    console.error("Error getting user meetings:", error)
    return []
  }
}

// Role-based access control for meetings
export async function getMeetingDetails(meetingId: string, userId: string): Promise<any> {
  try {
    // Get the user to check their role
    const user = await getUserById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Get the basic meeting information
    const meeting = await getMeetingById(meetingId)
    if (!meeting) {
      throw new Error("Meeting not found")
    }

    // Check if the user is a participant in the meeting
    const isParticipant = inMemoryStorage.meetingParticipants.some(
      (p) => p.meeting_id === meetingId && p.user_id === userId,
    )

    if (!isParticipant) {
      throw new Error("User is not a participant in this meeting")
    }

    // Base response that both roles can see
    const response = {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      summary: meeting.summary,
    }

    // If the user is a manager, add detailed information
    if (user.role === "manager") {
      const participants = await getMeetingParticipants(meetingId)

      // Get user details for each participant
      const participantsWithDetails = await Promise.all(
        participants.map(async (participant) => {
          const user = await getUserById(participant.user_id)
          return {
            ...participant,
            username: user?.username || "Unknown",
            email: user?.email || "Unknown",
          }
        }),
      )

      return {
        ...response,
        participants: participantsWithDetails,
        created_by: meeting.created_by,
        total_participants: participants.length,
        average_duration: participants.reduce((sum, p) => sum + (p.duration_minutes || 0), 0) / participants.length,
      }
    }

    // For regular members, return only the basic information
    return response
  } catch (error) {
    console.error("Error getting meeting details:", error)
    throw error
  }
}

// Initialize with sample data from sample-data.ts
export async function initializeInMemoryStorage(
  users: User[],
  riskScores: RiskScore[],
  meetings: Meeting[],
  meetingParticipants: MeetingParticipant[],
) {
  inMemoryStorage.users = users
  inMemoryStorage.riskScores = riskScores
  inMemoryStorage.meetings = meetings
  inMemoryStorage.meetingParticipants = meetingParticipants
}
