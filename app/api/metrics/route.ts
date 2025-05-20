// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { register } from '@/utils/metrics';

// Add basic auth middleware if needed in production
const authMiddleware = async (req: Request) => {
  // For production, you should implement proper authentication here
  // This is just a placeholder
  return true;
};

// Export the GET handler as a named export
export async function GET(request: Request) {
  try {
    // Check authorization in production
    if (process.env.NODE_ENV === 'production') {
      const isAuthorized = await authMiddleware(request);
      if (!isAuthorized) {
        return new NextResponse('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic' },
        });
      }
    }

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