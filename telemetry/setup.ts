import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { metrics } from '@opentelemetry/api';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import type { IncomingMessage } from 'http';

// Create Prometheus exporter
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  host: 'localhost',
  endpoint: '/metrics',
}, () => {
  console.log('📊 Prometheus metrics server started on http://localhost:9464/metrics');
});

// Create SDK with basic configuration
const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable problematic instrumentations that may cause issues in Next.js
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-net': {
        enabled: false,
      },
    }),
    new HttpInstrumentation({
      enabled: true,
      requestHook: (span, request) => {
        // Add custom attributes to HTTP spans
        const incomingRequest = request as IncomingMessage;
        if (incomingRequest.headers) {
          span.setAttributes({
            'http.request.header.user-agent': incomingRequest.headers['user-agent'] || 'unknown',
            'http.request.header.referer': incomingRequest.headers['referer'] || 'unknown',
          });
        }
      },
    }),
  ],
  metricReader: prometheusExporter,
});

// Initialize telemetry
export function initializeTelemetry() {
  try {
    sdk.start();
    console.log('🚀 OpenTelemetry initialized successfully');
    
    // The SDK automatically sets up the meter provider with the metric reader
    // No need to create another MeterProvider
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize OpenTelemetry:', error);
    return false;
  }
}

// Graceful shutdown
export function shutdownTelemetry() {
  return sdk.shutdown();
}

// Export SDK for potential custom usage
export { sdk }; 