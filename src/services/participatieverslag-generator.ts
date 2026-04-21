/**
 * Participatieverslag Generator — Layer 3 / Priority 5
 * Permit Intelligence Platform
 *
 * Generates a first-draft participation report (participatieverslag)
 * tailored to the specific requirements of each municipality.
 *
 * Legal basis: Art. 16.55 Omgevingswet + Art. 7.4 Omgevingsregeling
 * A participatieverslag is a required attachment to BOPA permit applications
 * in most Dutch municipalities. Missing or insufficient reports = permit denied.
 *
 * What this generates:
 *   - Core participatieverslag (works for most municipalities)
 *   - Municipality-specific extensions for:
 *     Haarlem   — 8-element paragraph + commission submission instruction
 *     Breda     — TWO documents: Participatieplan (pre-submission) + Verslag (post)
 *     Maastricht — satisfaction ratings section (from 6-step checklist)
 *     Arnhem    — attendance records attachment requirement
 *     Amsterdam — depth-matched to Category 1/2/3 intensity level
 *
 * Usage (programmatic):
 *   import { generateParticipatieverslag } from "./participatieverslag-generator";
 *   const { report, plan } = generateParticipatieverslag(input);
 *
 * Usage (CLI):
 *   npx ts-node participatieverslag-generator.ts
 *
 * Output format: Markdown string(s). Copy into Word, PDF, or submission portal.
 */

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface ParticipationActivity {
  /** Date of the activity (YYYY-MM-DD) */
  date: string;
  /** Type: "meeting" | "letter" | "survey" | "email" | "phone" | "public_presentation" | "design_session" | "kitchen_table" | "other" */
  type: string;
  /** Location or method (e.g., "Gemeentehuis Zaal A", "email", "online via Teams") */
  location: string;
  /** Who attended / was reached (names or categories: "direct neighbours", "business association") */
  attendees: string;
  /** Brief description of what was discussed / shared */
  description: string;
  /** Number of attendees (optional) */
  attendee_count?: number;
}

export interface StakeholderGroup {
  /** e.g., "Direct neighbours (within 50m)", "Local business association", "Wijkraad Centrum" */
  name: string;
  /** Why this group is affected */
  reason_affected: string;
  /** How they were identified */
  how_identified: string;
  /** Contact method used to reach them */
  contact_method: string;
}

export interface FeedbackItem {
  /** Who raised this feedback (group name, not individual) */
  raised_by: string;
  /** What they said / what concern they raised */
  concern: string;
  /** How the plan was changed in response */
  plan_change: string;
  /** If not incorporated, why not */
  reason_not_incorporated?: string;
  /** Was this incorporated? */
  incorporated: boolean;
}

export interface SatisfactionRating {
  /** Stakeholder group name */
  group: string;
  /** Rating 1–5 */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Optional comment */
  comment?: string;
}

export interface AttendanceRecord {
  /** Date of meeting */
  date: string;
  /** Location */
  location: string;
  /** List of names or "anonymous list attached" */
  attendee_names: string[];
  /** Signed attendance list available? */
  signed_list_attached: boolean;
}

/**
 * The full input required to generate a participatieverslag.
 * Fill in everything. Municipality-specific fields are used only when relevant.
 */
export interface VerslagInput {
  // ── Project metadata
  project_name: string;
  project_address: string;
  municipality: string;

  /** Submission date of the permit application (YYYY-MM-DD) */
  submission_date: string;

  /** Developer / applicant name */
  applicant_name: string;

  /** Contact person (if different from applicant) */
  contact_person?: string;

  // ── Project description
  /** One-paragraph description of the project */
  project_description: string;

  /** For Amsterdam: participation intensity category (1, 2, or 3) — output of amsterdam-questionnaire.ts */
  amsterdam_category?: 1 | 2 | 3;

  // ── Stakeholders
  stakeholder_groups: StakeholderGroup[];

  // ── Participation activities
  activities: ParticipationActivity[];

  // ── Feedback
  feedback_items: FeedbackItem[];

  // ── Outcome
  /** Was consensus reached? What is the current state of stakeholder relations? */
  outcome_description: string;

  // ── Municipality-specific (optional)

  /** Maastricht: satisfaction ratings per stakeholder group */
  satisfaction_ratings?: SatisfactionRating[];

