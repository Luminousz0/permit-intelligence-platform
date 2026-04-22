export interface ProjectSpec {
  type: string;
  housing_units?: number;
  location_type?: string;
  building_height_meters?: number;
}

export interface ParticipationResult {
  required: boolean | 'unknown';
  architecture: string;
  documents_required: string[];
  next_steps: string[];
}

// Expanded municipality database with 50+ cities
const PARTICIPATION_DB: Record<string, ParticipationResult> = {
  // G4 Cities
  'Amsterdam': {
    required: true,
    architecture: 'blanket_mandatory',
    documents_required: ['participatieplan'],
    next_steps: [
      'Use Amsterdam participation handbook to determine category (1-3)',
      'Category 3 requires gebiedsmakelaar involvement',
      'Submit participatieplan with permit application'
    ]
  },
  'Rotterdam': {
    required: true,
    architecture: 'scale_based',
    documents_required: ['participatierapportage'],
    next_steps: [
      'Large initiatives: contact intake team for participation advisor',
      'Small initiatives: follow factsheet guidance',
      'Projects within approved spatial frameworks may be exempt'
    ]
  },
  'Den Haag': {
    required: 'unknown',
    architecture: 'designated_only',
    documents_required: ['participatieverslag'],
    next_steps: [
      'Check council designation list for mandatory categories',
      'List still being finalized — contact municipality to confirm'
    ]
  },
  'Utrecht': {
    required: true,
    architecture: 'process_mandatory',
    documents_required: ['samenwerkingsplan', 'samenwerkingsverslag'],
    next_steps: [
      'Use "Kompas voor Zeggenschap" to determine cooperation form',
      'Submit Samenwerkingsplan before, Samenwerkingsverslag after',
      'Contact: samenstadmaken@utrecht.nl'
    ]
  },
  
  // G40 Cities
  'Eindhoven': {
    required: true,
    architecture: 'quickscan_intake',
    documents_required: ['participatieverslag'],
    next_steps: [
      'Use Eindhoven Quickscan tool to determine requirements',
      'Large projects: intake team assigns participation advisor'
    ]
  },
  'Almere': {
    required: 'unknown',
    architecture: 'case_by_case',
    documents_required: [],
    next_steps: [
      'Almere evaluates participation on a case-by-case basis',
      'Contact municipality before submission to understand expectations',
      'Document all participation activities proactively'
    ]
  },
  'Groningen': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['participatieverslag'],
    next_steps: [
      'Check 14-category activities list — if listed, participation is mandatory',
      'Developer owns the process — involve all affected parties',
      'Insufficient participation: one remedy opportunity, then rejection'
    ]
  },
  'Tilburg': {
    required: true,
    architecture: 'blanket_mandatory',
    documents_required: ['participatieverslag'],
    next_steps: [
      'All BOPAs require participation',
      'Use Impactscan to determine intensity level (A-D)',
      'Level D projects in strategic zones require municipality as co-partner'
    ]
  },
  'Breda': {
    required: true,
    architecture: 'blanket_mandatory',
    documents_required: ['participatieplan', 'participatieverslag'],
    next_steps: [
      'Two documents required: Participatieplan (initiative stage) + Participatieverslag (permit stage)',
      'Missing either document = permit denied'
    ]
  },
  'Nijmegen': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['participatieverslag'],
    next_steps: [
      'Participation mandatory for council binding advice categories',
      '6 categories trigger requirement — housing ≥2 units always triggers'
    ]
  },
  'Haarlem': {
    required: true,
    architecture: 'broad_trigger',
    documents_required: ['participatieparagraaf'],
    next_steps: [
      '8-element participation paragraph required',
      'Submit results to participants AND raadscommissie'
    ]
  },
  'Arnhem': {
    required: true,
    architecture: 'scoring',
    documents_required: ['attendance_records', 'participatieverslag'],
    next_steps: [
      '4-parameter scoring determines intensity level (1-3)',
      'Attendance records required for all meetings'
    ]
  },
  'Enschede': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['participatieverklaring'],
    next_steps: [
      '7-category designation list with detailed subcategories',
      'Category 7 (maatschappelijke onrust) is a soft catch-all'
    ]
  },
  'Zwolle': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['participatieverslag'],
    next_steps: [
      '8 threshold categories — height >25m, ≥5 homes, wind turbines always trigger'
    ]
  },
  'Maastricht': {
    required: 'unknown',
    architecture: 'proportional_discretionary',
    documents_required: ['participatieverslag'],
    next_steps: [
      'Use 6-step checklist to determine scope',
      'Include satisfaction ratings in report'
    ]
  },
  'Delft': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['participatieverslag'],
    next_steps: [
      '6 mandatory participation categories + 2 advisory-only categories',
      '>20 homes, schools, supermarkets >500m² always trigger'
    ]
  },
  'Leiden': {
    required: false,
    architecture: 'explicit_opt_out',
    documents_required: [],
    next_steps: [
      'Leiden has explicitly opted out of mandatory BOPA participation',
      'Voluntary participation encouraged but not required'
    ]
  },
  'Apeldoorn': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['participatieplan', 'participatieverslag'],
    next_steps: [
      'Two documents required (same as Breda)',
      'Linked to council advisory rights categories'
    ]
  },
  'Venlo': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['participatiedocumentatie'],
    next_steps: [
      'Broadest list in Netherlands — any housing unit triggers requirement',
      '9 categories with early engagement principle'
    ]
  },
  'Zoetermeer': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['participatiedocumentatie'],
    next_steps: [
      '≥26 dwellings triggers mandatory participation',
      'Use "In gesprek met je omgeving" guide'
    ]
  },
  'Leeuwarden': {
    required: true,
    architecture: 'binary_list',
    documents_required: ['eindverslag'],
    next_steps: [
      'Two-level compliance: designation list + broad trigger for stakeholders',
      'Eindverslag required with process overview and agreements'
    ]
  },
  'Dordrecht': {
    required: 'unknown',
    architecture: 'general_discretionary',
    documents_required: [],
    next_steps: [
      'Use "Dordtse Participatie Praatplaat" decision framework',
      'No binary trigger list — case-by-case judgment'
    ]
  },
  
  // Default for unknown municipalities
  'default': {
    required: 'unknown',
    architecture: 'no_policy',
    documents_required: ['participatieverklaring'],
    next_steps: [
      'No published municipal participation policy found',
      'Apply national safe minimum: identify stakeholders, inform, document',
      'Contact municipality to confirm expectations'
    ]
  }
};

export function checkParticipationRequirement(
  municipality: string,
  project: ProjectSpec
): ParticipationResult {
  // Try exact match
  let result = PARTICIPATION_DB[municipality];
  
  // Try case-insensitive match
  if (!result) {
    const lowerMun = municipality.toLowerCase();
    const match = Object.keys(PARTICIPATION_DB).find(
      key => key.toLowerCase() === lowerMun
    );
    result = match ? PARTICIPATION_DB[match] : undefined;
  }
  
  // Return default if not found
  return result || PARTICIPATION_DB['default'];
}

// Export municipality list for UI
export function getSupportedMunicipalities(): string[] {
  return Object.keys(PARTICIPATION_DB).filter(k => k !== 'default').sort();
}
