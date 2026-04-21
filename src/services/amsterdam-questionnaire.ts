/**
 * Amsterdam Participation Questionnaire — Layer 3 / Priority 3
 * Permit Intelligence Platform
 *
 * Replicates Amsterdam's Participatiehandreiking (2022) scoring system as an
 * interactive questionnaire. Exact questions and thresholds sourced directly
 * from the official PDF: "Betrek de buurt bij uw initiatieven."
 *
 * Source PDF: Wiki/Sources/participatiehandreiking_betrek_de_buurt_bij_uw_initiatieven.pdf
 * Policy URL: https://lokaleregelgeving.overheid.nl/CVDR684242/1
 *
 * The questionnaire has exactly 4 questions. Each answer scores 1, 2, or 3 points.
 * Minimum score: 4 (all 1s). Maximum score: 12 (all 3s).
 * Override rule: if the initiative conflicts with the omgevingsplan → +1 category.
 *
 * Category thresholds:
 *   Score ≤ 4  → Category 1 — Beperkte gevolgen (Inform)
 *   Score 5–8  → Category 2 — Middelgrote gevolgen (Consult)
 *   Score 9–12 → Category 3 — Aanzienlijke gevolgen (Advise)
 *
 * Source: Amsterdam Aanwijzingsbesluit + Participatiehandreiking 2022 (Gemeente Amsterdam)
 *
 * Usage (programmatic):
 *   import { scoreAmsterdamQuestionnaire } from "./amsterdam-questionnaire";
 *   const result = scoreAmsterdamQuestionnaire(answers);
 *
 * Usage (CLI):
 *   npx ts-node amsterdam-questionnaire.ts
 */

// ─── Question Definitions ─────────────────────────────────────────────────────

/**
 * Each option maps exactly to one of the answer choices in the official
 * Participatiehandreiking questionnaire (Stap 1).
 */
export interface QuestionOption {
  id: string;
  label_nl: string;    // Exact Dutch label from the official document
  label_en: string;    // English translation
  points: number;
  examples?: string;   // Examples listed in the handreiking
}

export interface Question {
  id: keyof AmsterdamAnswers;
  question_nl: string;   // Exact Dutch wording from official document
  question_en: string;   // English translation
  note?: string;
  options: QuestionOption[];
}

/**
 * The 4 official questions from Amsterdam's Participatiehandreiking (2022).
 * Exact wording preserved from the source PDF.
 */
