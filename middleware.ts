// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import logger from './utils/logger';

// Create a custom metrics tracking function that doesn't rely on prom-client directly
// This will buffer metrics data to be processed later
const trackMetric = async (data: {
  type: 'request' | 'duration';
  method: string;
  path: string;
  value?: number;
}) => {
  // In Edge Runtime, we can't directly increment metrics
  // Instead, we'll record the data in headers to be processed by a server-side component
  // or make a fetch request to our metrics API endpoint
  
  // This is optional - you can implement actual calls to your metrics API
  // if you want real-time metrics collection
  try {
    // You could make a fetch request to your metrics API here
    // but be aware this could add latency to your middleware
    // so consider carefully if you need real-time metrics
    
    // Example (commented out to avoid latency):
    /*
    await fetch('/api/metrics/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    */
  } catch (error) {
    // Don't let metrics errors affect the middleware flow
    console.error('Error recording metrics:', error);
  }
};

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { pathname } = request.nextUrl;
  const method = request.method;

  logger.info(`Incoming request: ${method} ${pathname}`, {
    requestId,
    method,
    path: pathname,
    userAgent: request.headers.get('user-agent') || 'unknown',
  });

  // Handle OPTIONS requests (CORS preflight)
  if (method === 'OPTIONS') {
    const response = NextResponse.json({}, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
    response.headers.set('x-request-id', requestId);
    return response;
  }

  // Handle /api/docs route with CORS headers
  if (pathname === '/api/docs') {
    const response = NextResponse.next({
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    response.headers.set('x-request-id', requestId);
    return response;
  }

  // Proceed with normal request
  const response = NextResponse.next();

  // Add tracing and metric headers
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-middleware-request-path', pathname);
  response.headers.set('x-middleware-request-method', method);
  response.headers.set('x-middleware-request-start', startTime.toString());

  // Track metrics without directly using prom-client
  const durationMs = Date.now() - startTime;
  
  // Use our custom tracking function instead of direct Prometheus calls
  trackMetric({ type: 'request', method, path: pathname });
  trackMetric({ type: 'duration', method, path: pathname, value: durationMs });

  logger.info(`Request completed: ${method} ${pathname}`, {
    requestId,
    duration: durationMs,
    status: response.status,
  });

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/api/docs',
    '/((?!_next/static|_next/image|favicon.ico|api/metrics).*)',
  ],
};