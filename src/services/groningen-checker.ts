/**
 * Groningen Binary List Checker — Layer 3 / Priority 4
 * Permit Intelligence Platform
 *
 * Checks whether a project falls under one of Groningen's 14 mandatory
 * activity categories (Activiteitenlijst). If it does → participation is
 * mandatory. If it does not → participation is voluntary.
 *
 * Source: Groningen Activiteitenlijst + Beleidsregels Participatie
 * Activiteitenlijst URL: https://lokaleregelgeving.overheid.nl/CVDR716944/1
 * Beleidsregels URL:     https://lokaleregelgeving.overheid.nl/CVDR708912/1
 * Effective:             22 March 2024
 *
 * This is the most precisely structured participation system in the Netherlands.
 * It is the ideal database schema for all future municipality profiles.
 *
 * Usage (programmatic):
 *   import { checkGroningen } from "./groningen-checker";
 *   const result = checkGroningen(project);
 *
 * Usage (CLI):
 *   npx ts-node groningen-checker.ts
 */

// ─── Project Input ────────────────────────────────────────────────────────────

/**
 * Answers to the Groningen category questions.
 * Each field corresponds to one or more of the 14 categories.
 * You only need to fill in the fields relevant to your project.
 * Leave the rest as undefined or null — they default to false.
 */
export interface GroningenProjectInput {
  // Category A — Renovation/modification/expansion of housing or other buildings
  /** Is the project a renovation, modification, or expansion of an existing building? */
  is_renovation_or_expansion?: boolean;
  /** Is it a like-for-like replacement on the same site? (Excludes from Category A) */
  replaces_existing_on_same_site?: boolean;

  // Category B — New housing in small villages
  /** Is this new residential construction? */
  is_new_housing?: boolean;
  /** Is it in a village with fewer than 5,000 residents? */
  village_under_5000?: boolean;
  /** How many new homes (organic growth, not part of a larger planned scheme)? */
  new_homes_count?: number;

  // Category C — Converting recreational homes to permanent residence
  /** Is the project converting a recreational dwelling (e.g., holiday home) to permanent residence? */
  is_recreational_to_permanent?: boolean;

  // Category D — Second service dwelling for agricultural business
  /** Is this a second service dwelling (dienstwoning) for an agricultural business? */
  is_second_agricultural_dwelling?: boolean;

  // Category E — Agricultural plot boundary expansion
  /** Does the project expand the boundary of an existing agricultural plot? */
  is_agricultural_land_expansion?: boolean;

  // Category F — Infill construction
  /** Is the project building in a gap within an existing settlement pattern (inbreiding)? */
  is_infill_construction?: boolean;

  // Category G — Business buildings on industrial parks
  /**
   * Does the project involve construction, modification, or expansion of business/industrial
   * buildings on an industrial or business park (bedrijventerrein)?
   */
  is_business_on_industrial_park?: boolean;

  // Category H — Social facilities
  /**
   * Is the project a social facility: welfare, healthcare, culture, education,
   * sports, or childcare?
   */
  is_social_facility?: boolean;

  // Category I — Mobile telecom masts (ALL THREE conditions must be true simultaneously)
  /** Is this a mobile telecom mast (antenne-installatie)? */
  is_telecom_mast?: boolean;
  /** Terrain area in m² */
  telecom_terrain_m2?: number;
  /** Structure height in metres */
  telecom_structure_height_m?: number;
  /** Mast height in metres */
  telecom_mast_height_m?: number;

  // Category J — Small public space structures
  /**
   * Is the project a small public space structure — kiosk, pavilion,
   * temporary cultural building, or temporary commercial building?
   */
  is_public_space_structure?: boolean;

  // Category K — Boat mooring
  /**
   * Is the project creating or expanding boat mooring facilities on a waterway
   * (including houseboats / woonboten)?
   */
  is_boat_mooring?: boolean;

  // Category L — Renewable energy
  /**
   * Is the project a renewable energy installation — solar field,
   * wind turbine(s), or biogas installation?
   */
  is_renewable_energy?: boolean;

  // Category M — Tree removal
  /** Is the project removing trees? */
  is_tree_removal?: boolean;
  /** How many trees are being removed? */
  trees_to_remove?: number;
  /** Is any of the trees heritage-designated (monumentale boom)? */
  includes_heritage_tree?: boolean;

