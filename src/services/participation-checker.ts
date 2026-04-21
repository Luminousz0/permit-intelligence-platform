/**
 * Participation Requirement Checker — Layer 3 Core Logic
 * Permit Intelligence Platform
 *
 * Given municipality + project spec → outputs:
 *   - required / not required / unknown / conditional
 *   - intensity level (where applicable)
 *   - required actions and documents
 *   - warnings and next steps
 *
 * No external API needed. Pure TypeScript.
 * Data source: Municipality Participation Database.json (same folder)
 */

import db from "../data/Municipality Participation Database.json";

// ─── Input Types ──────────────────────────────────────────────────────────────

export type ProjectType =
  | "housing_new"                  // New residential construction
  | "housing_renovation"           // Modification/expansion of existing housing
  | "housing_conversion_recreational" // Converting recreational home → permanent residence
  | "commercial"                   // Commercial buildings, retail, office
  | "industrial"                   // Industrial / manufacturing buildings
  | "social_facility"              // Welfare, healthcare, culture, education, sports, childcare
  | "renewable_energy"             // Solar fields, wind turbines, biogas
  | "agricultural"                 // Agricultural buildings / land
  | "telecom_mast"                 // Mobile telecom infrastructure
  | "public_space_structure"       // Kiosks, pavilions, temporary cultural/commercial buildings
  | "boat_mooring"                 // Waterway mooring / houseboats
  | "tree_removal"                 // Tree felling
  | "sports_recreation"            // Sports / recreation facility expansion
  | "infill_construction"          // Building in gaps in existing settlement patterns
  | "other";

export interface ProjectSpec {
  type: ProjectType;

  // Scale parameters
  housing_units?: number;                    // Number of residential units
  building_height_meters?: number;           // Height of tallest structure
  commercial_floor_area_m2?: number;         // Total commercial floor area

  // Location
  location_type?: "urban" | "rural" | "village_under_5000";

  // Specific flags
  is_standalone_solar?: boolean;             // True = ground-mounted; false = building-mounted
  wind_turbine_count?: number;
  eia_required?: boolean;                    // Mandatory Environmental Impact Assessment
  contradicts_omgevingsvisie?: boolean;      // Project contradicts municipal spatial vision
  nature_zone?: "waardevol" | "zeer_waardevol" | null; // Sensitive nature zone classification

  // Tree removal
  tree_count?: number;
  tree_is_heritage?: boolean;

  // Telecom mast (all three must be true for Groningen category I)
  telecom?: {
    terrain_m2?: number;
    structure_height_m?: number;
    mast_height_m?: number;
  };

  // Agricultural specifics (Groningen)
  village_population?: number;               // For category B threshold check
  is_second_agricultural_dwelling?: boolean; // Category D
  is_agricultural_land_expansion?: boolean;  // Category E
  replaces_existing_on_same_site?: boolean;  // Excludes from category A
}

// ─── Output Types ─────────────────────────────────────────────────────────────

/** required: boolean = definitive yes/no; 'unknown' = cannot determine; 'conditional' = depends on factors */
export type RequiredStatus = boolean | "unknown" | "conditional";

export interface IntensityLevel {
  level: number | string;
  label: string;
  required_actions: string[];
  description?: string;
}

export interface ParticipationResult {
  municipality: string;
  required: RequiredStatus;
  intensity?: IntensityLevel;
  architecture: string;
  documents_required: string[];
  warnings: string[];
  next_steps: string[];
  policy_url?: string | null;
  strictness?: string;
  non_compliance_consequence?: string;
  data_completeness?: string;
}

// ─── Database Helpers ─────────────────────────────────────────────────────────

function getMunicipalityProfile(input: string): any | null {
  const normalised = input.toLowerCase().replace(/\s+/g, "-");
  return (
    (db.municipalities as any[]).find(
      (m) =>
        m.id === normalised ||
        m.municipality.toLowerCase() === input.toLowerCase()
    ) ?? null
  );
}

function isNoPolicyMunicipality(input: string): boolean {
  return db.no_policy_municipalities.some(
    (name) => name.toLowerCase() === input.toLowerCase()
  );
}

// ─── Architecture Handlers ────────────────────────────────────────────────────

