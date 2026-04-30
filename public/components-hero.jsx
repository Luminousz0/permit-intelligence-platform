// Hero — bold problem-first headline + live municipality compliance widget.

const { useState } = React;

// Checklist data — hardcoded documentation requirements by municipality.
const CHECKLIST_DATA = [
  {
    name: "Amsterdam",
    status: "mandatory",
    docs: [
      { label: "Participatieverslag",          ref: "BOPA Art. 16.55" },
      { label: "Omgevingsdialoog notitie",      ref: "Art. 10.24" },
      { label: "Reactienota omwonenden",        ref: null },
      { label: "Projectbeschrijving",           ref: null },
      { label: "Visualisaties / renders",       ref: null },
      { label: "Stedenbouwkundig plan",         ref: "CVDR701294" },
    ]
  },
  {
    name: "Den Haag",
    status: "mandatory",
    docs: [
      { label: "Participatieverslag",           ref: "CVDR687744" },
      { label: "Reactienota omwonenden",        ref: null },
      { label: "Projectbeschrijving",           ref: null },
      { label: "Milieueffectbeoordeling",       ref: "Art. 16.43" },
      { label: "Visualisaties / renders",       ref: null },
    ]
  },
  {
    name: "Utrecht",
    status: "mandatory",
    docs: [
      { label: "Participatieverslag",           ref: "CVDR692058" },
      { label: "Omgevingsdialoog notitie",      ref: null },
      { label: "Reactienota omwonenden",        ref: null },
      { label: "Projectbeschrijving",           ref: null },
      { label: "Stedenbouwkundig plan",         ref: null },
    ]
  },
  {
    name: "Rotterdam",
    status: "discretionary",
    docs: [
      { label: "Projectbeschrijving",           ref: null },
      { label: "Participatieplan (optioneel)",  ref: "CVDR698117" },
      { label: "Reactienota omwonenden",        ref: null },
      { label: "Visualisaties / renders",       ref: null },
    ]
  },
  {
    name: "Almere",
    status: "mandatory",
    docs: [
      { label: "Participatieverslag",           ref: "CVDR685432" },
      { label: "Omgevingsdialoog notitie",      ref: null },
      { label: "Reactienota omwonenden",        ref: null },
      { label: "Projectbeschrijving",           ref: null },
      { label: "Geluidsprofiel",                ref: "Art. 5.78b" },
    ]
  },
  {
    name: "Groningen",
    status: "voluntary",
    docs: [
      { label: "Projectbeschrijving",           ref: null },
      { label: "Participatieplan (aanbevolen)", ref: "CVDR683910" },
      { label: "Visualisaties / renders",       ref: null },
    ]
  },
];

function StatusDot({ status, lang }) {
  const resolvedLang = lang || "nl";
  const labels = (window.COPY && window.COPY[resolvedLang] && window.COPY[resolvedLang].hero.statusLabels) || {
    mandatory: "Verplicht",
    discretionary: "Beoordelingsruimte",
    voluntary: "Vrijwillig",
    unprofiled: "Niet geprofileerd",
  };
  const colors = {
    mandatory:    { color: "var(--ink)",  bg: "var(--green)" },
    discretionary:{ color: "var(--ink)",  bg: "var(--amber)" },
    voluntary:    { color: "var(--ink)",  bg: "var(--blue-soft)" },
    unprofiled:   { color: "var(--mute)", bg: "var(--gray-soft)" },
  };
  const c = colors[status] || colors.unprofiled;
  const label = labels[status] || labels.unprofiled;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: c.bg, display: "inline-block" }}></span>
      <span style={{ fontSize: 13, color: c.color, letterSpacing: 0.1 }}>{label}</span>
    </span>
  );
}

