/**
 * Zwolle Threshold Checker — Layer 3 / Priority 6
 * Permit Intelligence Platform
 *
 * Evaluates whether a project triggers mandatory participation in Zwolle
 * using the municipality's 8-category threshold system.
 *
 * Source: Zwolle Participatie aanpak + Aanwijzingsbesluit
 * Policy URL: https://lokaleregelgeving.overheid.nl/CVDR726092/1
 *
 * Why Zwolle is the simplest checker to build:
 * - All thresholds are numeric or binary (except Category 4, which is a judgment call)
 * - No scoring, no questionnaire, no designation lists — just direct comparisons
 * - "Takes 2 hours to build" — this is that 2 hours
 *
 * Usage (programmatic):
 *   import { checkZwolle } from "./zwolle-checker";
 *   const result = checkZwolle(project);
 *
 * Usage (CLI):
 *   npx ts-node zwolle-checker.ts
 */

// ─── Input Types ──────────────────────────────────────────────────────────────

/**
 * All fields needed to evaluate Zwolle's 8 threshold categories.
 * Leave irrelevant fields undefined — they default to "not triggered."
 */
export interface ZwolleProjectInput {
  /** Category 1: Height of the tallest structure in meters (excluding antenna masts) */
  building_height_meters?: number;

  /** Category 2: Number of wind turbines */
  wind_turbine_count?: number;

  /** Category 3: Is this a standalone (ground-mounted) solar installation in open fields?
   *  Set to false for building-mounted solar — not triggered. */
  is_standalone_solar?: boolean;

  /** Category 4: Does the project contradict the municipal Omgevingsvisie?
   *  This is a judgment call — cannot be determined programmatically.
   *  Set to true if you believe it does, null if unsure. */
  contradicts_omgevingsvisie?: boolean | null;

  /** Categories 5 & 6: Number of housing units in this project */
  housing_units?: number;

  /** Categories 5 & 6: Location type */
  location_type?: "urban" | "rural";

  /** Category 7: Is a mandatory Environmental Impact Assessment (m.e.r.) required? */
  eia_required?: boolean;

  /** Category 8: Is the project located in a sensitive nature zone?
   *  "waardevol" = ecologically valuable zone
   *  "zeer_waardevol" = highest-value ecological zone */
  nature_zone?: "waardevol" | "zeer_waardevol" | null;
}

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface ZwolleCategory {
  /** Category number (1–8) */
  id: number;
  /** Short name */
  name: string;
  /** Human-readable description */
  description: string;
  /** The threshold as a string (for display) */
  threshold: string;
  /** Whether this category was triggered by the project input */
  triggered: boolean;
  /** Whether this requires a judgment call (cannot be evaluated programmatically) */
  is_judgment_call: boolean;
  /** Optional note for this category */
  note?: string;
}

export interface ZwolleResult {
  municipality: "Zwolle";
  /** True if any category is triggered */
  participation_required: boolean;
  /** True if Category 4 is relevant and ambiguous */
  has_judgment_call: boolean;
  /** All 8 categories with their trigger status */
  categories: ZwolleCategory[];
  /** Only the triggered categories */
  triggered_categories: ZwolleCategory[];
  documents_required: string[];
  warnings: string[];
  next_steps: string[];
  policy_url: string;
}

// ─── Category Definitions ─────────────────────────────────────────────────────

