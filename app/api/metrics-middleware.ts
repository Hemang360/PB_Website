import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import metricsService from '@/utils/metrics';

export function metricsMiddleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();
  const duration = Date.now() - start;

  // Record API response time
  metricsService.recordApiResponseTime(
    request.nextUrl.pathname,
    response.status,
    duration
  );

  return response;
} 