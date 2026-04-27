// Reference Tool page — interactive municipality lookup with full output panel.

const { useState: useStateT, useMemo: useMemoT } = React;

// ── Template generator ──────────────────────────────────────────────
function generateParticipatieverslag(muni, muniData, projectType, units) {
  const typeLabels = {
    residential: "Woningbouw",
    commercial: "Commercieel vastgoed",
    institutional: "Maatschappelijke voorziening",
    infrastructure: "Infrastructuur",
  };
  const typeLabel = typeLabels[projectType] || projectType;
  const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const docsSection = muniData.documents
    .map((d, i) => `
${i + 1}. ${d.title}
   ${d.desc}

   [INVULLEN: Voeg hier de relevante documentatie in]
`)
    .join("\n");

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
3   |          |                                |

3.2 Verwerking reacties

Nr. | Reactie verwerkt in plan? | Toelichting
1   | [ja/nee/gedeeltelijk]     |
2   |                           |
3   |                           |

══════════════════════════════════════════════════════════
SECTIE 4 — VERWERKING IN HET PLAN
══════════════════════════════════════════════════════════

[INVULLEN: Beschrijf welke aanpassingen aan het project zijn gedaan n.a.v. participatie, of waarom aanpassingen niet zijn doorgevoerd]

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

const FULL_MUNI_DATA = {
  Almere: {
    framework: "Activiteitenlijst",
    status: "mandatory",
    statusLabel: "Verplicht",
    trigger: "≥4 woningen of >500 m²",
    cvdr: "CVDR685432",
    updated: "12 januari 2026",
    province: "Flevoland",
    population: "228.000",
    contact: "omgevingsloket@almere.nl",
    documents: [
      { title: "Participatieverslag (verplicht)", desc: "Standaard format gemeente Almere; min. 4 secties: belanghebbenden, proces, uitkomsten, verwerking." },
      { title: "Participatieplan (vooraf)", desc: "Optioneel maar aanbevolen voor projecten >10 woningen." },
      { title: "Bewijsstukken", desc: "Notulen, e-mailcorrespondentie, foto's van bijeenkomsten." },
    ],
    method: "Beoordeling op compleetheid; geen inhoudelijke toets van uitkomsten.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Amsterdam: {
    framework: "Impact-scoring",
    status: "mandatory",
    statusLabel: "Verplicht",
    trigger: "Impactscore ≥7 punten",
    cvdr: "CVDR701294",
    updated: "3 maart 2026",
    province: "Noord-Holland",
    population: "920.000",
    contact: "omgeving@amsterdam.nl",
    documents: [
      { title: "Impact-assessment", desc: "Verplicht puntenformulier; bepaalt of participatie verplicht is." },
      { title: "Participatieverslag (model gemeente)", desc: "Verplicht model met 7 secties, incl. omgang met negatieve reacties." },
      { title: "Verklaring van burgerschap", desc: "Bewijs van betrokkenheid van direct omwonenden (≤200m)." },
    ],
    method: "Inhoudelijke beoordeling; gemeente kan om aanvullende participatie vragen.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Rotterdam: {
    framework: "Beoordelingsruimte",
    status: "discretionary",
    statusLabel: "Beoordelingsruimte",
    trigger: "Per geval beoordeeld",
    cvdr: "CVDR698117",
    updated: "18 februari 2026",
    province: "Zuid-Holland",
    population: "656.000",
    contact: "omgevingsloket@rotterdam.nl",
    documents: [
      { title: "Vooroverleg-aanvraag", desc: "Verplicht vooroverleg waarin gemeente bepaalt of participatie nodig is." },
      { title: "Participatieverslag (vrij format)", desc: "Indien gemeente participatie vereist; vrij format met inhoudelijke richtlijnen." },
    ],
    method: "Pre-beoordeling: gemeente bepaalt vereisten voorafgaand aan formele aanvraag.",
    timeline: "Vooroverleg 4-6 weken; daarna reguliere procedure",
  },
  Utrecht: {
    framework: "Activiteitenlijst",
    status: "mandatory",
    statusLabel: "Verplicht",
    trigger: "Woningbouw ≥3 eenheden",
    cvdr: "CVDR692058",
    updated: "27 januari 2026",
    province: "Utrecht",
    population: "367.000",
    contact: "omgevingsloket@utrecht.nl",
    documents: [
      { title: "Participatieverslag (model)", desc: "Verplicht stadsmodel; gestructureerd in 5 secties." },
      { title: "Bewonersbrief (concept)", desc: "Verplicht voor woningbouw; concept moet bij aanvraag." },
    ],
    method: "Beoordeling op compleetheid + procesconformiteit.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  "Den Haag": {
    framework: "Procesgebaseerd",
    status: "mandatory",
    statusLabel: "Verplicht",
    trigger: "Alle BOPA-aanvragen",
    cvdr: "CVDR687744",
    updated: "5 maart 2026",
    province: "Zuid-Holland",
    population: "560.000",
    contact: "omgevingsloket@denhaag.nl",
    documents: [
      { title: "Stappenplan-verslag", desc: "Verplicht 5-stappen proces gedocumenteerd: aankondiging, dialoog, terugkoppeling, verwerking, eindverslag." },
      { title: "Tijdlijn-bijlage", desc: "Datum-gestempelde tijdlijn van alle participatie-momenten." },
    ],
    method: "Procesconformiteit; gemeente toetst op naleving stappen.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Eindhoven: {
    framework: "Impact-scoring",
    status: "mandatory",
    statusLabel: "Verplicht",
    trigger: "Impact + omvang gecombineerd",
    cvdr: "CVDR690225",
    updated: "14 februari 2026",
    province: "Noord-Brabant",
    population: "243.000",
    contact: "omgeving@eindhoven.nl",
    documents: [
      { title: "Impactscore-formulier", desc: "Verplicht; combineert hoogte, m², omwonenden, milieu-effect." },
      { title: "Participatieverslag (model)", desc: "Indien score boven drempel; verplicht stadsmodel." },
    ],
    method: "Inhoudelijke beoordeling op uitkomsten en proces.",
    timeline: "8 weken reguliere procedure / 26 weken uitgebreide procedure",
  },
  Groningen: {
    framework: "Vrijwillig + disclosure",
    status: "voluntary",
    statusLabel: "Vrijwillig",
    trigger: "Aanbevolen, niet vereist",
    cvdr: "CVDR683910",
    updated: "8 december 2025",
    province: "Groningen",
    population: "234.000",
    contact: "omgevingsloket@groningen.nl",
    documents: [
      { title: "Disclosure-verklaring", desc: "Verplicht: vermeld of en hoe participatie heeft plaatsgevonden, ook als 'geen'." },
    ],
    method: "Lichtere lat; geen inhoudelijke toets, maar disclosure-plicht.",
    timeline: "8 weken reguliere procedure",
  },
  Tilburg: {
    framework: "Beoordelingsruimte",
    status: "discretionary",
    statusLabel: "Beoordelingsruimte",
    trigger: "Per geval beoordeeld",
    cvdr: "CVDR691803",
    updated: "21 januari 2026",
    province: "Noord-Brabant",
    population: "227.000",
    contact: "omgeving@tilburg.nl",
    documents: [
      { title: "Vooroverleg-rapportage", desc: "Vooroverleg verplicht; gemeente bepaalt vervolg-vereisten." },
    ],
    method: "Pre-beoordeling.",
    timeline: "Vooroverleg 4-6 weken; daarna reguliere procedure",
  },
};

const MUNI_LIST = Object.keys(FULL_MUNI_DATA);

function ToolPage({ lang, setLang }) {
  const [muni, setMuni] = useStateT("Almere");
  const [type, setType] = useStateT("residential");
  const [units, setUnits] = useStateT(8);
  const [query, setQuery] = useStateT("");

  const filtered = useMemoT(() => {
    if (!query) return MUNI_LIST;
    return MUNI_LIST.filter(m => m.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const data = FULL_MUNI_DATA[muni];
  const t = window.COPY[lang];
  const accent = window.ACCENT_PRESETS_S.blue;

  return (
    <>
      <SubNav lang={lang} setLang={setLang} current="tool.html" accent={accent}
              demoLabel={t.nav.demo} tryLabel={t.nav.tryTool} />
      <PageHeader
        breadcrumb={[{ label: "Home", href: "index.html" }, { label: "Referentietool" }]}
        eyebrow="Referentietool"
        title="Bekijk de vereisten voor jouw gemeente."
        sub="Selecteer een gemeente en projecttype. Krijg direct toepasselijke regels, documentatie-vereisten en bron-citatie."
      />
      <section className="tool-shell">
        <div className="container tool-grid">
          <aside className="tool-input">
            <h3>Zoekopdracht</h3>
            <div className="input-sub">28 gemeenten beschikbaar in database</div>

            <label className="field">
              <span className="field-label">Gemeente</span>
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                     placeholder="Zoek gemeente..." className="field-input" />
            </label>

            <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid var(--hairline)", borderRadius: 6, marginBottom: 14 }}>
              {filtered.map(m => (
                <button key={m} type="button"
                        onClick={() => { setMuni(m); setQuery(""); }}
                        style={{
                          display: "block", width: "100%", textAlign: "left", padding: "10px 12px",
                          background: muni === m ? "var(--bg-alt)" : "transparent",
                          border: "none", borderBottom: "1px solid var(--hairline)",
                          fontSize: 14, color: "var(--ink)", fontFamily: "var(--sans)"
                        }}>
                  {m}
                  <span style={{ float: "right", fontFamily: "var(--mono)", fontSize: 11, color: "var(--mute)" }}>
                    {FULL_MUNI_DATA[m].framework}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && <div style={{ padding: 16, fontSize: 13, color: "var(--mute)" }}>Geen match</div>}
            </div>

            <div className="tool-fields-row">
              <label className="field">
                <span className="field-label">Projecttype</span>
                <select value={type} onChange={(e) => setType(e.target.value)} className="field-input">
                  <option value="residential">Woningbouw</option>
                  <option value="commercial">Commercieel</option>
                  <option value="institutional">Maatschappelijk</option>
                  <option value="infrastructure">Infrastructuur</option>
                </select>
              </label>
              <label className="field">
                <span className="field-label">Aantal</span>
                <input type="number" value={units} onChange={(e) => setUnits(Number(e.target.value) || 0)}
                       className="field-input" min={1} />
              </label>
            </div>

            <div className="tool-disclaimer">
              Resultaat is gebaseerd op gepubliceerd beleid op querydatum. Bevestig actuele vereisten direct bij de gemeente vóór indiening.
            </div>
          </aside>

          <div className="tool-output">
            <div className="tool-output-head">
              <div>
                <div className="muni-name serif">{muni}</div>
                <div className="muni-meta">{data.province} · {data.population} inwoners · CVDR {data.cvdr.replace("CVDR", "")} · bijgewerkt {data.updated}</div>
              </div>
              <div className={`muni-status-pill is-${data.status}`}>
                <StatusDot status={data.status} />
              </div>
            </div>

            <div className="tool-output-section">
              <div className="tos-label">Beleidsbenadering</div>
              <div className="tos-body"><strong>{data.framework}.</strong> {data.method}</div>
              <ul className="tos-kv-list" style={{ marginTop: 16 }}>
                <li><span className="k">Trigger</span><span className="v">{data.trigger}</span></li>
                <li><span className="k">Doorlooptijd</span><span className="v">{data.timeline}</span></li>
                <li><span className="k">Contact</span><span className="v mono">{data.contact}</span></li>
              </ul>
            </div>

            <div className="tool-output-section">
              <div className="tos-label">Vereiste documentatie</div>
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
              <div className="tos-label">Bronnen</div>
              <ul className="tos-kv-list">
                <li><span className="k">CVDR-nummer</span><span className="v mono">{data.cvdr}</span></li>
                <li><span className="k">Publicatie</span><span className="v">{data.updated}</span></li>
                <li><span className="k">Origineel</span><span className="v"><a href="#" style={{ color: "var(--ink)", borderBottom: "1px solid var(--hairline-strong)" }}>↗ lokaleregelgeving.overheid.nl</a></span></li>
              </ul>
            </div>

            <div className="tool-output-section" style={{ background: "var(--bg-alt)" }}>
              <div className="tos-label">Documentatie genereren</div>
              <div className="tos-body" style={{ marginBottom: 14 }}>
                Genereer een participatieverslag-template aangepast aan {muni}'s vereisten en jouw projectkenmerken.
                Klaar om in te vullen — bevat alle secties die {muni} vereist.
              </div>
              <button type="button" className="btn btn-primary"
                      style={{ background: accent.bg, color: accent.fg }}
                      onClick={() => {
                        const content = generateParticipatieverslag(muni, data, type, units);
                        const filename = `participatieverslag-${muni.toLowerCase().replace(/\s+/g, "-")}.doc`;
                        downloadTemplate(content, filename);
                      }}>
                Genereer &amp; download template <span className="arrow">↓</span>
              </button>
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
