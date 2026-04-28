// Stats, Problem, ProcessTimeline, How, Proof, Roadmap, Pricing, FAQ, Footer, TrialModal

const { useState: useStateS, useEffect: useEffectS } = React;

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
