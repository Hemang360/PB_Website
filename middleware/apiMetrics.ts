// middleware/apiMetrics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import metrics from '../utils/metrics';
import logger from '../utils/logger';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withMetrics(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    const url = req.url || 'unknown';

    // Cast originalEnd to a flexible function type
    const originalEnd = res.end as (...args: any[]) => any;

    res.end = function (...args: any[]): any {
      const responseTime = Date.now() - start;
      const statusCode = res.statusCode;

      metrics.recordApiResponseTime(url, statusCode, responseTime);

      logger.info('API request completed', {
        method: req.method,
        url,
        statusCode,
        responseTime,
      });

      return originalEnd.apply(this, args);
    };

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