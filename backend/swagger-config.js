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
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium'
            },
            board_id: { type: 'integer', example: 3 },
            due_date: { type: 'string', format: 'date-time', nullable: true },
            user_id: { type: 'integer', example: 1, description: 'Task creator user id' },
            assignee_user_id: { type: 'integer', nullable: true, example: 2 },
            assignee_email: { type: 'string', nullable: true, example: 'member@example.com' }
          }
        },
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        BoardUser: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 7 },
            email: { type: 'string', format: 'email', example: 'member@example.com' },
            role: { type: 'string', enum: ['owner', 'member'], example: 'member' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User registration and login' },
      { name: 'Tasks', description: 'Task management operations' },
      { name: 'Boards', description: 'Board management and invitations' },
      { name: 'Admin', description: 'Administrative operations' },
      { name: 'FAQ', description: 'FAQ and user questions' },
      { name: 'Contact', description: 'Contact form messaging' }
    ]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJSDoc(options);