  /** Arnhem: attendance records for each meeting */
  attendance_records?: AttendanceRecord[];

  /**
   * Breda only: participation plan (pre-submission document).
   * If provided alongside a full verslag input, both documents will be generated.
   */
  breda_plan?: {
    /** Date the plan was submitted at the initiative stage */
    plan_date: string;
    /** How participation will be structured */
    participation_approach: string;
    /** How stakeholders will be identified */
    stakeholder_identification_strategy: string;
    /** Planned timeline for participation */
    planned_timeline: string;
  };

  /** Haarlem: the chosen 'influence level' offered to participants */
  haarlem_influence_level?: "raadplegen" | "adviseren" | "coproduceren" | "meebeslissen";
}

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface GeneratorOutput {
  /** Main participatieverslag (Markdown) — submit with permit application */
  report: string;
  /** Breda only: separate Participatieplan (Markdown) — submit at initiative stage */
  plan?: string;
  /** Human-readable list of municipality-specific requirements that were applied */
  applied_rules: string[];
  /** Warnings — things the generator flagged for review */
  warnings: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function activityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    meeting: "Informatiebijeenkomst",
    letter: "Brief / flyer",
    survey: "Enquête",
    email: "E-mail",
    phone: "Telefonisch overleg",
    public_presentation: "Openbare presentatie",
    design_session: "Ontwerpsessie",
    kitchen_table: "Keukentafelgesprek",
    other: "Overig",
  };
  return labels[type] ?? type;
}

function haarlemInfluenceLevelLabel(level: string | undefined): string {
  const labels: Record<string, string> = {
    raadplegen: "Raadplegen (advising input, no binding commitment)",
    adviseren: "Adviseren (structured advisory role)",
    coproduceren: "Coproduceren (jointly develop solutions)",
    meebeslissen: "Meebeslissen (shared decision-making authority)",
  };
  return labels[level ?? ""] ?? "Not specified";
}

// ─── Core Report Generator ────────────────────────────────────────────────────

function generateCoreReport(input: VerslagInput): string {
  const {
    project_name, project_address, municipality,
    submission_date, applicant_name, contact_person,
    project_description, stakeholder_groups, activities,
    feedback_items, outcome_description,
  } = input;

  const contactLine = contact_person
    ? `**Contact person:** ${contact_person}`
    : "";

  // Section 3 — activities table
  const activityRows = activities
    .map((a) =>
      `| ${formatDate(a.date)} | ${activityTypeLabel(a.type)} | ${a.location} | ${a.attendees}${a.attendee_count !== undefined ? ` (${a.attendee_count} aanwezig)` : ""} |`
    )
    .join("\n");

  const activityDetails = activities
    .map(
      (a, i) =>
        `**${i + 1}. ${activityTypeLabel(a.type)} — ${formatDate(a.date)}**\n` +
        `- Location / method: ${a.location}\n` +
        `- Participants: ${a.attendees}\n` +
        `- Content: ${a.description}`
    )
    .join("\n\n");

  // Section 2 — stakeholders
  const stakeholderRows = stakeholder_groups
    .map(
      (s) =>
        `| ${s.name} | ${s.reason_affected} | ${s.how_identified} | ${s.contact_method} |`
    )
    .join("\n");

  // Section 4 — feedback
  const incorporated = feedback_items.filter((f) => f.incorporated);
  const notIncorporated = feedback_items.filter((f) => !f.incorporated);

  const feedbackIncorporatedRows = incorporated.length
    ? incorporated
        .map((f) => `| ${f.raised_by} | ${f.concern} | ${f.plan_change} |`)
        .join("\n")
    : "_No changes made to the plan based on feedback._";

  const feedbackNotIncorporatedRows = notIncorporated.length
    ? notIncorporated
        .map(
          (f) =>
            `| ${f.raised_by} | ${f.concern} | ${f.reason_not_incorporated ?? "Not specified"} |`
        )
        .join("\n")
    : "_All feedback was incorporated or acknowledged._";

  return `# Participatieverslag — ${project_name}

**Municipality:** ${municipality}
**Project address:** ${project_address}
**Date of application:** ${formatDate(submission_date)}
**Applicant:** ${applicant_name}
${contactLine ? contactLine + "\n" : ""}
---

## 1. Project Overview

${project_description}

---

## 2. Stakeholders Identified

The following stakeholder groups were identified as parties with a direct or indirect interest in this project:

| Stakeholder Group | Reason Affected | How Identified | Contact Method |
|---|---|---|---|
${stakeholderRows}

---

## 3. Participation Activities Conducted

The following participation activities were carried out before submission of this application:

| Date | Type | Location / Method | Participants |
|---|---|---|---|
${activityRows}

### Details per Activity

${activityDetails}

---

## 4. Feedback Received and How It Was Incorporated

### 4a. Feedback incorporated into the plan

| Raised by | Concern / Input | Change Made to Plan |
|---|---|---|
${feedbackIncorporatedRows}

### 4b. Feedback not incorporated and reason

| Raised by | Concern / Input | Reason Not Incorporated |
|---|---|---|
${feedbackNotIncorporatedRows}

---

## 5. Outcome

${outcome_description}

---

## 6. Declaration

The applicant declares that the participation process described above was conducted in good faith, that all identified stakeholders were given adequate opportunity to provide input, and that this verslag accurately reflects the process and its outcomes.

**Applicant:** ${applicant_name}
**Date:** ${formatDate(submission_date)}
`;
}

