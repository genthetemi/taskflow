const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const pool = require('./config/db');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Best Task Management API!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.status(200).send(`Database connected! Solution: ${rows[0].solution}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database connection failed');
  }
});