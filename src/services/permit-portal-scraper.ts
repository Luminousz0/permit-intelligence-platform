/**
 * Public Permit Portal Scraper — Layer 1 / Priority 7
 * Permit Intelligence Platform
 *
 * Monitors overheid.nl/berichten-over-uw-buurt for permit announcements
 * and decisions near specified postcodes.
 *
 * What this gives you:
 *   - Stage 1: Permit SUBMITTED (announcement published on overheid.nl)
 *   - Stage 5: Decision PUBLISHED (besluit published on overheid.nl)
 *   - Stages 2–4 (internal municipal processing) remain dark until VTH partnerships
 *
 * How it works:
 *   1. Input: one or more postcodes + search radius
 *   2. Fetch announcement listings from overheid.nl (JSON or HTML)
 *   3. Parse each announcement: address, type, date, publication URL
 *   4. Compare against stored state (JSON file or SQLite)
 *   5. Detect NEW announcements and STATUS CHANGES
 *   6. Log changes; optionally call a webhook/callback on new events
 *
 * Tech:
 *   - Node.js + TypeScript
 *   - fetch (native Node 18+) or node-fetch for HTTP
 *   - Playwright/Puppeteer for JS-rendered pages (fallback if needed)
 *   - State stored in permit-state.json (MVP) — swap for SQLite later
 *
 * Run schedule: every 24h is sufficient (portal is not real-time)
 *
 * Usage:
 *   npx ts-node permit-portal-scraper.ts
 *   — or run on a cron: 0 8 * * * npx ts-node permit-portal-scraper.ts
 *
 * ─── IMPORTANT NOTE ON DSO API STATUS ────────────────────────────────────────
 * The DSO permit-tracking APIs (Verzoek afhandelen, Verzoekenoverzicht raadplegen,
 * Verzoeknotificatie ontvangen) are municipality-facing, not applicant-facing.
 * Internal processing stages (2–4) are in VTH software with no public API.
 * This scraper is the ONLY public data source for Layer 1 at MVP stage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

// ─── Configuration ────────────────────────────────────────────────────────────

/** Portal base URL — overheid.nl berichten-over-uw-buurt */
const PORTAL_BASE_URL = "https://www.overheid.nl/berichten-over-uw-buurt";

/**
 * API search endpoint.
 * overheid.nl provides a REST API for the "berichten" data.
 * Docs: https://developer.overheid.nl/apis/op-bekendmakingen
 */
const API_BASE_URL = "https://api.overheid.nl/bekendmakingen";

/** Where to store permit state (JSON file for MVP) */
const STATE_FILE = path.join(__dirname, "permit-state.json");

/** Request delay between API calls to avoid rate limiting (ms) */
const REQUEST_DELAY_MS = 1500;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonitoredPostcode {
  /** Dutch postcode: "1234AB" format (no space) */
  postcode: string;
  /** Search radius in meters (100–5000 recommended) */
  radius_meters: number;
  /** Optional label to identify this location in output */
  label?: string;
}

export type PermitEventType =
  | "aanvraag"           // Permit application submitted
  | "besluit"            // Decision published
  | "kennisgeving"       // General notification
  | "verlenging"         // Extension of decision period
  | "ontwerpbesluit"     // Draft decision (pre-final)
  | "other";

/** A single permit announcement parsed from overheid.nl */
export interface PermitAnnouncement {
  /** Unique identifier from the API */
  id: string;
  /** Short title of the announcement */
  title: string;
  /** Event type (aanvraag / besluit / etc.) */
  event_type: PermitEventType;
  /** Municipality name */
  municipality: string;
  /** Project address or location */
  address: string;
  /** Publication date (ISO 8601) */
  publication_date: string;
  /** URL to full announcement on overheid.nl */
  url: string;
  /** Postcode this announcement was found near */
  found_near_postcode: string;
  /** Distance from the postcode in meters (if returned by API) */
  distance_meters?: number;
  /** Raw category from the API */
  category?: string;
  /** Permit type description (e.g., "Omgevingsvergunning BOPA") */
  permit_type?: string;
}

