// instrumentation.js
// This is the required format for Next.js instrumentation
export async function register() {
  // Only run instrumentation in server/Node.js environment
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Dynamically import the modules to avoid browser bundling issues
      const { NodeSDK } = await import('@opentelemetry/sdk-node');
      const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
      const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
      const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');
      const { Resource } = await import('@opentelemetry/resources');
      const { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } = await import('@opentelemetry/semantic-conventions');

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
        [SEMRESATTRS_SERVICE_NAME]: 'point-blank-website',
        [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      });

      // Create SDK instance
      const sdk = new NodeSDK({
        resource,
        traceExporter,
        metricExporter,
        instrumentations: [getNodeAutoInstrumentations()],
      });

      // Initialize the SDK and register with the OpenTelemetry API
      await sdk.start();
      console.log('OpenTelemetry instrumentation initialized');

      // Gracefully shut down the SDK on process exit
      process.on('SIGTERM', async () => {
        try {
          await sdk.shutdown();
          console.log('OpenTelemetry instrumentation terminated');
        } catch (error) {
          console.error('Error terminating OpenTelemetry instrumentation:', error);
        } finally {
          process.exit(0);
        }
      });
    } catch (e) {
      console.error('Error setting up OpenTelemetry instrumentation:', e);
    }
  }
}