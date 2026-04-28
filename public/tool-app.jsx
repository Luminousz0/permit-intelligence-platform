// Reference Tool — full 3-step flow: Locate (PDOK) → Classify → Document

const {
  useState:   useStateT,
  useMemo:    useMemoT,
  useEffect:  useEffectT,
  useRef:     useRefT,
  useCallback: useCallbackT,
} = React;

// ── PDOK name normalisation (PDOK returns official names that differ from ours) ──
const PDOK_NAME_MAP = {
  "'s-gravenhage": "Den Haag",
  "s-gravenhage":  "Den Haag",
  "haarlemmermeer": null,         // not in our DB yet
  "gemeente amsterdam": "Amsterdam",
};
function normalizeMuniName(raw) {
  if (!raw) return "";
  const key = raw.toLowerCase().trim();
  if (key in PDOK_NAME_MAP) return PDOK_NAME_MAP[key] || "";
  // Capitalise first letter, lowercase rest
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

// ── PDOK Locatieserver suggest ───────────────────────────────────────────────
async function pdokSuggest(query) {
  if (!query || query.length < 3) return [];
  try {
    const url =
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free` +
      `?q=${encodeURIComponent(query)}&rows=6&fl=weergavenaam,gemeentenaam,type`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response?.docs || []).filter(d => d.gemeentenaam);
  } catch {
    return [];
  }
}

// ── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [dv, setDv] = useStateT(value);
  useEffectT(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Template generator ────────────────────────────────────────────────────────
function generateParticipatieverslag(muni, muniData, projectType, units) {
  const typeLabels = {
    residential:    "Woningbouw",
    commercial:     "Commercieel vastgoed",
    institutional:  "Maatschappelijke voorziening",
    infrastructure: "Infrastructuur",
  };
  const typeLabel = typeLabels[projectType] || projectType;
  const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const docsSection = muniData.documents
    .map((d, i) => `\n${i + 1}. ${d.title}\n   ${d.desc}\n\n   [INVULLEN: Voeg hier de relevante documentatie in]\n`)
    .join("");

  return `PARTICIPATIEVERSLAG
Conform ${muniData.framework}-beleid van gemeente ${muni}
Bronreferentie: ${muniData.cvdr} | Bijgewerkt: ${muniData.updated}
Gegenereerd: ${today}

══════════════════════════════════════════════════════════
PROJECTGEGEVENS
══════════════════════════════════════════════════════════

Projectnaam:        [INVULLEN]
Projectadres:       [INVULLEN]
Gemeente:           ${muni}
Provincie:          ${muniData.province}
Projecttype:        ${typeLabel}${units ? `\nAantal eenheden:    ${units}` : ""}
Aanvrager:          [INVULLEN: naam + organisatie]
Contactpersoon:     [INVULLEN]
Datum aanvraag:     [INVULLEN]

══════════════════════════════════════════════════════════
PARTICIPATIEPLICHT
══════════════════════════════════════════════════════════

Beleidsbenadering:  ${muniData.framework}
Status:             ${muniData.statusLabel}
Trigger:            ${muniData.trigger}
Beoordelingsmethode: ${muniData.method}

Doorlooptijd procedure:
${muniData.timeline}

══════════════════════════════════════════════════════════
SECTIE 1 — BETROKKEN BELANGHEBBENDEN
══════════════════════════════════════════════════════════

1.1 Overzicht belanghebbenden

Naam / Organisatie | Rol / Belang | Datum eerste contact | Reactie
[INVULLEN]         |              |                      |
[INVULLEN]         |              |                      |

1.2 Wijze van identificatie belanghebbenden
[INVULLEN: Beschrijf hoe u de kring van betrokkenen heeft bepaald]

══════════════════════════════════════════════════════════
SECTIE 2 — PARTICIPATIEPROCES
══════════════════════════════════════════════════════════

2.1 Aankondiging
Datum:              [INVULLEN]
Methode:            [INVULLEN: bijv. bewonersbrief, website, advertentie]
Bereik:             [INVULLEN: aantal ontvangers / adresgebied]

2.2 Bijeenkomsten en consultaties

Datum | Type (info/inspraak/overleg) | Locatie | Aanwezig | Samenvatting
[INVULLEN] |                         |         |          |

2.3 Overige communicatie
[INVULLEN: e-mails, telefoon, online consultatie, enz.]

══════════════════════════════════════════════════════════
SECTIE 3 — REACTIES EN UITKOMSTEN
══════════════════════════════════════════════════════════

3.1 Overzicht ontvangen reacties

Nr. | Indiener | Samenvatting bezwaar/opmerking | Categorie
1   |          |                                | [bezwaar / vraag / steun / neutraal]
2   |          |                                |

3.2 Verwerking reacties

Nr. | Reactie verwerkt in plan? | Toelichting
1   | [ja/nee/gedeeltelijk]     |
2   |                           |

══════════════════════════════════════════════════════════
SECTIE 4 — VERWERKING IN HET PLAN
══════════════════════════════════════════════════════════

[INVULLEN: Beschrijf welke aanpassingen aan het project zijn gedaan n.a.v. participatie]

══════════════════════════════════════════════════════════
VEREISTE DOCUMENTATIE (${muni})
══════════════════════════════════════════════════════════
${docsSection}
══════════════════════════════════════════════════════════
CONTACTGEGEVENS GEMEENTE
══════════════════════════════════════════════════════════

Omgevingsloket ${muni}
E-mail: ${muniData.contact}
Bronreferentie: lokaleregelgeving.overheid.nl — ${muniData.cvdr}

══════════════════════════════════════════════════════════
DISCLAIMER
══════════════════════════════════════════════════════════

Dit template is gebaseerd op gepubliceerd beleid per ${muniData.updated}.
Bevestig actuele vereisten bij de gemeente vóór indiening.
Gegenereerd door Permit Intelligence — permitintelligence.nl
`;
}

function downloadTemplate(content, filename) {
  const blob = new Blob([content], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Full 28-municipality database ─────────────────────────────────────────────
const FULL_MUNI_DATA = {
  Almere: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "≥4 woningen of >500 m²", cvdr: "CVDR685432", updated: "12 januari 2026",
    province: "Flevoland", population: "228.000", contact: "omgevingsloket@almere.nl",
    documents: [
      { title: "Participatieverslag (verplicht)", desc: "Standaard format gemeente Almere; min. 4 secties: belanghebbenden, proces, uitkomsten, verwerking." },
      { title: "Participatieplan (vooraf)", desc: "Optioneel maar aanbevolen voor projecten >10 woningen." },
      { title: "Bewijsstukken", desc: "Notulen, e-mailcorrespondentie, foto's van bijeenkomsten." },
    ],
    method: "Beoordeling op compleetheid; geen inhoudelijke toets.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Amsterdam: {
    framework: "Impact-scoring", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Impactscore ≥7 punten", cvdr: "CVDR701294", updated: "3 maart 2026",
    province: "Noord-Holland", population: "920.000", contact: "omgeving@amsterdam.nl",
    documents: [
      { title: "Impact-assessment", desc: "Verplicht puntenformulier; bepaalt of participatie verplicht is." },
      { title: "Participatieverslag (model gemeente)", desc: "Verplicht model met 7 secties, incl. omgang met negatieve reacties." },
      { title: "Verklaring van burgerschap", desc: "Bewijs van betrokkenheid van direct omwonenden (≤200m)." },
    ],
    method: "Inhoudelijke beoordeling; gemeente kan om aanvullende participatie vragen.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Rotterdam: {
    framework: "Beoordelingsruimte", status: "discretionary", statusLabel: "Beoordelingsruimte",
    trigger: "Per geval beoordeeld", cvdr: "CVDR698117", updated: "18 februari 2026",
    province: "Zuid-Holland", population: "656.000", contact: "omgevingsloket@rotterdam.nl",
    documents: [
      { title: "Vooroverleg-aanvraag", desc: "Verplicht vooroverleg; gemeente bepaalt of participatie nodig is." },
      { title: "Participatieverslag (vrij format)", desc: "Indien gemeente participatie vereist; vrij format met inhoudelijke richtlijnen." },
    ],
    method: "Pre-beoordeling: gemeente bepaalt vereisten voorafgaand aan formele aanvraag.",
    timeline: "Vooroverleg 4–6 weken; daarna reguliere procedure",
  },
  Utrecht: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Woningbouw ≥3 eenheden", cvdr: "CVDR692058", updated: "27 januari 2026",
    province: "Utrecht", population: "367.000", contact: "omgevingsloket@utrecht.nl",
    documents: [
      { title: "Participatieverslag (model)", desc: "Verplicht stadsmodel; gestructureerd in 5 secties." },
      { title: "Bewonersbrief (concept)", desc: "Verplicht voor woningbouw; concept moet bij aanvraag." },
    ],
    method: "Beoordeling op compleetheid + procesconformiteit.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  "Den Haag": {
    framework: "Procesgebaseerd", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Alle BOPA-aanvragen", cvdr: "CVDR687744", updated: "5 maart 2026",
    province: "Zuid-Holland", population: "560.000", contact: "omgevingsloket@denhaag.nl",
    documents: [
      { title: "Stappenplan-verslag", desc: "Verplicht 5-stappen proces: aankondiging, dialoog, terugkoppeling, verwerking, eindverslag." },
      { title: "Tijdlijn-bijlage", desc: "Datum-gestempelde tijdlijn van alle participatie-momenten." },
    ],
    method: "Procesconformiteit; gemeente toetst op naleving stappen.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Eindhoven: {
    framework: "Impact-scoring", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Impact + omvang gecombineerd", cvdr: "CVDR690225", updated: "14 februari 2026",
    province: "Noord-Brabant", population: "243.000", contact: "omgeving@eindhoven.nl",
    documents: [
      { title: "Impactscore-formulier", desc: "Verplicht; combineert hoogte, m², omwonenden, milieu-effect." },
      { title: "Participatieverslag (model)", desc: "Verplicht stadsmodel indien score boven drempel." },
    ],
    method: "Inhoudelijke beoordeling op uitkomsten en proces.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Groningen: {
    framework: "Vrijwillig + disclosure", status: "voluntary", statusLabel: "Vrijwillig",
    trigger: "Aanbevolen, niet vereist", cvdr: "CVDR683910", updated: "8 december 2025",
    province: "Groningen", population: "234.000", contact: "omgevingsloket@groningen.nl",
    documents: [
      { title: "Disclosure-verklaring", desc: "Verplicht: vermeld of en hoe participatie heeft plaatsgevonden, ook als 'geen'." },
    ],
    method: "Lichtere lat; geen inhoudelijke toets, maar disclosure-plicht.",
    timeline: "8 weken reguliere procedure",
  },
  Tilburg: {
    framework: "Beoordelingsruimte", status: "discretionary", statusLabel: "Beoordelingsruimte",
    trigger: "Per geval beoordeeld", cvdr: "CVDR691803", updated: "21 januari 2026",
    province: "Noord-Brabant", population: "227.000", contact: "omgeving@tilburg.nl",
    documents: [
      { title: "Vooroverleg-rapportage", desc: "Vooroverleg verplicht; gemeente bepaalt vervolg-vereisten." },
    ],
    method: "Pre-beoordeling.",
    timeline: "Vooroverleg 4–6 weken; daarna reguliere procedure",
  },
  Breda: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "≥5 woningen of >750 m²", cvdr: "CVDR694201", updated: "9 februari 2026",
    province: "Noord-Brabant", population: "185.000", contact: "omgevingsloket@breda.nl",
    documents: [
      { title: "Participatieverslag (model Breda)", desc: "Verplicht gemeentemodel; minimaal 4 onderdelen: stakeholders, aanpak, reacties, verwerking." },
      { title: "Bewijsstukken participatieproces", desc: "Correspondentie, notulen, foto-impressie bijeenkomsten." },
    ],
    method: "Beoordeling op compleetheid; gestandaardiseerd format vereist.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Nijmegen: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Woningbouw ≥4 eenheden", cvdr: "CVDR689553", updated: "15 januari 2026",
    province: "Gelderland", population: "180.000", contact: "omgevingsloket@nijmegen.nl",
    documents: [
      { title: "Participatieverslag (Nijmegen-format)", desc: "Verplicht format met procesoverzicht, reactielog en plan-aanpassingen." },
      { title: "Omgevingsdialoog-verslag", desc: "Specifiek voor grotere projecten; beschrijft directe burendialoog." },
    ],
    method: "Beoordeling op volledigheid van het participatieproces.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Haarlem: {
    framework: "Procesgebaseerd", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Alle BOPA-aanvragen", cvdr: "CVDR695812", updated: "22 januari 2026",
    province: "Noord-Holland", population: "163.000", contact: "omgevingsloket@haarlem.nl",
    documents: [
      { title: "Participatieverslag (Haarlem-format)", desc: "Verplicht format met tijdlijn, stakeholderslijst en reactieoverzicht." },
      { title: "Aankondigingsbrief (concept)", desc: "Concept bewonersbrief die aangeeft hoe omwonenden zijn geïnformeerd." },
    ],
    method: "Procesconformiteit; gemeente toetst naleving participatiestappen.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Arnhem: {
    framework: "Beoordelingsruimte", status: "discretionary", statusLabel: "Beoordelingsruimte",
    trigger: "Per geval beoordeeld", cvdr: "CVDR688402", updated: "11 december 2025",
    province: "Gelderland", population: "162.000", contact: "omgevingsloket@arnhem.nl",
    documents: [
      { title: "Vooroverleg-verslag", desc: "Gemeente beoordeelt in vooroverleg welke participatie-eisen van toepassing zijn." },
    ],
    method: "Pre-beoordeling per project; geen vaste drempelwaarden.",
    timeline: "Vooroverleg 4–6 weken; daarna reguliere procedure",
  },
  Zwolle: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "≥3 woningen of >500 m²", cvdr: "CVDR693147", updated: "19 januari 2026",
    province: "Overijssel", population: "130.000", contact: "omgevingsloket@zwolle.nl",
    documents: [
      { title: "Participatieverslag (Zwolle-format)", desc: "Verplicht format; minimaal: omschrijving proces, reacties omwonenden en verwerking." },
    ],
    method: "Beoordeling op compleetheid van verslag.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Enschede: {
    framework: "Vrijwillig + disclosure", status: "voluntary", statusLabel: "Vrijwillig",
    trigger: "Aanbevolen, niet vereist", cvdr: "CVDR686720", updated: "3 november 2025",
    province: "Overijssel", population: "158.000", contact: "omgevingsloket@enschede.nl",
    documents: [
      { title: "Disclosure-verklaring participatie", desc: "Verplicht: verklaar of en hoe participatie heeft plaatsgevonden." },
    ],
    method: "Lichtere disclosure-plicht; geen vaste proceseis.",
    timeline: "8 weken reguliere procedure",
  },
  Apeldoorn: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Woningbouw ≥5 eenheden", cvdr: "CVDR697034", updated: "28 januari 2026",
    province: "Gelderland", population: "165.000", contact: "omgevingsloket@apeldoorn.nl",
    documents: [
      { title: "Participatieverslag", desc: "Verplicht; beschrijft aanpak, betrokkenen, resultaten en verwerking in plan." },
      { title: "Reactieoverzicht", desc: "Tabel van ontvangen reacties met categorie en verwerking." },
    ],
    method: "Beoordeling op volledigheid participatiedocumentatie.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Leiden: {
    framework: "Impact-scoring", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Impactscore ≥5 punten", cvdr: "CVDR699281", updated: "7 februari 2026",
    province: "Zuid-Holland", population: "124.000", contact: "omgevingsloket@leiden.nl",
    documents: [
      { title: "Impactscore-formulier", desc: "Verplicht; bepaalt op basis van omvang en locatie of participatie verplicht is." },
      { title: "Participatieverslag (Leiden-format)", desc: "Verplicht als impactscore ≥5; stadsmodel met 5 secties." },
    ],
    method: "Inhoudelijke beoordeling van participatieproces en -resultaten.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Maastricht: {
    framework: "Procesgebaseerd", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Alle BOPA-aanvragen", cvdr: "CVDR691405", updated: "16 januari 2026",
    province: "Limburg", population: "121.000", contact: "omgevingsloket@maastricht.nl",
    documents: [
      { title: "Participatieverslag (Maastricht-format)", desc: "Verplicht format met 6 stappen: voorbereiding t/m eindrapportage." },
      { title: "Betrokkenheidsverklaring", desc: "Verplicht voor projecten nabij beschermd stadsgezicht." },
    ],
    method: "Procesconformiteit; strakke stappen-eis.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Dordrecht: {
    framework: "Beoordelingsruimte", status: "discretionary", statusLabel: "Beoordelingsruimte",
    trigger: "Per geval beoordeeld", cvdr: "CVDR686903", updated: "4 december 2025",
    province: "Zuid-Holland", population: "119.000", contact: "omgevingsloket@dordrecht.nl",
    documents: [
      { title: "Vooroverleg-aanvraag", desc: "Vooroverleg verplicht; gemeente bepaalt participatievereisten per project." },
    ],
    method: "Pre-beoordeling per project.",
    timeline: "Vooroverleg 4–6 weken; daarna reguliere procedure",
  },
  Zoetermeer: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "≥3 woningen of >400 m²", cvdr: "CVDR693740", updated: "23 januari 2026",
    province: "Zuid-Holland", population: "125.000", contact: "omgevingsloket@zoetermeer.nl",
    documents: [
      { title: "Participatieverslag", desc: "Verplicht; minimaal 3 secties: aanpak, reacties, verwerking." },
    ],
    method: "Beoordeling op compleetheid.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Amersfoort: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Woningbouw ≥4 eenheden", cvdr: "CVDR695017", updated: "30 januari 2026",
    province: "Utrecht", population: "160.000", contact: "omgevingsloket@amersfoort.nl",
    documents: [
      { title: "Participatieverslag (Amersfoort-format)", desc: "Verplicht stadsmodel; beschrijft inspraakmomenten, reacties en plan-wijzigingen." },
      { title: "Bewonersbrief", desc: "Concept brief waarmee omwonenden zijn uitgenodigd." },
    ],
    method: "Beoordeling op volledigheid en procesconformiteit.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Delft: {
    framework: "Procesgebaseerd", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Alle BOPA-aanvragen", cvdr: "CVDR688654", updated: "10 februari 2026",
    province: "Zuid-Holland", population: "103.000", contact: "omgevingsloket@delft.nl",
    documents: [
      { title: "Participatieverslag (Delft-format)", desc: "Verplicht; 5 stappen: aankondiging, inspraak, verwerking, terugkoppeling, eindverslag." },
    ],
    method: "Procesconformiteit; strakke documentatie-eis per stap.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Westland: {
    framework: "Beoordelingsruimte", status: "discretionary", statusLabel: "Beoordelingsruimte",
    trigger: "Per geval beoordeeld", cvdr: "CVDR687291", updated: "18 november 2025",
    province: "Zuid-Holland", population: "113.000", contact: "omgevingsloket@gemeentewestland.nl",
    documents: [
      { title: "Vooroverleg-verslag", desc: "Gemeente bepaalt in vooroverleg welke participatie-documentatie vereist is." },
    ],
    method: "Pre-beoordeling; sterk agrarisch gebied — vereisten case-by-case.",
    timeline: "Vooroverleg 4–6 weken; daarna reguliere procedure",
  },
  Emmen: {
    framework: "Vrijwillig + disclosure", status: "voluntary", statusLabel: "Vrijwillig",
    trigger: "Aanbevolen, niet vereist", cvdr: "CVDR684108", updated: "15 oktober 2025",
    province: "Drenthe", population: "106.000", contact: "omgevingsloket@emmen.nl",
    documents: [
      { title: "Disclosure-verklaring", desc: "Verplicht: verklaar hoe participatie is vormgegeven of waarom niet." },
    ],
    method: "Disclosure-plicht; geen vaste proceseisen.",
    timeline: "8 weken reguliere procedure",
  },
  Deventer: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "≥3 woningen of commercieel >1.000 m²", cvdr: "CVDR692876", updated: "17 januari 2026",
    province: "Overijssel", population: "101.000", contact: "omgevingsloket@deventer.nl",
    documents: [
      { title: "Participatieverslag", desc: "Verplicht; inclusief overzicht betrokkenen, methode en reactieverwerking." },
    ],
    method: "Beoordeling op compleetheid.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  "Sittard-Geleen": {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Woningbouw ≥3 eenheden", cvdr: "CVDR690612", updated: "6 januari 2026",
    province: "Limburg", population: "93.000", contact: "omgevingsloket@sittard-geleen.nl",
    documents: [
      { title: "Participatieverslag", desc: "Verplicht format; 4 onderdelen: stakeholders, aanpak, resultaten, verwerking." },
    ],
    method: "Beoordeling op volledigheid.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Leeuwarden: {
    framework: "Beoordelingsruimte", status: "discretionary", statusLabel: "Beoordelingsruimte",
    trigger: "Per geval beoordeeld", cvdr: "CVDR687834", updated: "29 november 2025",
    province: "Friesland", population: "123.000", contact: "omgevingsloket@leeuwarden.nl",
    documents: [
      { title: "Vooroverleg-aanvraag", desc: "Vooroverleg verplicht voor BOPA; gemeente bepaalt participatievereisten." },
    ],
    method: "Pre-beoordeling; vereisten afhankelijk van project en locatie.",
    timeline: "Vooroverleg 4–6 weken; daarna reguliere procedure",
  },
  Venlo: {
    framework: "Activiteitenlijst", status: "mandatory", statusLabel: "Verplicht",
    trigger: "≥4 woningen of >500 m²", cvdr: "CVDR693481", updated: "20 januari 2026",
    province: "Limburg", population: "101.000", contact: "omgevingsloket@venlo.nl",
    documents: [
      { title: "Participatieverslag (Venlo-format)", desc: "Verplicht; beschrijft aanpak, betrokkenen, reacties en verwerking." },
    ],
    method: "Beoordeling op compleetheid.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Zaanstad: {
    framework: "Impact-scoring", status: "mandatory", statusLabel: "Verplicht",
    trigger: "Impactscore ≥6 punten", cvdr: "CVDR696250", updated: "4 februari 2026",
    province: "Noord-Holland", population: "163.000", contact: "omgevingsloket@zaanstad.nl",
    documents: [
      { title: "Impactscore-formulier", desc: "Verplicht; bepaalt of participatie verplicht is op basis van omvang en locatie." },
      { title: "Participatieverslag (model Zaanstad)", desc: "Verplicht als score ≥6; stadsmodel met 5 secties." },
    ],
    method: "Inhoudelijke beoordeling van participatieproces en -resultaten.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
};

const MUNI_LIST = Object.keys(FULL_MUNI_DATA).sort((a, b) => a.localeCompare(b, "nl"));

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = [
    { n: "01", label: "Lokaliseer" },
    { n: "02", label: "Classificeer" },
    { n: "03", label: "Documenteer" },
  ];
  return (
    <div className="tool-step-indicator">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`tsi-item ${step === i + 1 ? "tsi-active" : step > i + 1 ? "tsi-done" : ""}`}>
            <span className="tsi-n">{step > i + 1 ? "✓" : s.n}</span>
            <span className="tsi-label">{s.label}</span>
          </div>
          {i < 2 && <span className="tsi-arrow">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── PDOK address input ────────────────────────────────────────────────────────
function AddressSearch({ onMuniDetected, lang }) {
  const [address, setAddress]       = useStateT("");
  const [suggestions, setSuggestions] = useStateT([]);
  const [loading, setLoading]       = useStateT(false);
  const [detectedMuni, setDetectedMuni] = useStateT(null);
  const [showDrop, setShowDrop]     = useStateT(false);
  const wrapRef = useRefT(null);

  const debouncedAddress = useDebounce(address, 320);

  useEffectT(() => {
    if (!debouncedAddress || debouncedAddress.length < 3) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    let active = true;
    setLoading(true);
    pdokSuggest(debouncedAddress).then(docs => {
      if (!active) return;
      setSuggestions(docs);
      setShowDrop(docs.length > 0);
      setLoading(false);
    });
    return () => { active = false; };
  }, [debouncedAddress]);

  // Close dropdown on outside click
  useEffectT(() => {
    function onClickOut(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false);
    }
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  function pickSuggestion(doc) {
    const raw = doc.gemeentenaam || "";
    const normalized = normalizeMuniName(raw);
    // Find best match in FULL_MUNI_DATA
    const match = Object.keys(FULL_MUNI_DATA).find(k =>
      k.toLowerCase() === normalized.toLowerCase()
    );
    setAddress(doc.weergavenaam || raw);
    setShowDrop(false);
    setSuggestions([]);
    if (match) {
      setDetectedMuni(match);
      onMuniDetected(match);
    } else {
      setDetectedMuni(raw + " (niet in database)");
      onMuniDetected(null);
    }
  }

  const isNL = lang !== "en";
  const placeholder = isNL ? "Voer een adres in, bijv. Koningsplein 10 Amsterdam…" : "Enter an address, e.g. Koningsplein 10 Amsterdam…";

  return (
    <div className="address-search-wrap" ref={wrapRef}>
      <div className="address-input-row">
        <div className="address-icon">⌖</div>
        <input
          type="text"
          className="field-input address-input"
          placeholder={placeholder}
          value={address}
          onChange={e => { setAddress(e.target.value); setDetectedMuni(null); }}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <div className="address-spinner" />}
      </div>

      {showDrop && suggestions.length > 0 && (
        <ul className="pdok-dropdown">
          {suggestions.map((doc, i) => (
            <li key={i} onMouseDown={() => pickSuggestion(doc)} className="pdok-item">
              <span className="pdok-name">{doc.weergavenaam}</span>
              {doc.gemeentenaam && (
                <span className="pdok-muni mono small">
                  {doc.gemeentenaam}
                  {FULL_MUNI_DATA[normalizeMuniName(doc.gemeentenaam)] ? " ✓" : ""}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {detectedMuni && (
        <div className={`pdok-detected ${FULL_MUNI_DATA[detectedMuni] ? "pdok-hit" : "pdok-miss"}`}>
          {FULL_MUNI_DATA[detectedMuni]
            ? `${isNL ? "Gemeente herkend" : "Municipality detected"}: ${detectedMuni}`
            : `${isNL ? "Niet in database" : "Not in database"}: ${detectedMuni}`}
        </div>
      )}
    </div>
  );
}

// ── Main tool page ────────────────────────────────────────────────────────────
function ToolPage({ lang, setLang }) {
  // Read ?muni= URL param to support deep-links from the map
  const defaultMuni = useMemoT(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("muni");
      return (p && FULL_MUNI_DATA[p]) ? p : "Almere";
    } catch { return "Almere"; }
  }, []);

  const [muni,  setMuni]  = useStateT(defaultMuni);
  const [type,  setType]  = useStateT("residential");
  const [units, setUnits] = useStateT(8);
  const [query, setQuery] = useStateT("");
  const [step,  setStep]  = useStateT(1);

  const filtered = useMemoT(() => {
    if (!query) return MUNI_LIST;
    return MUNI_LIST.filter(m => m.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const data   = FULL_MUNI_DATA[muni];
  const t      = window.COPY[lang];
  const tt     = t.tool;
  const accent = window.ACCENT_PRESETS_S.blue;

  function handleMuniSelect(m) {
    if (!m) return;
    setMuni(m);
    setQuery("");
    setStep(s => Math.max(s, 2));
  }

  return (
    <>
      <SubNav lang={lang} setLang={setLang} current="tool.html" accent={accent}
              demoLabel={t.nav.demo} tryLabel={t.nav.tryTool} />
      <PageHeader
        breadcrumb={[{ label: "Home", href: "index.html" }, { label: tt.breadcrumbLabel }]}
        eyebrow={tt.eyebrow}
        title={tt.title}
        sub={tt.sub}
      />

      <section className="tool-shell">
        <div className="container">
          <StepIndicator step={step} />

          <div className="tool-grid">
            {/* ── Left: input panel ── */}
            <aside className="tool-input">

              {/* Step 01 — Locate */}
              <div className="tool-step-block">
                <div className="tool-step-header">
                  <span className="tool-step-num mono">01</span>
                  <span className="tool-step-title">{lang === "en" ? "Locate" : "Lokaliseer"}</span>
                  <span className="tool-step-tag mono small">PDOK · BAG</span>
                </div>
                <AddressSearch onMuniDetected={handleMuniSelect} lang={lang} />
                <div className="tool-step-divider mono small">
                  {lang === "en" ? "— or search by municipality —" : "— of zoek op gemeente —"}
                </div>
                <label className="field">
                  <span className="field-label">{tt.muniLabel}</span>
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                         placeholder={tt.muniPlaceholder} className="field-input" />
                </label>
                <div className="muni-list-scroll">
                  {filtered.map(m => (
                    <button key={m} type="button"
                            onClick={() => handleMuniSelect(m)}
                            className={`muni-list-item ${muni === m ? "is-selected" : ""}`}>
                      <span>{m}</span>
                      <span className="mono small mute">{FULL_MUNI_DATA[m].framework}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ padding: 16, fontSize: 13, color: "var(--mute)" }}>{tt.noMatch}</div>
                  )}
                </div>
              </div>

              {/* Step 02 — Classify */}
              <div className="tool-step-block">
                <div className="tool-step-header">
                  <span className="tool-step-num mono">02</span>
                  <span className="tool-step-title">{lang === "en" ? "Classify" : "Classificeer"}</span>
                  <span className="tool-step-tag mono small">BOPA · drempels</span>
                </div>
                <div className="tool-fields-row">
                  <label className="field">
                    <span className="field-label">{tt.typeLabel}</span>
                    <select value={type} onChange={e => { setType(e.target.value); setStep(s => Math.max(s, 2)); }}
                            className="field-input">
                      {t.hero.types.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field-label">{tt.countLabel}</span>
                    <input type="number" value={units}
                           onChange={e => { setUnits(Number(e.target.value) || 0); setStep(s => Math.max(s, 2)); }}
                           className="field-input" min={1} />
                  </label>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: accent.bg, color: accent.fg, width: "100%", justifyContent: "center", marginTop: 12 }}
                  onClick={() => setStep(3)}
                >
                  {lang === "en" ? "Get documentation requirements" : "Toon documentatievereisten"}
                  <span className="arrow">→</span>
                </button>
              </div>

              <div className="tool-disclaimer">{tt.disclaimer}</div>
            </aside>

            {/* ── Right: output panel ── */}
            <div className="tool-output">
              {/* Step 03 header */}
              <div className="tool-output-head">
                <div>
                  <div className="muni-name serif">{muni}</div>
                  <div className="muni-meta">
                    {data.province} · {data.population} {tt.residentsSuffix} · {data.cvdr} · {tt.updatedPrefix} {data.updated}
                  </div>
                </div>
                <div className={`muni-status-pill is-${data.status}`}>
                  <StatusDot status={data.status} lang={lang} />
                </div>
              </div>

              <div className="tool-output-section">
                <div className="tos-label">{tt.policyHeader}</div>
                <div className="tos-body"><strong>{data.framework}.</strong> {data.method}</div>
                <ul className="tos-kv-list" style={{ marginTop: 16 }}>
                  <li><span className="k">{tt.triggerLabel}</span><span className="v">{data.trigger}</span></li>
                  <li><span className="k">{tt.timelineLabel}</span><span className="v">{data.timeline}</span></li>
                  <li><span className="k">{tt.contactLabel}</span><span className="v mono">{data.contact}</span></li>
                </ul>
              </div>

              <div className="tool-output-section">
                <div className="tos-label">{tt.docsHeader}</div>
                <ul className="tos-doc-list">
                  {data.documents.map((d, i) => (
                    <li key={i}>
                      <div className="doc-title">{d.title}</div>
                      <div className="doc-desc">{d.desc}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tool-output-section">
                <div className="tos-label">{tt.sourcesHeader}</div>
                <ul className="tos-kv-list">
                  <li><span className="k">{tt.cvdrLabel}</span><span className="v mono">{data.cvdr}</span></li>
                  <li><span className="k">{tt.pubLabel}</span><span className="v">{data.updated}</span></li>
                  <li>
                    <span className="k">{tt.sourceLabel}</span>
                    <span className="v">
                      <a href="https://lokaleregelgeving.overheid.nl" target="_blank" rel="noreferrer"
                         style={{ color: "var(--ink)", borderBottom: "1px solid var(--hairline-strong)" }}>
                        ↗ lokaleregelgeving.overheid.nl
                      </a>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="tool-output-section" style={{ background: "var(--bg-alt)" }}>
                <div className="tos-label">{tt.generateHeader}</div>
                <div className="tos-body" style={{ marginBottom: 14 }}>
                  {tt.generateBodyPre} {muni}{tt.generateBodyPost}
                </div>
                <button type="button" className="btn btn-primary"
                        style={{ background: accent.bg, color: accent.fg }}
                        onClick={() => {
                          const content = generateParticipatieverslag(muni, data, type, units);
                          const filename = `participatieverslag-${muni.toLowerCase().replace(/\s+/g, "-")}.doc`;
                          downloadTemplate(content, filename);
                        }}>
                  {tt.generateBtn} <span className="arrow">↓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SubFooter t={t} />
    </>
  );
}

function ToolApp() {
  const [lang, setLang] = useStateT("nl");
  return <ToolPage lang={lang} setLang={setLang} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<ToolApp />);