/** Stored state for a single permit (tracks progression) */
export interface PermitRecord {
  id: string;
  title: string;
  municipality: string;
  address: string;
  permit_type?: string;
  events: Array<{
    event_type: PermitEventType;
    publication_date: string;
    url: string;
    discovered_at: string;
  }>;
  first_seen: string;
  last_updated: string;
  found_near_postcode: string;
  /** Resolved status based on events seen */
  status: "submitted" | "decided" | "draft_decision" | "other";
}

/** Full persisted state (written to permit-state.json) */
export interface PermitState {
  last_run: string;
  monitored_postcodes: MonitoredPostcode[];
  permits: Record<string, PermitRecord>;
}

/** A status change detected during a scan run */
export interface StatusChange {
  type: "new_permit" | "new_event" | "decision_published";
  permit: PermitRecord;
  announcement: PermitAnnouncement;
  description: string;
}

// ─── State Management ─────────────────────────────────────────────────────────

function loadState(postcodes: MonitoredPostcode[]): PermitState {
  if (fs.existsSync(STATE_FILE)) {
    try {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      return JSON.parse(raw) as PermitState;
    } catch (e) {
      console.warn("State file corrupted, starting fresh:", e);
    }
  }
  return {
    last_run: new Date(0).toISOString(),
    monitored_postcodes: postcodes,
    permits: {},
  };
}

