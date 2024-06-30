const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
 
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

console.log('About to import voterRoutes');

const{jwtAuthMiddleware} = require('./jwt');

// Import the router files
const voterRoutes = require('./routes/voterRoutes');
const CandidateRoutes = require('./routes/candidateRoutes');

//const { jwtAuthMiddleware } = require('./jwt');

app.use('/voter', voterRoutes);
app.use('/candidate',CandidateRoutes);

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app. listen(PORT, ()=>
{
  console. log('listening on port 3000');
});   