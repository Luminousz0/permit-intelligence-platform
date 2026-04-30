import express from 'express';
import cors from 'cors';
import path from 'path';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, AlignmentType, TextRun, BorderStyle } from 'docx';
import { analyzeProject } from './services/permit-intelligence-engine';
import { getValidWerkzaamheden } from './services/werkzaamheden-service';
import { trackCase } from './services/case-tracker';
import { predictTimeline } from './services/timeline-predictor';
import { registerUser, loginUser, verifyToken } from './services/auth';
import { sendReportEmail } from './services/email';
import i18next from './services/i18n';
import middleware from 'i18next-http-middleware';
import db from './db/database';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'asramcharan@gmail.com';

// Auth helper
function requireAuth(req: any, res: any): { id: number; email: string } | null {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return user as { id: number; email: string };
}

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
  // Generate token for new user (same as login)
  const loginResult = await loginUser(email, password);
  if (!loginResult) {
    return res.status(500).json({ error: 'Token generation failed' });
  }
  res.status(201).json(loginResult);
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

// Trial signup — collect email, notify Ashwin
app.post('/api/trial-signup', async (req, res) => {
  const { email, name, company } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  console.log(`Trial signup: ${name || '-'} <${email}> ${company ? `(${company})` : ''}`);

  const html = `
    <h2 style="font-family:sans-serif">Nieuwe trial aanmelding</h2>
    <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">
      <tr><td style="padding:6px 16px 6px 0;color:#888">Naam</td><td><strong>${name || '—'}</strong></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888">Email</td><td><strong>${email}</strong></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888">Bedrijf</td><td>${company || '—'}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888">Tijdstip</td><td>${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}</td></tr>
    </table>
  `;

  try {
    await sendReportEmail(ADMIN_EMAIL, `Nieuwe trial signup: ${email}`, html);
  } catch (err) {
    console.error('Email notification failed:', err);
    // Don't fail the request — signup was received
  }

  res.json({ success: true });
});

