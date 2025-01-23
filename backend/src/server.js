const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('TaskFlow Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {    
  console.log(`Server is running on http://localhost:${PORT}`);
});