// Hero — bold problem-first headline + live municipality compliance widget.

const { useState } = React;

// Municipality participation data — used by MunicipalityScanner for live checks.
window.MUNICIPALITIES = [
  { name: "Almere",      status: "mandatory",     trigger: "≥4 woningen of >500 m²",          cvdr: "CVDR685432" },
  { name: "Amsterdam",   status: "mandatory",     trigger: "Impactscore ≥7 punten",            cvdr: "CVDR701294" },
  { name: "Rotterdam",   status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR698117" },
  { name: "Utrecht",     status: "mandatory",     trigger: "Woningbouw ≥3 eenheden",           cvdr: "CVDR692058" },
  { name: "Den Haag",    status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR687744" },
  { name: "Eindhoven",   status: "mandatory",     trigger: "Impact + omvang gecombineerd",     cvdr: "CVDR690225" },
  { name: "Groningen",   status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR683910" },
  { name: "Tilburg",     status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR691803" },
  { name: "Breda",       status: "mandatory",     trigger: "≥5 woningen of >750 m²",          cvdr: "CVDR694201" },
  { name: "Nijmegen",    status: "mandatory",     trigger: "Woningbouw ≥4 eenheden",           cvdr: "CVDR689553" },
  { name: "Haarlem",     status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR695812" },
  { name: "Arnhem",      status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR688402" },
  { name: "Zwolle",      status: "mandatory",     trigger: "≥3 woningen of >500 m²",          cvdr: "CVDR693147" },
  { name: "Enschede",    status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR686720" },
  { name: "Apeldoorn",   status: "mandatory",     trigger: "Woningbouw ≥5 eenheden",           cvdr: "CVDR697034" },
  { name: "Leiden",      status: "mandatory",     trigger: "Impactscore ≥5 punten",            cvdr: "CVDR699281" },
  { name: "Maastricht",  status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR691405" },
  { name: "Dordrecht",   status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR686903" },
  { name: "Zoetermeer",  status: "mandatory",     trigger: "≥3 woningen of >400 m²",          cvdr: "CVDR693740" },
  { name: "Amersfoort",  status: "mandatory",     trigger: "Woningbouw ≥4 eenheden",           cvdr: "CVDR695017" },
  { name: "Delft",       status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR688654" },
  { name: "Westland",    status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR687291" },
  { name: "Emmen",       status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR684108" },
  { name: "Deventer",    status: "mandatory",     trigger: "≥3 woningen of commercieel >1000 m²", cvdr: "CVDR692876" },
  { name: "Sittard-Geleen", status: "mandatory",  trigger: "Woningbouw ≥3 eenheden",           cvdr: "CVDR690612" },
  { name: "Leeuwarden",  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR687834" },
  { name: "Venlo",       status: "mandatory",     trigger: "≥4 woningen of >500 m²",          cvdr: "CVDR693481" },
  { name: "Zaanstad",    status: "mandatory",     trigger: "Impactscore ≥6 punten",            cvdr: "CVDR696250" },
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

function MunicipalityScanner({ lang, t, accent }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const munis = window.MUNICIPALITIES;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % munis.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const muni = munis[idx];

  const statusConfig = {
    mandatory:     { bg: "var(--green)",     label: lang === "en" ? "Mandatory"     : "Verplicht" },
    discretionary: { bg: "var(--amber)",     label: lang === "en" ? "Discretionary" : "Beoordelingsruimte" },
    voluntary:     { bg: "var(--blue-soft)", label: lang === "en" ? "Voluntary"     : "Vrijwillig" },
  };
  const sc = statusConfig[muni.status] || statusConfig.voluntary;

  const titleNL = "Gemeentelijke compliance database";
  const titleEN = "Municipal compliance database";
  const subNL = `${idx + 1} van ${munis.length} gemeenten`;
  const subEN = `${idx + 1} of ${munis.length} municipalities`;

  return (
    <div className="hero-widget">
      <div className="widget-head">
        <div>
          <div className="widget-title">{lang === "en" ? titleEN : titleNL}</div>
          <div className="widget-sub mono small">{lang === "en" ? subEN : subNL}</div>
        </div>
        <div className="widget-pill">
          <span className="dot live"></span>
          <span>live</span>
        </div>
      </div>

      <div className={`scanner-entry ${visible ? "scanner-fade-in" : "scanner-fade-out"}`}>
        <div className="scanner-municipality">{muni.name}</div>
        <div className="scanner-status">
          <span className="scanner-dot" style={{ background: sc.bg }}></span>
          <span className="scanner-status-label mono small">{sc.label}</span>
        </div>
        <div className="scanner-trigger">{muni.trigger}</div>
        <div className="scanner-meta">
          <span>{muni.cvdr}</span>
          <span className="scanner-cvdr-link">↗ lokaleregelgeving.overheid.nl</span>
        </div>
      </div>

      <div className="scanner-progress">
        {munis.map((_, i) => (
          <span key={i} className={`scanner-pip${i === idx ? " active" : ""}`}></span>
        ))}
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
            <MunicipalityScanner lang={lang} t={t.hero} accent={accent} />
          </div>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
window.StatusDot = StatusDot;