  // Category N — Sports / recreation facilities
  /**
   * Is this an expansion of a sports or recreation facility involving
   * disproportionate construction (onevenredig grote bebouwing)?
   */
  is_sports_recreation_expansion?: boolean;
}

// ─── Category Definitions ─────────────────────────────────────────────────────

export interface GroningenCategory {
  code: string;
  title_nl: string;
  title_en: string;
  threshold_description: string;
  threshold_logic?: "AND" | "OR";
  mandatory: true;
  beleidsregels_notes: string;
}

export const GRONINGEN_CATEGORIES: GroningenCategory[] = [
  {
    code: "A",
    title_nl: "Verbouw / wijziging / uitbreiding van bestaande woningen en gebouwen",
    title_en: "Renovation, modification, or expansion of existing housing and buildings",
    threshold_description:
      "Any renovation, modification, or expansion of an existing housing unit or other building. " +
      "Exception: like-for-like replacement on the exact same site (sloopnieuwbouw op dezelfde locatie).",
    mandatory: true,
    beleidsregels_notes:
      "Includes expansions that change the footprint, height, or use of the existing building.",
  },
  {
    code: "B",
    title_nl: "Nieuwbouwwoningen in kleine kernen",
    title_en: "New housing in small villages",
    threshold_description:
      "New residential construction in a village with fewer than 5,000 residents, " +
      "where the project adds more than 2 homes as organic growth (not part of a large planned scheme).",
    mandatory: true,
    beleidsregels_notes:
      "The 'small village' threshold is the settlement population, not the municipality population. " +
      "Groningen municipality contains many small kernen — confirm the specific kern population.",
  },
  {
    code: "C",
    title_nl: "Omzetting recreatiewoning naar permanente bewoning",
    title_en: "Converting recreational homes to permanent residence",
    threshold_description:
      "All cases. Any project converting a holiday home, seasonal dwelling, or recreational unit " +
      "to a permanent residential function.",
    mandatory: true,
    beleidsregels_notes:
      "No minimum size or number threshold. A single conversion triggers the requirement.",
  },
  {
    code: "D",
    title_nl: "Tweede dienstwoning bij agrarisch bedrijf",
    title_en: "Second service dwelling for agricultural business",
    threshold_description:
      "All cases. Adding a second service dwelling (dienstwoning) attached to an agricultural business " +
      "for operational purposes (e.g., for a second employee or family member needing on-site residence).",
    mandatory: true,
    beleidsregels_notes:
      "First dienstwoningen are standard; the second is where participation is triggered.",
  },
  {
    code: "E",
    title_nl: "Uitbreiding van agrarische bouwpercelen",
    title_en: "Agricultural plot boundary expansion",
    threshold_description:
      "Any increase of the boundary of an existing agricultural bouwperceel (building plot). " +
      "Applies to all cases where the legal plot boundary expands.",
    mandatory: true,
    beleidsregels_notes:
      "Triggered by boundary expansion, not just building expansion. Even small increases trigger the requirement.",
  },
  {
    code: "F",
    title_nl: "Inbreiding",
    title_en: "Infill construction",
    threshold_description:
      "Building in an existing gap within a settlement pattern (filling an open space between " +
      "existing buildings in an urban or village context).",
    mandatory: true,
    beleidsregels_notes:
      "Applies to urban infill and village gap-filling. Does not apply to greenfield development at the settlement edge.",
  },
  {
    code: "G",
    title_nl: "Bedrijfsgebouwen op bedrijventerreinen",
    title_en: "Business buildings on industrial/business parks",
    threshold_description:
      "Construction, modification, or expansion of business or industrial buildings on " +
      "an industrial park (bedrijventerrein) or business park.",
    mandatory: true,
    beleidsregels_notes:
      "The project must be on a designated bedrijventerrein. Standalone commercial buildings outside " +
      "business parks are covered under other categories.",
  },
  {
    code: "H",
    title_nl: "Maatschappelijke voorzieningen",
    title_en: "Social facilities",
    threshold_description:
      "All cases. Projects providing welfare (welzijn), healthcare (zorg), cultural (cultuur), " +
      "educational (onderwijs), sports (sport), or childcare (kinderopvang) facilities.",
    mandatory: true,
    beleidsregels_notes:
      "Broad category. Includes new construction, expansion, and repurposing of existing buildings for these functions.",
  },
  {
    code: "I",
    title_nl: "Mobiele antenne-installaties",
    title_en: "Mobile telecom masts",
    threshold_description:
      "ALL THREE of the following must be true simultaneously: " +
      "(1) terrain area > 100m², AND (2) structure height > 5m, AND (3) mast height > 40m.",
    threshold_logic: "AND",
    mandatory: true,
    beleidsregels_notes:
      "This is the strictest threshold logic in the activiteitenlijst — all three conditions must hold. " +
      "A mast that is 40m but on a terrain of only 80m² does NOT trigger the requirement.",
  },
  {
    code: "J",
    title_nl: "Kleine bouwwerken in de openbare ruimte",
    title_en: "Small structures in public space",
    threshold_description:
      "Kiosks, pavilions, temporary cultural buildings, and temporary commercial buildings placed in public space.",
    mandatory: true,
    beleidsregels_notes:
      "Specifically structures placed IN the public space (sidewalks, squares, parks). " +
      "Permanent large buildings fall under other categories.",
  },
  {
    code: "K",
    title_nl: "Ligplaatsen in het water",
    title_en: "Boat mooring on waterways",
    threshold_description:
      "Creating or expanding boat mooring facilities on waterways, including houseboats (woonboten) " +
      "and vessel moorage (pleziervaartuigen).",
    mandatory: true,
    beleidsregels_notes:
      "Applies to permanent mooring designations. Temporary mooring is generally not included.",
  },
  {
    code: "L",
    title_nl: "Hernieuwbare energie",
    title_en: "Renewable energy installations",
    threshold_description:
      "All cases. Solar fields (not building-mounted), wind turbines, and biogas installations.",
    mandatory: true,
    beleidsregels_notes:
      "Building-mounted solar panels (zonnepanelen op dak) are generally not included. " +
      "Standalone ground-mounted solar fields and all wind turbines are always included.",
  },
  {
    code: "M",
    title_nl: "Vellen van houtopstanden",
    title_en: "Tree removal",
    threshold_description:
      "More than 20 trees (vellingen), OR any removal of a heritage-designated tree (monumentale boom).",
    threshold_logic: "OR",
    mandatory: true,
    beleidsregels_notes:
      "The 20-tree threshold counts individual trees, not groups. A single heritage tree triggers the requirement immediately.",
  },
  {
    code: "N",
    title_nl: "Uitbreiding sport- en recreatievoorzieningen",
    title_en: "Expansion of sports / recreation facilities",
    threshold_description:
      "Expansion of a sports or recreation facility involving a disproportionately large " +
      "amount of construction (onevenredig grote bebouwing) relative to the existing facility.",
    mandatory: true,
    beleidsregels_notes:
      "'Disproportionate' is a judgment call — there is no published m² threshold. " +
      "If the proposed construction is clearly larger than the existing facility, participation is triggered.",
  },
];

