// middleware/apiMetrics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import metrics from '../utils/metrics';
import logger from '../utils/logger';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withMetrics(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    const originalEnd = res.end;
    const url = req.url || 'unknown';
    
    // Create a wrapper for the end function to capture the status code
    res.end = function(this: any, ...args: any[]) {
      const responseTime = Date.now() - start;
      const statusCode = res.statusCode;
      
      // Record metrics
      metrics.recordApiResponseTime(url, statusCode, responseTime);
      
      // Log the request completion
      logger.info('API request completed', {
        method: req.method,
        url,
        statusCode,
        responseTime,
      });
      
      // Call the original end function
      return originalEnd.apply(this, args);
    } as any;
    
    // Log the request start
    logger.info('API request started', {
      method: req.method,
      url,
    });
    
    try {
      await handler(req, res);
    } catch (error) {
      logger.error('API request error', {
        method: req.method,
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // If response hasn't been sent yet, send a 500
      if (!res.writableEnded) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
}

// Example usage:
// export default withMetrics(async function handler(req, res) {
//   // Your API logic here
// });