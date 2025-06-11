import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/profile']

// Public routes that don't require authentication
const publicRoutes = ['/login', '/auth/callback', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  // For protected routes, we'll handle auth check on the client side
  // This middleware just ensures proper routing
  if (isProtectedRoute) {
    // Let the page handle authentication check client-side
    return NextResponse.next()
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For any other routes, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