export const AMSTERDAM_QUESTIONS: Question[] = [
  {
    id: "initiative_type",
    question_nl: "Wat is het type/omvang van uw initiatief?",
    question_en: "What is the type/scale of your initiative?",
    note: "If your initiative combines housing + facilities, the heaviest criterion applies.",
    options: [
      {
        id: "A",
        label_nl: "Veelvoorkomende initiatieven met beperkte gevolgen",
        label_en: "Common initiatives with limited impact",
        points: 1,
        examples:
          "Muurdoorbraken, kozijn-/gevelwijzigingen, handelsreclame, dakterrassen, balkons, " +
          "dakuitbouwen, veranda's, buitentrappen, vergunningplichtige uitbouwen, woningsplitsen, " +
          "Airbnb/B&B, vervangen woonboten, kleinschalige kelders en koekoeken, " +
          "kleinschalige functiewijzigingen (bergingen→wonen, detailhandel→kantoor, " +
          "niet-woonfunctie→woonfunctie), interne wijzigingen (brandscheidingen, splitsen, samenvoegen)",
      },
      {
        id: "B",
        label_nl: "Initiatief met middelgrote gevolgen",
        label_en: "Initiative with moderate impact",
        points: 2,
        examples:
          "Ingrijpende functiewijzigingen (sportscholen, horeca, terrassen, scholen, " +
          "kinderdagverblijven), toevoegen extra bouwlagen/optoppingen, grootschalige kelderbouw, " +
          "nieuwe ligplaatsen, kleinschalige transformaties (meerdere maar beperkt aantal adressen), " +
          "sloop-/nieuwbouw van een hoofdgebouw met beperkte afwijkingen",
      },
      {
        id: "C",
        label_nl: "Initiatief met grote gevolgen",
        label_en: "Initiative with major impact",
        points: 3,
        examples:
          "Projecten/grootschalige ruimtelijke ontwikkelingen, grootschalige transformatie, " +
          "grootschalige sloop-nieuwbouw, grootschalige nieuwbouw",
      },
    ],
  },
  {
    id: "traffic_parking",
    question_nl: "Zorgt uw initiatief voor meer verkeer of parkeerdrukte?",
    question_en: "Does your initiative cause more traffic or parking pressure?",
    options: [
      {
        id: "1",
        label_nl: "(Bijna) niet",
        label_en: "(Almost) none",
        points: 1,
      },
      {
        id: "2",
        label_nl: "Meer verkeer en/of parkeerdrukte",
        label_en: "More traffic and/or parking pressure",
        points: 2,
      },
      {
        id: "3",
        label_nl: "Veel meer verkeer en/of parkeerdrukte",
        label_en: "Much more traffic and/or parking pressure",
        points: 3,
      },
    ],
  },
  {
    id: "green_space",
    question_nl: "Heeft uw initiatief gevolgen voor het groen?",
    question_en: "Does your initiative affect green space?",
    note: "Includes: felling/replanting trees, removing greenery, laying paths, playgrounds.",
    options: [
      {
        id: "1",
        label_nl: "(Bijna) niet",
        label_en: "(Almost) none",
        points: 1,
      },
      {
        id: "2",
        label_nl: "Gevolgen voor het groen",
        label_en: "Some impact on green space",
        points: 2,
      },
      {
        id: "3",
        label_nl: "Grote gevolgen voor het groen",
        label_en: "Major impact on green space",
        points: 3,
      },
    ],
  },
  {
    id: "neighbourhood_experience",
    question_nl: "Verandert uw initiatief de beleving van de wijk of buurt?",
    question_en: "Does your initiative change the experience of the neighbourhood?",
    note: "Includes: taller buildings, different street layout, more activity (e.g. terrace), noise nuisance, less sunlight.",
    options: [
      {
        id: "1",
        label_nl: "(Bijna) niet",
        label_en: "(Almost) no change",
        points: 1,
      },
      {
        id: "2",
        label_nl: "Verandering van de beleving van de wijk of buurt",
        label_en: "Change to the neighbourhood experience",
        points: 2,
      },
      {
        id: "3",
        label_nl: "Grote veranderingen van de beleving van de wijk of buurt",
        label_en: "Major changes to the neighbourhood experience",
        points: 3,
      },
    ],
  },
];

// ─── Answer & Result Types ────────────────────────────────────────────────────

export interface AmsterdamAnswers {
  /** Q1: Type/scale of initiative — A (1pt) | B (2pt) | C (3pt) */
  initiative_type: "A" | "B" | "C";
  /** Q2: Traffic/parking impact — 1 (1pt) | 2 (2pt) | 3 (3pt) */
  traffic_parking: "1" | "2" | "3";
  /** Q3: Green space impact — 1 (1pt) | 2 (2pt) | 3 (3pt) */
  green_space: "1" | "2" | "3";
  /** Q4: Neighbourhood experience change — 1 (1pt) | 2 (2pt) | 3 (3pt) */
  neighbourhood_experience: "1" | "2" | "3";
  /** Override: does the initiative conflict with the omgevingsplan? If true → +1 category */
  conflicts_with_omgevingsplan?: boolean;
}

export interface CategoryInfo {
  id: 1 | 2 | 3;
  label_nl: string;
  label_en: string;
  step2_label: string;       // The Stap 2 participation form required
  required_actions: string[];
  required_actions_detail: string;
  documents_required: string[];
  typical_duration: string;
  notes: string;
}

export interface AmsterdamScoringResult {
  municipality: "Amsterdam";
  required: true;
  total_points: number;
  min_points: 4;
  max_points: 12;
  breakdown: Array<{
    question_nl: string;
    question_en: string;
    answer_label_nl: string;
    answer_label_en: string;
    points: number;
  }>;
  /** Category before omgevingsplan override */
  raw_category: 1 | 2 | 3;
  /** Final category after applying override rule (if any) */
  final_category: 1 | 2 | 3;
  omgevingsplan_override_applied: boolean;
  category: CategoryInfo;
  warnings: string[];
  next_steps: string[];
  policy_url: string;
  source: string;
}