function saveState(state: PermitState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

function resolveStatus(events: PermitRecord["events"]): PermitRecord["status"] {
  const types = events.map((e) => e.event_type);
  if (types.includes("besluit")) return "decided";
  if (types.includes("ontwerpbesluit")) return "draft_decision";
  if (types.includes("aanvraag") || types.includes("kennisgeving")) return "submitted";
  return "other";
}

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "PermitIntelligencePlatform/1.0 (contact@example.com)" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          } else {
            resolve(data);
          }
        });
      })
      .on("error", reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── API Fetcher ──────────────────────────────────────────────────────────────

/**
 * Fetch permit announcements near a postcode from the overheid.nl API.
 *
 * Uses the "Op: Bekendmakingen" API (Open Data from KOOP / Kennis- en Exploitatiecentrum
 * voor Officiële Overheidspublicaties).
 *
 * API reference: https://developer.overheid.nl/apis/op-bekendmakingen
 * The API returns results in JSON-LD format.
 *
 * ⚠️  API AUTHENTICATION NOTE:
 * The Bekendmakingen API is publicly accessible but may require an API key
 * registered at developer.overheid.nl. Set OVERHEID_API_KEY environment variable.
 *
 * Categories to filter for (BOPA-relevant):
 *   "Vergunningen" — permit applications and decisions
 *   "Omgevingsvergunning" — environment/zoning permits specifically
 *
 * @param postcode  Postcode to search near (e.g., "1234AB")
 * @param radius    Search radius in meters
 * @param page      Page number (1-indexed, 10 results per page)
 */
async function fetchAnnouncementsForPostcode(
  postcode: MonitoredPostcode,
  page: number = 1
): Promise<PermitAnnouncement[]> {
  const apiKey = process.env.OVERHEID_API_KEY ?? "";
  const params = new URLSearchParams({
    postcode: postcode.postcode,
    straal: String(postcode.radius_meters),
    page: String(page),
    // Filter to permit-relevant categories only
    // Uncomment to narrow scope:
    // categorie: "Vergunningen",
  });

  if (apiKey) {
    params.set("overheidapi-key", apiKey);
  }

  const url = `${API_BASE_URL}?${params.toString()}`;

  let raw: string;
  try {
    raw = await httpsGet(url);
  } catch (err) {
    console.error(`  ✗ Failed to fetch for postcode ${postcode.postcode}:`, err);
    return [];
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(`  ✗ Invalid JSON response for postcode ${postcode.postcode}`);
    return [];
  }

  // The API returns a JSON-LD structure with "_embedded" containing results
  const items: any[] = parsed?._embedded?.bekendmakingen ?? parsed?.results ?? [];

  return items.map((item: any): PermitAnnouncement => ({
    id: item.id ?? item["@id"] ?? item.identifier ?? `${postcode.postcode}-${Date.now()}-${Math.random()}`,
    title: item.title ?? item.dcterms_title ?? "Untitled",
    event_type: classifyEventType(item),
    municipality: item.municipality ?? item.gemeente ?? extractMunicipality(item),
    address: item.address ?? item.locatie ?? item.location ?? "Address not specified",
    publication_date: item.datePublished ?? item.date ?? item.dcterms_date ?? new Date().toISOString(),
    url: item.url ?? item["@id"] ?? `${PORTAL_BASE_URL}?postcode=${postcode.postcode}`,
    found_near_postcode: postcode.postcode,
    distance_meters: item.distance ?? item.afstand,
    category: item.categorie ?? item.category,
    permit_type: extractPermitType(item),
  }));
}

function classifyEventType(item: any): PermitEventType {
  const text = [
    item.title ?? "",
    item.categorie ?? "",
    item.type ?? "",
    item.dcterms_type ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("besluit") && !text.includes("ontwerp")) return "besluit";
  if (text.includes("ontwerpbesluit") || text.includes("ontwerp besluit")) return "ontwerpbesluit";
  if (text.includes("aanvraag")) return "aanvraag";
  if (text.includes("kennisgeving")) return "kennisgeving";
  if (text.includes("verlenging")) return "verlenging";
  return "other";
}

function extractMunicipality(item: any): string {
  return (
    item.dcterms_spatial?.[0]?.label ??
    item.authority ??
    item.creator ??
    "Unknown municipality"
  );
}

function extractPermitType(item: any): string | undefined {
  const description = item.description ?? item.dcterms_description ?? "";
  if (description.toLowerCase().includes("omgevingsvergunning")) return "Omgevingsvergunning";
  if (description.toLowerCase().includes("bopa")) return "BOPA";
  if (description.toLowerCase().includes("bouwvergunning")) return "Bouwvergunning";
  return undefined;
}

// ─── Change Detector ──────────────────────────────────────────────────────────

function processAnnouncements(
  announcements: PermitAnnouncement[],
  state: PermitState
): StatusChange[] {
  const changes: StatusChange[] = [];
  const now = new Date().toISOString();

  for (const ann of announcements) {
    const existing = state.permits[ann.id];

    if (!existing) {
      // Brand new permit we haven't seen before
      const newEvent = {
        event_type: ann.event_type,
        publication_date: ann.publication_date,
        url: ann.url,
        discovered_at: now,
      };

      const record: PermitRecord = {
        id: ann.id,
        title: ann.title,
        municipality: ann.municipality,
        address: ann.address,
        permit_type: ann.permit_type,
        events: [newEvent],
        first_seen: now,
        last_updated: now,
        found_near_postcode: ann.found_near_postcode,
        status: resolveStatus([newEvent]),
      };

      state.permits[ann.id] = record;

      changes.push({
        type: "new_permit",
        permit: record,
        announcement: ann,
        description: `NEW: ${ann.event_type} — "${ann.title}" @ ${ann.address} (${ann.municipality})`,
      });
    } else {
      // Already known — check if a new event type was seen
      const knownEventTypes = new Set(existing.events.map((e) => e.event_type));

      if (!knownEventTypes.has(ann.event_type)) {
        const newEvent = {
          event_type: ann.event_type,
          publication_date: ann.publication_date,
          url: ann.url,
          discovered_at: now,
        };

        existing.events.push(newEvent);
        existing.last_updated = now;
        existing.status = resolveStatus(existing.events);

        const changeType: StatusChange["type"] =
          ann.event_type === "besluit" ? "decision_published" : "new_event";

        changes.push({
          type: changeType,
          permit: existing,
          announcement: ann,
          description:
            changeType === "decision_published"
              ? `🏁 DECISION PUBLISHED: "${existing.title}" @ ${existing.address} (${existing.municipality})`
              : `UPDATE: New ${ann.event_type} for "${existing.title}" @ ${existing.address} (${existing.municipality})`,
        });
      }
    }
  }

  return changes;
}

// ─── Webhook / Alert ──────────────────────────────────────────────────────────

/**
 * Called when status changes are detected.
 * In production: send to Slack, webhook, email, or database.
 * For MVP: log to console + write to alert-log.json.
 */
function handleChanges(changes: StatusChange[]): void {
  if (changes.length === 0) {
    console.log("  No new announcements or status changes.");
    return;
  }

  console.log(`\n  🔔 ${changes.length} change(s) detected:\n`);
  for (const change of changes) {
    console.log(`  ${change.description}`);
    console.log(`    URL: ${change.announcement.url}`);
    console.log(`    Date: ${change.announcement.publication_date}`);
    console.log("");
  }

  // Append to alert log
  const logFile = path.join(__dirname, "permit-alerts.json");
  let log: StatusChange[] = [];
  if (fs.existsSync(logFile)) {
    try {
      log = JSON.parse(fs.readFileSync(logFile, "utf-8"));
    } catch {
      log = [];
    }
  }
  log.push(...changes);
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  console.log(`  Alert log updated: ${logFile}`);

  // ── FUTURE: Call webhook ──
  // const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  // if (webhookUrl) {
  //   for (const change of changes) {
  //     await fetch(webhookUrl, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(change),
  //     });
  //   }
  // }
}

// ─── Main Scraper ─────────────────────────────────────────────────────────────

/**
 * Run the permit portal scraper.
 * Fetches current announcements near all monitored postcodes,
 * compares against stored state, and reports changes.
 *
 * @param postcodes  List of postcodes to monitor
 * @param maxPages   Max pages to fetch per postcode (10 results/page). Default: 3
 */
export async function runScraper(
  postcodes: MonitoredPostcode[],
  maxPages: number = 3
): Promise<StatusChange[]> {
  console.log(`\n══════════════════════════════════════════`);
  console.log(`  Permit Portal Scraper — Layer 1`);
  console.log(`  Run at: ${new Date().toISOString()}`);
  console.log(`══════════════════════════════════════════\n`);

  // Load state from disk
  const state = loadState(postcodes);
  const allChanges: StatusChange[] = [];

  // Scrape each postcode
  for (const postcode of postcodes) {
    const label = postcode.label ? ` (${postcode.label})` : "";
    console.log(`Scanning ${postcode.postcode}${label} within ${postcode.radius_meters}m...`);

    const allAnnouncements: PermitAnnouncement[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const pageAnnouncements = await fetchAnnouncementsForPostcode(postcode, page);

      if (pageAnnouncements.length === 0) {
        // No more results
        break;
      }

      allAnnouncements.push(...pageAnnouncements);
      await sleep(REQUEST_DELAY_MS);
    }

    console.log(`  Found ${allAnnouncements.length} announcement(s) total.`);

    // Optional: filter to BOPA-relevant only
    const relevant = filterBOPARelevant(allAnnouncements);
    console.log(`  BOPA-relevant: ${relevant.length}`);

    const changes = processAnnouncements(relevant, state);
    allChanges.push(...changes);
    handleChanges(changes);
  }

  // Update state
  state.last_run = new Date().toISOString();
  state.monitored_postcodes = postcodes;
  saveState(state);

  console.log(`\n══ Run complete ══`);
  console.log(`  Total permits tracked: ${Object.keys(state.permits).length}`);
  console.log(`  Changes this run: ${allChanges.length}`);
  console.log(`  State saved to: ${STATE_FILE}`);

  return allChanges;
}

/**
 * Filter announcements to only BOPA-relevant permit events.
 * Strips general governmental announcements, planning documents, etc.
 */
function filterBOPARelevant(announcements: PermitAnnouncement[]): PermitAnnouncement[] {
  const bopaKeywords = [
    "omgevingsvergunning",
    "bopa",
    "buitenplanse omgevingsactiviteit",
    "vergunningaanvraag",
    "bouwvergunning",
    "aanvraag omgevingsvergunning",
  ];

  return announcements.filter((a) => {
    const text = [a.title, a.permit_type ?? "", a.category ?? ""]
      .join(" ")
      .toLowerCase();

    // Include if any BOPA keyword matches
    const matchesBOPA = bopaKeywords.some((kw) => text.includes(kw));

    // Also include general "aanvraag" and "besluit" categories that could be permit-related
    const isPermitEvent = a.event_type === "aanvraag" || a.event_type === "besluit";

    return matchesBOPA || isPermitEvent;
  });
}

// ─── State Query Helpers ──────────────────────────────────────────────────────

/**
 * Get all tracked permits for a given municipality.
 */
export function getPermitsForMunicipality(
  municipality: string
): PermitRecord[] {
  if (!fs.existsSync(STATE_FILE)) return [];
  const state: PermitState = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  return Object.values(state.permits).filter(
    (p) => p.municipality.toLowerCase() === municipality.toLowerCase()
  );
}

/**
 * Get all permits currently in "submitted" status (awaiting decision).
 */
export function getOpenPermits(): PermitRecord[] {
  if (!fs.existsSync(STATE_FILE)) return [];
  const state: PermitState = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  return Object.values(state.permits).filter((p) => p.status === "submitted");
}

/**
 * Print a summary of all tracked permits to console.
 */
export function printPermitSummary(): void {
  if (!fs.existsSync(STATE_FILE)) {
    console.log("No state file found. Run the scraper first.");
    return;
  }
  const state: PermitState = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  const permits = Object.values(state.permits);

  console.log(`\n══ Permit Summary ══`);
  console.log(`Last run: ${state.last_run}`);
  console.log(`Total tracked: ${permits.length}`);
  console.log(`Open (submitted, no decision yet): ${permits.filter((p) => p.status === "submitted").length}`);
  console.log(`Decided: ${permits.filter((p) => p.status === "decided").length}`);
  console.log("\nRecent permits:");

  permits
    .sort((a, b) => b.last_updated.localeCompare(a.last_updated))
    .slice(0, 10)
    .forEach((p) => {
      console.log(`  [${p.status.toUpperCase()}] ${p.title} — ${p.address} (${p.municipality})`);
    });
}

// ─── CLI Mode ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  /**
   * Configure your monitored postcodes here (or load from env/config file).
   * Replace with real project postcodes.
   */
  const MONITORED_POSTCODES: MonitoredPostcode[] = [
    {
      postcode: "1011AB",  // Amsterdam Centrum (example)
      radius_meters: 500,
      label: "Amsterdam Centrum",
    },
    {
      postcode: "8011AA",  // Zwolle centre (example)
      radius_meters: 1000,
      label: "Zwolle Centrum",
    },
    // Add more postcodes here as projects are onboarded
  ];

  const args = process.argv.slice(2);

  if (args[0] === "summary") {
    printPermitSummary();
  } else {
    // Run the full scraper
    runScraper(MONITORED_POSTCODES, 3).catch((err) => {
      console.error("Scraper failed:", err);
      process.exit(1);
    });
  }
}

