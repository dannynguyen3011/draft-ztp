"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/useAuth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronRight } from "lucide-react"

interface Meeting {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  summary: string
}

export default function MeetingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true)
        // In a real app, this would fetch from your API
        // For demo purposes, we'll use sample data

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Sample meetings data
        const sampleMeetings = [
          {
            id: "meeting-1",
            title: "Q1 Performance Review",
            description: "Review of Q1 performance metrics and goals for Q2",
            start_time: "2023-04-10T10:00:00Z",
            end_time: "2023-04-10T11:30:00Z",
            summary:
              "Discussed Q1 results (15% above target). Set Q2 goals focusing on market expansion and product improvements.",
          },
          {
            id: "meeting-2",
            title: "Product Roadmap Planning",
            description: "Planning session for product features in the next 6 months",
            start_time: "2023-04-12T14:00:00Z",
            end_time: "2023-04-12T16:00:00Z",
            summary:
              "Prioritized 5 key features for next release. Timeline set for June launch. Assigned development teams.",
          },
          {
            id: "meeting-3",
            title: "Security Protocol Review",
            description: "Review and update of security protocols and procedures",
            start_time: "2023-04-14T09:00:00Z",
            end_time: "2023-04-14T10:30:00Z",
            summary:
              "Updated access control policies. Implemented new MFA requirements. Scheduled security training for May.",
          },
        ]

        setMeetings(sampleMeetings)
      } catch (error) {
        console.error("Error fetching meetings:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMeetings()
    }
  }, [user, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading meetings...</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Meetings</h1>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          New Meeting
        </Button>
      </div>

      <div className="grid gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{meeting.title}</CardTitle>
              <CardDescription>{meeting.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(meeting.start_time)} - {formatDate(meeting.end_time)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{meeting.summary}</p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <Button
                variant="ghost"
                className="ml-auto flex items-center gap-1"
                onClick={() => router.push(`/meetings/${meeting.id}`)}
              >
                View Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
