// utils/metrics.ts
import { Meter, metrics } from '@opentelemetry/api';

class MetricsService {
  private meter: Meter;
  private pageViewCounter;
  private apiResponseTimeHistogram;
  private activeSessions;

  constructor() {
    this.meter = metrics.getMeter('point-blank-website');
    
    // Counter for page views
    this.pageViewCounter = this.meter.createCounter('page_views', {
      description: 'Number of page views',
      unit: '1',
    });
    
    // Histogram for API response times
    this.apiResponseTimeHistogram = this.meter.createHistogram('api_response_time', {
      description: 'API response time',
      unit: 'ms',
    });
    
    // Up/down counter for active sessions
    this.activeSessions = this.meter.createUpDownCounter('active_sessions', {
      description: 'Number of active sessions',
      unit: '1',
    });
  }

  recordPageView(path: string) {
    this.pageViewCounter.add(1, {
      path,
    });
  }

  recordApiResponseTime(endpoint: string, statusCode: number, durationMs: number) {
    this.apiResponseTimeHistogram.record(durationMs, {
      endpoint,
      statusCode: statusCode.toString(),
    });
  }

  sessionStarted() {
    this.activeSessions.add(1);
  }

  sessionEnded() {
    this.activeSessions.add(-1);
  }
}

// Singleton instance
const metricsService = new MetricsService();
export default metricsService;