// ─── Category Definitions ─────────────────────────────────────────────────────

/**
 * Category definitions from Stap 2 of Amsterdam's Participatiehandreiking.
 * Source: exact text from official PDF.
 */
const CATEGORIES: Record<1 | 2 | 3, CategoryInfo> = {
  1: {
    id: 1,
    label_nl: "Beperkte gevolgen voor de fysieke leefomgeving",
    label_en: "Limited consequences for the physical environment",
    step2_label: "Informeren (Inform)",
    required_actions: [
      "Inform direct neighbours and immediate residents",
    ],
    required_actions_detail:
      "Inform direct buren en omwonenden of your project. " +
      "Methods: letter, email, or information boards (infoborden) at the project site. " +
      "Scope: direct neighbours and immediate residents only — not a broader public process.",
    documents_required: ["Participatieplan (submitted with permit application)"],
    typical_duration: "1–2 weeks",
    notes:
      "Lightest category — but not optional. You must inform and document. " +
      "The participatieplan must contain: who was involved, how, to what degree, and how objections were handled. " +
      "Results must be shared with both the municipality AND the stakeholders.",
  },
  2: {
    id: 2,
    label_nl: "Middelgrote gevolgen voor de fysieke leefomgeving",
    label_en: "Moderate consequences for the physical environment",
    step2_label: "Raadplegen (Consult)",
    required_actions: [
      "Gather reactions, ideas, and opinions from a broader group",
      "Include: direct neighbours, broader residents, and entrepreneurs in the area",
    ],
    required_actions_detail:
      "Raadplegen — go beyond informing, enter into consultation. " +
      "Involve not just direct neighbours but also broader residents (omwonenden) and " +
      "local entrepreneurs. Methods: online survey (online enquête) or information evening (informatieavond). " +
      "A gebiedsmakelaar can advise on approach.",
    documents_required: ["Participatieplan (submitted with permit application)"],
    typical_duration: "4–8 weeks",
    notes:
      "Standard category for most Amsterdam BOPAs. The participatieplan must demonstrate " +
      "genuine consultation — simply distributing a flyer is not sufficient at this level.",
  },
  3: {
    id: 3,
    label_nl: "Aanzienlijke gevolgen voor de fysieke leefomgeving",
    label_en: "Substantial consequences for the physical environment",
    step2_label: "Adviseren (Advise)",
    required_actions: [
      "Actively seek advice from a broad stakeholder group",
      "Include: omwonenden, (ver)huurders, kopers, ondernemers, and relevant authorities",
      "Relevant authorities: omgevingsdiensten, waterschappen (as applicable)",
      "Must involve gebiedsmakelaar early in the process",
      "If you deviate from advice received — you MUST motivate why",
    ],
    required_actions_detail:
      "Adviseren — the most intensive form. Actively seek input from a broad group including " +
      "residents, tenants, buyers, entrepreneurs, and relevant government bodies. " +
      "Methods: inspraakbijeenkomsten (public consultation sessions), brainstormsessies, " +
      "digital input platform. The gebiedsmakelaar must be involved early — not at the end. " +
      "Critical: if you do NOT follow advice received, you must explicitly document why.",
    documents_required: ["Participatieplan (extensive — submitted with permit application)"],
    typical_duration: "3–6 months",
    notes:
      "Highest category. A thin participatieplan at Category 3 = rejected as incomplete. " +
      "Budget significant time and cost for this process before submitting.",
  },
};

// ─── Scoring Logic ────────────────────────────────────────────────────────────

/**
 * Assign raw category based on total points.
 * Source: Amsterdam Participatiehandreiking (2022), Stap 1 scoring table.
 *
 *   Score = 4        → Category 1  (minimum possible score = all 1s = 1+1+1+1)
 *   Score 5–8        → Category 2
 *   Score 9–12       → Category 3  (maximum possible score = all 3s = 3+3+3+3)
 */
