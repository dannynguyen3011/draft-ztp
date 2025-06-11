import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const { resource } = params
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { 
          permissions: { read: false, write: false, delete: false },
          resource 
        },
        { status: 401 }
      )
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { 
          permissions: { read: false, write: false, delete: false },
          resource 
        },
        { status: 401 }
      )
    }

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003'
    
    // Make request to backend for permissions
    const response = await fetch(`${backendUrl}/api/protected/permissions/${resource}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { 
          permissions: { read: false, write: false, delete: false },
          resource 
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Permissions check error:', error)
    return NextResponse.json(
      { 
        permissions: { read: false, write: false, delete: false },
        resource: params.resource 
      },
      { status: 500 }
    )
  }
} 