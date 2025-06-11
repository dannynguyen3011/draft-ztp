import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resource, action, context } = body
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { allowed: false, reason: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { allowed: false, reason: 'Invalid authorization token format' },
        { status: 401 }
      )
    }

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003'
    
    // Make request to backend for authorization check
    const response = await fetch(`${backendUrl}/api/check-authorization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        resource,
        action,
        context: {
          riskScore: context?.riskScore || 0,
          location: context?.location || 'unknown',
          mfaVerified: context?.mfaVerified || false,
          vpnConnected: context?.vpnConnected || false,
        }
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { allowed: false, reason: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      if (response.status === 403) {
        return NextResponse.json(
          { allowed: false, reason: 'Access denied by policy' },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        { allowed: false, reason: 'Authorization service error' },
        { status: 500 }
      )
    }

    const result = await response.json()
    return NextResponse.json({
      allowed: result.allowed || false,
      reason: result.reason || null,
    })

  } catch (error) {
    console.error('Authorization check error:', error)
    return NextResponse.json(
      { allowed: false, reason: 'Authorization service unavailable' },
      { status: 500 }
    )
  }
} 