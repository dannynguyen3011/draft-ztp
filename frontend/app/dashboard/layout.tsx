"use client"

import type React from "react"
import { TopNavbar } from "@/components/top-navbar"
import { usePageTracking } from "@/hooks/usePageTracking"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enable automatic page tracking for all dashboard pages
  usePageTracking()

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}