/*
 * ── Running on a schedule ────────────────────────────────────────────────────
 *
 * Option A: System cron (recommended for MVP)
 *   Add to crontab (runs at 08:00 every day):
 *   0 8 * * * cd /path/to/project && npx ts-node permit-portal-scraper.ts >> scraper.log 2>&1
 *
 * Option B: Node.js cron package
 *   npm install node-cron
 *   import cron from "node-cron";
 *   cron.schedule("0 8 * * *", () => runScraper(MONITORED_POSTCODES));
 *
 * Option C: Cloud (after MVP)
 *   - AWS Lambda + EventBridge (daily trigger)
 *   - Railway / Render cron job
 *   - GitHub Actions scheduled workflow
 *
 * ── What this gives you vs. the DSO API ──────────────────────────────────────
 *
 * | Data point                  | This scraper       | DSO API (when key arrives)   |
 * |-----------------------------|--------------------|------------------------------|
 * | Submission published        | ✅ Yes              | ✅ Yes (more structured)      |
 * | Completeness check (stage 2)| ✗ No               | ✗ No (VTH software)          |
 * | Internal processing (3–4)   | ✗ No               | ✗ No (VTH software)          |
 * | Decision published (stage 5)| ✅ Yes              | ✅ Yes                        |
 * | Structured case reference   | ✗ No               | ✅ Yes                        |
 * | Real-time updates           | ✗ No (24h poll)    | Possible (webhook future)    |
 *
 * The gap between submission and decision (stages 2–4, typically 8–26 weeks)
 * stays dark until VTH software partnerships or DSO STAM access.
 */
