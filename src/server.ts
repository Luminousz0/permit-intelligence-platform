import express from 'express';
import cors from 'cors';
import path from 'path';
import { analyzeProject } from './services/permit-intelligence-engine';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const result = await analyzeProject(req.body);
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`
═══════════════════════════════════════════════════════════
  🏗️  Permit Intelligence Platform — Server Running
═══════════════════════════════════════════════════════════
  
  Local: http://localhost:${PORT}
  
═══════════════════════════════════════════════════════════
  `);
});

