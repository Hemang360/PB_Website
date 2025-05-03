// app/api/analytics/pageview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import logger from '../../../../utils/logger';
import metrics from '../../../../utils/metrics';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { path, referrer, userAgent, timestamp } = data;

    // Log the page view
    logger.info('Page view recorded', {
      path,
      referrer,
      userAgent,
      timestamp
    });

    // Record the page view in metrics
    metrics.recordPageView(path);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error recording page view', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to record page view' },
      { status: 500 }
    );
  }
}