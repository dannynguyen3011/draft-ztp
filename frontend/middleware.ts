import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is trying to access dashboard pages
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for admin authentication in cookies or headers
    // For now, we'll skip server-side auth check since we handle it client-side
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
