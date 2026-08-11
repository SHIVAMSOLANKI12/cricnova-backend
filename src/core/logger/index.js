/**
 * -----------------------------------------------------------------------------
 * File: core/logger/index.js
 * Description:
 * Centralized Winston Logger
 * -----------------------------------------------------------------------------
 */

import winston from 'winston';
import path from 'node:path';

import config from '../../config/index.js';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),

  winston.format.errors({
    stack: true,
  }),

  winston.format.splat(),

  winston.format.json()
);

const logger = winston.createLogger({
  level: config.logging.level,

  format: logFormat,

  defaultMeta: {
    service: 'cricnova-backend',
  },

  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),

      level: 'error',
    }),

    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
    }),
  ],
});

/**
 * Development / Test Console Transport
 */
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),

        winston.format.printf(
          ({ level, message, timestamp, stack }) => `[${timestamp}] ${level}: ${stack || message}`
        )
      ),
    })
  );
}

export default logger;
