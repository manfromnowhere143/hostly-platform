// ════════════════════════════════════════════════════════════════════════════════
// HOSTLY PLATFORM - Middleware
// CORS support for public API routes
// ════════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// CORS headers for public API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle preflight OPTIONS requests for public API
  if (pathname.startsWith('/api/public') && request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // Add CORS headers to public API responses
  if (pathname.startsWith('/api/public') || pathname.startsWith('/api/health')) {
    const response = NextResponse.next()

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/public/:path*', '/api/health/:path*'],
}