function assignRawCategory(totalPoints: number): 1 | 2 | 3 {
  if (totalPoints <= 4) return 1;
  if (totalPoints <= 8) return 2;
  return 3;
}

/**
 * Apply the omgevingsplan override rule.
 * If the initiative conflicts with the omgevingsplan → shifts up one category.
 * Category 1 → Category 2. Category 2 → Category 3. Category 3 stays at 3.
 */
function applyOverride(rawCategory: 1 | 2 | 3, conflictsWithOmgevingsplan: boolean): 1 | 2 | 3 {
  if (!conflictsWithOmgevingsplan) return rawCategory;
  if (rawCategory === 1) return 2;
  if (rawCategory === 2) return 3;
  return 3; // Already max
}

/**
 * Score the Amsterdam questionnaire given a set of answers.
 * Uses the exact 4-question structure from the official Participatiehandreiking.
 */
export function scoreAmsterdamQuestionnaire(
  answers: AmsterdamAnswers
): AmsterdamScoringResult {
  let totalPoints = 0;
  const breakdown: AmsterdamScoringResult["breakdown"] = [];

  for (const question of AMSTERDAM_QUESTIONS) {
    const selectedId = answers[question.id] as string;
    const option = question.options.find((o) => o.id === selectedId);

    if (!option) {
      throw new Error(
        `Invalid answer '${selectedId}' for question '${question.id}'. ` +
        `Valid options: ${question.options.map((o) => o.id).join(", ")}`
      );
    }

    totalPoints += option.points;
    breakdown.push({
      question_nl: question.question_nl,
      question_en: question.question_en,
      answer_label_nl: option.label_nl,
      answer_label_en: option.label_en,
      points: option.points,
    });
  }

  const rawCategory = assignRawCategory(totalPoints);
  const overrideApplied = !!answers.conflicts_with_omgevingsplan;
  const finalCategory = applyOverride(rawCategory, overrideApplied);
  const category = CATEGORIES[finalCategory];

  const warnings: string[] = [];

  // Boundary warnings
  if (totalPoints === 4) {
    warnings.push(
      "Score = 4 (the absolute minimum). Any increase in project scope could move you to Category 2."
    );
  }
  if (totalPoints === 8 || totalPoints === 9) {
    warnings.push(
      `Score ${totalPoints} is at or near the Category 2/3 boundary. ` +
      "Small changes in scope could shift the category. Review carefully."
    );
  }
  if (totalPoints === 5) {
    warnings.push(
      "Score = 5. Just one point above Category 1 threshold. Verify your answers against the exact question wording."
    );
  }
  if (overrideApplied && rawCategory !== finalCategory) {
    warnings.push(
      `Omgevingsplan conflict rule applied: Category ${rawCategory} → Category ${finalCategory}. ` +
      "This is a hard override — category cannot be reduced by adjusting scoring answers."
    );
  }
  if (finalCategory === 3) {
    warnings.push(
      "Category 3 requires a substantial participation process. Start before the design is finalised — " +
      "participation at this level takes 3–6 months. A gebiedsmakelaar must be involved early."
    );
  }

  const next_steps: string[] = [
    `Participation is MANDATORY for all BOPAs in Amsterdam — no exceptions.`,
    `Total score: ${totalPoints}/12 points.`,
    overrideApplied && rawCategory !== finalCategory
      ? `Category upgraded from ${rawCategory} to ${finalCategory} due to conflict with the omgevingsplan.`
      : "",
    `Final category: ${finalCategory} — ${category.label_nl} (${category.step2_label}).`,
    `Required participation form: ${category.step2_label}.`,
    `Required actions: ${category.required_actions.join("; ")}.`,
    `Typical process duration: ${category.typical_duration}.`,
    `Document required: ${category.documents_required.join(", ")}.`,
    `The participatieplan must contain: who was involved, how, to what degree, how objections were handled.`,
    `Submit the participatieplan WITH your BOPA application.`,
    `Non-compliance: application rejected as incomplete before substantive review.`,
    `Official policy: https://lokaleregelgeving.overheid.nl/CVDR684242/1`,
  ].filter(Boolean);

  return {
    municipality: "Amsterdam",
    required: true,
    total_points: totalPoints,
    min_points: 4,
    max_points: 12,
    breakdown,
    raw_category: rawCategory,
    final_category: finalCategory,
    omgevingsplan_override_applied: overrideApplied,
    category,
    warnings,
    next_steps,
    policy_url: "https://lokaleregelgeving.overheid.nl/CVDR684242/1",
    source: "Participatiehandreiking 'Betrek de buurt bij uw initiatieven' — Gemeente Amsterdam (2022)",
  };
}