// ─── Municipality-Specific Extensions ────────────────────────────────────────

/**
 * Haarlem: adds the required 8-element participation paragraph.
 * Source: Verordening participatie en uitdaagrecht 2024, Art. ...
 */
function appendHaarlemSection(
  report: string,
  input: VerslagInput,
  appliedRules: string[]
): string {
  appliedRules.push(
    "Haarlem — 8-element participation paragraph applied (Verordening participatie en uitdaagrecht 2024)"
  );
  appliedRules.push(
    "Haarlem — Results must be submitted to: (a) all participants and (b) the council commission (raadscommissie)"
  );

  const influenceLabel = haarlemInfluenceLevelLabel(input.haarlem_influence_level);

  const haarlemSection = `
---

## Haarlem — Participatieparagraaf (verplichte 8 elementen)

> Required by Haarlem's Verordening participatie en uitdaagrecht 2024.
> All 8 elements must be present. Results submitted to participants AND the raadscommissie.

**1. Project impact**
${input.project_description}

**2. Objectives of the participation process**
The goal of the participation process was to inform affected stakeholders, gather their input, and — where possible — incorporate their concerns into the project design before permit submission.

**3. Influence level offered to participants**
${influenceLabel}

**4. Participation timeline**
${input.activities.length > 0
  ? `From ${formatDate(input.activities[0].date)} to ${formatDate(input.activities[input.activities.length - 1].date)}.`
  : "See activity table in Section 3."
}

**5. Stakeholder identification method**
${input.stakeholder_groups.map((s) => `- ${s.name}: ${s.how_identified}`).join("\n")}

**6. Outreach methods used**
${input.activities.map((a) => `- ${activityTypeLabel(a.type)}: ${a.location}`).join("\n")}

**7. Feedback mechanisms**
Stakeholders were given the opportunity to provide input via: ${[...new Set(input.activities.map((a) => activityTypeLabel(a.type)))].join(", ")}.

**8. How input was handled**
${input.feedback_items.length > 0
  ? input.feedback_items
      .map((f) =>
        f.incorporated
          ? `- ${f.raised_by}: "${f.concern}" → Plan changed: ${f.plan_change}`
          : `- ${f.raised_by}: "${f.concern}" → Not incorporated: ${f.reason_not_incorporated ?? "see Section 4b"}`
      )
      .join("\n")
  : "No specific feedback items were recorded. General sentiment was [positive/neutral/negative]."
}

> ⚠️ **Next step (Haarlem):** After permit application is submitted, send this participatieparagraaf to:
> 1. All participants listed above
> 2. The relevant raadscommissie (council commission)
> The commission will assess whether findings have been sufficiently incorporated.
`;

  return report + haarlemSection;
}

/**
 * Amsterdam: adds a category-specific depth guidance section.
 */