// Generate participatieverslag as DOCX
app.post('/api/generate-docx', async (req, res) => {
  try {
    const { content, filename } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Split content into paragraphs and create document
    const paragraphs = content.split('\n').map((line, i) => {
      // Handle section headers (lines with ══════)
      if (line.includes('══')) {
        return new Paragraph({
          text: '',
          spacing: { before: 200, after: 100 },
        });
      }

      // Regular text
      const trimmed = line.trim();
      if (!trimmed) {
        return new Paragraph({ text: '' });
      }

      // Check if it's a bold header (all caps at start of section)
      const isSectionTitle = /^[A-Z\s\-]+$/.test(trimmed) && trimmed.length > 10;

      return new Paragraph({
        text: line,
        spacing: { line: 240, lineRule: 'auto' },
        style: isSectionTitle ? 'Heading1' : 'Normal',
        alignment: AlignmentType.LEFT,
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'document.docx'}"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('DOCX generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== Application Tracking & Dashboard Endpoints ==========

// POST /api/applications — Create new application with initial milestones
app.post('/api/applications', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const { projectName, address, municipality, projectType, caseNumber, timelineWeeks, notes, housingUnits } = req.body;

  if (!projectName || !municipality || !projectType) {
    return res.status(400).json({ error: 'projectName, municipality, and projectType required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO applications (user_id, project_name, address, municipality, project_type, case_number, timeline_weeks, notes, housing_units)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(user.id, projectName, address || null, municipality, projectType, caseNumber || null, timelineWeeks || null, notes || null, housingUnits || null);
    const appId = (result as any).lastInsertRowid;

    // Create 5 milestone rows (stages 1-5, all incomplete)
    const stages = [
      { stage: 1, key: 'submitted' },
      { stage: 2, key: 'volledigheidscheck' },
      { stage: 3, key: 'regeltoetsing' },
      { stage: 4, key: 'proceduretrack' },
      { stage: 5, key: 'besluit' },
    ];

    const milestoneStmt = db.prepare(`
      INSERT INTO milestones (application_id, stage, stage_key, completed_at, notes)
      VALUES (?, ?, ?, NULL, NULL)
    `);

    stages.forEach(s => {
      milestoneStmt.run(appId, s.stage, s.key);
    });

    res.status(201).json({ id: appId, status: 'draft' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications — List all applications for user with milestone counts
app.get('/api/applications', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const stmt = db.prepare(`
      SELECT
        a.*,
        (SELECT COUNT(*) FROM milestones WHERE application_id = a.id AND completed_at IS NOT NULL) as completed_milestones
      FROM applications a
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `);

    const applications = stmt.all(user.id);
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications/:id — Get single application with full milestones array
app.get('/api/applications/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.params;

  try {
    const appStmt = db.prepare(`
      SELECT * FROM applications WHERE id = ? AND user_id = ?
    `);
    const app = appStmt.get(id, user.id);

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const milestonesStmt = db.prepare(`
      SELECT * FROM milestones WHERE application_id = ? ORDER BY stage ASC
    `);
    const milestones = milestonesStmt.all(id);

    res.json({ ...(app as any), milestones });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/applications/:id — Update application fields and/or mark milestone complete
app.put('/api/applications/:id', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.params;
  const { projectName, address, municipality, projectType, caseNumber, timelineWeeks, notes, housingUnits, status, completeMilestoneStage } = req.body;

  try {
    // Check app exists and belongs to user
    const checkStmt = db.prepare('SELECT * FROM applications WHERE id = ? AND user_id = ?');
    const app = checkStmt.get(id, user.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Track if status changed for email notification
    const oldStatus = (app as any).status;

    // Update application fields
    const updates: string[] = [];
    const values: any[] = [];

    if (projectName !== undefined) {
      updates.push('project_name = ?');
      values.push(projectName);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (municipality !== undefined) {
      updates.push('municipality = ?');
      values.push(municipality);
    }
    if (projectType !== undefined) {
      updates.push('project_type = ?');
      values.push(projectType);
    }
    if (caseNumber !== undefined) {
      updates.push('case_number = ?');
      values.push(caseNumber);
    }
    if (timelineWeeks !== undefined) {
      updates.push('timeline_weeks = ?');
      values.push(timelineWeeks);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (housingUnits !== undefined) {
      updates.push('housing_units = ?');
      values.push(housingUnits);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id, user.id);

      const updateStmt = db.prepare(`
        UPDATE applications SET ${updates.join(', ')} WHERE id = ? AND user_id = ?
      `);
      updateStmt.run(...values);

      // Fire email if status changed
      if (status && status !== oldStatus) {
        const statusMap: any = {
          draft: 'Concept',
          submitted: 'Ingediend',
          volledigheidscheck: 'Volledigheidscheck',
          regeltoetsing: 'Regeltoetsing',
          proceduretrack: 'In procedure',
          besluit: 'Besluit ontvangen',
        };
        const html = `
          <h2 style="font-family:sans-serif">Aanvraagstatus bijgewerkt</h2>
          <p style="font-family:sans-serif;font-size:15px">
            <strong>${(app as any).project_name}</strong> — ${(app as any).municipality}<br/>
            Status: <strong>${statusMap[status] || status}</strong>
          </p>
        `;
        try {
          await sendReportEmail(ADMIN_EMAIL, `Aanvraag status update: ${projectName}`, html);
        } catch (err) {
          console.error('Status email notification failed:', err);
        }
      }
    }

    // Mark milestone complete if specified
    if (completeMilestoneStage !== undefined) {
      const milestoneStmt = db.prepare(`
        UPDATE milestones SET completed_at = CURRENT_TIMESTAMP WHERE application_id = ? AND stage = ?
      `);
      milestoneStmt.run(id, completeMilestoneStage);

      // Fire email for milestone completion
      const milestoneLabels = ['', 'Ingediend', 'Volledigheidscheck', 'Regeltoetsing', 'Proceduretrack', 'Besluit'];
      const html = `
        <h2 style="font-family:sans-serif">Mijlpaal bereikt</h2>
        <p style="font-family:sans-serif;font-size:15px">
          <strong>${(app as any).project_name}</strong> — ${(app as any).municipality}<br/>
          Mijlpaal: <strong>${milestoneLabels[completeMilestoneStage] || 'Stap ' + completeMilestoneStage}</strong>
        </p>
      `;
      try {
        await sendReportEmail(ADMIN_EMAIL, `Mijlpaal bereikt: ${(app as any).project_name}`, html);
      } catch (err) {
        console.error('Milestone email notification failed:', err);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/applications/:id — Delete application (milestones cascade via FK)
app.delete('/api/applications/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?');
    stmt.run(id, user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== End Application Tracking Endpoints ==========

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
