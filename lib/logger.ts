/**
 * Structured Logging Utility
 * Provides consistent logging across the application
 */

import { isProduction } from './config';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private serviceName = 'booking-platform';

  private formatLog(entry: LogEntry): string {
    if (isProduction) {
      // JSON format for production (easier to parse)
      return JSON.stringify({
        service: this.serviceName,
        ...entry,
      });
    }

    // Human-readable format for development
    const { level, message, timestamp, context, error } = entry;
    let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }

    if (error) {
      output += `\n  Error: ${error.message}`;
      if (error.stack) {
        output += `\n  Stack: ${error.stack}`;
      }
    }

    return output;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        },
      }),
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!isProduction) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Specific logging methods for common scenarios
  apiRequest(method: string, path: string, userId?: string): void {
    this.info(`API ${method} ${path}`, { userId, action: 'api_request' });
  }

  apiError(method: string, path: string, error: Error, userId?: string): void {
    this.error(`API ${method} ${path} failed`, error, { userId, action: 'api_error' });
  }

  dbQuery(query: string, table: string, duration?: number): void {
    this.debug(`Database query on ${table}`, {
      action: 'db_query',
      query,
      duration,
    });
  }

  dbError(operation: string, table: string, error: Error): void {
    this.error(`Database ${operation} failed on ${table}`, error, {
      action: 'db_error',
      table,
    });
  }

  authEvent(event: string, userId?: string, success: boolean = true): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    this.log(level, `Auth event: ${event}`, {
      userId,
      action: 'auth_event',
      success,
    });
  }

  businessEvent(event: string, context?: LogContext): void {
    this.info(`Business event: ${event}`, {
      ...context,
      action: 'business_event',
    });
  }

  security(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      action: 'security_event',
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default
export default logger;
