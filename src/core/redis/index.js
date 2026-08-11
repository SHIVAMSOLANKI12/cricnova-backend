/**
 * -----------------------------------------------------------------------------
 * File: core/redis/index.js
 * Description:
 * Centralized Redis Client
 * -----------------------------------------------------------------------------
 */

import { createClient } from 'redis';

import config from '../../config/index.js';
import logger from '../logger/index.js';

const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },

  password: config.redis.password,
});

/**
 * Redis Error Handler
 */
redisClient.on('error', (error) => {
  logger.error('Redis client error.', {
    error: error?.message ?? error,
    stack: error?.stack,
  });
});

/**
 * Redis Connection Handler
 */
redisClient.on('connect', () => {
  logger.info('Redis client connected.');
});

export default redisClient;
