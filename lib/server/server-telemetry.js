// server-telemetry.js - Import this in your API routes or server components
// This file should be placed in a location that is only imported on the server side

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// For singleton pattern
let sdk;

export function initTelemetry() {
  if (sdk) {
    return sdk; // Return existing instance if already initialized
  }

  try {
    // Configure the SDK to export telemetry data
    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: {},
    });

    const metricExporter = new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics',
      headers: {},
    });

    // Create resource
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'point-blank-website',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    });

    // Create SDK instance
    sdk = new NodeSDK({
      resource,
      traceExporter,
      metricExporter,
      instrumentations: [getNodeAutoInstrumentations()]
    });

    // Initialize the SDK and register with the OpenTelemetry API
    sdk.start()
      .then(() => console.log('Tracing initialized'))
      .catch((error) => console.log('Error initializing tracing', error));

    // Gracefully shut down the SDK on process exit
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
    });

    return sdk;
  } catch (e) {
    console.error('Error setting up OpenTelemetry instrumentation:', e);
    return null;
  }
}