// ─── Checker Logic ────────────────────────────────────────────────────────────

export interface CategoryMatch {
  code: string;
  title_en: string;
  threshold_description: string;
  threshold_logic?: "AND" | "OR";
  beleidsregels_notes: string;
}

export interface GroningenCheckResult {
  municipality: "Groningen";
  required: boolean;
  matched_categories: CategoryMatch[];
  unmatched_categories: string[];    // just codes
  warnings: string[];
  beleidsregels: {
    developer_owns_process: true;
    must_involve_all_affected_parties: true;
    identical_info_required: true;
    insufficient_consequence: string;
  };
  next_steps: string[];
  policy_url_activiteitenlijst: string;
  policy_url_beleidsregels: string;
}

/**
 * Check whether a project triggers mandatory participation under
 * Groningen's Activiteitenlijst (22 March 2024).
 */
export function checkGroningen(project: GroningenProjectInput): GroningenCheckResult {
  const matched: CategoryMatch[] = [];
  const unmatched: string[] = [];
  const warnings: string[] = [];

  function check(code: string, triggered: boolean): void {
    const cat = GRONINGEN_CATEGORIES.find((c) => c.code === code)!;
    if (triggered) {
      matched.push({
        code: cat.code,
        title_en: cat.title_en,
        threshold_description: cat.threshold_description,
        threshold_logic: cat.threshold_logic,
        beleidsregels_notes: cat.beleidsregels_notes,
      });
    } else {
      unmatched.push(code);
    }
  }

  // A — Renovation/modification/expansion (excludes like-for-like replacement)
  check(
    "A",
    !!project.is_renovation_or_expansion && !project.replaces_existing_on_same_site
  );

  // B — New housing in small villages (<5000 residents, >2 homes organic growth)
  check(
    "B",
    !!project.is_new_housing &&
      !!project.village_under_5000 &&
      (project.new_homes_count ?? 0) > 2
  );

  // C — Converting recreational homes to permanent residence
  check("C", !!project.is_recreational_to_permanent);

  // D — Second service dwelling for agricultural business
  check("D", !!project.is_second_agricultural_dwelling);

  // E — Agricultural plot boundary expansion
  check("E", !!project.is_agricultural_land_expansion);

  // F — Infill construction
  check("F", !!project.is_infill_construction);

  // G — Business buildings on industrial parks
  check("G", !!project.is_business_on_industrial_park);

  // H — Social facilities
  check("H", !!project.is_social_facility);

  // I — Telecom masts (ALL THREE conditions)
  const telecomTrigger =
    !!project.is_telecom_mast &&
    (project.telecom_terrain_m2 ?? 0) > 100 &&
    (project.telecom_structure_height_m ?? 0) > 5 &&
    (project.telecom_mast_height_m ?? 0) > 40;

  if (project.is_telecom_mast && !telecomTrigger) {
    warnings.push(
      "Telecom mast identified but not all three Category I thresholds are met. " +
      `Current values: terrain=${project.telecom_terrain_m2 ?? "?"} m² (need >100), ` +
      `structure=${project.telecom_structure_height_m ?? "?"} m (need >5), ` +
      `mast=${project.telecom_mast_height_m ?? "?"} m (need >40). ` +
      "ALL THREE must be exceeded simultaneously."
    );
  }
  check("I", telecomTrigger);

  // J — Small public space structures
  check("J", !!project.is_public_space_structure);

  // K — Boat mooring
  check("K", !!project.is_boat_mooring);

  // L — Renewable energy
  check("L", !!project.is_renewable_energy);

  // M — Tree removal (>20 trees OR any heritage tree)
  const treeRemovalTrigger =
    !!project.is_tree_removal &&
    ((project.trees_to_remove ?? 0) > 20 || !!project.includes_heritage_tree);

  if (project.is_tree_removal && !treeRemovalTrigger) {
    warnings.push(
      `Tree removal below threshold: ${project.trees_to_remove ?? 0} trees ` +
      `(need >20 for mandatory), no heritage trees identified. ` +
      "Voluntary participation recommended."
    );
  }
  check("M", treeRemovalTrigger);

  // N — Sports/recreation expansion with disproportionate construction
  if (project.is_sports_recreation_expansion) {
    warnings.push(
      "Category N 'disproportionate construction' is a judgment call — no published m² threshold. " +
      "If the proposed construction is clearly larger than the existing facility, treat as triggered. " +
      "Confirm with Groningen if uncertain."
    );
  }
  check("N", !!project.is_sports_recreation_expansion);

  const required = matched.length > 0;

  const next_steps: string[] = required
    ? [
        `${matched.length} mandatory trigger(s) found: ${matched.map((c) => `Category ${c.code}`).join(", ")}.`,
        "Participation is MANDATORY under the Groningen Activiteitenlijst.",
        "",
        "Beleidsregels requirements:",
        "  • YOU own the participation process — the municipality does not organise it for you.",
        "  • Involve ALL affected parties (belanghebbenden) — not just direct neighbours.",
        "  • Give all parties identical, complete information.",
        "  • Start early — participation must be completed before submitting the BOPA.",
        "",
        "If municipality deems participation insufficient:",
        "  → You will receive ONE opportunity to remedy the deficiency.",
        "  → If still insufficient: application is rejected.",
        "",
        "Documents required: Participatieverslag",
        "  Contents: who was involved, what was communicated, what feedback was received, how it was handled.",
        "",
        `Activiteitenlijst: https://lokaleregelgeving.overheid.nl/CVDR716944/1`,
        `Beleidsregels: https://lokaleregelgeving.overheid.nl/CVDR708912/1`,
      ]
    : [
        "Project does not match any of Groningen's 14 mandatory activity categories.",
        "Participation is VOLUNTARY for this project.",
        "",
        "Even though not mandatory, consider participating voluntarily:",
        "  • Reduces risk of late objections from neighbours during the permit process.",
        "  • If you do participate voluntarily, apply the same documentation standards.",
        "  • Goodwill with the municipality makes the process smoother.",
        "",
        `Activiteitenlijst: https://lokaleregelgeving.overheid.nl/CVDR716944/1`,
      ];

  return {
    municipality: "Groningen",
    required,
    matched_categories: matched,
    unmatched_categories: unmatched,
    warnings,
    beleidsregels: {
      developer_owns_process: true,
      must_involve_all_affected_parties: true,
      identical_info_required: true,
      insufficient_consequence: "remedy_opportunity_then_rejection",
    },
    next_steps,
    policy_url_activiteitenlijst: "https://lokaleregelgeving.overheid.nl/CVDR716944/1",
    policy_url_beleidsregels: "https://lokaleregelgeving.overheid.nl/CVDR708912/1",
  };
}

