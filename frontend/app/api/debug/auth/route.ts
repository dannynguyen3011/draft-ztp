import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        error: 'No authorization token provided',
        hasAuth: false
      })
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({
        error: 'Invalid authorization token format',
        hasAuth: false
      })
    }

    try {
      // Decode JWT payload (without verification for debugging)
      const base64Payload = token.split('.')[1]
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
      
      // Extract realm roles
      const realmRoles = payload.realm_access?.roles || []
      
      // Extract client roles
      const clientRoles: string[] = []
      if (payload.resource_access) {
        Object.entries(payload.resource_access).forEach(([clientId, client]: [string, any]) => {
          if (client.roles) {
            clientRoles.push(...client.roles.map((role: string) => `${clientId}:${role}`))
          }
        })
      }

      // Filter out default Keycloak roles
      const userRoles = realmRoles.filter((role: string) => 
        !['offline_access', 'uma_authorization', 'default-roles-demo'].includes(role)
      )

      return NextResponse.json({
        hasAuth: true,
        username: payload.preferred_username,
        email: payload.email,
        realmRoles: realmRoles,
        userRoles: userRoles,
        clientRoles: clientRoles,
        allRoles: [...userRoles, ...clientRoles],
        exp: payload.exp,
        iat: payload.iat,
        tokenValid: payload.exp > Date.now() / 1000,
        clientId: payload.azp || payload.aud,
        issuer: payload.iss
      })

    } catch (decodeError) {
      return NextResponse.json({
        error: 'Failed to decode token',
        hasAuth: true,
        tokenError: (decodeError as Error).message
      })
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: (error as Error).message
    })
  }
} 