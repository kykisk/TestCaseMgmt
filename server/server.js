/**
 * TestCase Management System - Express API Server
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const projectsRouter = require('./routes/projects');
const requirementsRouter = require('./routes/requirements');
const testcasesRouter = require('./routes/testcases');
const statisticsRouter = require('./routes/statistics');
const testExecutionSuitesRouter = require('./routes/test-execution-suites');
const testExecutionItemsRouter = require('./routes/test-execution-items');
const testExecutionRunsRouter = require('./routes/test-execution-runs');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/requirements', requirementsRouter);
app.use('/api/testcases', testcasesRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/test-execution-suites', testExecutionSuitesRouter);
app.use('/api/test-execution-items', testExecutionItemsRouter);
app.use('/api/test-execution-runs', testExecutionRunsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  // Catch-all route for SPA (Express 5 compatible)
  app.use((req, res, next) => {
    // Only handle GET requests and skip API routes
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
      next();
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log('='.repeat(80));
  console.log(`🚀 TestCase API Server`);
  console.log('='.repeat(80));
  console.log(`Environment: ${ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(80));
});
