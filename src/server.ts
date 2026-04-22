import express from 'express';
import cors from 'cors';
import path from 'path';
import { analyzeProject } from './services/permit-intelligence-engine';
import { getValidWerkzaamheden } from './services/werkzaamheden-service';
import { trackCase } from './services/case-tracker';
import { predictTimeline } from './services/timeline-predictor';
import { registerUser, loginUser, verifyToken } from './services/auth';
import { sendReportEmail } from './services/email';
import i18next from './services/i18n';
import middleware from 'i18next-http-middleware';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(middleware.handle(i18next));
app.use(express.static(path.join(__dirname, '../public')));

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = await registerUser(email, password);
  if (!user) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  res.json({ user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json(result);
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  res.json({ user });
});

// Email report endpoint
app.post('/api/email-report', async (req, res) => {
  const { email, reportHtml, subject } = req.body;
  if (!email || !reportHtml) {
    return res.status(400).json({ error: 'Email and reportHtml required' });
  }
  try {
    const previewUrl = await sendReportEmail(email, subject || 'Permit Intelligence Report', reportHtml);
    res.json({ success: true, previewUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Existing endpoints
app.get('/api/werkzaamheden', async (req, res) => {
  try {
    const activities = await getValidWerkzaamheden();
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const result = await analyzeProject(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/track-case', async (req, res) => {
  try {
    const { caseNumber } = req.body;
    if (!caseNumber) {
      return res.status(400).json({ error: 'Case number required' });
    }
    const status = await trackCase(caseNumber);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/predict-timeline', async (req, res) => {
  try {
    const { municipality, projectType, housingUnits } = req.body;
    if (!municipality || !projectType) {
      return res.status(400).json({ error: 'Municipality and project type required' });
    }
    const prediction = await predictTimeline(municipality, projectType, housingUnits);
    res.json(prediction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
