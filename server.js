const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Verify public directory exists
const publicDir = path.join(__dirname, 'public');
console.log(`Public directory: ${publicDir}`);
console.log(`Public directory exists: ${fs.existsSync(publicDir)}`);

// Serve static files from public directory
app.use(express.static(publicDir, {
  maxAge: '1h',
  etag: false,
  dotfiles: 'allow'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// API requests - return 404 for now (no backend)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API not available - static site only' });
});

// Fallback route - serve index.html for single-page app navigation
app.use((req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('Permit Intelligence Platform');
  console.log('═══════════════════════════════════════');
  console.log(`Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Static files from: ${publicDir}`);
  console.log('═══════════════════════════════════════');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
