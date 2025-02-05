const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;

/**
 * @swagger
 * /api/auth/register:
 *  post:
 *      summary: Register a new user
 *      tags: [Authentication]
 *      requestBody:
 *         required: true
 *        content:
 *         application/json:
 *          schema:
 *           $ref: '#/components/schemas/User'
 *     responses:
 *        201:
 *         description: User registered successfully
 *       400:
 *        description: Invalid input
 *      500:
 *      description: Server error
 */

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *      summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *         schema:
 *          $ref: '#/components/schemas/User'
 *  responses:
 *      200:
 *          description: Login successful
 *              content:
 *                  application/json:
 *                      schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                          type: string
 *                           example:'example:                  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *  401:
 *     description: Invalid credentials
 *  500:
 *    description: Server error
 */
