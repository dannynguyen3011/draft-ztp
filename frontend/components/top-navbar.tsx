"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Shield,
  Menu,
  X,
  Home,
  Activity,
  Users,
  Lock,
  Network,
  Database,
  HelpCircle,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  User,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { keycloakAuth } from "@/lib/keycloak"
import { AuthorizedComponent } from "@/components/AuthorizedComponent"

export function TopNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadUser = async () => {
      // Check if user is authenticated
      if (!keycloakAuth.isAuthenticated()) {
        setUser(null)
        return
      }

      // Try to get cached user info first
      let currentUser = keycloakAuth.getCurrentUser()
      
      // If no cached user info but we have a token, fetch user info
      if (!currentUser) {
        try {
          const userInfo = await keycloakAuth.getUserInfo()
          localStorage.setItem('user_info', JSON.stringify(userInfo))
          currentUser = userInfo
        } catch (error) {
          console.error('Failed to get user info:', error)
          // If we can't get user info, the token might be invalid
          keycloakAuth.logout()
          return
        }
      }
      
      setUser(currentUser)
    }

    loadUser()
  }, [mounted])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    if (!mounted) return
    keycloakAuth.logout()
  }

  // Don't render during SSR
  if (!mounted) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:block text-xl font-bold text-gray-900">ZeroTrust</span>
            </Link>

            {/* Navigation Menu - Role-based visibility */}
            <div className="hidden md:flex ml-10 space-x-8">
              {/* Dashboard - Available to all authenticated users */}
              <AuthorizedComponent resource="dashboard" action="read" showLoader={false}>
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </AuthorizedComponent>

              {/* Analytics - Only managers and admins */}
              <AuthorizedComponent resource="analytics" action="read" showLoader={false}>
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </AuthorizedComponent>

              {/* Users - Only managers and admins */}
              <AuthorizedComponent resource="users" action="read" showLoader={false}>
                <Link
                  href="/dashboard/users"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Link>
              </AuthorizedComponent>

              {/* Policies - All users can read, but employees limited */}
              <AuthorizedComponent resource="policies" action="read" showLoader={false}>
                <Link
                  href="/dashboard/policies"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Policies
                </Link>
              </AuthorizedComponent>

              {/* Integrations - Only managers and admins */}
              <AuthorizedComponent resource="integrations" action="read" showLoader={false}>
                <Link
                  href="/dashboard/integrations"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Network className="w-4 h-4 mr-2" />
                  Integrations
                </Link>
              </AuthorizedComponent>

              {/* Audit Logs - Only managers and admins */}
              <AuthorizedComponent resource="audit" action="read" showLoader={false}>
                <Link
                  href="/dashboard/audit"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Audit Logs
                </Link>
              </AuthorizedComponent>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Help Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Documentation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.preferred_username || user.name || user.email || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled>
                    <User className="w-4 h-4 mr-2" />
                    {user.preferred_username || user.name || user.email || "User"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={toggleMenu}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu - Role-based visibility */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Dashboard - Available to all authenticated users */}
              <AuthorizedComponent resource="dashboard" action="read" showLoader={false}>
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </AuthorizedComponent>

              {/* Analytics - Only managers and admins */}
              <AuthorizedComponent resource="analytics" action="read" showLoader={false}>
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </AuthorizedComponent>

              {/* Users - Only managers and admins */}
              <AuthorizedComponent resource="users" action="read" showLoader={false}>
                <Link
                  href="/dashboard/users"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Link>
              </AuthorizedComponent>

              {/* Policies - All users can read, but employees limited */}
              <AuthorizedComponent resource="policies" action="read" showLoader={false}>
                <Link
                  href="/dashboard/policies"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Policies
                </Link>
              </AuthorizedComponent>

              {/* Integrations - Only managers and admins */}
              <AuthorizedComponent resource="integrations" action="read" showLoader={false}>
                <Link
                  href="/dashboard/integrations"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Network className="w-4 h-4 mr-2" />
                  Integrations
                </Link>
              </AuthorizedComponent>

              {/* Audit Logs - Only managers and admins */}
              <AuthorizedComponent resource="audit" action="read" showLoader={false}>
                <Link
                  href="/dashboard/audit"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Audit Logs
                </Link>
              </AuthorizedComponent>

              {/* Mobile user actions */}
              {user && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Signed in as {user.preferred_username || user.name || user.email || "User"}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
