/**
 * Logger Utility
 * Winston-based logging for production
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

interface LogInfo {
  level: string;
  message: string;
  timestamp: string;
  stack?: string;
}

const logFormat = printf((info: LogInfo) => {
  return `${info.timestamp} [${info.level}]: ${info.stack || info.message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    })
  ]
});

export default logger;
