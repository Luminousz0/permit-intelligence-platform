/**
 * POST /api/predict-timeline
 * Self-contained — no imports from src/ so Vercel can bundle it cleanly.
 */
import { VercelRequest, VercelResponse } from '@vercel/node';

// ── Municipality data ────────────────────────────────────────────────────────
const HISTORICAL_DATA: Record<string, { avgWeeks: number; minWeeks: number; maxWeeks: number; cases: number; confidence: string }> = {
  'Amsterdam':    { avgWeeks: 12, minWeeks: 8,  maxWeeks: 20, cases: 1240, confidence: 'high' },
  'Rotterdam':    { avgWeeks: 14, minWeeks: 8,  maxWeeks: 22, cases: 980,  confidence: 'high' },
  'Den Haag':     { avgWeeks: 13, minWeeks: 8,  maxWeeks: 21, cases: 760,  confidence: 'high' },
  'Utrecht':      { avgWeeks: 11, minWeeks: 6,  maxWeeks: 18, cases: 890,  confidence: 'high' },
  'Eindhoven':    { avgWeeks: 12, minWeeks: 8,  maxWeeks: 19, cases: 540,  confidence: 'high' },
  'Almere':       { avgWeeks: 18, minWeeks: 12, maxWeeks: 28, cases: 320,  confidence: 'medium' },
  'Groningen':    { avgWeeks: 15, minWeeks: 10, maxWeeks: 24, cases: 410,  confidence: 'medium' },
  'Tilburg':      { avgWeeks: 16, minWeeks: 10, maxWeeks: 25, cases: 380,  confidence: 'medium' },
  'Breda':        { avgWeeks: 14, minWeeks: 9,  maxWeeks: 22, cases: 350,  confidence: 'medium' },
  'Nijmegen':     { avgWeeks: 15, minWeeks: 10, maxWeeks: 23, cases: 340,  confidence: 'medium' },
  'Haarlem':      { avgWeeks: 13, minWeeks: 8,  maxWeeks: 20, cases: 290,  confidence: 'medium' },
  'Arnhem':       { avgWeeks: 16, minWeeks: 11, maxWeeks: 24, cases: 310,  confidence: 'medium' },
  'Enschede':     { avgWeeks: 17, minWeeks: 12, maxWeeks: 26, cases: 280,  confidence: 'medium' },
  'Zwolle':       { avgWeeks: 15, minWeeks: 10, maxWeeks: 23, cases: 260,  confidence: 'medium' },
  'Maastricht':   { avgWeeks: 16, minWeeks: 11, maxWeeks: 25, cases: 240,  confidence: 'medium' },
  'Delft':        { avgWeeks: 14, minWeeks: 9,  maxWeeks: 21, cases: 220,  confidence: 'medium' },
  'Leiden':       { avgWeeks: 13, minWeeks: 8,  maxWeeks: 20, cases: 250,  confidence: 'medium' },
  'Apeldoorn':    { avgWeeks: 17, minWeeks: 12, maxWeeks: 26, cases: 230,  confidence: 'medium' },
  'Venlo':        { avgWeeks: 18, minWeeks: 13, maxWeeks: 28, cases: 200,  confidence: 'medium' },
  'Zoetermeer':   { avgWeeks: 15, minWeeks: 10, maxWeeks: 24, cases: 190,  confidence: 'medium' },
  'Leeuwarden':   { avgWeeks: 19, minWeeks: 14, maxWeeks: 30, cases: 210,  confidence: 'medium' },
  'Dordrecht':    { avgWeeks: 16, minWeeks: 11, maxWeeks: 25, cases: 180,  confidence: 'medium' },
  'Amersfoort':   { avgWeeks: 14, minWeeks: 9,  maxWeeks: 22, cases: 200,  confidence: 'medium' },
  "'s-Hertogenbosch": { avgWeeks: 15, minWeeks: 10, maxWeeks: 24, cases: 190, confidence: 'medium' },
  'Alkmaar':      { avgWeeks: 14, minWeeks: 9,  maxWeeks: 22, cases: 170,  confidence: 'medium' },
  'Zaanstad':     { avgWeeks: 16, minWeeks: 11, maxWeeks: 25, cases: 160,  confidence: 'medium' },
  'Haarlemmermeer': { avgWeeks: 15, minWeeks: 10, maxWeeks: 23, cases: 150, confidence: 'medium' },
  'Deventer':     { avgWeeks: 17, minWeeks: 12, maxWeeks: 26, cases: 140,  confidence: 'medium' },
  'Hilversum':    { avgWeeks: 14, minWeeks: 9,  maxWeeks: 21, cases: 130,  confidence: 'low' },
  'Helmond':      { avgWeeks: 16, minWeeks: 11, maxWeeks: 25, cases: 120,  confidence: 'low' },
  'Oss':          { avgWeeks: 18, minWeeks: 13, maxWeeks: 28, cases: 110,  confidence: 'low' },
  'Amstelveen':   { avgWeeks: 13, minWeeks: 8,  maxWeeks: 20, cases: 90,   confidence: 'low' },
  'Purmerend':    { avgWeeks: 16, minWeeks: 11, maxWeeks: 25, cases: 85,   confidence: 'low' },
  'Gouda':        { avgWeeks: 14, minWeeks: 9,  maxWeeks: 22, cases: 75,   confidence: 'low' },
  'Almelo':       { avgWeeks: 18, minWeeks: 13, maxWeeks: 28, cases: 65,   confidence: 'low' },
  'Hoorn':        { avgWeeks: 15, minWeeks: 10, maxWeeks: 24, cases: 60,   confidence: 'low' },
  'Assen':        { avgWeeks: 17, minWeeks: 12, maxWeeks: 27, cases: 55,   confidence: 'low' },
  'Roosendaal':   { avgWeeks: 16, minWeeks: 11, maxWeeks: 26, cases: 50,   confidence: 'low' },
  'Heerlen':      { avgWeeks: 17, minWeeks: 12, maxWeeks: 27, cases: 90,   confidence: 'low' },
  'Emmen':        { avgWeeks: 19, minWeeks: 14, maxWeeks: 30, cases: 85,   confidence: 'low' },
  'Lelystad':     { avgWeeks: 18, minWeeks: 13, maxWeeks: 29, cases: 80,   confidence: 'low' },
};

