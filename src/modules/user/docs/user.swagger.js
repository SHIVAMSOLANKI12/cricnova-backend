/**
 * -----------------------------------------------------------------------------
 * File: user.swagger.js
 * Description:
 * Enterprise User Profile OpenAPI Documentation
 *
 * Responsibilities:
 * - Document User Profile APIs
 * - Define request schemas
 * - Define response schemas
 * - Define authentication requirements
 * - Define standard error responses
 *
 * NOTE:
 * - Documentation only
 * - No business logic
 * - No database access
 * -----------------------------------------------------------------------------
 */

const userSwagger = {
  /**
   * ---------------------------------------------------------------------------
   * Schemas
   * ---------------------------------------------------------------------------
   */
  schemas: {
    UserProfile: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '1bddba06-ac18-4ded-9176-2c05b20d9c16',
        },

        phone: {
          type: 'string',
          nullable: true,
          example: '9876543210',
        },

        email: {
          type: 'string',
          format: 'email',
          nullable: true,
          example: 'rahul@example.com',
        },

        username: {
          type: 'string',
          nullable: true,
          example: 'rahul123',
        },

        firstName: {
          type: 'string',
          nullable: true,
          example: 'Rahul',
        },

        lastName: {
          type: 'string',
          nullable: true,
          example: 'Sharma',
        },

        city: {
          type: 'string',
          nullable: true,
          example: 'Mumbai',
        },

        gender: {
          type: 'string',
          nullable: true,
          enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'],
          example: 'MALE',
        },

        profileImageUrl: {
          type: 'string',
          format: 'uri',
          nullable: true,
          example: 'https://cdn.example.com/profiles/rahul.jpg',
        },

        avatarId: {
          type: 'string',
          nullable: true,
          example: 'batsman_blue_01',
        },

        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: '2000-05-20T00:00:00.000Z',
        },

        preferredLanguage: {
          type: 'string',
          nullable: true,
          example: 'en',
        },

        profileCompleted: {
          type: 'boolean',
          example: true,
        },

        phoneVerified: {
          type: 'boolean',
          example: true,
        },

        emailVerified: {
          type: 'boolean',
          example: false,
        },

        status: {
          type: 'string',
          example: 'ACTIVE',
        },

        createdAt: {
          type: 'string',
          format: 'date-time',
        },

        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
      },
    },

    UpdateProfileRequest: {
      type: 'object',
      additionalProperties: false,
      properties: {
        firstName: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          example: 'Rahul',
        },

        lastName: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          example: 'Sharma',
        },

        city: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          example: 'Mumbai',
        },

        gender: {
          type: 'string',
          nullable: true,
          enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'],
          example: 'MALE',
        },

        profileImageUrl: {
          type: 'string',
          format: 'uri',
          nullable: true,
          example: 'https://cdn.example.com/profiles/rahul.jpg',
        },

        avatarId: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          example: 'batsman_blue_01',
        },

        dateOfBirth: {
          type: 'string',
          format: 'date',
          nullable: true,
          example: '2000-05-20',
        },

        preferredLanguage: {
          type: 'string',
          nullable: true,
          maxLength: 20,
          example: 'en',
        },
      },
    },

    UpdateAvatarRequest: {
      type: 'object',
      required: ['avatarId'],
      additionalProperties: false,
      properties: {
        avatarId: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          example: 'batsman_blue_01',
          description: 'Identifier of an active cricket avatar.',
        },
      },
    },

    SuccessResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },

        message: {
          type: 'string',
          example: 'Profile fetched successfully.',
        },

        data: {
          $ref: '#/components/schemas/UserProfile',
        },
      },
    },

    ErrorResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },

        message: {
          type: 'string',
          example: 'Authentication required.',
        },

        code: {
          type: 'string',
          example: 'UNAUTHORIZED',
        },
      },
    },
  },

  /**
   * ---------------------------------------------------------------------------
   * Paths
   * ---------------------------------------------------------------------------
   */
  paths: {
    '/api/v1/users/me': {
      get: {
        tags: ['User Profile'],

        summary: 'Get current user profile',

        description: "Returns the authenticated user's profile.",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: 'User profile fetched successfully.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },

          401: {
            description: 'Authentication required or access token invalid.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          403: {
            description: 'User account is inactive or suspended.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          404: {
            description: 'User profile not found.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/users/me/profile': {
      patch: {
        tags: ['User Profile'],

        summary: 'Update current user profile',

        description:
          "Partially updates the authenticated user's profile. profileCompleted is calculated server-side and cannot be supplied by the client.",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateProfileRequest',
              },

              example: {
                firstName: 'Rahul',
                lastName: 'Sharma',
                city: 'Mumbai',
                gender: 'MALE',
                dateOfBirth: '2000-05-20',
                preferredLanguage: 'en',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Profile updated successfully.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },

          400: {
            description: 'Invalid profile data.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          401: {
            description: 'Authentication required or access token invalid.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          403: {
            description: 'User account is inactive or suspended.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          404: {
            description: 'User profile not found.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/users/me/avatar': {
      patch: {
        tags: ['User Profile'],

        summary: "Update current user's avatar",

        description:
          "Updates the authenticated user's cricket avatar. The selected avatar must be an active avatar supported by the system. The profile completion status is calculated server-side.",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateAvatarRequest',
              },

              example: {
                avatarId: 'batsman_blue_01',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Avatar updated successfully.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },

          400: {
            description: 'Invalid request or unavailable avatar.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          401: {
            description: 'Authentication required or access token invalid.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          403: {
            description: 'User account is inactive or suspended.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          404: {
            description: 'User profile not found.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          429: {
            description: 'Too many requests.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          500: {
            description: 'Internal server error.',

            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};

export default userSwagger;
