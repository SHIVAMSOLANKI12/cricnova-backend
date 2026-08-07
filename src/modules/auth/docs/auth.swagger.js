/**
 * -----------------------------------------------------------------------------
 * File: auth.swagger.js
 * Description:
 * Enterprise OpenAPI 3.0 Documentation Definitions for Authentication Module
 *
 * Endpoints Documented:
 * - GET  /api/v1/auth/health
 * - POST /api/v1/auth/send-otp
 * - POST /api/v1/auth/verify-otp
 * - POST /api/v1/auth/refresh-token
 * - POST /api/v1/auth/logout
 * - POST /api/v1/auth/logout-all
 * - GET  /api/v1/auth/me
 * -----------------------------------------------------------------------------
 */

export const authSwaggerDocumentation = {
  '/api/v1/auth/health': {
    get: {
      tags: ['Authentication'],
      summary: 'Authentication Module Health Check',
      description: 'Returns operational status of authentication module.',
      responses: {
        200: {
          description: 'Authentication module operational',
          content: {
            'application/json': {
              example: {
                status: 'UP',
                module: 'auth',
                timestamp: '2026-08-07T12:00:00.000Z',
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/auth/send-otp': {
    post: {
      tags: ['Authentication'],
      summary: 'Send Mobile OTP',
      description: "Generates and dispatches an OTP to the user's mobile number.",
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['mobile'],
              properties: {
                mobile: {
                  type: 'string',
                  example: '9999999999',
                  pattern: '^[6-9]\\d{9}$',
                  description: '10-digit Indian mobile number',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'OTP sent successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'OTP sent successfully.',
                data: {
                  target: '9999999999',
                  expiresInSeconds: 300,
                },
              },
            },
          },
        },
        400: { description: 'Validation error or invalid mobile number' },
        429: { description: 'Rate limit exceeded / OTP resend cooldown active' },
      },
    },
  },
  '/api/v1/auth/verify-otp': {
    post: {
      tags: ['Authentication'],
      summary: 'Verify OTP & Authenticate',
      description:
        'Verifies mobile OTP, auto-registers new users, creates session and returns JWT tokens.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['mobile', 'otp'],
              properties: {
                mobile: { type: 'string', example: '9999999999' },
                otp: { type: 'string', example: '123456' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Authentication successful',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Authentication successful.',
                data: {
                  isNewUser: false,
                  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  user: {
                    id: 'c8f5d0a1-4e78-4a90-8e12-3456789abcde',
                    phone: '9999999999',
                    firstName: 'Super',
                    lastName: 'Admin',
                    username: 'cric_superadmin',
                    email: 'admin@cricnova.com',
                    status: 'ACTIVE',
                    profileCompleted: true,
                  },
                  roles: ['SUPER_ADMIN'],
                },
              },
            },
          },
        },
        400: { description: 'Invalid or expired OTP' },
        429: { description: 'OTP verification attempt limit exceeded' },
      },
    },
  },
  '/api/v1/auth/refresh-token': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh Access Token',
      description: 'Rotates refresh token and issues a fresh Access Token pair.',
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                refreshToken: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Access token refreshed successfully.',
                data: {
                  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  roles: ['PLAYER'],
                },
              },
            },
          },
        },
        401: { description: 'Invalid, expired, or reused refresh token' },
      },
    },
  },
  '/api/v1/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout Current Device',
      description: 'Revokes current refresh token and invalidates active session.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Logged out successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Logged out successfully.',
              },
            },
          },
        },
        401: { description: 'Unauthorized / Invalid Session' },
      },
    },
  },
  '/api/v1/auth/logout-all': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout All Devices',
      description:
        'Revokes all sessions and refresh tokens across all devices for the authenticated user.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Logged out from all devices',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Logged out from all devices successfully.',
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/v1/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get Authenticated User Profile',
      description: "Fetches current user's profile, roles, and permissions.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User profile fetched successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'User profile fetched successfully.',
                data: {
                  id: 'c8f5d0a1-4e78-4a90-8e12-3456789abcde',
                  phone: '9999999999',
                  firstName: 'Cricket',
                  lastName: 'Player',
                  username: 'cn_a1b2c3d4',
                  email: null,
                  profileImageUrl: null,
                  status: 'ACTIVE',
                  phoneVerified: true,
                  emailVerified: false,
                  profileCompleted: false,
                  roles: ['PLAYER'],
                  permissions: [],
                  createdAt: '2026-08-06T10:00:00.000Z',
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized or Invalid Session' },
      },
    },
  },
};

export default authSwaggerDocumentation;
