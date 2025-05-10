// instrumentation.js

// Avoid importing from packages that require Node.js internals
export async function register() {
  // Skip instrumentation on client-side
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  try {
    // Import only the bare minimum from specific packages
    const api = await import('@opentelemetry/api');
    const { trace } = api;
    
    // Use only web-compatible instrumentations
    const { registerInstrumentations } = await import('@opentelemetry/instrumentation');
    const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http');
    
    // Import resource modules with namespace
    const resourcesModule = await import('@opentelemetry/resources');
    const semanticConventionsModule = await import('@opentelemetry/semantic-conventions');
    
    // Import web-compatible SDK components
    const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
    const { WebTracerProvider } = await import('@opentelemetry/sdk-trace-web');
    const { ConsoleSpanExporter } = await import('@opentelemetry/sdk-trace-base');

    // Create resource attributes
    const attributes = {};
    attributes[semanticConventionsModule.SemanticResourceAttributes.SERVICE_NAME] = 
      process.env.OTEL_SERVICE_NAME || 'point-blank-website';
    attributes[semanticConventionsModule.SemanticResourceAttributes.SERVICE_VERSION] = 
      process.env.OTEL_SERVICE_VERSION || '1.0.0';
    attributes[semanticConventionsModule.SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT] = 
      process.env.NODE_ENV || 'development';

    // Create resource using the createResource function
    const resource = resourcesModule.createResource(attributes);

    // Create a web-compatible provider (works in Node.js too)
    const provider = new WebTracerProvider({
      resource: resource
    });

    // Use console exporter to avoid complex dependencies
    const exporter = new ConsoleSpanExporter();
    const processor = new BatchSpanProcessor(exporter);
    provider.addSpanProcessor(processor);
    
    // Register the provider
    provider.register();
    
    // Register basic HTTP instrumentation only
    registerInstrumentations({
      instrumentations: [
        new HttpInstrumentation({
          ignoreIncomingPaths: [/^\/health$/, /^\/favicon\.ico$/],
        }),
      ],
    });

    console.info('OpenTelemetry instrumentation initialized successfully');
    
    // Create a basic tracer for manual instrumentation
    const tracer = trace.getTracer('point-blank-website');
    
    // Add a test span to verify everything is working
    const testSpan = tracer.startSpan('test-initialization');
    testSpan.setAttribute('test.attribute', 'test-value');
    testSpan.end();
    
    // Basic cleanup handler
    const cleanup = () => {
      console.info('OpenTelemetry shutdown initiated');
      // Force flush any remaining spans
      provider.forceFlush().finally(() => {
        console.info('OpenTelemetry provider flushed');
        process.exit(0);
      });
    };
    
    // Register signal handlers
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    
  } catch (error) {
    console.error('Error setting up OpenTelemetry instrumentation:', error);
  }
}