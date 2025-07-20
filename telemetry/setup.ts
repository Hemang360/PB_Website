import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | null = null;
let prometheusExporter: PrometheusExporter | null = null;

// Check if telemetry is disabled
const telemetryDisabled = process.env.DISABLE_TELEMETRY === 'true';

if (telemetryDisabled) {
  console.log('📊 Telemetry disabled via DISABLE_TELEMETRY environment variable');
}

// Create Prometheus exporter with error handling
if (!telemetryDisabled) {
  try {
    prometheusExporter = new PrometheusExporter({
      port: 9464,
      host: '0.0.0.0', // Bind to all interfaces
      endpoint: '/metrics',
    }, () => {
      console.log('📊 Prometheus metrics server started on http://0.0.0.0:9464/metrics');
    });
  } catch (error) {
    console.error('❌ Failed to create Prometheus exporter:', error);
    process.exit(1);
  }

  // Create SDK with basic configuration
  sdk = new NodeSDK({
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
    ],
    metricReader: prometheusExporter,
  });
}

// Initialize telemetry
export function initializeTelemetry() {
  if (telemetryDisabled) {
    console.log('🚀 Telemetry disabled - skipping initialization');
    return true;
  }
  
  try {
    if (!sdk) {
      console.error('❌ SDK not initialized');
      return false;
    }
    
    sdk.start();
    console.log('🚀 OpenTelemetry initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize OpenTelemetry:', error);
    return false;
  }
}

// Graceful shutdown
export async function shutdownTelemetry() {
  if (telemetryDisabled) {
    console.log('🚀 Telemetry disabled - skipping shutdown');
    return;
  }
  
  try {
    if (sdk) {
      await sdk.shutdown();
      console.log('✅ OpenTelemetry SDK shutdown complete');
    }
    
    if (prometheusExporter) {
      // Close the Prometheus exporter server
      const server = (prometheusExporter as any).server;
      if (server) {
        await new Promise<void>((resolve) => {
          server.close(() => {
            console.log('✅ Prometheus exporter server closed');
            resolve();
          });
        });
      }
    }
  } catch (error) {
    console.error('❌ Error during telemetry shutdown:', error);
  }
}

// Export SDK for potential custom usage
export { sdk }; 