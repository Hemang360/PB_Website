import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { httpRequestsTotal, httpRequestDuration } from '../app/api/metrics/route';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;
  
  // Create a response
  const response = NextResponse.next();
  
  // Record metrics immediately
  const duration = (Date.now() - start) / 1000; // Convert to seconds
  const status = '200'; // Default status, will be updated if there's an error
  
  // Increment request counter
  httpRequestsTotal.inc({ method, path, status });
  
  // Record request duration
  httpRequestDuration.observe({ method, path, status }, duration);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 