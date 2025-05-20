// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withMetrics } from '@/lib/server/metrics-middleware';
import { withTelemetry } from '@/lib/server/next.Instrumentation';

// Example handler
async function handler(request: NextRequest) {
  // Your API logic here
  return NextResponse.json({ message: 'Success' });
}

// Wrap the handler with metrics and telemetry
export const GET = withMetrics(
  (request: NextRequest) => withTelemetry(handler, request, '/api/example')
);