/**
 * Server Monitoring Application
 * Express.js application with Prometheus metrics exposition
 * Runs on port 3000
 */

const express = require('express');
const client = require('prom-client');

// Create Express application
const app = express();
const PORT = 3002;

// Create a Registry to register metrics
const register = new client.Registry();

// Enable default metrics collection (CPU, memory, etc.)
// This collects Node.js process metrics like heap usage, CPU usage, event loop lag, etc.
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_', // Prefix all default metrics with 'nodejs_'
});

// Create custom HTTP request counter metric
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Create custom HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Create a gauge for application health status
const appHealthGauge = new client.Gauge({
  name: 'app_health_status',
  help: 'Application health status (1 = healthy, 0 = unhealthy)',
  registers: [register],
});

// Middleware to track HTTP metrics for all requests
app.use((req, res, next) => {
  const startTime = Date.now();

  // Track response finish to record metrics
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const labels = {
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode.toString(),
    };

    // Increment request counter
    httpRequestCounter.inc(labels);

    // Record request duration
    httpRequestDuration.observe(labels, duration);
  });

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  // Set health status to healthy (1)
  appHealthGauge.set(1);

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Metrics endpoint - Prometheus scrapes this
app.get('/metrics', async (req, res) => {
  try {
    // Set health status to healthy (1) when metrics are accessible
    appHealthGauge.set(1);

    // Set content type for Prometheus
    res.set('Content-Type', register.contentType);

    // Send metrics
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (error) {
    // Set health status to unhealthy (0) on error
    appHealthGauge.set(0);
    res.status(500).send('Error generating metrics');
  }
});

// Root endpoint - Welcome message
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Server Monitoring System!',
    description: 'This is a sample Node.js application monitored by Prometheus and Grafana.',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
    },
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`Metrics endpoint: http://0.0.0.0:${PORT}/metrics`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  appHealthGauge.set(0);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  appHealthGauge.set(0);
  process.exit(0);
});