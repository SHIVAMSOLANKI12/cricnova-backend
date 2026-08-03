const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./core/logger');
const { initSocket } = require('./core/socket');

const server = http.createServer(app);

// Bootstrap Socket.IO
initSocket(server, { origin: config.cors.origin, credentials: true });

server.listen(config.port, () => {
  logger.info(`🚀 CricNova Server running on port ${config.port} in [${config.env}] mode`);
  logger.info(`Health check available at http://localhost:${config.port}/health`);
});

// Unhandled Rejections & Exceptions Handling
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected Error:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
