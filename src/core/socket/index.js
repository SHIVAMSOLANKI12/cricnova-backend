/**
 * -----------------------------------------------------------------------------
 * File: core/socket/index.js
 * Description:
 * Socket.IO Initialization & Access Layer
 * -----------------------------------------------------------------------------
 */

import { Server } from 'socket.io';

import logger from '../logger/index.js';

let io = null;

/**
 * -----------------------------------------------------------------------------
 * Initialize Socket.IO
 * -----------------------------------------------------------------------------
 */
const initSocket = (httpServer, corsOptions) => {
  if (io) {
    logger.warn('Socket.IO has already been initialized.');

    return io;
  }

  io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected.', {
      socketId: socket.id,
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected.', {
        socketId: socket.id,

        reason,
      });
    });
  });

  return io;
};

/**
 * -----------------------------------------------------------------------------
 * Get Socket.IO Instance
 * -----------------------------------------------------------------------------
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized.');
  }

  return io;
};

export { initSocket, getIO };