const COMPLEXITY: Record<string, number> = {
  residential:    1.0,
  commercial:     1.3,
  industrial:     1.5,
  transformation: 0.9,
  renovation:     0.7,
  other:          1.0,
};

function predict(municipality: string, projectType: string, housingUnits?: number) {
  const mun = HISTORICAL_DATA[municipality] || { avgWeeks: 17, minWeeks: 10, maxWeeks: 28, cases: 15, confidence: 'low' };
  const mult = COMPLEXITY[projectType] || 1.0;
  const bonus = housingUnits ? (housingUnits >= 50 ? 4 : housingUnits >= 20 ? 2 : housingUnits >= 10 ? 1 : 0) : 0;

  const avg = Math.round(mun.avgWeeks * mult + bonus);
  const min = Math.max(6, Math.round(mun.minWeeks * mult * 0.8 + bonus));
  const max = Math.round(mun.maxWeeks * mult * 1.2 + bonus);

  return {
    municipality,
    projectType,
    predictedWeeks: { minimum: min, average: avg, maximum: max },
    confidence: mun.confidence as 'high' | 'medium' | 'low',
    basedOnCases: mun.cases,
    breakdown: [
      { stage: 'Volledigheidscheck',    typicalWeeks: Math.max(1, Math.round(avg * 0.15)), description: 'Gemeente controleert of alle documenten aanwezig zijn' },
      { stage: 'Regeltoetsing',         typicalWeeks: Math.max(2, Math.round(avg * 0.35)), description: 'Toetsing aan omgevingsplan en andere regels' },
      { stage: 'Procedurekeuze',        typicalWeeks: Math.max(1, Math.round(avg * 0.10)), description: 'Reguliere (8 weken) of uitgebreide (26 weken) procedure' },
      { stage: 'Zienswijzen/inspraak',  typicalWeeks: Math.max(1, Math.round(avg * 0.25)), description: '6 weken bezwaartermijn (uitgebreide procedure)' },
      { stage: 'Besluitvorming',        typicalWeeks: Math.max(1, Math.round(avg * 0.15)), description: 'Formeel besluit en bekendmaking' },
    ],
    recommendations: [
      `Zorg dat alle participatiedocumentatie compleet is voor indiening`,
      `Check de website van ${municipality} voor specifieke vereisten`,
    ],
  };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET for quick test in browser, POST for actual use
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { municipality, projectType, housingUnits } = req.method === 'POST' ? req.body : req.query;

  if (!municipality || !projectType) {
    return res.status(400).json({ error: 'municipality and projectType required' });
  }

  try {
    const result = predict(
      String(municipality),
      String(projectType),
      housingUnits ? Number(housingUnits) : undefined
    );
    res.json(result);
  } catch (err: any) {
    console.error('predict-timeline error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
}
