"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, User, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MeetingParticipant {
  id: string
  username: string
  email: string
  join_time: string
  leave_time: string | null
  duration_minutes: number | null
}

interface MeetingDetails {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  summary: string
  participants?: MeetingParticipant[]
  total_participants?: number
  average_duration?: number
  created_by?: string
}

// Mock meeting data
const mockMeetings: Record<string, MeetingDetails> = {
  "meeting-1": {
    id: "meeting-1",
    title: "Q1 Performance Review",
    description: "Review of Q1 performance metrics and goals for Q2",
    start_time: "2023-04-10T10:00:00Z",
    end_time: "2023-04-10T11:30:00Z",
    summary:
      "Discussed Q1 results (15% above target). Set Q2 goals focusing on market expansion and product improvements. Team agreed to focus on three key initiatives: 1) Expanding into European markets, 2) Launching the mobile app redesign, and 3) Improving customer retention through a new loyalty program.",
    participants: [
      {
        id: "participant-1",
        username: "john.manager",
        email: "john.manager@example.com",
        join_time: "2023-04-10T09:55:00Z",
        leave_time: "2023-04-10T11:30:00Z",
        duration_minutes: 95,
      },
      {
        id: "participant-2",
        username: "sarah.manager",
        email: "sarah.manager@example.com",
        join_time: "2023-04-10T10:00:00Z",
        leave_time: "2023-04-10T11:30:00Z",
        duration_minutes: 90,
      },
      {
        id: "participant-3",
        username: "mike.member",
        email: "mike.member@example.com",
        join_time: "2023-04-10T10:05:00Z",
        leave_time: "2023-04-10T11:25:00Z",
        duration_minutes: 80,
      },
      {
        id: "participant-4",
        username: "lisa.member",
        email: "lisa.member@example.com",
        join_time: "2023-04-10T10:10:00Z",
        leave_time: "2023-04-10T11:30:00Z",
        duration_minutes: 80,
      },
    ],
    total_participants: 4,
    average_duration: 86.25,
    created_by: "user-1",
  },
  "meeting-2": {
    id: "meeting-2",
    title: "Product Roadmap Planning",
    description: "Planning session for product features in the next 6 months",
    start_time: "2023-04-12T14:00:00Z",
    end_time: "2023-04-12T16:00:00Z",
    summary:
      "Prioritized 5 key features for next release. Timeline set for June launch. Assigned development teams. The team decided to focus on improving the user onboarding experience, adding advanced analytics, implementing single sign-on, enhancing mobile responsiveness, and adding integration with popular CRM tools.",
    participants: [
      {
        id: "participant-5",
        username: "sarah.manager",
        email: "sarah.manager@example.com",
        join_time: "2023-04-12T13:55:00Z",
        leave_time: "2023-04-12T16:00:00Z",
        duration_minutes: 125,
      },
      {
        id: "participant-6",
        username: "mike.member",
        email: "mike.member@example.com",
        join_time: "2023-04-12T14:00:00Z",
        leave_time: "2023-04-12T16:00:00Z",
        duration_minutes: 120,
      },
      {
        id: "participant-7",
        username: "alex.member",
        email: "alex.member@example.com",
        join_time: "2023-04-12T14:05:00Z",
        leave_time: "2023-04-12T15:45:00Z",
        duration_minutes: 100,
      },
    ],
    total_participants: 3,
    average_duration: 115,
    created_by: "user-2",
  },
  "meeting-3": {
    id: "meeting-3",
    title: "Security Protocol Review",
    description: "Review and update of security protocols and procedures",
    start_time: "2023-04-14T09:00:00Z",
    end_time: "2023-04-14T10:30:00Z",
    summary:
      "Updated access control policies. Implemented new MFA requirements. Scheduled security training for May. The team also identified several potential vulnerabilities in the current system and developed a plan to address them within the next two weeks. All team members were assigned specific security tasks to complete before the next review.",
    participants: [
      {
        id: "participant-8",
        username: "john.manager",
        email: "john.manager@example.com",
        join_time: "2023-04-14T08:55:00Z",
        leave_time: "2023-04-14T10:30:00Z",
        duration_minutes: 95,
      },
      {
        id: "participant-9",
        username: "sarah.manager",
        email: "sarah.manager@example.com",
        join_time: "2023-04-14T09:00:00Z",
        leave_time: "2023-04-14T10:30:00Z",
        duration_minutes: 90,
      },
      {
        id: "participant-10",
        username: "lisa.member",
        email: "lisa.member@example.com",
        join_time: "2023-04-14T09:10:00Z",
        leave_time: "2023-04-14T10:25:00Z",
        duration_minutes: 75,
      },
      {
        id: "participant-11",
        username: "alex.member",
        email: "alex.member@example.com",
        join_time: "2023-04-14T09:15:00Z",
        leave_time: "2023-04-14T10:30:00Z",
        duration_minutes: 75,
      },
    ],
    total_participants: 4,
    average_duration: 83.75,
    created_by: "user-1",
  },
}