/**
 * BLANKET MANDATORY — Amsterdam, Tilburg, Breda, 's-Hertogenbosch
 * Participation always required for BOPAs. Intensity determined by scoring (where applicable).
 */
function handleBlanketMandatory(
  mun: any,
  project: ProjectSpec
): ParticipationResult {
  const result: ParticipationResult = {
    municipality: mun.municipality,
    required: true,
    architecture: mun.architecture,
    documents_required: mun.documents_required ?? [],
    warnings: [],
    next_steps: [],
    policy_url: mun.policy_url ?? null,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };

  // Amsterdam — run Participatiehandreiking scoring questionnaire
  if (mun.id === "amsterdam" && mun.scoring_system) {
    result.intensity = scoreAmsterdam(mun.scoring_system, project);
    result.next_steps.push(
      `Participation is mandatory for all BOPAs in Amsterdam.`,
      `Preliminary category: ${result.intensity.level} (${result.intensity.label}).`,
      `Required at this level: ${result.intensity.required_actions.join(", ")}.`,
      `Verify with the official Participatiehandreiking questionnaire before submitting.`,
      `Policy: ${mun.policy_url}`
    );
    result.warnings.push(
      "Amsterdam category shown is a heuristic approximation from project specs. " +
      "For exact scoring: use amsterdam-questionnaire.ts (4-question interactive flow from the official Participatiehandreiking). " +
      "Source: 'Betrek de buurt bij uw initiatieven' (Gemeente Amsterdam, 2022)."
    );
  }

  // Breda — two-document system
  if (mun.id === "breda") {
    result.next_steps.push(
      "Submit a Participatieplan at the initiative stage (before design is fixed).",
      "Submit a Participatieverslag with your permit application.",
      `Policy: ${mun.policy_url}`
    );
    result.warnings.push(
      "Breda requires TWO documents at different stages: Participatieplan upfront, Participatieverslag at submission. Missing either = permit denied."
    );
  }

  // Tilburg — minimal guidance
  if (mun.id === "tilburg") {
    result.next_steps.push(
      "Inform the surrounding environment (direct neighbours for housing; the street for businesses).",
      "Submit a declaration that participation occurred, plus a description of the outcome."
    );
    result.warnings.push(
      "Tilburg's published guidance is extremely thin. Contact the gemeente to clarify expectations before starting participation."
    );
  }

  // 's-Hertogenbosch — Bossche omgevingsdialoog
  if (mun.id === "s-hertogenbosch") {
    result.next_steps.push(
      "Enter into a Bossche omgevingsdialoog with surrounding stakeholders.",
      "Format is flexible — no fixed template. Document the dialogue process and outcomes."
    );
    result.warnings.push(
      "What counts as 'sufficient' dialogue in 's-Hertogenbosch is not explicitly defined. Err on the side of more structured documentation."
    );
  }

  return result;
}

/**
 * BINARY LIST — Groningen
 * 14 activity categories. On the list → mandatory. Off the list → voluntary.
 */