// ─── Pretty Printer ───────────────────────────────────────────────────────────

export function formatAmsterdamResult(result: AmsterdamScoringResult): string {
  const lines: string[] = [];
  const sep = "─".repeat(60);

  lines.push(sep);
  lines.push("AMSTERDAM PARTICIPATION QUESTIONNAIRE — RESULT");
  lines.push("Source: Participatiehandreiking (Gemeente Amsterdam, 2022)");
  lines.push(sep);
  lines.push("");

  lines.push("SCORE BREAKDOWN");
  lines.push("");
  for (const item of result.breakdown) {
    const bar = "█".repeat(item.points) + "░".repeat(Math.max(0, 3 - item.points));
    lines.push(`  ${bar} ${item.points} pts — ${item.question_nl}`);
    lines.push(`         Answer: ${item.answer_label_nl} (${item.answer_label_en})`);
    lines.push("");
  }

  lines.push(`  TOTAL: ${result.total_points} / ${result.max_points} points (min: ${result.min_points})`);
  lines.push("");

  if (result.omgevingsplan_override_applied) {
    lines.push(`  ⚠️  Omgevingsplan override: raw Category ${result.raw_category} → final Category ${result.final_category}`);
    lines.push("");
  }

  lines.push(sep);
  lines.push("");

  const cat = result.category;
  lines.push(`CATEGORY ASSIGNED: ${cat.id} — ${cat.label_nl}`);
  lines.push(`                   (${cat.label_en})`);
  lines.push(`Participation form: ${cat.step2_label}`);
  lines.push("");
  lines.push(`Typical process duration: ${cat.typical_duration}`);
  lines.push("");

  lines.push("WHAT YOU MUST DO:");
  lines.push("");
  for (const action of cat.required_actions) {
    lines.push(`  • ${action}`);
  }
  lines.push("");
  lines.push(cat.required_actions_detail);
  lines.push("");

  lines.push("DOCUMENT REQUIRED:");
  lines.push(`  • ${cat.documents_required.join(", ")}`);
  lines.push("");

  lines.push("NOTES:");
  lines.push(`  ${cat.notes}`);
  lines.push("");

  if (result.warnings.length > 0) {
    lines.push("WARNINGS:");
    for (const w of result.warnings) {
      lines.push(`  ⚠  ${w}`);
    }
    lines.push("");
  }

  lines.push("NEXT STEPS:");
  for (const step of result.next_steps) {
    if (step) lines.push(`  → ${step}`);
  }
  lines.push("");
  lines.push(`Policy: ${result.policy_url}`);
  lines.push(`Source: ${result.source}`);
  lines.push(sep);

  return lines.join("\n");
}

// ─── CLI Runner ───────────────────────────────────────────────────────────────

/**
 * Interactive CLI questionnaire — runs in the terminal, prompts for answers,
 * prints the result. Run with: npx ts-node amsterdam-questionnaire.ts
 *
 * For a browser/UI context: use scoreAmsterdamQuestionnaire() directly
 * with answers collected via your UI form.
 */
