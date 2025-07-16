import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeTelemetry, shutdownTelemetry } from './telemetry/setup';
import { trackRequestStart, trackRequestEnd } from './telemetry/metrics';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3002', 10);

// Initialize telemetry first
console.log('🚀 Initializing telemetry...');
const telemetryInitialized = initializeTelemetry();

if (!telemetryInitialized) {
  console.error('❌ Failed to initialize telemetry. Exiting...');
  process.exit(1);
}

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Start request tracking
      const startTime = trackRequestStart();
      
      // Parse the request URL
      const parsedUrl = parse(req.url!, true);
      const { pathname, query } = parsedUrl;
      
      // Get request information
      const method = req.method || 'GET';
      const userAgent = req.headers['user-agent'];
      
      // Handle the request
      await handle(req, res, parsedUrl);
      
      // Track request completion
      const statusCode = res.statusCode || 200;
      trackRequestEnd(startTime, method, pathname || '/', statusCode, userAgent);
      
    } catch (error) {
      console.error('Error handling request:', error);
      
      // Track error
      const startTime = Date.now();
      const method = req.method || 'GET';
      const pathname = parse(req.url!, true).pathname || '/';
      const userAgent = req.headers['user-agent'];
      
      trackRequestEnd(startTime, method, pathname, 500, userAgent);
      
      // Send error response
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  })
  .once('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`🌟 Server ready on http://${hostname}:${port}`);
    console.log(`📊 Metrics available at http://localhost:9464/metrics`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await shutdownTelemetry();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await shutdownTelemetry();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught exception:', error);
  await shutdownTelemetry();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  await shutdownTelemetry();
  process.exit(1);
}); 