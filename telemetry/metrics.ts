import { metrics } from '@opentelemetry/api';
import type { NextRequest, NextResponse } from 'next/server';

// Create a meter for custom metrics
const meter = metrics.getMeter('pb-website-custom-metrics', '1.0.0');

// Create custom metrics
export const httpRequestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

export const httpRequestDuration = meter.createHistogram('http_request_duration_seconds', {
  description: 'HTTP request duration in seconds',
  unit: 's',
});

export const httpRequestsInProgress = meter.createUpDownCounter('http_requests_in_progress', {
  description: 'Number of HTTP requests currently in progress',
});

export const pageViewCounter = meter.createCounter('page_views_total', {
  description: 'Total number of page views',
});

export const apiRequestCounter = meter.createCounter('api_requests_total', {
  description: 'Total number of API requests',
});

export const errorCounter = meter.createCounter('errors_total', {
  description: 'Total number of errors',
});

// Helper function to record HTTP request metrics
export function recordHttpRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userAgent?: string
) {
  const labels = {
    method,
    path,
    status_code: statusCode.toString(),
    user_agent: userAgent || 'unknown',
  };

  // Record request count
  httpRequestCounter.add(1, labels);

  // Record request duration
  httpRequestDuration.record(duration, labels);

  // Record errors if status code indicates error
  if (statusCode >= 400) {
    errorCounter.add(1, {
      ...labels,
      error_type: statusCode >= 500 ? 'server_error' : 'client_error',
    });
  }

  // Record page views for non-API routes
  if (!path.startsWith('/api/')) {
    pageViewCounter.add(1, { path, method });
  } else {
    apiRequestCounter.add(1, { path, method, status_code: statusCode.toString() });
  }
}

// Helper function to track request start
export function trackRequestStart() {
  httpRequestsInProgress.add(1);
  return Date.now();
}

// Helper function to track request end
export function trackRequestEnd(startTime: number, method: string, path: string, statusCode: number, userAgent?: string) {
  const duration = (Date.now() - startTime) / 1000; // Convert to seconds
  httpRequestsInProgress.add(-1);
  recordHttpRequest(method, path, statusCode, duration, userAgent);
}

// Middleware function for Next.js API routes
export function withMetrics<T extends any[]>(
  handler: (...args: T) => Promise<Response | NextResponse>
) {
  return async (...args: T): Promise<Response | NextResponse> => {
    const startTime = trackRequestStart();
    
    try {
      const response = await handler(...args);
      
      // Extract request information
      const request = args[0] as NextRequest;
      const method = request.method;
      const path = new URL(request.url).pathname;
      const userAgent = request.headers.get('user-agent') || undefined;
      
      // Get status code from response
      const statusCode = response.status;
      
      trackRequestEnd(startTime, method, path, statusCode, userAgent);
      
      return response;
    } catch (error) {
      // Record error metrics
      const request = args[0] as NextRequest;
      const method = request.method;
      const path = new URL(request.url).pathname;
      const userAgent = request.headers.get('user-agent') || undefined;
      
      trackRequestEnd(startTime, method, path, 500, userAgent);
      
      throw error;
    }
  };
}

// Function to record custom business metrics
export function recordBusinessMetric(metricName: string, value: number, labels?: Record<string, string>) {
  const businessMeter = metrics.getMeter('pb-website-business-metrics', '1.0.0');
  const counter = businessMeter.createCounter(metricName, {
    description: `Business metric: ${metricName}`,
  });
  
  counter.add(value, labels);
}

// Function to record custom gauge metrics
export function recordGaugeMetric(metricName: string, value: number, labels?: Record<string, string>) {
  const gaugeMeter = metrics.getMeter('pb-website-gauge-metrics', '1.0.0');
  const gauge = gaugeMeter.createObservableGauge(metricName, {
    description: `Gauge metric: ${metricName}`,
  });
  
  gauge.addCallback((result) => {
    result.observe(value, labels);
  });
}

// Export meter for custom usage
export { meter }; 