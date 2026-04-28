// Hero — bold problem-first headline + live municipality compliance widget.

const { useState, useMemo } = React;

// Municipality participation data — used by HeroWidget for live checks.
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

function HeroWidget({ lang, t, accent }) {
  const [muniInput, setMuniInput] = useState("Almere");
  const [type, setType] = useState("residential");
  const [units, setUnits] = useState(8);
  const [submitted, setSubmitted] = useState(true);

  const matched = useMemo(() => {
    const q = muniInput.trim().toLowerCase();
    if (!q) return null;
    return window.MUNICIPALITIES.find(m => m.name.toLowerCase().startsWith(q)) || null;
  }, [muniInput]);

  const result = submitted && matched ? matched : null;

  return (
    <div className="hero-widget">
      <div className="widget-head">
        <div>
          <div className="widget-title">{t.widgetTitle}</div>
          <div className="widget-sub">{t.widgetSub}</div>
        </div>
        <div className="widget-pill">
          <span className="dot live"></span>
          <span>live tool</span>
        </div>
      </div>

      <div className="widget-form">
        <label className="field">
          <span className="field-label">{t.widgetMuni}</span>
          <input
            type="text"
            value={muniInput}
            onChange={(e) => { setMuniInput(e.target.value); setSubmitted(false); }}
            placeholder={t.widgetMuniPlaceholder}
            className="field-input"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <label className="field">
          <span className="field-label">{t.widgetType}</span>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setSubmitted(false); }}
            className="field-input"
          >
            {t.types.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
        </label>

        <label className="field field-units">
          <span className="field-label">{t.widgetUnits}</span>
          <input
            type="number"
            value={units}
            onChange={(e) => { setUnits(Number(e.target.value) || 0); setSubmitted(false); }}
            className="field-input"
            min={1}
          />
        </label>

        <button
          type="button"
          className="widget-cta"
          onClick={() => setSubmitted(true)}
          style={{ background: accent.bg, color: accent.fg }}
        >
          {t.widgetCheck}
          <span className="arrow">→</span>
        </button>
      </div>

      <div className="widget-result">
        {result ? (
          <>
            <div className="result-row">
              <div className="result-key">{lang === "en" ? "Municipality" : "Gemeente"}</div>
              <div className="result-val mono">{result.name}</div>
            </div>
            <div className="result-row">
              <div className="result-key">Status</div>
              <div className="result-val"><StatusDot status={result.status} lang={lang} /></div>
            </div>
            <div className="result-row">
              <div className="result-key">Trigger</div>
              <div className="result-val">{result.trigger}</div>
            </div>
            <div className="result-row">
              <div className="result-key">{lang === "en" ? "Source" : "Bron"}</div>
              <div className="result-val mono small">
                {result.cvdr || "—"} {result.cvdr && <span className="src-link">↗ lokaleregelgeving.overheid.nl</span>}
              </div>
            </div>
          </>
        ) : (
          <div className="result-empty">
            <div className="empty-line">{t.widgetNoMatch}</div>
            <div className="empty-sub">{t.widgetNoMatchSub}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Hero({ lang, t, headlineIdx, accent, onScrollHow }) {
  const h = t.hero.headlines[headlineIdx % t.hero.headlines.length];

  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="container hero-grid">
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
            <span className="foot-item"><span className="dot live"></span>{t.hero.footLive}</span>
            <span className="foot-sep">·</span>
            <span className="foot-item">{t.hero.footMunicipalities}</span>
            <span className="foot-sep">·</span>
            <span className="foot-item">{t.hero.footSource}</span>
          </div>
        </div>

        <div className="hero-aside">
          <HeroWidget lang={lang} t={t.hero} accent={accent} />
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
window.StatusDot = StatusDot;
