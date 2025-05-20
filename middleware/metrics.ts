import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { httpRequestsTotal, httpRequestDuration } from '../utils/metrics';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;

  // Process request normally
  const response = NextResponse.next();

  // Compute and record metrics immediately
  const duration = (Date.now() - start) / 1000; // in seconds
  const status = response.status.toString();

  // Increment request counter
  httpRequestsTotal.inc({ method, path, status });

  // Record request duration
  httpRequestDuration.observe({ method, path, status }, duration);

  return response;
}

export const config = {
  matcher: [
    // Exclude metrics endpoint to avoid circular dependencies
    '/((?!_next/static|_next/image|favicon.ico|public/|api/metrics/).*)',
  ],
};