function handleBinaryListGroningen(
  mun: any,
  project: ProjectSpec
): ParticipationResult {
  const matches: string[] = [];

  for (const cat of mun.binary_list_system.categories) {
    if (matchesGroningenCategory(cat.code, project)) {
      matches.push(`Category ${cat.code}: ${cat.activity}`);
    }
  }

  const required = matches.length > 0;

  return {
    municipality: mun.municipality,
    required,
    architecture: mun.architecture,
    documents_required: required ? mun.documents_required : [],
    warnings: [],
    next_steps: required
      ? [
          `Mandatory triggers: ${matches.join("; ")}.`,
          "Involve all affected parties and give them identical information.",
          "Developer owns the process — municipality does not organise it for you.",
          "If deemed insufficient after submission, you get one remedy opportunity before rejection.",
          `Activiteitenlijst: ${mun.policy_url_activiteitenlijst}`,
          `Beleidsregels: ${mun.policy_url_beleidsregels}`,
        ]
      : [
          "Project does not match any of Groningen's 14 mandatory activity categories.",
          "Participation is voluntary. Recommended but not required.",
          "If you do participate voluntarily, apply the same documentation standards.",
        ],
    policy_url: mun.policy_url_activiteitenlijst,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

function matchesGroningenCategory(code: string, project: ProjectSpec): boolean {
  switch (code) {
    case "A": // Renovation/modification/expansion of housing (excludes like-for-like replacement)
      return (
        project.type === "housing_renovation" &&
        !project.replaces_existing_on_same_site
      );
    case "B": // New housing in small villages (<5000 pop, >2 homes organic growth)
      return (
        project.type === "housing_new" &&
        project.location_type === "village_under_5000" &&
        (project.housing_units ?? 0) > 2
      );
    case "C": // Converting recreational homes to permanent residence
      return project.type === "housing_conversion_recreational";
    case "D": // Second service dwelling for agricultural business
      return !!project.is_second_agricultural_dwelling;
    case "E": // Agricultural plot boundary expansion
      return !!project.is_agricultural_land_expansion;
    case "F": // Infill construction (building in gaps in existing settlement)
      return project.type === "infill_construction";
    case "G": // Business buildings on industrial parks
      return project.type === "commercial" || project.type === "industrial";
    case "H": // Social facilities (welfare, healthcare, culture, education, sports, childcare)
      return project.type === "social_facility";
    case "I": // Telecom masts — ALL THREE conditions must be true simultaneously
      return (
        project.type === "telecom_mast" &&
        (project.telecom?.terrain_m2 ?? 0) > 100 &&
        (project.telecom?.structure_height_m ?? 0) > 5 &&
        (project.telecom?.mast_height_m ?? 0) > 40
      );
    case "J": // Small public space structures (kiosks, pavilions, temporary buildings)
      return project.type === "public_space_structure";
    case "K": // Boat mooring (including houseboats)
      return project.type === "boat_mooring";
    case "L": // Renewable energy (solar fields, wind turbines, biogas)
      return project.type === "renewable_energy";
    case "M": // Tree removal — >20 trees OR any heritage tree
      return (
        project.type === "tree_removal" &&
        ((project.tree_count ?? 0) > 20 || !!project.tree_is_heritage)
      );
    case "N": // Sports/recreation facility expansion
      return project.type === "sports_recreation";
    default:
      return false;
  }
}

/**
 * BINARY LIST — Zwolle
 * 8 threshold categories. Numeric/binary checks. Clearest programmatic system.
 */
function handleBinaryListZwolle(
  mun: any,
  project: ProjectSpec
): ParticipationResult {
  const triggers: Array<{ id: number; description: string; isJudgmentCall: boolean }> = [];

  for (const cat of mun.binary_list_system.categories) {
    if (matchesZwolleCategory(cat, project)) {
      triggers.push({
        id: cat.id,
        description: `#${cat.id} ${cat.description} (threshold: ${cat.threshold})`,
        isJudgmentCall: cat.threshold_type === "judgment",
      });
    }
  }

  const required = triggers.length > 0;
  const hasJudgmentCall = triggers.some((t) => t.isJudgmentCall);

  return {
    municipality: mun.municipality,
    required,
    architecture: mun.architecture,
    documents_required: required ? mun.documents_required : [],
    warnings: hasJudgmentCall
      ? [
          "Category #4 (contradicts omgevingsvisie) is a judgment call. Cannot be determined programmatically — verify directly with municipality.",
        ]
      : [],
    next_steps: required
      ? [
          `Mandatory trigger(s): ${triggers.map((t) => t.description).join("; ")}.`,
          `Policy: ${mun.policy_url}`,
        ]
      : [
          "Project does not meet any of Zwolle's 8 threshold categories.",
          "Participation is voluntary for this project.",
        ],
    policy_url: mun.policy_url,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

function matchesZwolleCategory(cat: any, project: ProjectSpec): boolean {
  switch (cat.id) {
    case 1: // Tall buildings >25m
      return (project.building_height_meters ?? 0) > 25;
    case 2: // Wind turbines ≥1
      return (project.wind_turbine_count ?? 0) >= 1;
    case 3: // Standalone (ground-mounted) solar installations
      return project.type === "renewable_energy" && !!project.is_standalone_solar;
    case 4: // Contradicts omgevingsvisie — judgment call
      return !!project.contradicts_omgevingsvisie;
    case 5: // Housing ≥5 units in urban area
      return (
        (project.housing_units ?? 0) >= 5 && project.location_type === "urban"
      );
    case 6: // Housing ≥5 units in rural area
      return (
        (project.housing_units ?? 0) >= 5 && project.location_type === "rural"
      );
    case 7: // EIA required
      return !!project.eia_required;
    case 8: // Sensitive nature zones
      return (
        project.nature_zone === "waardevol" ||
        project.nature_zone === "zeer_waardevol"
      );
    default:
      return false;
  }
}

/**
 * SCORING — Arnhem
 * All BOPAs mandatory. 4-parameter scoring → intensity level (1/2/3).
 */
function handleScoring(mun: any, project: ProjectSpec): ParticipationResult {
  const result: ParticipationResult = {
    municipality: mun.municipality,
    required: true,
    architecture: mun.architecture,
    documents_required: mun.documents_required ?? [],
    warnings: [
      "Arnhem scoring uses heuristic approximation — exact parameter scales are not published. Treat level as preliminary.",
    ],
    next_steps: [],
    policy_url: mun.policy_url,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };

  if (mun.id === "arnhem" && mun.scoring_system) {
    result.intensity = scoreArnhem(mun.scoring_system, project);
    result.next_steps.push(
      `Participation mandatory for all BOPAs in Arnhem.`,
      `Preliminary level: ${result.intensity.level} — ${result.intensity.label}.`,
      `Required at this level: ${result.intensity.required_actions.join(", ")}.`,
      `Attendance records required. Report must cover: steps taken, results, support levels, how feedback shaped the plan.`,
      `Verify with the Arnhem Handreiking for exact scoring values. Policy: ${mun.policy_url}`
    );
  }

  return result;
}

function scoreAmsterdam(scoringSystem: any, project: ProjectSpec): IntensityLevel {
  /**
   * Heuristic approximation of Amsterdam's Participatiehandreiking (2022) scoring.
   *
   * The EXACT questionnaire has 4 questions (each scored 1-3):
   *   Q1: Initiative type/scale (A=1, B=2, C=3)
   *   Q2: Traffic/parking impact (none=1, more=2, much more=3)
   *   Q3: Green space impact (none=1, some=2, major=3)
   *   Q4: Neighbourhood experience change (none=1, changes=2, major=3)
   *   Min: 4 pts → Cat 1. Range 5-8 → Cat 2. Range 9-12 → Cat 3.
   *   Override: conflict with omgevingsplan → +1 category.
   *
   * This function approximates the category from ProjectSpec fields (no explicit answers).
   * For exact scoring, use amsterdam-questionnaire.ts with the 4-question interactive flow.
   *
   * Source: Participatiehandreiking 'Betrek de buurt bij uw initiatieven' (Gemeente Amsterdam, 2022)
   */
  let score = 0;

  // Q1 proxy: initiative type/scale (via housing units + project type)
  if ((project.housing_units ?? 0) >= 25 || project.type === "renewable_energy") score += 3;
  else if ((project.housing_units ?? 0) >= 5 || (project.commercial_floor_area_m2 ?? 0) >= 500) score += 2;
  else score += 1;

  // Q2 proxy: traffic/parking (via scale and project type)
  if ((project.housing_units ?? 0) >= 50 || project.eia_required) score += 3;
  else if ((project.housing_units ?? 0) >= 10 || (project.commercial_floor_area_m2 ?? 0) >= 1000) score += 2;
  else score += 1;

  // Q3 proxy: green space impact
  if (project.nature_zone === "zeer_waardevol" || (project.wind_turbine_count ?? 0) >= 1) score += 3;
  else if (project.nature_zone === "waardevol") score += 2;
  else score += 1;

  // Q4 proxy: neighbourhood experience change
  if ((project.building_height_meters ?? 0) > 25 || project.contradicts_omgevingsvisie) score += 3;
  else if ((project.building_height_meters ?? 0) > 15 || project.type === "public_space_structure") score += 2;
  else score += 1;

  // Override: contradicts omgevingsplan → +1 category (applied below)
  const cats = scoringSystem.categories;

  // Thresholds: 4=Cat1, 5-8=Cat2, 9-12=Cat3 (adjusted from heuristic range 4-12)
  let catIndex: number;
  if (score <= 5) catIndex = 0;       // Cat 1
  else if (score <= 9) catIndex = 1;  // Cat 2
  else catIndex = 2;                  // Cat 3

  // Apply omgevingsplan override
  if (project.contradicts_omgevingsvisie && catIndex < 2) {
    catIndex += 1;
  }

  return { level: catIndex + 1, label: cats[catIndex].label, required_actions: cats[catIndex].required_actions, description: cats[catIndex].description };
}

function scoreArnhem(scoringSystem: any, project: ProjectSpec): IntensityLevel {
  /**
   * Arnhem: 4 parameters, each scored → sum / 4 → level 1/2/3
   * Parameters: building_category, traffic_congestion, green_space_impact, neighbourhood_character
   * Exact per-parameter scales not published — approximated here.
   */
  let total = 0;

  // Building category (units or commercial volume)
  if ((project.housing_units ?? 0) >= 50 || (project.commercial_floor_area_m2 ?? 0) >= 5000)
    total += 3;
  else if ((project.housing_units ?? 0) >= 10 || (project.commercial_floor_area_m2 ?? 0) >= 1000)
    total += 2;
  else total += 1;

  // Traffic congestion effects
  if ((project.housing_units ?? 0) >= 50 || project.eia_required) total += 3;
  else if ((project.housing_units ?? 0) >= 10) total += 2;
  else total += 1;

  // Green space impact
  if (project.nature_zone === "zeer_waardevol") total += 3;
  else if (project.nature_zone === "waardevol") total += 2;
  else total += 1;

  // Neighbourhood character
  if ((project.building_height_meters ?? 0) > 25 || project.contradicts_omgevingsvisie) total += 3;
  else if ((project.building_height_meters ?? 0) > 15) total += 2;
  else total += 1;

  const avg = total / 4;
  const levels = scoringSystem.levels;

  if (avg < 1.75)
    return { level: 1, label: levels[0].label, required_actions: levels[0].required_actions, description: levels[0].description };
  if (avg < 2.5)
    return { level: 2, label: levels[1].label, required_actions: levels[1].required_actions, description: levels[1].description };
  return { level: 3, label: levels[2].label, required_actions: levels[2].required_actions, description: levels[2].description };
}

/**
 * DESIGNATED ONLY — Den Haag, Utrecht, Nijmegen, Enschede
 * Mandatory only for council-designated project types. Lists not yet mapped.
 */
function handleDesignatedOnly(mun: any): ParticipationResult {
  const listAvailable =
    mun.designated_system?.designation_list_available ??
    mun.designated_system?.binding_advice_list_available ??
    false;

  return {
    municipality: mun.municipality,
    required: "unknown",
    architecture: mun.architecture,
    documents_required: [],
    warnings: [
      listAvailable
        ? `Designation list available for ${mun.municipality} — check project type against it.`
        : `Designation list for ${mun.municipality} has not been mapped yet. Cannot determine requirement automatically.`,
    ],
    next_steps: [
      `Check ${mun.municipality}'s council designation list to see if your project type is listed.`,
      "If on the list: participation is mandatory.",
      "If not on the list: participation is voluntary (confirm with municipality to be safe).",
      ...(mun.policy_url ? [`Policy reference: ${mun.policy_url}`] : []),
      ...(mun.designated_system?.contact_email
        ? [`Contact: ${mun.designated_system.contact_email}`]
        : []),
    ],
    policy_url: mun.policy_url ?? null,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

/**
 * EXPLICIT OPT-OUT — Leiden
 * No mandatory BOPA participation. Entirely voluntary.
 */
function handleExplicitOptOut(mun: any): ParticipationResult {
  return {
    municipality: mun.municipality,
    required: false,
    architecture: mun.architecture,
    documents_required: [],
    warnings: [],
    next_steps: [
      `${mun.municipality} has explicitly opted out of mandatory BOPA participation.`,
      "No participatieverslag required.",
      "Voluntary participation is encouraged — documenting it shows goodwill and reduces risk of late objections.",
    ],
    policy_url: mun.policy_url ?? null,
    strictness: mun.strictness,
    non_compliance_consequence: "none",
    data_completeness: mun.data_completeness,
  };
}

/**
 * SCALE-BASED — Rotterdam
 * Large initiatives = full mandatory track. Small = encouraged, lighter.
 * Threshold between large/small not explicitly published — intake team decides.
 */
function handleScaleBased(mun: any, project: ProjectSpec): ParticipationResult {
  // Heuristic indicators of a "large" initiative
  const largeIndicators: string[] = [];
  if ((project.housing_units ?? 0) >= 50) largeIndicators.push("50+ housing units");
  if ((project.commercial_floor_area_m2 ?? 0) >= 5000) largeIndicators.push("5000m²+ commercial floor area");
  if (project.eia_required) largeIndicators.push("EIA required");
  if ((project.building_height_meters ?? 0) > 25) largeIndicators.push("building height >25m");

  const likelyLarge = largeIndicators.length > 0;

  return {
    municipality: mun.municipality,
    required: likelyLarge ? true : "conditional",
    architecture: mun.architecture,
    documents_required: likelyLarge ? mun.documents_required : [],
    warnings: [
      "Rotterdam's threshold between 'large' and 'small' is not publicly defined — intake team determines track.",
    ],
    next_steps: likelyLarge
      ? [
          `Project shows indicators of a LARGE initiative: ${largeIndicators.join(", ")}.`,
          "Contact Rotterdam's intake team — a participation advisor will be assigned.",
          "Submit a participatierapportage with your application.",
          ...(mun.prior_framework_exemption
            ? [
                "IMPORTANT: Check if your project aligns with an existing approved spatial framework (masterplan, omgevingsvisie). If yes, prior-framework exemption may apply — no new participation required.",
              ]
            : []),
          `Policy: ${mun.policy_url}`,
        ]
      : [
          "Project may qualify as a SMALL initiative — lighter participation expected.",
          "Participation is encouraged but not strictly mandatory for small initiatives.",
          "Contact Rotterdam's intake team to confirm which track applies.",
          `Policy: ${mun.policy_url}`,
        ],
    policy_url: mun.policy_url,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

/**
 * QUICKSCAN INTAKE — Eindhoven
 * Municipality provides self-serve Quickscan tool. Use it to determine requirement.
 */
function handleQuickscanIntake(mun: any): ParticipationResult {
  return {
    municipality: mun.municipality,
    required: "conditional",
    architecture: mun.architecture,
    documents_required: [],
    warnings: [],
    next_steps: [
      "Use Eindhoven's self-serve Quickscan tool to determine whether participation is required.",
      `Quickscan: ${mun.quickscan_system.quickscan_url}`,
      "Large projects: contact the intake team — a participation advisor will be assigned.",
      "Standard projects: follow Quickscan result. Submit participatieverslag if the tool requires it.",
    ],
    policy_url: mun.quickscan_system.quickscan_url,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

/**
 * BROAD TRIGGER — Haarlem
 * Mandatory when any "reasonably expectable stakeholders" exist.
 * In practice: nearly any project adjacent to existing buildings or public space.
 */
function handleBroadTrigger(mun: any, project: ProjectSpec): ParticipationResult {
  // Virtually all built-environment projects will have expectable stakeholders
  const stakeholdersExpectable = project.type !== "tree_removal" || (project.tree_count ?? 0) > 5;

  return {
    municipality: mun.municipality,
    required: stakeholdersExpectable ? true : "conditional",
    architecture: mun.architecture,
    documents_required: mun.documents_required ?? [],
    warnings: [
      "Haarlem's trigger is broad: participation is mandatory whenever 'reasonably expectable stakeholders' exist.",
      "For any project adjacent to homes, businesses, or public space — assume mandatory.",
    ],
    next_steps: [
      "Prepare a participation paragraph covering all 8 required elements.",
      "Required elements: project impact, objectives, influence level, timeline, stakeholder method, outreach methods, feedback mechanisms, how input was handled.",
      "Submit results to both participants and the council commission after completing participation.",
      `Verordening participatie en uitdaagrecht 2024: ${mun.policy_url}`,
      "Note: Parolo lists Haarlem as 'geen beleid' — this is wrong. Haarlem has had a 2024 ordinance in effect since 29 Feb 2024.",
    ],
    policy_url: mun.policy_url,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

/**
 * PROPORTIONAL DISCRETIONARY — Maastricht
 * No hard trigger. Developer determines scope using the 6-step checklist.
 */
function handleProportionalDiscretionary(mun: any): ParticipationResult {
  return {
    municipality: mun.municipality,
    required: "conditional",
    architecture: mun.architecture,
    documents_required: mun.documents_required ?? [],
    warnings: [
      "No hard mandatory threshold. Developer determines participation scope proportional to project scale and impact.",
    ],
    next_steps: [
      "Apply Maastricht's 6-step checklist:",
      "  1. Define plan (goals, timeline, budget, decision-makers)",
      "  2. Analyse stakeholders (who is affected and at what level)",
      "  3. Choose participation method (kitchen-table talks, design sessions, surveys, public meetings)",
      "  4. Invite participants (personal invitations, clarity on what is fixed vs. flexible)",
      "  5. Test and document agreements (record agreements, document activities)",
      "  6. Submit participation report (methodology, attendance, changes made, satisfaction ratings)",
      `Checklist: ${mun.policy_url}`,
    ],
    policy_url: mun.policy_url,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

/**
 * CASE BY CASE — Almere
 * No fixed rules. Municipality evaluates each BOPA individually.
 */
function handleCaseByCase(mun: any): ParticipationResult {
  return {
    municipality: mun.municipality,
    required: "unknown",
    architecture: mun.architecture,
    documents_required: [],
    warnings: [
      `${mun.municipality} evaluates participation requirements case-by-case — no published threshold or designation list.`,
      "If municipality finds participation insufficient, they will collect stakeholder views themselves — causing significant delays.",
      ...(mun.case_by_case_system?.policy_being_finalised
        ? [`Note: ${mun.municipality}'s participation policy is still being finalised as of 2026.`]
        : []),
    ],
    next_steps: [
      `Contact ${mun.municipality} before submitting to ask what participation level they expect for your specific project type.`,
      "Document all participation proactively — err on the side of doing more, not less.",
      "Who was contacted, when, how, what was said, what changed as a result.",
      ...(mun.policy_url ? [`Reference: ${mun.policy_url}`] : []),
    ],
    policy_url: mun.policy_url ?? null,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

/**
 * LIMITED SCOPE — Apeldoorn
 * Verordening covers municipal policy, not developer BOPA applications.
 */
function handleLimitedScope(mun: any): ParticipationResult {
  return {
    municipality: mun.municipality,
    required: "unknown",
    architecture: mun.architecture,
    documents_required: [],
    warnings: [
      `${mun.municipality}'s verordening covers how the municipality involves residents in its own policy decisions — not developer BOPA applications.`,
      "No BOPA participation requirement identified, but a separate aanwijzingsbesluit may exist and has not been found yet.",
    ],
    next_steps: [
      `Contact ${mun.municipality} directly to confirm whether BOPA participation is expected.`,
      "Search lokaleregelgeving.overheid.nl for a separate aanwijzingsbesluit under Apeldoorn.",
      "Until confirmed: apply national safe minimum as a precaution.",
    ],
    policy_url: mun.policy_url ?? null,
    strictness: mun.strictness,
    non_compliance_consequence: mun.non_compliance_consequence,
    data_completeness: mun.data_completeness,
  };
}

/**
 * NO POLICY — 35 municipalities
 * No published participation policy. Apply national safe minimum.
 */
function handleNoPolicy(municipalityName: string): ParticipationResult {
  const nm = db.national_safe_minimum;
  return {
    municipality: municipalityName,
    required: "unknown",
    architecture: "no_policy",
    documents_required: nm.documents_required,
    warnings: [
      "No published municipal participation policy found for this municipality.",
      "Apply the national safe minimum based on Art. 16.55 Omgevingswet.",
    ],
    next_steps: [
      "Identify all stakeholders with a direct interest in the project.",
      "Inform them of the project.",
      "Give them an opportunity to provide input.",
      "Document what was done and what input was received.",
      "Proactively contact the municipality to ask what they expect — some municipalities with no published policy still have informal expectations.",
    ],
    policy_url: null,
    strictness: "unknown",
    non_compliance_consequence: "unknown",
    data_completeness: "none",
  };
}

// ─── Main Entrypoint ──────────────────────────────────────────────────────────

/**
 * Check participation requirements for a given municipality and project.
 *
 * @param municipalityInput  Municipality name or ID (e.g., "Amsterdam", "amsterdam", "den-haag")
 * @param project            Project specification
 * @returns ParticipationResult with requirement status, intensity, documents, warnings, next steps
 */
export function checkParticipationRequirement(
  municipalityInput: string,
  project: ProjectSpec
): ParticipationResult {
  // 1. Check no-policy list
  if (isNoPolicyMunicipality(municipalityInput)) {
    return handleNoPolicy(municipalityInput);
  }

  // 2. Look up municipality profile
  const mun = getMunicipalityProfile(municipalityInput);

  if (!mun) {
    // Municipality exists but hasn't been profiled yet
    return {
      municipality: municipalityInput,
      required: "unknown",
      architecture: "unprofiled",
      documents_required: [],
      warnings: [
        `${municipalityInput} has not been profiled yet in the database.`,
        "Cannot determine participation requirement automatically.",
      ],
      next_steps: [
        "Check lokaleregelgeving.overheid.nl for this municipality's participation verordening.",
        "Apply national safe minimum (Art. 16.55 Omgevingswet) until profile is available.",
        "Flag this municipality for profiling.",
      ],
      policy_url: null,
      data_completeness: "none",
    };
  }

  // 3. Dispatch to architecture-specific handler
  switch (mun.architecture) {
    case "blanket_mandatory":
      return handleBlanketMandatory(mun, project);

    case "binary_list":
      return mun.id === "groningen"
        ? handleBinaryListGroningen(mun, project)
        : handleBinaryListZwolle(mun, project);

    case "scoring":
      return handleScoring(mun, project);

    case "designated_only":
      return handleDesignatedOnly(mun);

    case "explicit_opt_out":
      return handleExplicitOptOut(mun);

    case "scale_based":
      return handleScaleBased(mun, project);

    case "quickscan_intake":
      return handleQuickscanIntake(mun);

    case "broad_trigger":
      return handleBroadTrigger(mun, project);

    case "proportional_discretionary":
      return handleProportionalDiscretionary(mun);

    case "case_by_case":
      return handleCaseByCase(mun);

    case "limited_scope":
      return handleLimitedScope(mun);

    default:
      return {
        municipality: mun.municipality,
        required: "unknown",
        architecture: mun.architecture,
        documents_required: [],
        warnings: [
          `Architecture type '${mun.architecture}' not yet implemented in checker.`,
        ],
        next_steps: ["Manual review required for this municipality."],
        policy_url: mun.policy_url ?? null,
        data_completeness: mun.data_completeness,
      };
  }
}

/**
 * Run the checker against all 18 profiled municipalities for a given project.
 * Useful for: comparing requirements across cities, generating market-wide snapshots.
 */
export function checkAllMunicipalities(
  project: ProjectSpec
): Record<string, ParticipationResult> {
  const results: Record<string, ParticipationResult> = {};
  for (const mun of db.municipalities as any[]) {
    results[mun.id] = checkParticipationRequirement(mun.id, project);
  }
  return results;
}

// ─── Example Usage ────────────────────────────────────────────────────────────
/*

// Example 1: 20-unit housing project in Amsterdam
const result = checkParticipationRequirement("amsterdam", {
  type: "housing_new",
  housing_units: 20,
  building_height_meters: 18,
  location_type: "urban",
});
// → required: true, intensity: { level: 2, label: "Middelgrote gevolgen", ... }

// Example 2: Wind turbine in Groningen
const result2 = checkParticipationRequirement("groningen", {
  type: "renewable_energy",
  wind_turbine_count: 2,
  is_standalone_solar: false,
});
// → required: true (Category L: Renewable energy)

// Example 3: Small retail building in Leiden
const result3 = checkParticipationRequirement("leiden", {
  type: "commercial",
  commercial_floor_area_m2: 400,
});
// → required: false (explicit opt-out)

// Example 4: 3-unit housing renovation in Zwolle
const result4 = checkParticipationRequirement("zwolle", {
  type: "housing_renovation",
  housing_units: 3,
  building_height_meters: 8,
  location_type: "urban",
});
// → required: false (doesn't trigger any of the 8 threshold categories)

// Example 5: Scan all profiled municipalities for a 50-unit housing project
const allResults = checkAllMunicipalities({
  type: "housing_new",
  housing_units: 50,
  building_height_meters: 22,
  location_type: "urban",
});

*/
