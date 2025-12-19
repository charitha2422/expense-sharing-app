require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS Middleware - Allow requests from frontend
app.use(cors({
  origin: 'http://localhost:3001', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/balances', require('./routes/balances'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Expense Sharing API is running' });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-sharing-app';
const PORT = process.env.PORT || 3000;

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Please check your MONGODB_URI in .env file');
    process.exit(1);
  });

module.exports = app;


