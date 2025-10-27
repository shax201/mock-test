import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenInMiddleware } from '@/lib/auth/simple-jwt'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protection (exclude login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyTokenInMiddleware(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next()
  }

  // Instructor routes protection (exclude login page)
  if (pathname.startsWith('/instructor') && pathname !== '/instructor/login') {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token || !verifyTokenInMiddleware(token)) {
      return NextResponse.redirect(new URL('/instructor/login', request.url))
    }

    return NextResponse.next()
  }

  // Student test routes protection
  if (pathname.startsWith('/test')) {
    // For test routes, we'll validate the token in the API route
    // This middleware just ensures the route structure is correct
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/test/:path*'
  ]
}
