// Stats, Problem, ProcessTimeline, How, Proof, Roadmap, Pricing, FAQ, Footer, TrialModal

const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

// ---------- STATS ----------
function StatsStrip({ t }) {
  return (
    <section className="stats" data-screen-label="02 Stats">
      <div className="container">
        <div className="section-head">
          <div className="head-l">
            <div className="eyebrow">{t.stats.subtitle}</div>
            <h2 className="section-title serif">{t.stats.title}</h2>
          </div>
          <div className="head-r mono small mute">{t.stats.asOf}</div>
        </div>
        <div className="stats-grid">
          {t.stats.items.map((s, i) => (
            <div className="stat" key={i}>
              <div className="stat-value serif">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="stats-legend">
          {t.stats.legend.map((l, i) => (
            <span className="legend-item" key={i}>
              <span className={`legend-dot dot-${l.color}`}></span>
              {l.label}
            </span>
          ))}
          <span className="legend-spacer"></span>
          <a className="legend-link" href="gemeenten.html">{t.stats.viewDb}</a>
        </div>
      </div>
    </section>
  );
}

// ---------- PROBLEM ----------
function Problem({ t }) {
  return (
    <section className="problem" data-screen-label="03 Problem">
      <div className="container problem-grid">
        <div className="problem-text">
          <div className="eyebrow">{t.problem.eyebrow}</div>
          <h2 className="section-title serif">{t.problem.title}</h2>
          {t.problem.paragraphs.map((p, i) => (
            <p className="prose" key={i}>{p}</p>
          ))}
        </div>
        <div className="cost-card">
          <div className="cost-head">
            <div className="cost-title">{t.problem.breakdown.title}</div>
            <div className="cost-tag mono small">{t.problem.breakdown.costTag}</div>
          </div>
          <div className="cost-list">
            {t.problem.breakdown.items.map((it, i) => (
              <div className="cost-row" key={i}>
                <div className="cost-meta">
                  <div className="cost-label">{it.label}</div>
                  <div className="cost-note">{it.note}</div>
                </div>
                <div className="cost-value serif">{it.cost}</div>
              </div>
            ))}
          </div>
          <div className="cost-foot">
            <span className="cost-foot-label">{t.problem.breakdown.totalLossLabel}</span>
            <span className="cost-foot-value serif">{t.problem.breakdown.totalLossValue}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- HOW IT WORKS ----------
function HowItWorks({ t, accent }) {
  return (
    <section className="how" data-screen-label="04 How" id="how">
      <div className="container">
        <div className="section-head">
          <div className="head-l">
            <div className="eyebrow">{t.how.eyebrow}</div>
            <h2 className="section-title serif">{t.how.title}</h2>
          </div>
          <div className="head-r">
            <a href="tool.html" className="link-arrow">
              {t.how.try} <span className="arrow">→</span>
            </a>
          </div>
        </div>
        <div className="how-grid">
          {t.how.steps.map((s, i) => (
            <div className="how-step" key={i}>
              <div className="step-n mono">{s.n}</div>
              <div className="step-title serif">{s.title}</div>
              <div className="step-body">{s.body}</div>
              <div className="step-tag mono small">{s.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- PROOF ----------
function Proof({ t }) {
  return (
    <section className="proof" data-screen-label="05 Proof">
      <div className="container proof-grid">
        <div className="proof-quote-wrap">
          <div className="eyebrow light">{t.proof.eyebrow}</div>
          <h2 className="section-title serif light">{t.proof.title}</h2>
          <blockquote className="proof-quote serif">
            <span className="quote-mark">“</span>
            {t.proof.quote}
            <span className="quote-mark close">”</span>
          </blockquote>
          <div className="proof-attr">
            <div className="attr-line">{t.proof.attribution}</div>
            <div className="attr-note mono small">{t.proof.attributionNote}</div>
          </div>
        </div>
        <div className="proof-sources">
          <div className="sources-title">{t.proof.sources.title}</div>
          <p className="sources-body">{t.proof.sources.body}</p>
          <ul className="sources-list mono small">
            {t.proof.sources.list.map((s, i) => (
              <li key={i}><span className="src-bullet">↗</span>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------- PROCESS TIMELINE ----------
function ProcessTimeline({ t }) {
  return (
    <section className="process" data-screen-label="03b Process">
      <div className="container">
        <div className="section-head">
          <div className="head-l">
            <div className="eyebrow">{t.process.eyebrow}</div>
            <h2 className="section-title serif">{t.process.title}</h2>
            <p className="section-sub">{t.process.sub}</p>
          </div>
        </div>
        <div className="process-timeline">
          {t.process.stages.map((stage, i) => (
            <div className={`process-stage ${stage.isBlackBox ? "is-blackbox" : ""}`} key={i}>
              <div className="stage-n">{stage.n}</div>
              <div className="stage-label serif">{stage.label}</div>
              <div className="stage-body">{stage.body}</div>
              <div className="stage-timing">{stage.timing}</div>
            </div>
          ))}
        </div>
        <div className="process-blackbox-label">
          ▪ {t.process.blackBoxLabel}
        </div>
        <div className="process-gov-stat">{t.process.govStat}</div>
      </div>
    </section>
  );
}

// ---------- ROADMAP ----------
function Roadmap({ t }) {
  return (
    <section className="roadmap" data-screen-label="05b Roadmap">
      <div className="container">
        <div className="section-head center">
          <div className="eyebrow">{t.roadmap.eyebrow}</div>
          <h2 className="section-title serif">{t.roadmap.title}</h2>
          <p className="section-sub">{t.roadmap.sub}</p>
        </div>
        <div className="roadmap-layers">
          {t.roadmap.layers.map((layer, i) => (
            <div className={`roadmap-layer layer-${layer.status}`} key={i}>
              <div className="layer-n">{layer.n}</div>
              <div className="layer-body">
                <div className="layer-header">
                  <div className="layer-label">{layer.label}</div>
                  <span className={`layer-status status-${layer.status}`}>{layer.statusLabel}</span>
                </div>
                <div className="layer-text">{layer.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- TRIAL MODAL ----------
function TrialModal({ lang, accent, onClose }) {
  const [name, setName] = useStateS("");
  const [email, setEmail] = useStateS("");
  const [status, setStatus] = useStateS("idle"); // idle | loading | success | error

  // Close on Escape
  useEffectS(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const base = window.API_BASE || "";
      const resp = await fetch(base + "/api/trial-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (resp.ok) {
        setStatus("success");
        if (window.trackEvent) window.trackEvent("trial_signup", "conversion", email);
      } else {
        setStatus("error");
      }
    } catch (_) {
      setStatus("error");
    }
  };

  const isNL = lang !== "en";
  const L = {
    title:         isNL ? "Start je gratis proefperiode" : "Start your free trial",
    sub:           isNL ? "14 dagen gratis. Geen creditcard nodig." : "14 days free. No credit card required.",
    namePh:        isNL ? "Naam (optioneel)" : "Name (optional)",
    emailPh:       isNL ? "E-mailadres" : "Email address",
    cta:           isNL ? "Account aanmaken" : "Create account",
    loading:       isNL ? "Verwerken\u2026" : "Processing\u2026",
    fine:          isNL ? "Geen creditcard. Geen automatische verlenging." : "No credit card. No auto-renewal.",
    errorMsg:      isNL ? "Er ging iets mis. Probeer opnieuw." : "Something went wrong. Please try again.",
    successTitle:  isNL ? "Gelukt \u2014 we nemen contact op." : "Done \u2014 we\u2019ll be in touch.",
    successBody:   isNL ? "Bevestiging volgt op " : "Confirmation coming to ",
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Sluiten">×</button>

        {status === "success" ? (
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h3 className="serif modal-title">{L.successTitle}</h3>
            <p>{L.successBody}<strong>{email}</strong></p>
          </div>
        ) : (
          <>
            <h3 className="serif modal-title">{L.title}</h3>
            <p className="modal-sub">{L.sub}</p>
            <form onSubmit={submit} className="modal-form">
              <input
                type="text"
                placeholder={L.namePh}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                autoComplete="name"
              />
              <input
                type="email"
                placeholder={L.emailPh}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                required
                autoComplete="email"
                autoFocus
              />
              {status === "error" && (
                <div className="modal-error">{L.errorMsg}</div>
              )}
              <button
                type="submit"
                className="btn btn-primary modal-submit"
                style={{ background: accent.bg, color: accent.fg, borderColor: accent.bg }}
                disabled={status === "loading"}
              >
                {status === "loading" ? L.loading : L.cta}
                {status !== "loading" && <span className="arrow">\u2192</span>}
              </button>
            </form>
            <hr className="modal-divider" />
            <p className="modal-fine">{L.fine}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- PRICING ----------
function Pricing({ t, accent, onTrialOpen }) {
  const handleCta = (tier) => {
    if (tier.type === "trial") {
      if (onTrialOpen) onTrialOpen();
      if (window.trackEvent) window.trackEvent("trial_cta_click", "conversion", tier.name);
    } else if (tier.type === "demo") {
      if (window.openCalendly) window.openCalendly("pricing");
      else if (window.trackEvent) window.trackEvent("demo_cta_click", "conversion", tier.name);
    } else {
      // free tier — go straight to tool
      window.location.href = "tool.html";
    }
  };

  return (
    <section className="pricing" data-screen-label="06 Pricing" id="pricing">
      <div className="container">
        <div className="section-head center">
          <div className="eyebrow">{t.pricing.eyebrow}</div>
          <h2 className="section-title serif">{t.pricing.title}</h2>
          <p className="section-sub">{t.pricing.subtitle}</p>
        </div>
        <div className="tiers">
          {t.pricing.tiers.map((tier, i) => (
            <div className={`tier ${tier.accent ? "tier-accent" : ""}`} key={i}>
              {tier.accent && <div className="tier-flag mono">{tier.recommended}</div>}
              <div className="tier-name">{tier.name}</div>
              <div className="tier-price-row">
                <div className="tier-price serif">{tier.price}</div>
                <div className="tier-period mono small">{tier.period}</div>
              </div>
              <div className="tier-desc">{tier.description}</div>
              <ul className="tier-features">
                {tier.features.map((f, j) => (
                  <li key={j}><span className="check">✓</span>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`tier-cta ${tier.accent ? "tier-cta-primary" : ""}`}
                style={tier.accent ? { background: accent.bg, color: accent.fg, borderColor: accent.bg } : {}}
                onClick={() => handleCta(tier)}
              >
                {tier.cta} <span className="arrow">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- FAQ ----------
function FAQ({ t }) {
  const [open, setOpen] = useStateS(0);
  return (
    <section className="faq" data-screen-label="07 FAQ">
      <div className="container faq-grid">
        <div className="faq-head">
          <div className="eyebrow">{t.faq.eyebrow}</div>
          <h2 className="section-title serif">{t.faq.title}</h2>
          <a href="#" className="link-arrow small">{t.faq.cta} <span className="arrow">→</span></a>
        </div>
        <div className="faq-list">
          {t.faq.items.map((it, i) => (
            <div className={`faq-item ${open === i ? "open" : ""}`} key={i}>
              <button type="button" className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="faq-q-text">{it.q}</span>
                <span className="faq-toggle">{open === i ? "–" : "+"}</span>
              </button>
              {open === i && <div className="faq-a prose">{it.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- FOOTER ----------
function Footer({ t }) {
  return (
    <footer className="footer" data-screen-label="08 Footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-mark">
              <span className="brand-glyph">PI</span>
            </div>
            <div className="brand-name serif">Permit Intelligence</div>
            <p className="footer-tagline">{t.footer.tagline}</p>
          </div>
          <div className="footer-cols">
            {t.footer.cols.map((c, i) => (
              <div className="footer-col" key={i}>
                <div className="footer-col-title mono small">{c.title}</div>
                <ul>{c.links.map((l, j) => <li key={j}><a href="#">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal mono small">{t.footer.legal}</div>
          <div className="footer-disclaimer">{t.footer.disclaimer}</div>
        </div>
      </div>
    </footer>
  );
}

// ── Netherlands Map data ─────────────────────────────────────────────────────
const NL_MAP_DATA = [
  { name: "Almere",         coords: [52.3508, 5.2647],  status: "mandatory",     trigger: "≥4 woningen of >500 m²",          cvdr: "CVDR685432" },
  { name: "Amsterdam",      coords: [52.3676, 4.9041],  status: "mandatory",     trigger: "Impactscore ≥7 punten",            cvdr: "CVDR701294" },
  { name: "Rotterdam",      coords: [51.9225, 4.4792],  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR698117" },
  { name: "Utrecht",        coords: [52.0907, 5.1214],  status: "mandatory",     trigger: "Woningbouw ≥3 eenheden",           cvdr: "CVDR692058" },
  { name: "Den Haag",       coords: [52.0705, 4.3007],  status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR687744" },
  { name: "Eindhoven",      coords: [51.4416, 5.4697],  status: "mandatory",     trigger: "Impact + omvang gecombineerd",     cvdr: "CVDR690225" },
  { name: "Groningen",      coords: [53.2194, 6.5665],  status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR683910" },
  { name: "Tilburg",        coords: [51.5555, 5.0913],  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR691803" },
  { name: "Breda",          coords: [51.5719, 4.7683],  status: "mandatory",     trigger: "≥5 woningen of >750 m²",          cvdr: "CVDR694201" },
  { name: "Nijmegen",       coords: [51.8426, 5.8518],  status: "mandatory",     trigger: "Woningbouw ≥4 eenheden",           cvdr: "CVDR689553" },
  { name: "Haarlem",        coords: [52.3874, 4.6462],  status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR695812" },
  { name: "Arnhem",         coords: [51.9851, 5.8987],  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR688402" },
  { name: "Zwolle",         coords: [52.5168, 6.0830],  status: "mandatory",     trigger: "≥3 woningen of >500 m²",          cvdr: "CVDR693147" },
  { name: "Enschede",       coords: [52.2215, 6.8937],  status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR686720" },
  { name: "Apeldoorn",      coords: [52.2112, 5.9699],  status: "mandatory",     trigger: "Woningbouw ≥5 eenheden",           cvdr: "CVDR697034" },
  { name: "Leiden",         coords: [52.1601, 4.4970],  status: "mandatory",     trigger: "Impactscore ≥5 punten",            cvdr: "CVDR699281" },
  { name: "Maastricht",     coords: [50.8514, 5.6909],  status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR691405" },
  { name: "Dordrecht",      coords: [51.8133, 4.6901],  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR686903" },
  { name: "Zoetermeer",     coords: [52.0577, 4.4942],  status: "mandatory",     trigger: "≥3 woningen of >400 m²",          cvdr: "CVDR693740" },
  { name: "Amersfoort",     coords: [52.1561, 5.3878],  status: "mandatory",     trigger: "Woningbouw ≥4 eenheden",           cvdr: "CVDR695017" },
  { name: "Delft",          coords: [52.0116, 4.3571],  status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR688654" },
  { name: "Westland",       coords: [51.9958, 4.1946],  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR687291" },
  { name: "Emmen",          coords: [52.7791, 6.9009],  status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR684108" },
  { name: "Deventer",       coords: [52.2550, 6.1604],  status: "mandatory",     trigger: "≥3 woningen of commercieel >1000 m²", cvdr: "CVDR692876" },
  { name: "Sittard-Geleen", coords: [51.0016, 5.8706],  status: "mandatory",     trigger: "Woningbouw ≥3 eenheden",           cvdr: "CVDR690612" },
  { name: "Leeuwarden",     coords: [53.2012, 5.7999],  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR687834" },
  { name: "Venlo",          coords: [51.3702, 6.1724],  status: "mandatory",     trigger: "≥4 woningen of >500 m²",          cvdr: "CVDR693481" },
  { name: "Zaanstad",       coords: [52.4387, 4.8188],  status: "mandatory",     trigger: "Impactscore ≥6 punten",            cvdr: "CVDR696250" },
  // ── 13 new municipalities (added April 2026) ────────────────────────────────
  { name: "'s-Hertogenbosch", coords: [51.6921, 5.3050], status: "mandatory",     trigger: "Alle BOPA-aanvragen (omgevingsdialoog)", cvdr: "CVDR694802" },
  { name: "Helmond",        coords: [51.4753, 5.6633],  status: "voluntary",     trigger: "Aanbevolen; disclosure bij indiening", cvdr: "CVDR703561" },
  { name: "Ede",            coords: [52.0399, 5.6618],  status: "voluntary",     trigger: "Geen verplichte trigger (expliciet uitgesloten)", cvdr: "CVDR739251" },
  { name: "Haarlemmermeer", coords: [52.4432, 4.6897],  status: "mandatory",     trigger: "≥5 woningen of >750 m²",          cvdr: "CVDR706812" },
  { name: "Alkmaar",        coords: [52.6372, 4.7396],  status: "mandatory",     trigger: "Alle BOPA-aanvragen",              cvdr: "CVDR708245" },
  { name: "Alphen aan den Rijn", coords: [52.1395, 4.6577], status: "mandatory", trigger: "≥4 woningen of >500 m²",          cvdr: "CVDR704938" },
  { name: "Hengelo",        coords: [52.2629, 6.7952],  status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR695403" },
  { name: "Gouda",          coords: [51.9848, 4.7108],  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR697208" },
  { name: "Roosendaal",     coords: [51.5300, 4.4749],  status: "mandatory",     trigger: "≥3 woningen of >500 m²",          cvdr: "CVDR700182" },
  { name: "Lelystad",       coords: [52.5083, 5.4764],  status: "discretionary", trigger: "Per geval beoordeeld",             cvdr: "CVDR696745" },
  { name: "Purmerend",      coords: [52.5089, 5.1853],  status: "mandatory",     trigger: "≥4 woningen of >600 m²",          cvdr: "CVDR702847" },
  { name: "Hoorn",          coords: [52.6428, 5.0572],  status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR694007" },
  { name: "Nissewaard",     coords: [51.8375, 4.1464],  status: "voluntary",     trigger: "Aanbevolen, niet vereist",         cvdr: "CVDR692304" },
];

const STATUS_COLORS = {
  mandatory:     { fill: "#4ade80", label: "Verplicht",           labelEn: "Mandatory" },
  discretionary: { fill: "#fbbf24", label: "Beoordelingsruimte",  labelEn: "Discretionary" },
  voluntary:     { fill: "#60a5fa", label: "Vrijwillig",          labelEn: "Voluntary" },
};

// ── Netherlands Map component ────────────────────────────────────────────────
function NetherlandsMap({ t, lang }) {
  const mapContainerRef = useRefS(null);
  const leafletMapRef   = useRefS(null);
  const [activeCity, setActiveCity] = useStateS(null);
  const isNL = lang !== "en";

  useEffectS(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;
    if (typeof L === "undefined") return;

    const map = L.map(mapContainerRef.current, {
      center: [52.2, 5.3],
      zoom: 7,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom zoom control position
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // CartoDB Positron — clean, minimal tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 18 }
    ).addTo(map);

    // Subtle label layer on top
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
      { maxZoom: 18, pane: "shadowPane" }
    ).addTo(map);

    // Draw markers
    NL_MAP_DATA.forEach(city => {
      const color = STATUS_COLORS[city.status]?.fill || "#9ca3af";
      const marker = L.circleMarker(city.coords, {
        radius: 10,
        fillColor: color,
        color: "rgba(255,255,255,0.9)",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.88,
        className: "nl-map-marker",
      }).addTo(map);

      const statusLabel = STATUS_COLORS[city.status]?.[isNL ? "label" : "labelEn"] || "";
      marker.bindTooltip(
        `<div class="map-tooltip">
          <div class="mtt-name">${city.name}</div>
          <div class="mtt-status">${statusLabel}</div>
          <div class="mtt-trigger">${city.trigger}</div>
          <div class="mtt-cvdr mono">${city.cvdr}</div>
        </div>`,
        { permanent: false, direction: "top", offset: [0, -8], className: "nl-map-tooltip" }
      );

      marker.on("click", () => {
        window.location.href = `tool.html?muni=${encodeURIComponent(city.name)}`;
      });

      marker.on("mouseover", () => setActiveCity(city.name));
      marker.on("mouseout",  () => setActiveCity(null));
    });

    // Fit Netherlands bounds
    map.fitBounds([[50.7, 3.3], [53.6, 7.2]], { padding: [24, 24] });

    leafletMapRef.current = map;
    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  const mandatory    = NL_MAP_DATA.filter(c => c.status === "mandatory").length;
  const discretionary = NL_MAP_DATA.filter(c => c.status === "discretionary").length;
  const voluntary    = NL_MAP_DATA.filter(c => c.status === "voluntary").length;

  return (
    <section className="nl-map-section" data-screen-label="02b Map">
      <div className="container">
        <div className="section-head">
          <div className="head-l">
            <div className="eyebrow">{isNL ? "Database — 41 gemeenten in kaart" : "Database — 41 municipalities mapped"}</div>
            <h2 className="section-title serif">
              {isNL ? "Compliance zichtbaar gemaakt." : "Compliance made visible."}
            </h2>
            <p className="section-sub" style={{ marginTop: 8 }}>
              {isNL
                ? "Klik op een gemeente voor directe toegang tot beleidsdata, documentatievereisten en CVDR-citatie."
                : "Click any municipality for instant access to policy data, documentation requirements, and CVDR citation."}
            </p>
          </div>
          <div className="head-r">
            <a href="tool.html" className="link-arrow">
              {isNL ? "Naar de referentietool" : "Open reference tool"} <span className="arrow">→</span>
            </a>
          </div>
        </div>

        <div className="nl-map-layout">
          {/* Map */}
          <div className="nl-map-container">
            <div ref={mapContainerRef} className="nl-map-canvas" />
            {activeCity && (
              <div className="nl-map-active-label mono small">
                {activeCity} — {isNL ? "klik voor details" : "click for details"}
              </div>
            )}
          </div>

          {/* Sidebar stats */}
          <div className="nl-map-sidebar">
            <div className="nl-map-stat-card">
              <div className="nlms-eyebrow mono small">{isNL ? "Database" : "Coverage"}</div>
              <div className="nlms-value serif">28</div>
              <div className="nlms-label">{isNL ? "gemeenten volledig geprofileerd" : "municipalities fully profiled"}</div>
            </div>

            <div className="nl-map-legend">
              <div className="nml-title mono small">{isNL ? "Status participatieplicht" : "Participation status"}</div>
              <div className="nml-item">
                <span className="nml-dot" style={{ background: STATUS_COLORS.mandatory.fill }} />
                <div>
                  <div className="nml-label">{isNL ? "Verplicht" : "Mandatory"}</div>
                  <div className="nml-count mono small">{mandatory} {isNL ? "gemeenten" : "municipalities"}</div>
                </div>
              </div>
              <div className="nml-item">
                <span className="nml-dot" style={{ background: STATUS_COLORS.discretionary.fill }} />
                <div>
                  <div className="nml-label">{isNL ? "Beoordelingsruimte" : "Discretionary"}</div>
                  <div className="nml-count mono small">{discretionary} {isNL ? "gemeenten" : "municipalities"}</div>
                </div>
              </div>
              <div className="nml-item">
                <span className="nml-dot" style={{ background: STATUS_COLORS.voluntary.fill }} />
                <div>
                  <div className="nml-label">{isNL ? "Vrijwillig" : "Voluntary"}</div>
                  <div className="nml-count mono small">{voluntary} {isNL ? "gemeenten" : "municipalities"}</div>
                </div>
              </div>
            </div>

            <div className="nl-map-cta-block">
              <a href="tool.html" className="btn btn-primary" style={{ background: "var(--ink)", color: "var(--bg)", width: "100%", justifyContent: "center" }}>
                {isNL ? "Zoek jouw gemeente" : "Find your municipality"} <span className="arrow">→</span>
              </a>
              <div className="nl-map-source mono small">
                {isNL ? "Bron: lokaleregelgeving.overheid.nl" : "Source: lokaleregelgeving.overheid.nl"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.StatsStrip = StatsStrip;
window.Problem = Problem;
window.ProcessTimeline = ProcessTimeline;
window.HowItWorks = HowItWorks;
window.Proof = Proof;
window.Roadmap = Roadmap;
window.Pricing = Pricing;
window.FAQ = FAQ;
window.Footer = Footer;
window.TrialModal = TrialModal;
window.NetherlandsMap = NetherlandsMap;
