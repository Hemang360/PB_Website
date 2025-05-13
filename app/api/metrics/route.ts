import { NextResponse } from 'next/server';
import { register } from '@/utils/metrics';

// Export the GET handler as a named export
export async function GET() {
  try {
    // Get metrics in Prometheus format
    const metrics = await register.metrics();
    
    // Return metrics with correct content type
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Error collecting metrics:', error);
    return new NextResponse('Error collecting metrics', { status: 500 });
  }
} 