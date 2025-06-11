import type React from "react"
import { TopNavbar } from "@/components/top-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}
