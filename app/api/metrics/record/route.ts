// app/api/metrics/record/route.ts
import { NextResponse } from 'next/server';
import { httpRequestsTotal, httpRequestDuration } from '@/utils/metrics';

// This endpoint will run in the Node.js environment (not Edge)
// and can safely use prom-client

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Update the appropriate metrics based on the data type
    if (data.type === 'request') {
      httpRequestsTotal.inc({ method: data.method, path: data.path });
    } else if (data.type === 'duration' && data.value !== undefined) {
      httpRequestDuration.observe({ method: data.method, path: data.path }, data.value);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording metrics:', error);
    return NextResponse.json({ error: 'Failed to record metrics' }, { status: 500 });
  }
}