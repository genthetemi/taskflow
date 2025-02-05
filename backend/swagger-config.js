const components = {
  responses: {
    UnauthorizedError: {
      description: 'Invalid or missing authentication token',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Unauthorized' }
            }
          }
        }
      }
    },
    ValidationError: {
      description: 'Invalid request body',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Title is required' }
            }
          }
        }
      }
    }
  }
};


const { response } = require('express');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: 'Complete API documentation for Task Management System',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Task: {
          type: 'object',
          required: ['title'],
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Complete project report' },
            description: { type: 'string', example: 'Finish documentation' },
            status: { 
              type: 'string', 
              enum: ['pending', 'in-progress', 'completed'],
              default: 'pending'
            },
            user_id: { type: 'integer', example: 1 }
          }
        },
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User registration and login' },
      { name: 'Tasks', description: 'Task management operations' }
    ]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJSDoc(options);