function DocumentChecklistWidget({ lang, t, accent }) {
  const [muniIdx, setMuniIdx] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState("building"); // "building" | "complete" | "clearing"
  const [clearing, setClearing] = useState(false);

  const muni = CHECKLIST_DATA[muniIdx];

  React.useEffect(() => {
    let timer;
    if (phase === "building") {
      if (revealedCount < muni.docs.length) {
        timer = setTimeout(() => setRevealedCount(c => c + 1), 280);
      } else {
        timer = setTimeout(() => setPhase("complete"), 100);
      }
    } else if (phase === "complete") {
      timer = setTimeout(() => {
        setClearing(true);
        setTimeout(() => {
          setMuniIdx(i => (i + 1) % CHECKLIST_DATA.length);
          setRevealedCount(0);
          setPhase("building");
          setClearing(false);
        }, 350);
      }, 2200);
    }
    return () => clearTimeout(timer);
  }, [phase, revealedCount]);

  const statusDotColor = {
    mandatory: "var(--green)",
    discretionary: "var(--amber)",
    voluntary: "var(--blue-soft)",
  }[muni.status];

  const titleNL = "Vereiste documenten";
  const titleEN = "Required documents";
  const subNL = `${Math.min(revealedCount, muni.docs.length)} / ${muni.docs.length} documenten bepaald`;
  const subEN = `${Math.min(revealedCount, muni.docs.length)} / ${muni.docs.length} documents identified`;

  return (
    <div className="hero-widget">
      <div className="widget-head">
        <div>
          <div className="widget-title">
            {lang === "en" ? titleEN : titleNL}
            <span className="checklist-muni-tag">{muni.name}</span>
          </div>
          <div className="widget-sub mono small">{lang === "en" ? subEN : subNL}</div>
        </div>
        <div className="widget-pill">
          <span className="dot live"></span>
          <span>live</span>
        </div>
      </div>

      <div className={`checklist-body${clearing ? " checklist-clearing" : ""}`}>
        {muni.docs.map((doc, i) => {
          const isVisible = i < revealedCount;
          const isLoading = i === revealedCount - 1 && phase === "building";
          return (
            <div
              key={`${muni.name}-${i}`}
              className={`checklist-item${isVisible ? " checklist-visible" : ""}${isLoading ? " checklist-loading" : ""}`}
              style={{ transitionDelay: `${i * 20}ms` }}
            >
              <span className="checklist-check">
                {isLoading ? (
                  <span className="checklist-spinner"></span>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className="checklist-label">{doc.label}</span>
              {doc.ref && (
                <span className="checklist-ref mono small">{doc.ref}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="checklist-footer">
        <span
          className="checklist-status-dot"
          style={{ background: statusDotColor }}
        ></span>
        <span className="mono small checklist-status-text">
          {lang === "en"
            ? (muni.status === "mandatory" ? "Mandatory" : muni.status === "discretionary" ? "Discretionary" : "Voluntary")
            : (muni.status === "mandatory" ? "Verplicht" : muni.status === "discretionary" ? "Beoordelingsruimte" : "Vrijwillig")}
        </span>
        <span className="checklist-footer-sep">·</span>
        <span className="mono small" style={{ color: "var(--mute)" }}>{muni.name}</span>
      </div>
    </div>
  );
}

function Hero({ lang, t, headlineIdx, accent, onScrollHow }) {
  const h = t.hero.headlines[headlineIdx % t.hero.headlines.length];

  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-text">
            <div className="eyebrow">{t.hero.eyebrow}</div>
            <h1 className="hero-headline">
              <span className="headline-line">{h.line1}</span>
              <span className="headline-line headline-emph">{h.line2}</span>
            </h1>
            <p className="hero-sub">{h.sub}</p>
            <div className="hero-ctas">
              <a
                href="tool.html"
                className="btn btn-primary"
                style={{ background: accent.bg, color: accent.fg, borderColor: accent.bg }}
              >
                {t.hero.ctaPrimary}
                <span className="arrow">→</span>
              </a>
              <button type="button" className="btn btn-ghost" onClick={onScrollHow}>
                {t.hero.ctaSecondary}
              </button>
            </div>
            <div className="hero-foot">
              <span className="foot-item">{t.hero.footMunicipalities}</span>
              <span className="foot-sep">·</span>
              <span className="foot-item">{t.hero.footSource}</span>
              <span className="foot-sep">·</span>
              <span className="foot-item mono small">Omgevingswet 2024</span>
            </div>
          </div>
          <div className="hero-aside">
            <DocumentChecklistWidget lang={lang} t={t.hero} accent={accent} />
          </div>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
window.StatusDot = StatusDot;
window.DocumentChecklistWidget = DocumentChecklistWidget;
