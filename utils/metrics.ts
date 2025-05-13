// utils/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create a registry to store metrics
export const register = new Registry();

class MetricsService {
  private pageViewCounter: Counter;
  private apiResponseTimeHistogram: Histogram;
  private activeSessionsGauge: Gauge;

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
