import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeTelemetry, shutdownTelemetry } from './telemetry/setup';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3002', 10);

let server: any = null;
let isShuttingDown = false;

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
  server = createServer(async (req, res) => {
    try {
      // Parse the request URL
      const parsedUrl = parse(req.url!, true);
      
      // Handle the request
      await handle(req, res, parsedUrl);
      
    } catch (error) {
      console.error('Error handling request:', error);
      
      // Send error response
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  })
  .once('error', (err) => {
    console.error('Server error:', err);
    if (!isShuttingDown) {
      process.exit(1);
    }
  })
  .listen(port, () => {
    console.log(`🌟 Server ready on http://${hostname}:${port}`);
    console.log(`📊 Metrics available at http://localhost:9464/metrics`);
  });
});

// Graceful shutdown function
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  
  isShuttingDown = true;
  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
  
  // Set a timeout to force exit if shutdown takes too long
  const timeout = setTimeout(() => {
    console.log('⏰ Shutdown timeout reached, forcing exit...');
    process.exit(1);
  }, 10000); // 10 seconds timeout
  
  try {
    // Close the HTTP server
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('✅ HTTP server closed');
          resolve();
        });
      });
    }
    
    // Shutdown telemetry
    await shutdownTelemetry();
    console.log('✅ Telemetry shutdown complete');
    
    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    clearTimeout(timeout);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught exception:', error);
  if (!isShuttingDown) {
    await gracefulShutdown('uncaughtException');
  }
});

// Handle unhandled rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  if (!isShuttingDown) {
    await gracefulShutdown('unhandledRejection');
  }
}); 