async function runCLI(): Promise<void> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  console.log("\n" + "═".repeat(60));
  console.log("AMSTERDAM PARTICIPATION QUESTIONNAIRE");
  console.log("Participatiehandreiking — Gemeente Amsterdam (2022)");
  console.log("═".repeat(60));
  console.log("");
  console.log("Amsterdam requires participation for ALL BOPA applications.");
  console.log("Answer 4 questions to determine which category (1/2/3) applies.");
  console.log("Minimum score: 4 pts (all minimums) → Category 1");
  console.log("Maximum score: 12 pts (all maximums) → Category 3");
  console.log("");

  const answers: Partial<AmsterdamAnswers> = {};

  for (const question of AMSTERDAM_QUESTIONS) {
    console.log("─".repeat(50));
    console.log(`Q: ${question.question_nl}`);
    console.log(`   ${question.question_en}`);
    if (question.note) {
      console.log(`   Note: ${question.note}`);
    }
    console.log("");

    for (let i = 0; i < question.options.length; i++) {
      const opt = question.options[i];
      console.log(`  ${i + 1}. [${opt.points} pt${opt.points > 1 ? "s" : ""}] ${opt.label_nl}`);
      console.log(`           ${opt.label_en}`);
      if (opt.examples) {
        const preview = opt.examples.length > 80 ? opt.examples.slice(0, 80) + "..." : opt.examples;
        console.log(`           Examples: ${preview}`);
      }
    }

    let choice: number | null = null;
    while (choice === null || choice < 1 || choice > question.options.length) {
      const raw = await ask(`\nEnter choice (1–${question.options.length}): `);
      const parsed = parseInt(raw.trim(), 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= question.options.length) {
        choice = parsed;
      } else {
        console.log(`  Please enter a number between 1 and ${question.options.length}.`);
      }
    }

    answers[question.id] = question.options[choice - 1].id as any;
    console.log(`  ✓ ${question.options[choice - 1].points} pt${question.options[choice - 1].points > 1 ? "s" : ""} — ${question.options[choice - 1].label_nl}`);
    console.log("");
  }

  // Override question
  console.log("─".repeat(50));
  console.log("Override Rule: Conflict with Omgevingsplan");
  console.log("If your initiative is in strijd met het omgevingsplan (conflicts with the");
  console.log("municipal environmental plan), the category automatically shifts up by one.");
  const overrideRaw = await ask("Does your initiative conflict with the omgevingsplan? (y/n, or 'unknown'): ");
  const overrideTrimmed = overrideRaw.trim().toLowerCase();
  answers.conflicts_with_omgevingsplan =
    overrideTrimmed === "y" || overrideTrimmed === "yes" ? true : false;

  rl.close();

  const result = scoreAmsterdamQuestionnaire(answers as AmsterdamAnswers);
  console.log(formatAmsterdamResult(result));
}

// ─── Example Usage ────────────────────────────────────────────────────────────
/*

// Example 1: Large residential development in Amsterdam
const result1 = scoreAmsterdamQuestionnaire({
  initiative_type: "C",          // Grootschalige nieuwbouw → 3 pts
  traffic_parking: "2",          // More traffic → 2 pts
  green_space: "1",              // (Almost) no green space impact → 1 pt
  neighbourhood_experience: "3", // Major neighbourhood change → 3 pts
  // Total: 9 pts → Category 3 — Aanzienlijke gevolgen (Adviseren)
});
console.log(formatAmsterdamResult(result1));

// Example 2: Small apartment conversion
const result2 = scoreAmsterdamQuestionnaire({
  initiative_type: "A",          // Woningsplitsen → 1 pt
  traffic_parking: "1",          // (Almost) none → 1 pt
  green_space: "1",              // (Almost) none → 1 pt
  neighbourhood_experience: "1", // (Almost) no change → 1 pt
  // Total: 4 pts → Category 1 — Beperkte gevolgen (Informeren)
});

// Example 3: Medium project with omgevingsplan conflict (triggers override)
const result3 = scoreAmsterdamQuestionnaire({
  initiative_type: "B",          // Ingrijpende functiewijziging → 2 pts
  traffic_parking: "2",          // More traffic → 2 pts
  green_space: "1",              // (Almost) none → 1 pt
  neighbourhood_experience: "1", // (Almost) no change → 1 pt
  conflicts_with_omgevingsplan: true,
  // Total: 6 pts → raw Category 2, override → final Category 3
});

*/

// Run CLI if executed directly
if (require.main === module) {
  runCLI().catch(console.error);
}
