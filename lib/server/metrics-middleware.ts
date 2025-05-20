import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { httpRequestsTotal, httpRequestDuration } from '@/utils/metrics';

export function withMetrics(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const start = Date.now();
    const path = req.nextUrl.pathname;
    const method = req.method;
    
    try {
      const response = await handler(req);
      
      // Record metrics after the response is generated
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      const status = response.status;
      
      httpRequestsTotal.inc({ method, path, status });
      httpRequestDuration.observe({ method, path, status }, duration);
      
      return response;
    } catch (error) {
      // Record error metrics
      const status = error instanceof Error ? 500 : 400;
      httpRequestsTotal.inc({ method, path, status });
      httpRequestDuration.observe({ method, path, status }, (Date.now() - start) / 1000);
      
      throw error;
    }
  };
}