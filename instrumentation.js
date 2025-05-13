// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { NodeSDK } = await import('@opentelemetry/sdk-node');
      const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
      const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');
      const { SemanticResourceAttributes } = await import('@opentelemetry/semantic-conventions');
      const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
      const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http');
      const { ExpressInstrumentation } = await import('@opentelemetry/instrumentation-express');
      
      //here is the actual fix ------> get the default resource first
      const sdkNode = await import('@opentelemetry/sdk-node');
      
      const attributes = {};
      attributes[SemanticResourceAttributes.SERVICE_NAME] = 'point-blank-website';
      attributes[SemanticResourceAttributes.SERVICE_VERSION] = '1.0.0';
      attributes[SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT] = process.env.NODE_ENV || 'development';
      
      const traceExporter = new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
          ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
          : 'http://localhost:4318/v1/traces',
      });

      const metricExporter = new OTLPMetricExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
          ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
          : 'http://localhost:4318/v1/metrics',
      });

      const sdk = new NodeSDK({
        resourceAttributes: attributes, 
        traceExporter,
        metricReader: new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 10000, 
        }),
        instrumentations: [
          new HttpInstrumentation(),
          new ExpressInstrumentation(),
        ],
      });

      sdk.start();

      ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
          sdk.shutdown()
            .then(() => console.log('SDK shut down successfully'))
            .catch(err => console.error('Error shutting down SDK', err))
            .finally(() => process.exit(0));
        });
      });

      console.log('OpenTelemetry instrumentation initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenTelemetry instrumentation:', error);
    }
  }
}