import winston from 'winston';
import { env } from './env.js';

const format = winston.format;

const enumerateErrorFormat = format((info) => {
  if (info.error instanceof Error) {
    const error = info.error;
    info.error = {
      stack: error.stack,
      message: error.message,
    };
  }
  return info;
});

export const logger = winston.createLogger({
  level: env('LOG_LEVEL', 'info'),
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    enumerateErrorFormat(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
  silent: process.env.NODE_ENV === 'test',
});
