import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { TopNavbar } from "@/components/top-navbar"
import { Users, Clock, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CommunityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
                <p className="text-muted-foreground">Connect with other ZeroTrust Platform users</p>
              </div>
              <Button>Create New Topic</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Discussions</CardTitle>
                    <CardDescription>Most active topics in the community</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        title: "Best practices for implementing MFA",
                        category: "Authentication",
                        replies: 24,
                        views: 342,
                        lastActivity: "2 hours ago",
                      },
                      {
                        title: "How to configure network segmentation",
                        category: "Network Security",
                        replies: 18,
                        views: 256,
                        lastActivity: "5 hours ago",
                      },
                      {
                        title: "Troubleshooting API Gateway issues",
                        category: "Integration",
                        replies: 32,
                        views: 415,
                        lastActivity: "1 day ago",
                      },
                      {
                        title: "GDPR compliance with ZeroTrust",
                        category: "Compliance",
                        replies: 15,
                        views: 189,
                        lastActivity: "2 days ago",
                      },
                      {
                        title: "Behavioral monitoring false positives",
                        category: "Monitoring",
                        replies: 27,
                        views: 301,
                        lastActivity: "3 days ago",
                      },
                    ].map((topic, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between">
                          <div>
                            <Link href={`/community/topic-${index + 1}`} className="font-medium hover:underline">
                              {topic.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{topic.category}</Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" /> {topic.replies} replies
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" /> {topic.views} views
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {topic.lastActivity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Discussions
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Members</span>
                        <span className="font-medium">5,284</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Topics</span>
                        <span className="font-medium">1,342</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Posts</span>
                        <span className="font-medium">8,976</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Online Now</span>
                        <span className="font-medium">124</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { name: "General Discussion", count: 342 },
                        { name: "Authentication", count: 256 },
                        { name: "Access Control", count: 189 },
                        { name: "Behavioral Monitoring", count: 145 },
                        { name: "Incident Response", count: 132 },
                        { name: "Integration", count: 118 },
                        { name: "Compliance", count: 95 },
                      ].map((category, index) => (
                        <div key={index} className="flex justify-between">
                          <Link
                            href={`/community/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-sm hover:underline"
                          >
                            {category.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">{category.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { name: "John Smith", posts: 342, joined: "1 year ago" },
                        { name: "Jane Doe", posts: 256, joined: "2 years ago" },
                        { name: "Mike Johnson", posts: 189, joined: "6 months ago" },
                        { name: "Sarah Williams", posts: 145, joined: "1 year ago" },
                        { name: "David Brown", posts: 132, joined: "3 years ago" },
                      ].map((user, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <Link
                              href={`/community/user/${user.name.toLowerCase().replace(/\s+/g, "-")}`}
                              className="text-sm hover:underline"
                            >
                              {user.name}
                            </Link>
                            <div className="text-xs text-muted-foreground">Joined {user.joined}</div>
                          </div>
                          <span className="text-xs text-muted-foreground">{user.posts} posts</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