function appendAmsterdamSection(
  report: string,
  input: VerslagInput,
  appliedRules: string[]
): string {
  const cat = input.amsterdam_category;
  if (!cat) return report;

  const requirements: Record<1 | 2 | 3, { label: string; actions: string[] }> = {
    1: {
      label: "Beperkte gevolgen",
      actions: [
        "Inform direct neighbours only",
        "One round of informing (no interactive session required)",
        "Verslag must confirm: who was informed, when, and how",
      ],
    },
    2: {
      label: "Middelgrote gevolgen",
      actions: [
        "Active dialogue with affected stakeholders",
        "At least one interactive meeting",
        "Document feedback received and how it shaped the plan",
        "Verslag must show evidence of genuine engagement, not just information delivery",
      ],
    },
    3: {
      label: "Aanzienlijke gevolgen",
      actions: [
        "Multi-round participation process required",
        "Broad stakeholder group involvement (not just direct neighbours)",
        "Each round documented separately",
        "Verslag must show iterative design — plan must visibly respond to feedback across rounds",
        "All rounds, attendees, and decisions documented",
      ],
    },
  };

  const req = requirements[cat];

  appliedRules.push(
    `Amsterdam — Category ${cat} (${req.label}) depth requirements applied (Participatiehandreiking)`
  );
  appliedRules.push(
    "Amsterdam — Policy: https://lokaleregelgeving.overheid.nl/CVDR684242/1"
  );

  const amsterdamSection = `
---

## Amsterdam — Category ${cat} Compliance Check (${req.label})

> Required depth for Category ${cat} projects per Amsterdam's Participatiehandreiking.
> The verslag above must demonstrate all of the following:

${req.actions.map((a) => `- [ ] ${a}`).join("\n")}

> ⚠️ Verify exact requirements with the official Participatiehandreiking before submitting.
> Exact scoring thresholds are not publicly published — treat this category as directional.
`;

  return report + amsterdamSection;
}

/**
 * Arnhem: adds attendance records section.
 */
function appendArnhemSection(
  report: string,
  input: VerslagInput,
  appliedRules: string[]
): string {
  appliedRules.push(
    "Arnhem — Attendance records required for all meetings (Handreiking Arnhem)"
  );
  appliedRules.push(
    "Arnhem — Report must cover: steps taken, results, support levels, how feedback shaped the plan"
  );

  const records = input.attendance_records ?? [];

  const attendanceSection = `
---

## Arnhem — Attendance Records (bijlage aanwezigheidsregistratie)

> Required by Arnhem's Handreiking participatie. All meetings must have documented attendance.
> Policy: https://lokaleregelgeving.overheid.nl/CVDR678218/1

${records.length === 0
  ? `> ⚠️ No attendance records provided. You must attach signed attendance lists to this verslag for each meeting held. Without them, the permit may be rejected.`
  : records
      .map(
        (r) => `
### Meeting: ${formatDate(r.date)} — ${r.location}

${r.attendee_names.length > 0 ? r.attendee_names.map((n) => `- ${n}`).join("\n") : "_See attached list_"}

Signed attendance list attached: **${r.signed_list_attached ? "Yes" : "No — must be added before submission"}**
`
      )
      .join("\n")
}

### Arnhem Participation Report Checklist

- [ ] Steps taken (which activities, in which order)
- [ ] Results (what was the response from each stakeholder group)
- [ ] Support levels (did stakeholders support, oppose, or remain neutral?)
- [ ] How feedback shaped the final plan (specific changes made or reasons for not changing)
`;

  return report + attendanceSection;
}

/**
 * Maastricht: adds satisfaction ratings section.
 */
function appendMaastrichtSection(
  report: string,
  input: VerslagInput,
  appliedRules: string[]
): string {
  appliedRules.push(
    "Maastricht — Satisfaction ratings section required (Participatiechecklist Step 6)"
  );
  appliedRules.push(
    "Maastricht — Policy: https://www.gemeentemaastricht.nl/bouwen-en-verbouwen/participatie/checklist-participatie"
  );

  const ratings = input.satisfaction_ratings ?? [];

  const ratingsSection = `
---

## Maastricht — Tevredenheidsbeoordelingen (Satisfaction Ratings)

> Required by Maastricht's Participatiechecklist, Step 6.
> Rate each stakeholder group's satisfaction with the participation process (1 = very dissatisfied, 5 = very satisfied).

| Stakeholder Group | Rating (1–5) | Comment |
|---|---|---|
${ratings.length > 0
  ? ratings.map((r) => `| ${r.group} | ${r.rating}/5 | ${r.comment ?? "—"} |`).join("\n")
  : "| _Add stakeholder group_ | _/5_ | _Add comment_ |\n| _Add stakeholder group_ | _/5_ | _Add comment_ |"
}

${ratings.length === 0
  ? `> ⚠️ Satisfaction ratings not yet provided. Fill in the table above before submission.`
  : ""
}
`;

  return report + ratingsSection;
}

