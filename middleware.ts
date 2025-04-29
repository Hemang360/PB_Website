import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import logger from './utils/logger';
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  logger.info(`Incoming request: ${request.method} ${request.nextUrl.pathname}`, {
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent') || 'unknown',
  });
  if (request.nextUrl.pathname === '/api/docs') {
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
  if (request.method === 'OPTIONS') {
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

  // Default response
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  return response;
}
export const config = {
  matcher: [
    '/api/:path*',
    '/api/docs',
  ],
};