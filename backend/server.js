const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Use promise-based MySQL
const taskRoutes = require('./src/routes/taskRoutes'); // Ensure this path is correct
const boardRoutes = require('./src/routes/boardRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const faqRoutes = require('./src/routes/faqRoutes');

const authRoutes = require('./src/routes/authRoutes');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');
const { setupDatabase } = require('./src/utils/dbSetup');

const app = express();

// CORS Middleware (Allows requests from frontend)
app.use(cors({
    origin: 'http://localhost:3000', // Change this to your frontend's domain
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faq', faqRoutes);

// Documentation endpoint
app.use('/api-docs', 
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'TaskFlow API Docs'
    })
  );



// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//Check if Database Connection Works
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.status(200).json({ message: 'Database connection successful', result: rows });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Task Routes
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Best Task Management API!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await setupDatabase();
        console.log('Database setup completed');
    } catch (error) {
        console.error('Database setup failed:', error.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})();