export default function MeetingDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    const fetchMeetingDetails = async () => {
      try {
        setLoading(true)

        // In a real app, this would fetch from your API
        // For demo purposes, we'll use mock data

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const meetingData = mockMeetings[params.id]

        if (!meetingData) {
          throw new Error("Meeting not found")
        }

        // Filter data based on user role
        const isManager = user?.roles.includes("manager")

        if (isManager) {
          // Managers can see all details
          setMeeting(meetingData)
        } else {
          // Members can only see summary and basic info
          const { id, title, description, start_time, end_time, summary } = meetingData
          setMeeting({ id, title, description, start_time, end_time, summary })
        }
      } catch (error: any) {
        console.error("Error fetching meeting details:", error)
        setError(error.message || "An error occurred while fetching meeting details")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMeetingDetails()
    }
  }, [params.id, user, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading meeting details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={() => router.push("/meetings")}>Back to Meetings</Button>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg">Meeting not found</p>
        <Button onClick={() => router.push("/meetings")}>Back to Meetings</Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const isManager = user?.roles.includes("manager")

  return (
    <div className="container py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/meetings")}>
        Back to Meetings
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{meeting.title}</CardTitle>
              <CardDescription>{meeting.description}</CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {new Date(meeting.start_time) > new Date() ? "Upcoming" : "Completed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>
              {formatDate(meeting.start_time)} - {formatDate(meeting.end_time)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Meeting Summary</TabsTrigger>
          {isManager && <TabsTrigger value="participants">Participants</TabsTrigger>}
          {isManager && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Summary</CardTitle>
              <CardDescription>Key points and decisions from the meeting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Summary</h3>
                </div>
                <p className="whitespace-pre-line">{meeting.summary}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isManager && (
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Participant Details</CardTitle>
                <CardDescription>{meeting.total_participants} participants attended this meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-4 gap-4 border-b p-3 font-medium">
                    <div>Participant</div>
                    <div>Join Time</div>
                    <div>Leave Time</div>
                    <div>Duration</div>
                  </div>

                  {meeting.participants?.map((participant) => (
                    <div key={participant.id} className="grid grid-cols-4 gap-4 border-b p-3 last:border-0">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{participant.username}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{participant.email}</span>
                      </div>
                      <div>{formatDate(participant.join_time)}</div>
                      <div>{participant.leave_time ? formatDate(participant.leave_time) : "N/A"}</div>
                      <div>{participant.duration_minutes} minutes</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isManager && (
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Analytics</CardTitle>
                <CardDescription>Insights and statistics about this meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="flex flex-col space-y-2 rounded-lg border p-4">
                    <span className="text-sm text-muted-foreground">Total Participants</span>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{meeting.total_participants}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 rounded-lg border p-4">
                    <span className="text-sm text-muted-foreground">Average Duration</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{meeting.average_duration?.toFixed(1)} min</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 rounded-lg border p-4">
                    <span className="text-sm text-muted-foreground">Meeting Length</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {Math.round(
                          (new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000,
                        )}{" "}
                        min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border p-4">
                  <h3 className="mb-4 font-medium">Attendance Rate</h3>
                  <div className="space-y-4">
                    {meeting.participants?.map((participant) => (
                      <div key={participant.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>{participant.username}</span>
                          <span className="text-sm font-medium">
                            {participant.duration_minutes
                              ? Math.round(
                                  (participant.duration_minutes /
                                    Math.round(
                                      (new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) /
                                        60000,
                                    )) *
                                    100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width: `${
                                participant.duration_minutes
                                  ? Math.round(
                                      (participant.duration_minutes /
                                        Math.round(
                                          (new Date(meeting.end_time).getTime() -
                                            new Date(meeting.start_time).getTime()) /
                                            60000,
                                        )) *
                                        100,
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