const ZWOLLE_CATEGORIES: Array<{
  id: number;
  name: string;
  description: string;
  threshold: string;
  is_judgment_call: boolean;
  note?: string;
  evaluate: (p: ZwolleProjectInput) => boolean;
}> = [
  {
    id: 1,
    name: "tall_buildings",
    description: "Tall buildings",
    threshold: "Building height > 25 metres (excluding antenna masts)",
    is_judgment_call: false,
    evaluate: (p) => (p.building_height_meters ?? 0) > 25,
  },
  {
    id: 2,
    name: "wind_turbines",
    description: "Wind turbines",
    threshold: "One or more wind turbines",
    is_judgment_call: false,
    evaluate: (p) => (p.wind_turbine_count ?? 0) >= 1,
  },
  {
    id: 3,
    name: "solar_installations",
    description: "Standalone solar installations",
    threshold: "Standalone (ground-mounted) solar in open fields — not building-mounted",
    is_judgment_call: false,
    note: "Building-mounted solar (on rooftops or facades) does NOT trigger this category.",
    evaluate: (p) => !!p.is_standalone_solar,
  },
  {
    id: 4,
    name: "vision_conflicts",
    description: "Projects contradicting the Omgevingsvisie",
    threshold: "Project contradicts municipal environmental vision (Omgevingsvisie Zwolle)",
    is_judgment_call: true,
    note: "This is a judgment call — cannot be evaluated programmatically. Verify directly with the municipality. When in doubt, assume triggered.",
    evaluate: (p) => p.contradicts_omgevingsvisie === true,
  },
  {
    id: 5,
    name: "housing_urban",
    description: "Housing projects in urban areas",
    threshold: "≥ 5 residential units, urban location",
    is_judgment_call: false,
    evaluate: (p) =>
      (p.housing_units ?? 0) >= 5 && p.location_type === "urban",
  },
  {
    id: 6,
    name: "housing_rural",
    description: "Housing projects in rural areas",
    threshold: "≥ 5 residential units, rural location",
    is_judgment_call: false,
    evaluate: (p) =>
      (p.housing_units ?? 0) >= 5 && p.location_type === "rural",
  },
  {
    id: 7,
    name: "eia_required",
    description: "Mandatory Environmental Impact Assessment (m.e.r.)",
    threshold: "Any project for which a mandatory m.e.r. (EIA) is required",
    is_judgment_call: false,
    note: "Check whether your project meets EIA criteria under the Besluit milieu-effectrapportage.",
    evaluate: (p) => !!p.eia_required,
  },
  {
    id: 8,
    name: "sensitive_nature_areas",
    description: "Construction in sensitive nature zones",
    threshold: "Project in 'waardevol' or 'zeer waardevol' zone on Zwolle's nature map",
    is_judgment_call: false,
    note: "Consult Zwolle's ecological map to verify zone classification before marking this.",
    evaluate: (p) =>
      p.nature_zone === "waardevol" || p.nature_zone === "zeer_waardevol",
  },
];

// ─── Main Checker ─────────────────────────────────────────────────────────────

/**
 * Check whether a project triggers mandatory participation in Zwolle.
 *
 * @param project  Project specification — fill in only the relevant fields
 * @returns        ZwolleResult with full category breakdown and next steps
 */
export function checkZwolle(project: ZwolleProjectInput): ZwolleResult {
  const categories: ZwolleCategory[] = ZWOLLE_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    threshold: cat.threshold,
    triggered: cat.evaluate(project),
    is_judgment_call: cat.is_judgment_call,
    note: cat.note,
  }));

  const triggered = categories.filter((c) => c.triggered);
  const required = triggered.length > 0;

  // Category 4 special handling: unclear input
  const cat4 = categories.find((c) => c.id === 4)!;
  const hasJudgmentCall =
    project.contradicts_omgevingsvisie === null ||
    project.contradicts_omgevingsvisie === undefined;

  const warnings: string[] = [];
  const nextSteps: string[] = [];

  if (hasJudgmentCall) {
    warnings.push(
      "Category 4 (contradicts Omgevingsvisie) was not evaluated — input is null/undefined. " +
      "Verify manually with the municipality whether your project conflicts with Zwolle's spatial vision."
    );
  }

  if (required) {
    nextSteps.push(
      `Mandatory participation triggered by: ${triggered.map((c) => `Category ${c.id} (${c.description})`).join(", ")}.`,
      "Conduct participation before submitting your BOPA permit application.",
      "Document all participation activities and produce a participatieverslag.",
      "Policy: https://lokaleregelgeving.overheid.nl/CVDR726092/1"
    );
  } else {
    nextSteps.push(
      "No threshold categories triggered. Participation is voluntary for this project in Zwolle.",
      "Voluntary participation is recommended — it reduces risk of late objections after submission.",
      hasJudgmentCall
        ? "Confirm Category 4 (Omgevingsvisie conflict) with the municipality before assuming no requirement."
        : "Result is definitive based on the inputs provided.",
      "Policy: https://lokaleregelgeving.overheid.nl/CVDR726092/1"
    );
  }

  return {
    municipality: "Zwolle",
    participation_required: required,
    has_judgment_call: hasJudgmentCall,
    categories,
    triggered_categories: triggered,
    documents_required: required ? ["participatieverslag"] : [],
    warnings,
    next_steps: nextSteps,
    policy_url: "https://lokaleregelgeving.overheid.nl/CVDR726092/1",
  };
}