// ─── Breda Plan Generator ─────────────────────────────────────────────────────

/**
 * Breda Participatieplan — submitted at the INITIATIVE stage (before design is finalised).
 * This is Document 1 of 2. The participatieverslag (generated above) is Document 2.
 */
function generateBredaPlan(input: VerslagInput): string {
  if (!input.breda_plan) {
    return `# Participatieplan — ${input.project_name}

> ⚠️ Breda requires a Participatieplan at the INITIATIVE stage (before design is finalised).
> This document has not been completed — fill in the fields below.

**Municipality:** Breda
**Project:** ${input.project_name}
**Applicant:** ${input.applicant_name}
**Plan date:** _[Date submitted at initiative stage]_

---

## 1. Participation Approach

_[Describe how you plan to conduct participation: how many rounds, what methods, what decisions are still open to input]_

---

## 2. Stakeholder Identification Strategy

_[Describe how you will identify all affected parties: radius, adjacency, municipal databases, neighbourhood associations]_

---

## 3. Planned Timeline

_[Describe the planned participation timeline, including: start date, key milestones, expected end date]_

---

> ⚠️ **Breda requirement:** This Participatieplan must be submitted at the initiative stage.
> The Participatieverslag (Document 2) is submitted later, with the permit application.
> Missing either document = permit denied.
> Policy: https://lokaleregelgeving.overheid.nl/CVDR626689
`;
  }

  const p = input.breda_plan;

  return `# Participatieplan — ${input.project_name}

> **Document 1 of 2 — Breda**
> This Participatieplan is submitted at the INITIATIVE stage, before design is finalised.
> The Participatieverslag is submitted later, with the permit application.
> Policy: https://lokaleregelgeving.overheid.nl/CVDR626689

**Municipality:** Breda
**Project:** ${input.project_name}
**Project address:** ${input.project_address}
**Applicant:** ${input.applicant_name}
**Plan date:** ${formatDate(p.plan_date)}

---

## 1. Participation Approach

${p.participation_approach}

---

## 2. Stakeholder Identification Strategy

${p.stakeholder_identification_strategy}

---

## 3. Planned Timeline

${p.planned_timeline}

---

> **Next step (Breda):** After participation is completed, submit the Participatieverslag (Document 2) with your BOPA permit application.
`;
}

// ─── Main Entrypoint ──────────────────────────────────────────────────────────

/**
 * Generate a participatieverslag (and, for Breda, a participatieplan) for a BOPA permit application.
 *
 * @param input  Full description of the project and participation process
 * @returns      { report: string, plan?: string, applied_rules: string[], warnings: string[] }
 */
export function generateParticipatieverslag(input: VerslagInput): GeneratorOutput {
  const appliedRules: string[] = [];
  const warnings: string[] = [];
  const munId = input.municipality.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "");

  // Validate minimums
  if (input.stakeholder_groups.length === 0) {
    warnings.push("No stakeholder groups defined. At minimum, list direct neighbours as a stakeholder group.");
  }
  if (input.activities.length === 0) {
    warnings.push("No participation activities recorded. A verslag with no activities will be rejected.");
  }

  // Generate core report
  let report = generateCoreReport(input);

  // Apply municipality-specific extensions
  if (munId === "amsterdam" || munId.startsWith("amsterdam")) {
    if (!input.amsterdam_category) {
      warnings.push(
        "Amsterdam requires a category (1/2/3) from the Participatiehandreiking questionnaire. " +
        "Run amsterdam-questionnaire.ts to determine it, then set input.amsterdam_category."
      );
    } else {
      report = appendAmsterdamSection(report, input, appliedRules);
    }
  }

  if (munId === "haarlem") {
    if (!input.haarlem_influence_level) {
      warnings.push("Haarlem requires an influence level to be specified (raadplegen / adviseren / coproduceren / meebeslissen).");
    }
    report = appendHaarlemSection(report, input, appliedRules);
  }

  if (munId === "arnhem") {
    report = appendArnhemSection(report, input, appliedRules);
  }

  if (munId === "maastricht") {
    report = appendMaastrichtSection(report, input, appliedRules);
  }

  if (munId === "breda") {
    appliedRules.push(
      "Breda — TWO documents required: Participatieplan (initiative stage) + Participatieverslag (permit application). " +
      "Policy: https://lokaleregelgeving.overheid.nl/CVDR626689"
    );
    if (!input.breda_plan) {
      warnings.push(
        "Breda requires a Participatieplan submitted at the initiative stage. " +
        "Provide input.breda_plan to generate it."
      );
    }
  }

  const output: GeneratorOutput = {
    report,
    applied_rules: appliedRules,
    warnings,
  };

  // Generate Breda plan if inputs are present
  if (munId === "breda") {
    output.plan = generateBredaPlan(input);
  }

  return output;
}

