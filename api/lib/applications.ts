/**
 * Applications store — pure fs/JSON, no native modules.
 * Data lives in /tmp/pi_applications.json (ephemeral, cleared on redeployment).
 */
import fs from 'fs';

const STORE_PATH = '/tmp/pi_applications.json';

export interface Milestone {
  id: number;
  stage: string;
  stage_key: string;
  completed_at?: string | null;
}

export interface Application {
  id: number;
  user_id: number;
  project_name: string;
  municipality: string;
  address?: string;
  project_type: string;
  case_number?: string;
  status: string;
  notes?: string;
  timeline_weeks?: number;
  housing_units?: number;
  milestones: Milestone[];
  completed_milestones: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_MILESTONE_STAGES = [
  'volledigheidscheck',
  'regeltoetsing',
  'procedurekeuze',
  'zienswijzen',
  'besluitvorming',
];

function readStore(): Application[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')) as Application[];
    }
  } catch (_) {}
  return [];
}

function writeStore(apps: Application[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(apps, null, 2));
}

export function getApplicationsByUser(userId: number): Application[] {
  return readStore()
    .filter(a => a.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getApplicationById(id: number, userId: number): Application | null {
  return readStore().find(a => a.id === id && a.user_id === userId) || null;
}

export function createApplication(userId: number, data: {
  projectName?: string;
  municipality?: string;
  address?: string;
  projectType?: string;
  caseNumber?: string;
  timelineWeeks?: string | number;
  housingUnits?: string | number;
  notes?: string;
}): Application {
  const apps = readStore();
  const now = new Date().toISOString();

  const milestones: Milestone[] = DEFAULT_MILESTONE_STAGES.map((stage, i) => ({
    id: Date.now() + i,
    stage,
    stage_key: stage,
    completed_at: null,
  }));

  const app: Application = {
    id: Date.now(),
    user_id: userId,
    project_name: data.projectName || 'Naamloos project',
    municipality: data.municipality || '',
    address: data.address || '',
    project_type: data.projectType || 'other',
    case_number: data.caseNumber || '',
    status: 'draft',
    notes: data.notes || '',
    timeline_weeks: data.timelineWeeks ? Number(data.timelineWeeks) : undefined,
    housing_units: data.housingUnits ? Number(data.housingUnits) : undefined,
    milestones,
    completed_milestones: 0,
    created_at: now,
    updated_at: now,
  };

  apps.push(app);
  writeStore(apps);
  return app;
}

export function updateApplication(
  id: number,
  userId: number,
  updates: Record<string, unknown>
): Application | null {
  const apps = readStore();
  const idx = apps.findIndex(a => a.id === id && a.user_id === userId);
  if (idx === -1) return null;

  const app = { ...apps[idx] };

  // Handle milestone completion
  if (updates.completeMilestoneStage) {
    const stage = String(updates.completeMilestoneStage);
    app.milestones = app.milestones.map(m =>
      m.stage === stage && !m.completed_at
        ? { ...m, completed_at: new Date().toISOString() }
        : m
    );
    app.completed_milestones = app.milestones.filter(m => m.completed_at).length;
  }

  // Handle regular field updates
  const allowed: Array<keyof Application> = ['status', 'notes', 'timeline_weeks', 'housing_units', 'case_number', 'address'];
  for (const key of allowed) {
    if (key in updates) {
      (app as Record<string, unknown>)[key] = updates[key];
    }
  }

  app.updated_at = new Date().toISOString();
  apps[idx] = app;
  writeStore(apps);
  return app;
}

export function deleteApplication(id: number, userId: number): boolean {
  const apps = readStore();
  const filtered = apps.filter(a => !(a.id === id && a.user_id === userId));
  if (filtered.length === apps.length) return false;
  writeStore(filtered);
  return true;
}