// ─── Pretty Printer ───────────────────────────────────────────────────────────

export function formatGroningenResult(result: GroningenCheckResult): string {
  const lines: string[] = [];
  const sep = "─".repeat(60);

  lines.push(sep);
  lines.push("GRONINGEN PARTICIPATION CHECKER — RESULT");
  lines.push("Activiteitenlijst (effective 22 March 2024)");
  lines.push(sep);
  lines.push("");

  if (result.required) {
    lines.push(`▶ STATUS: MANDATORY (${result.matched_categories.length} trigger(s) found)`);
  } else {
    lines.push("▶ STATUS: VOLUNTARY (no mandatory triggers found)");
  }
  lines.push("");

  if (result.matched_categories.length > 0) {
    lines.push("TRIGGERED CATEGORIES:");
    lines.push("");
    for (const cat of result.matched_categories) {
      lines.push(`  ✓ Category ${cat.code} — ${cat.title_en}`);
      lines.push(`    Threshold: ${cat.threshold_description}`);
      if (cat.threshold_logic) {
        lines.push(`    Logic: ${cat.threshold_logic}`);
      }
      lines.push(`    Notes: ${cat.beleidsregels_notes}`);
      lines.push("");
    }
  }

  const nonTriggered = GRONINGEN_CATEGORIES.filter(
    (c) => !result.matched_categories.some((m) => m.code === c.code)
  );
  if (nonTriggered.length > 0 && !result.required) {
    lines.push(`NOT TRIGGERED (${nonTriggered.length} categories checked, none matched):`);
    lines.push(`  ${nonTriggered.map((c) => `${c.code}`).join("  ")}`);
    lines.push("");
  }

  if (result.warnings.length > 0) {
    lines.push("WARNINGS:");
    for (const w of result.warnings) {
      lines.push(`  ⚠  ${w}`);
    }
    lines.push("");
  }

  lines.push("NEXT STEPS:");
  for (const step of result.next_steps) {
    lines.push(`  ${step}`);
  }
  lines.push("");
  lines.push(sep);

  return lines.join("\n");
}

