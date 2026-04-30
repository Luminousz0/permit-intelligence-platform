const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  etag: false,
  dotfiles: 'allow'
}));

// =============== TIMELINE PREDICTION DATA ===============
const TIMELINE_DATA = {
  'Amsterdam': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Rotterdam': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Den Haag': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Utrecht': 'Vooroverleg 4–6 weken; daarna reguliere procedure',
  'Eindhoven': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Groningen': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Almere': '8 weken reguliere procedure',
  'Tilburg': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Zwolle': 'Vooroverleg 4–6 weken; daarna reguliere procedure',
  'Arnhem': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Alkmaar': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Haarlem': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Leiden': 'Vooroverleg 4–6 weken; daarna reguliere procedure',
  'Maastricht': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Breda': '8 weken reguliere procedure',
  'Enschede': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Hengelo': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Apeldoorn': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Zaanstad': 'Vooroverleg 4–6 weken; daarna reguliere procedure',
  'Amersfoort': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Dordrecht': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Delft': '8 weken reguliere procedure',
  'Zoetermeer': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Westland': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Leeuwarden': 'Vooroverleg 4–6 weken; daarna reguliere procedure',
  'Emmen': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Assen': '8 weken reguliere procedure / 26 weken uitgebreide procedure',
  'Purmerend': '8 weken reguliere procedure / 26 weken uitgebreide procedure'
};

// =============== API ENDPOINTS ===============

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Timeline Prediction
app.post('/api/predict-timeline', (req, res) => {
  try {
    const { municipality } = req.body;

    if (!municipality) {
      return res.status(400).json({ error: 'Municipality required' });
    }

    // Determine weeks based on municipality
    let minimum = 8;
    let average = 18;
    let maximum = 26;

    if (municipality === 'Almere' || municipality === 'Delft') {
      minimum = 8;
      average = 8;
      maximum = 8;
    } else if (municipality === 'Utrecht' || municipality === 'Zaanstad' || municipality === 'Leiden' || municipality === 'Leeuwarden') {
      minimum = 10;
      average = 12;
      maximum = 16;
    }

    res.json({
      success: true,
      municipality,
      predictedWeeks: {
        minimum,
        average,
        maximum
      }
    });
  } catch (error) {
    console.error('Timeline prediction error:', error);
    res.status(500).json({ error: 'Failed to predict timeline' });
  }
});

// Generate DOCX (placeholder - returns base64 of simple text)
app.post('/api/generate-docx', (req, res) => {
  try {
    // Simple response - full DOCX generation requires docx library
    // For now, return a simple text-based response
    res.json({
      success: true,
      message: 'PDF export requires backend setup. Please contact support.',
      downloadUrl: null
    });
  } catch (error) {
    console.error('DOCX generation error:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

// Auth endpoints (placeholder)
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Placeholder - just return success with a token
    res.status(201).json({
      success: true,
      token: 'placeholder_token_' + Date.now(),
      user: { id: 1, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    res.json({
      success: true,
      token: 'placeholder_token_' + Date.now(),
      user: { id: 1, email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Fallback - serve index.html for SPA routing
app.use((req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('Permit Intelligence Platform');
  console.log('═══════════════════════════════════════');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ URL: http://localhost:${PORT}`);
  console.log(`✓ Static frontend: serving from public/`);
  console.log(`✓ API endpoints: /api/predict-timeline, /api/auth/*`);
  console.log('═══════════════════════════════════════');
});

// Graceful shutdown
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