// ─── Example Usage ────────────────────────────────────────────────────────────
/*

// Example: 20-unit housing project in Haarlem (Category-2 equivalent intensity)
const result = generateParticipatieverslag({
  project_name: "Wooncomplex Spaarnestraat 44",
  project_address: "Spaarnestraat 44, Haarlem",
  municipality: "Haarlem",
  submission_date: "2026-05-15",
  applicant_name: "Vastgoed Ontwikkeling BV",
  contact_person: "J. de Vries",
  project_description: "Construction of 20 new residential units in a 4-storey building on a previously commercial plot.",
  haarlem_influence_level: "raadplegen",
  stakeholder_groups: [
    {
      name: "Direct neighbours (within 50m)",
      reason_affected: "Adjacent buildings, noise and construction impact",
      how_identified: "Municipal address register + site visit",
      contact_method: "Written letter"
    },
    {
      name: "Wijkraad Centrum",
      reason_affected: "Represents neighbourhood interests",
      how_identified: "Municipal website",
      contact_method: "Email"
    }
  ],
  activities: [
    {
      date: "2026-03-10",
      type: "letter",
      location: "Physical post",
      attendees: "All addresses within 50m radius (12 properties)",
      description: "Project introduction letter with project summary and invitation to information evening"
    },
    {
      date: "2026-03-24",
      type: "meeting",
      location: "Wijkcentrum De Klinker, Zaal 2",
      attendees: "8 neighbours, 2 wijkraad representatives",
      attendee_count: 10,
      description: "Presentation of project plans. Discussion of concerns about building height and parking."
    }
  ],
  feedback_items: [
    {
      raised_by: "Neighbours (Spaarnestraat 42)",
      concern: "Building height blocks natural light to rear garden",
      plan_change: "Rear building height reduced from 14m to 11m",
      incorporated: true
    },
    {
      raised_by: "Wijkraad Centrum",
      concern: "Insufficient parking spaces for 20 units",
      plan_change: "Parking analysis conducted — municipal norm satisfied by shared parking on adjacent street",
      reason_not_incorporated: "Additional on-site parking not feasible within plot constraints; municipal parking norm is met",
      incorporated: false
    }
  ],
  outcome_description: "The participation process resulted in one design change (reduced rear height). One concern (parking) was addressed through analysis but not resolved to the satisfaction of the wijkraad. Overall stakeholder relations remain constructive."
});

console.log(result.report);       // Full participatieverslag
console.log(result.applied_rules); // Haarlem-specific rules applied
console.log(result.warnings);      // Any flags for review

*/

// ─── CLI Mode ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  console.log("participatieverslag-generator.ts — CLI mode\n");
  console.log("This file is designed to be imported and called with a VerslagInput object.");
  console.log("See the example at the bottom of the file.");
  console.log("\nSupported municipalities with extensions:");
  console.log("  Amsterdam  — Category 1/2/3 depth requirements");
  console.log("  Haarlem    — 8-element participation paragraph");
  console.log("  Arnhem     — Attendance records + report checklist");
  console.log("  Maastricht — Satisfaction ratings");
  console.log("  Breda      — TWO documents: Participatieplan + Participatieverslag");
  console.log("\nAll other municipalities: core template (compliant with Art. 16.55 Omgevingswet)");
}