// ─── CLI Runner ───────────────────────────────────────────────────────────────

/**
 * Walk through each of the 14 categories interactively.
 * Run with: npx ts-node groningen-checker.ts
 */
async function runCLI(): Promise<void> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  const yesNo = async (question: string): Promise<boolean> => {
    while (true) {
      const raw = await ask(`${question} (y/n): `);
      const ans = raw.trim().toLowerCase();
      if (ans === "y" || ans === "yes") return true;
      if (ans === "n" || ans === "no") return false;
      console.log("  Please enter y or n.");
    }
  };

  const askNumber = async (question: string): Promise<number> => {
    while (true) {
      const raw = await ask(`${question}: `);
      const n = parseFloat(raw.trim());
      if (!isNaN(n) && n >= 0) return n;
      console.log("  Please enter a valid number (≥ 0).");
    }
  };

  console.log("\n" + "═".repeat(60));
  console.log("GRONINGEN BINARY LIST CHECKER");
  console.log("Activiteitenlijst — 14 Categories (effective 22 March 2024)");
  console.log("═".repeat(60));
  console.log("");
  console.log("Answer questions for each category. Enter 'y' for yes, 'n' for no.");
  console.log("We will check all 14 categories and tell you which trigger mandatory participation.");
  console.log("");

  const project: GroningenProjectInput = {};

  // ── Category A ──
  console.log("─".repeat(50));
  console.log("CATEGORY A — Renovation / modification / expansion");
  project.is_renovation_or_expansion = await yesNo(
    "Is this a renovation, modification, or expansion of an existing building or home?"
  );
  if (project.is_renovation_or_expansion) {
    project.replaces_existing_on_same_site = await yesNo(
      "Is it a like-for-like replacement on the exact same site (sloopnieuwbouw)?"
    );
  }

  // ── Category B ──
  console.log("─".repeat(50));
  console.log("CATEGORY B — New housing in small villages");
  project.is_new_housing = await yesNo("Is this new residential construction?");
  if (project.is_new_housing) {
    project.village_under_5000 = await yesNo(
      "Is it in a village (kern) with fewer than 5,000 residents?"
    );
    if (project.village_under_5000) {
      project.new_homes_count = await askNumber("How many new homes are being added?");
    }
  }

  // ── Category C ──
  console.log("─".repeat(50));
  console.log("CATEGORY C — Converting recreational homes to permanent residence");
  project.is_recreational_to_permanent = await yesNo(
    "Is this converting a holiday home or recreational dwelling to permanent residential use?"
  );

  // ── Category D ──
  console.log("─".repeat(50));
  console.log("CATEGORY D — Second service dwelling for agricultural business");
  project.is_second_agricultural_dwelling = await yesNo(
    "Is this adding a SECOND service dwelling (dienstwoning) to an agricultural business?"
  );

  // ── Category E ──
  console.log("─".repeat(50));
  console.log("CATEGORY E — Agricultural plot boundary expansion");
  project.is_agricultural_land_expansion = await yesNo(
    "Does the project expand the legal boundary of an agricultural bouwperceel?"
  );

  // ── Category F ──
  console.log("─".repeat(50));
  console.log("CATEGORY F — Infill construction");
  project.is_infill_construction = await yesNo(
    "Is this infill construction — building in a gap within an existing settlement?"
  );

  // ── Category G ──
  console.log("─".repeat(50));
  console.log("CATEGORY G — Business buildings on industrial/business parks");
  project.is_business_on_industrial_park = await yesNo(
    "Is this constructing, modifying, or expanding business/industrial buildings on a designated bedrijventerrein?"
  );

  // ── Category H ──
  console.log("─".repeat(50));
  console.log("CATEGORY H — Social facilities");
  project.is_social_facility = await yesNo(
    "Is this a welfare, healthcare, culture, education, sports, or childcare facility?"
  );

  // ── Category I ──
  console.log("─".repeat(50));
  console.log("CATEGORY I — Mobile telecom masts (ALL THREE thresholds must be met)");
  project.is_telecom_mast = await yesNo("Is this a mobile telecom mast (antenne-installatie)?");
  if (project.is_telecom_mast) {
    project.telecom_terrain_m2 = await askNumber("Terrain area (m²)?");
    project.telecom_structure_height_m = await askNumber("Structure height (metres)?");
    project.telecom_mast_height_m = await askNumber("Mast height (metres)?");
  }

  // ── Category J ──
  console.log("─".repeat(50));
  console.log("CATEGORY J — Small structures in public space");
  project.is_public_space_structure = await yesNo(
    "Is this a kiosk, pavilion, or temporary cultural/commercial building in public space?"
  );

  // ── Category K ──
  console.log("─".repeat(50));
  console.log("CATEGORY K — Boat mooring");
  project.is_boat_mooring = await yesNo(
    "Does the project create or expand boat mooring on a waterway (including houseboats)?"
  );

  // ── Category L ──
  console.log("─".repeat(50));
  console.log("CATEGORY L — Renewable energy");
  project.is_renewable_energy = await yesNo(
    "Is this a renewable energy project — solar field, wind turbine(s), or biogas installation?"
  );

  // ── Category M ──
  console.log("─".repeat(50));
  console.log("CATEGORY M — Tree removal (>20 trees OR any heritage tree)");
  project.is_tree_removal = await yesNo("Does the project involve removing trees?");
  if (project.is_tree_removal) {
    project.trees_to_remove = await askNumber("How many trees will be removed?");
    project.includes_heritage_tree = await yesNo(
      "Does the removal include any heritage-designated trees (monumentale bomen)?"
    );
  }

  // ── Category N ──
  console.log("─".repeat(50));
  console.log("CATEGORY N — Sports / recreation facility expansion");
  project.is_sports_recreation_expansion = await yesNo(
    "Is this an expansion of a sports or recreation facility with disproportionately large construction?"
  );

  rl.close();

  console.log("");
  const result = checkGroningen(project);
  console.log(formatGroningenResult(result));
}

// Run CLI if executed directly
if (require.main === module) {
  runCLI().catch(console.error);
}
