// utils/metrics.ts
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a registry to store metrics
export const register = new Registry();

// Add default Node.js metrics
collectDefaultMetrics({ register });

class MetricsService {
  private pageViewCounter: Counter;
  private apiResponseTimeHistogram: Histogram;
  private activeSessionsGauge: Gauge;
  // Add HTTP metrics
  public httpRequestsTotal: Counter;
  public httpRequestDuration: Histogram;

  constructor() {
    // Counter for page views
    this.pageViewCounter = new Counter({
      name: 'point_blank_page_views_total',
      help: 'Number of page views',
      labelNames: ['path'],
      registers: [register],
    });
    
    // Histogram for API response times
    this.apiResponseTimeHistogram = new Histogram({
      name: 'point_blank_api_response_time_seconds',
      help: 'API response time in seconds',
      labelNames: ['endpoint', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [register],
    });
    
    // Gauge for active sessions
    this.activeSessionsGauge = new Gauge({
      name: 'point_blank_active_sessions',
      help: 'Number of active sessions',
      registers: [register],
    });

    // Add HTTP request counter
    this.httpRequestsTotal = new Counter({
      name: 'point_blank_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [register],
    });

    // Add HTTP request duration
    this.httpRequestDuration = new Histogram({
      name: 'point_blank_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    });
  }

  recordPageView(path: string) {
    this.pageViewCounter.inc({ path });
  }

  recordApiResponseTime(endpoint: string, statusCode: number, durationMs: number) {
    this.apiResponseTimeHistogram.observe(
      { endpoint, status_code: statusCode.toString() },
      durationMs / 1000 // Convert to seconds
    );
  }

  sessionStarted() {
    this.activeSessionsGauge.inc();
  }

  sessionEnded() {
    this.activeSessionsGauge.dec();
  }
}

// Singleton instance
const metricsService = new MetricsService();
export default metricsService;

// Export HTTP metrics for middleware
export const httpRequestsTotal = metricsService.httpRequestsTotal;
export const httpRequestDuration = metricsService.httpRequestDuration;