/**
 * Print a human-readable result to the console.
 */
export function printZwolleResult(result: ZwolleResult): void {
  console.log("\n══════════════════════════════════════════");
  console.log("  Zwolle Participation Threshold Checker");
  console.log("══════════════════════════════════════════\n");

  console.log(
    `Result: ${result.participation_required ? "✅ MANDATORY PARTICIPATION REQUIRED" : "⬜ NO MANDATORY PARTICIPATION"}\n`
  );

  console.log("Category Breakdown:");
  console.log("───────────────────");
  for (const cat of result.categories) {
    const icon = cat.triggered ? "✅" : "⬜";
    const jc = cat.is_judgment_call ? " [JUDGMENT CALL]" : "";
    console.log(`${icon} Cat ${cat.id}: ${cat.description}${jc}`);
    console.log(`       Threshold: ${cat.threshold}`);
    if (cat.note) console.log(`       Note: ${cat.note}`);
  }

  if (result.triggered_categories.length > 0) {
    console.log("\nTriggered categories:");
    for (const c of result.triggered_categories) {
      console.log(`  → Category ${c.id}: ${c.description}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((w) => console.log(`  - ${w}`));
  }

  console.log("\nNext steps:");
  result.next_steps.forEach((s) => console.log(`  → ${s}`));

  if (result.participation_required) {
    console.log("\nDocuments required:", result.documents_required.join(", "));
  }

  console.log("\nPolicy: " + result.policy_url);
  console.log("══════════════════════════════════════════\n");
}

// ─── Example Usage ────────────────────────────────────────────────────────────
/*

// Example 1: 8-unit housing project in urban Zwolle
const result1 = checkZwolle({
  housing_units: 8,
  location_type: "urban",
  building_height_meters: 12,
});
// → participation_required: true (Category 5: ≥5 units urban)

// Example 2: Standalone solar park in Zwolle
const result2 = checkZwolle({
  is_standalone_solar: true,
});
// → participation_required: true (Category 3)

// Example 3: Small commercial renovation
const result3 = checkZwolle({
  building_height_meters: 8,
  housing_units: 0,
  location_type: "urban",
  is_standalone_solar: false,
  wind_turbine_count: 0,
  eia_required: false,
  nature_zone: null,
  contradicts_omgevingsvisie: false,
});
// → participation_required: false

// Example 4: Wind turbine (always triggers)
const result4 = checkZwolle({ wind_turbine_count: 1 });
// → participation_required: true (Category 2)

*/

// ─── CLI Mode ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  console.log("Running Zwolle checker with example project (8-unit urban housing, 14m height)...\n");

  const exampleProject: ZwolleProjectInput = {
    housing_units: 8,
    location_type: "urban",
    building_height_meters: 14,
    wind_turbine_count: 0,
    is_standalone_solar: false,
    contradicts_omgevingsvisie: null, // Unknown — will flag as judgment call
    eia_required: false,
    nature_zone: null,
  };

  const result = checkZwolle(exampleProject);
  printZwolleResult(result);
}
