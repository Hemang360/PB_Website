// lib/logger.js
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// Ensure logs directory exists
const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'point-blank-website' },
  transports: [
    // Write logs to file for Promtail to collect
    new winston.transports.File({
      filename: path.join(logDirectory, 'app.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Console output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add request context
export const addRequestContext = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 15);
  next();
};

// Helper functions to use throughout the application
export default {
  debug: (message, meta = {}) => {
    logger.debug(message, { timestamp: new Date().toISOString(), ...meta });
  },
  info: (message, meta = {}) => {
    logger.info(message, { timestamp: new Date().toISOString(), ...meta });
  },
  warn: (message, meta = {}) => {
    logger.warn(message, { timestamp: new Date().toISOString(), ...meta });
  },
  error: (message, meta = {}) => {
    logger.error(message, { timestamp: new Date().toISOString(), ...meta });
  },
  http: (req, res, responseTime) => {
    const { method, url, headers, requestId } = req;
    logger.http(`${method} ${url}`, {
      timestamp: new Date().toISOString(),
      method,
      url,
      status: res.statusCode,
      responseTime,
      userAgent: headers['user-agent'],
      requestId,
    });
  },
};