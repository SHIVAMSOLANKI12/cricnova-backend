/**
 * -----------------------------------------------------------------------------
 * File: app.js
 * Description:
 * Enterprise Express Application Configuration & Global Middleware Pipeline
 *
 * Responsibilities:
 * - Trust Proxy & Proxy Hardening
 * - Request Tracing & Correlation ID Tracking
 * - Security Headers via Helmet & Fingerprint Stripping
 * - Hardened CORS Policies
 * - Request Compression & Body Parsing
 * - Structured HTTP Request Logging
 * - API Versioning Route Mounting (/api/v1)
 * - 404 & Centralized Error Middleware
 * -----------------------------------------------------------------------------
 */

import express from 'express';
import crypto from 'crypto';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Environment Configuration
import env from './config/env.js';

// Logger & Custom Middlewares
import logger from './common/logger/winston.js';
import notFound from './common/middleware/not-found.js';
import errorHandler from './common/middleware/error-handler.js';

// Routes Imports
import authRoutes from './modules/auth/routes/auth.routes.js';
import userRoutes from './modules/user/routes/user.routes.js';
import playerProfileRoutes from './modules/player-profile/routes/player-profile.routes.js';

const app = express();

/**
 * --------------------------------------------------------------------------
 * 1. Proxy Hardening & Server Fingerprint Stripping
 * --------------------------------------------------------------------------
 */
app.set('trust proxy', 1);
app.disable('x-powered-by');

/**
 * --------------------------------------------------------------------------
 * 2. Request Correlation ID Middleware
 * --------------------------------------------------------------------------
 */
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

/**
 * --------------------------------------------------------------------------
 * 3. Security HTTP Headers (Helmet)
 * --------------------------------------------------------------------------
 */
app.use(helmet());

/**
 * --------------------------------------------------------------------------
 * 4. Cross-Origin Resource Sharing (CORS)
 * --------------------------------------------------------------------------
 */
const allowedOrigins = ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation: Access denied.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  })
);

/**
 * --------------------------------------------------------------------------
 * 5. Request Parsing & Compression
 * --------------------------------------------------------------------------
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

/**
 * --------------------------------------------------------------------------
 * 6. HTTP Request Logging (Morgan -> Winston Stream)
 * --------------------------------------------------------------------------
 */
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

/**
 * --------------------------------------------------------------------------
 * 7. Health Check Endpoint
 * --------------------------------------------------------------------------
 */
app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'CricNova Engine Backend is running healthy.',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

/**
 * --------------------------------------------------------------------------
 * 8. API Route Mounting
 * --------------------------------------------------------------------------
 */
const apiPrefix = '/api/v1';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/users`, playerProfileRoutes);

/**
 * --------------------------------------------------------------------------
 * 9. 404 Not Found Handler
 * --------------------------------------------------------------------------
 */
app.use(notFound);

/**
 * --------------------------------------------------------------------------
 * 10. Global Centralized Error Handler
 * --------------------------------------------------------------------------
 */
app.use(errorHandler);

export default app;
