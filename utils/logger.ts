type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private createLogEntry(level: LogLevel, message: string, meta: Record<string, any> = {}): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      ...meta
    };
  }

  private log(level: LogLevel, message: string, meta: Record<string, any> = {}): void {
    const logEntry = this.createLogEntry(level, message, meta);
    const logString = JSON.stringify(logEntry);
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      // In a production setup, you might use a file system logger
      // or send directly to a logging service
      // Here we'll just use console methods for simplicity
      console[level](logString);
    } else {
      // In development, format logs for better readability
      console[level](message, meta);
    }
  }

  debug(message: string, meta: Record<string, any> = {}): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta: Record<string, any> = {}): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta: Record<string, any> = {}): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta: Record<string, any> = {}): void {
    this.log('error', message, meta);
  }
}

// Create a default logger instance
const logger = new Logger('point-blank-website');

export default logger;