import type { NextApiRequest, NextApiResponse } from 'next'
import logger from '../../utils/logger'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  logger.info('API route called', { 
    method: req.method,
    url: req.url,
    query: req.query
  })

  try {
    // Your API logic here
    res.status(200).json({ message: 'Success' })
  } catch (error) {
    logger.error('API route error', { 
      error: error instanceof Error ? error.message : String(error) 
    })
    res.status(500).json({ error: 'Internal Server Error' })
  }
}