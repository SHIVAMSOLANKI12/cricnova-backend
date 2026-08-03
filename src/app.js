const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const logger = require('./core/logger');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({ origin: config.cors.origin, credentials: true }));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Gzip compression
app.use(compression());

// HTTP Request Logging
const morganFormat = config.env === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Root Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CricNova API Foundation is healthy',
    timestamp: new Date().toISOString(),
    env: config.env,
  });
});

// API Routes Mounting
app.use(config.apiPrefix, routes);

// Global 404 Handler
app.use((req, res, _next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  logger.error(err.stack || err.message);

  res.status(statusCode).json({
    status: 'error',
    message:
      config.env === 'production' && statusCode === 500 ? 'Internal Server Error' : err.message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
