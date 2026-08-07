import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import env from '../../config/env.js';

const logsDirectory = path.resolve('logs');

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const logger = createLogger({
  level: env.LOG_LEVEL,

  defaultMeta: {
    service: 'cricnova-backend',
  },

  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),

    format.errors({
      stack: true,
    }),

    format.splat(),

    format.json()
  ),

  transports: [
    new transports.File({
      filename: path.join(logsDirectory, 'error.log'),
      level: 'error',
    }),

    new transports.File({
      filename: path.join(logsDirectory, 'combined.log'),
    }),
  ],

  exceptionHandlers: [
    new transports.File({
      filename: path.join(logsDirectory, 'exceptions.log'),
    }),
  ],

  rejectionHandlers: [
    new transports.File({
      filename: path.join(logsDirectory, 'rejections.log'),
    }),
  ],

  exitOnError: false,
});

if (env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
      ),
    })
  );
}

export default logger;
