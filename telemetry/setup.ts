import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | null = null;
let prometheusExporter: PrometheusExporter | null = null;

const telemetryDisabled = process.env.DISABLE_TELEMETRY === 'true';

if (!telemetryDisabled) {
  try {
    prometheusExporter = new PrometheusExporter({
      port: 9464,
      host: '0.0.0.0',
      endpoint: '/metrics',
    });

    sdk = new NodeSDK({
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
          '@opentelemetry/instrumentation-dns': { enabled: false },
          '@opentelemetry/instrumentation-net': { enabled: false },
        }),
      ],
      metricReader: prometheusExporter,
    });
  } catch (error) {
    process.exit(1);
  }
}

export function initializeTelemetry() {
  if (telemetryDisabled) return true;
  
  try {
    if (!sdk) return false;
    sdk.start();
    return true;
  } catch (error) {
    return false;
  }
}

export async function shutdownTelemetry() {
  if (telemetryDisabled) return;
  
  try {
    if (sdk) {
      await sdk.shutdown();
    }
    
    if (prometheusExporter) {
      const server = (prometheusExporter as any).server;
      if (server) {
        await new Promise<void>((resolve) => {
          server.close(() => resolve());
        });
      }
    }
  } catch (error) {
    // Silent fail
  }
}

export { sdk }; 