"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Search, BookOpen, FileQuestion } from "lucide-react"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("tickets")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [newTicketSubject, setNewTicketSubject] = useState("")
  const [newTicketDescription, setNewTicketDescription] = useState("")

  // Demo data for support tickets
  const ticketsData = [
    {
      id: "TICKET-2025-001",
      subject: "Unable to access financial reports",
      status: "open",
      priority: "high",
      created: "2025-05-07 08:23:45",
      updated: "2025-05-07 09:15:22",
      requester: "jane.smith@example.com",
      assignee: "Support Team",
    },
    {
      id: "TICKET-2025-002",
      subject: "MFA not working on mobile app",
      status: "in progress",
      priority: "medium",
      created: "2025-05-07 09:45:12",
      updated: "2025-05-07 10:30:45",
      requester: "john.doe@example.com",
      assignee: "Technical Support",
    },
    {
      id: "TICKET-2025-003",
      subject: "Need access to marketing resources",
      status: "pending",
      priority: "low",
      created: "2025-05-06 14:22:10",
      updated: "2025-05-06 15:17:33",
      requester: "alex.marketing@example.com",
      assignee: "Access Management",
    },
    {
      id: "TICKET-2025-004",
      subject: "Security alert false positive",
      status: "resolved",
      priority: "medium",
      created: "2025-05-05 11:10:22",
      updated: "2025-05-05 16:45:18",
      requester: "admin@example.com",
      assignee: "Security Team",
    },
  ]

  // Demo data for knowledge base articles
  const knowledgeBaseData = [
    {
      id: "KB-001",
      title: "How to Reset Your Password",
      category: "Authentication",
      views: 1245,
      lastUpdated: "2025-04-15",
    },
    {
      id: "KB-002",
      title: "Setting Up Multi-Factor Authentication",
      category: "Security",
      views: 987,
      lastUpdated: "2025-04-22",
    },
    {
      id: "KB-003",
      title: "Requesting Access to Resources",
      category: "Access Management",
      views: 756,
      lastUpdated: "2025-05-01",
    },
    {
      id: "KB-004",
      title: "Understanding Risk Scores",
      category: "Security",
      views: 543,
      lastUpdated: "2025-03-28",
    },
    {
      id: "KB-005",
      title: "Responding to Security Alerts",
      category: "Security",
      views: 432,
      lastUpdated: "2025-04-10",
    },
  ]

  // Demo data for FAQs
  const faqsData = [
    {
      id: 1,
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. Follow the instructions sent to your email to create a new password.",
    },
    {
      id: 2,
      question: "What should I do if I receive a security alert?",
      answer: "First, verify if the activity was performed by you. If not, immediately report it to the security team and change your password. Follow any additional instructions provided in the alert.",
    },
    {
      id: 3,
      question: "How do I request access to a new resource?",
      answer: "Navigate to the Access Control section and click on 'Request Access'. Select the resource you need access to and provide a business justification. Your request will be routed to the appropriate approver.",
    },
    {
      id: 4,
      question: "Why was my access request denied?",
      answer: "Access requests may be denied if they don't meet security policy requirements, lack proper justification, or require additional approvals. Contact your manager or the security team for specific details about your request.",
    },
    {
      id: 5,
      question: "How do I set up multi-factor authentication?",
      answer: "Go to your profile settings and select 'Security'. Click on 'Enable MFA' and follow the setup wizard. You can choose between app-based authentication, SMS, or hardware tokens depending on your organization's policies.",
    },
  ]

  const handleCreateTicket = () => {
    alert("Ticket created successfully! A support representative will contact you shortly.")
    setNewTicketSubject("")
    setNewTicketDescription("")
  }

  return (
    <div className="container max-w-7xl mx-auto flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support</h1>
          <p className="text-muted-foreground">
            Get help with the Zero Trust Platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>
                  Submit a new support request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input 
                      id="subject" 
                      placeholder="Brief description of your issue" 
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Select defaultValue="access">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="access">Access Issues</SelectItem>
                        <SelectItem value="security">Security Concerns</SelectItem>
                        <SelectItem value="technical">Technical Problems</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea 
                      id="description" 
                      placeholder="Please provide details about your issue" 
                      rows={5}
                      value={newTicketDescription}
                      onChange={(e) => setNewTicketDescription(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleCreateTicket}
                  disabled={!newTicketSubject || !newTicketDescription}
                >
                  Submit Ticket
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Your Tickets</CardTitle>
                <CardDescription>
                  Track your support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search tickets..." 
                      className="pl-8" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {ticketsData
                    .filter(ticket => 
                      (statusFilter === "all" || ticket.status === statusFilter) &&
                      (searchQuery === "" || 
                        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground">{ticket.id}</p>
                          </div>
                          <Badge 
                            variant={
                              ticket.status === "resolved" ? "outline" : 
                              ticket.status === "pending" ? "secondary" : 
                              ticket.status === "in progress" ? "default" :
                              "destructive"
                            }
                          >
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">Priority: </span>
                            <span className={
                              ticket.priority === "high" ? "text-destructive" : 
                              ticket.priority === "medium" ? "text-amber-500" : 
                              "text-green-500"
                            }>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created: </span>
                            <span>{ticket.created.split(' ')[0]}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Assignee: </span>
                            <span>{ticket.assignee}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated: </span>
                            <span>{ticket.updated.split(' ')[1]}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Articles and guides to help you use the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search knowledge base..." className="pl-8" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="access">Access Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-4 bg-muted p-2 text-xs font-medium">
                  <div>Title</div>
                  <div>Category</div>
                  <div>Views</div>
                  <div>Last Updated</div>
                </div>
                <div className="divide-y">
                  {knowledgeBaseData.map((article) => (
                    <div key={article.id} className="grid grid-cols-4 items-center p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{article.title}</span>
                      </div>
                      <div>{article.category}</div>
                      <div>{article.views}</div>
                      <div className="flex items-center justify-between">
                        <span>{article.lastUpdated}</span>
                        <Button variant="ghost" size="sm">
                          Read
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Articles</CardTitle>
                <CardDescription>Most viewed knowledge base articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeBaseData
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 3)
                    .map((article) => (
                    <div key={article.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="text-xs text-muted-foreground">{article.category}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Read</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recently Updated</CardTitle>
                <CardDescription>Latest knowledge base updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeBaseData
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .slice(0, 3)
                    .map((article) => (
                    <div key={article.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="text-xs text-muted-foreground">Updated: {article.lastUpdated}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Read</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search FAQs..." className="pl-8" />
              </div>

              <div className="space-y-4">
                {faqsData.map((faq) => (
                  <Card key={faq.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <FileQuestion className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">{faq.question}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">Available 24/7 for urgent issues</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-sm text-muted-foreground">support@example.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
                <CardDescription>
                  When you can reach our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Monday - Friday</span>
                    <span className="text-sm text-muted-foreground">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Saturday</span>
                    <span className="text-sm text-muted-foreground">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Sunday</span>
                    <span className="text-sm text-muted-foreground">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
