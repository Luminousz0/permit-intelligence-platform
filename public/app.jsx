// Top nav + main app shell with a much-expanded Tweaks panel.

const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp, useCallback: useCallbackApp } = React;

const ACCENT_PRESETS = {
  orange:  { bg: "oklch(0.68 0.16 50)",  fg: "#fff",            name: "Oranje" },
  blue:    { bg: "oklch(0.45 0.13 250)", fg: "#fff",            name: "Blauw" },
  black:   { bg: "oklch(0.18 0.01 250)", fg: "#fff",            name: "Zwart" },
  green:   { bg: "oklch(0.55 0.15 145)", fg: "#fff",            name: "Bos" },
  red:     { bg: "oklch(0.55 0.18 25)",  fg: "#fff",            name: "Tegel" },
  yellow:  { bg: "oklch(0.85 0.16 90)",  fg: "oklch(0.18 0.01 250)", name: "Mosterd" },
  violet:  { bg: "oklch(0.5 0.18 295)",  fg: "#fff",            name: "Violet" },
  custom:  { bg: "var(--accent-custom)", fg: "var(--accent-fg-custom)", name: "Custom" },
};

const FONT_PAIRS = {
  serif:   { headline: "'Source Serif 4', Georgia, serif",     body: "'Inter Tight', system-ui, sans-serif" },
  geometric: { headline: "'Space Grotesk', system-ui, sans-serif", body: "'Inter Tight', system-ui, sans-serif" },
  classic: { headline: "'Playfair Display', Georgia, serif",   body: "'Inter Tight', system-ui, sans-serif" },
  modern:  { headline: "'Inter Tight', system-ui, sans-serif", body: "'Inter Tight', system-ui, sans-serif" },
  editorial: { headline: "'Fraunces', Georgia, serif",         body: "'Inter Tight', system-ui, sans-serif" },
  technical: { headline: "'JetBrains Mono', ui-monospace, monospace", body: "'Inter Tight', system-ui, sans-serif" },
};

const BG_PRESETS = {
  paper:   { bg: "oklch(0.985 0.003 85)", alt: "oklch(0.965 0.005 85)", name: "Paper" },
  cool:    { bg: "oklch(0.985 0.005 240)", alt: "oklch(0.96 0.008 240)", name: "Cool" },
  warm:    { bg: "oklch(0.97 0.012 60)",   alt: "oklch(0.94 0.018 60)",  name: "Warm" },
  green:   { bg: "oklch(0.98 0.012 145)",  alt: "oklch(0.95 0.02 145)",  name: "Mint" },
  dark:    { bg: "oklch(0.16 0.01 250)",   alt: "oklch(0.22 0.012 250)", name: "Dark" },
  pure:    { bg: "#ffffff",                alt: "oklch(0.96 0 0)",       name: "Pure" },
};

const HOME_NAV = {
  nl: [
    { href: "regelgeving.html", label: "Regelgeving" },
    { href: "tool.html",        label: "Referentietool" },
    { href: "gemeenten.html",   label: "Gemeenten" },
    { href: "diensten.html",    label: "Diensten" },
    { href: "faq.html",         label: "FAQ" },
  ],
  en: [
    { href: "regelgeving.html", label: "Regulatory" },
    { href: "tool.html",        label: "Reference tool" },
    { href: "gemeenten.html",   label: "Municipalities" },
    { href: "diensten.html",    label: "Services" },
    { href: "faq.html",         label: "FAQ" },
  ],
};

function Logo({ glyph }) {
  return (
    <a href="index.html" className="logo">
      <span className="logo-mark"><span className="logo-glyph">{glyph || "PI"}</span></span>
      <span className="logo-text serif">Permit Intelligence</span>
    </a>
  );
}

function Nav({ lang, setLang, t, accent, sticky, glyph, onTrialOpen }) {
  return (
    <header className="nav" data-sticky={sticky ? "yes" : "no"}>
      <div className="container nav-inner">
        <Logo glyph={glyph} />
        <nav className="nav-links">
          {HOME_NAV[lang].map(l => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-right">
          <button type="button" className="lang-toggle mono small"
                  onClick={() => setLang(lang === "nl" ? "en" : "nl")}>
            <span className={lang === "nl" ? "active" : ""}>NL</span>
            <span className="lang-sep">/</span>
            <span className={lang === "en" ? "active" : ""}>EN</span>
          </button>
          <button
            type="button"
            className="nav-cta-ghost"
            onClick={() => window.openCalendly ? window.openCalendly("nav") : (window.location.href = "diensten.html")}
          >
            {t.nav.demo}
          </button>
          <button
            type="button"
            className="nav-cta"
            style={{ background: accent.bg, color: accent.fg }}
            onClick={() => { if (onTrialOpen) onTrialOpen(); }}
          >
            {t.nav.tryTool}
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [trialOpen, setTrialOpen] = useStateApp(false);
  const openTrial = useCallbackApp(() => setTrialOpen(true), []);
  const closeTrial = useCallbackApp(() => setTrialOpen(false), []);

  const lang = tweaks.lang;
  const setLang = (v) => setTweak("lang", v);
  const t = window.COPY[lang];

  // Cycle headlines automatically
  const [autoIdx, setAutoIdx] = useStateApp(tweaks.headline);
  useEffectApp(() => {
    if (!tweaks.autoCycle) { setAutoIdx(tweaks.headline); return; }
    const total = t.hero.headlines.length;
    let i = tweaks.headline;
    const id = setInterval(() => {
      i = (i + 1) % total;
      setAutoIdx(i);
    }, 4000);
    return () => clearInterval(id);
  }, [tweaks.autoCycle, tweaks.headline, t]);

  const headlineIdx = tweaks.autoCycle ? autoIdx : tweaks.headline;

  // Resolve accent
  const baseAccent = ACCENT_PRESETS[tweaks.accent] || ACCENT_PRESETS.orange;
  const accent = tweaks.accent === "custom"
    ? { bg: tweaks.customAccent, fg: tweaks.customAccentText }
    : baseAccent;

  // Apply CSS variables
  useEffectApp(() => {
    const r = document.documentElement;
    const fonts = FONT_PAIRS[tweaks.fontPair] || FONT_PAIRS.serif;
    const bg = BG_PRESETS[tweaks.bgPreset] || BG_PRESETS.paper;
    r.style.setProperty("--serif", fonts.headline);
    r.style.setProperty("--sans", fonts.body);
    r.style.setProperty("--bg", bg.bg);
    r.style.setProperty("--bg-alt", bg.alt);
    r.style.setProperty("--accent-custom", tweaks.customAccent);
    r.style.setProperty("--accent-fg-custom", tweaks.customAccentText);
    r.style.setProperty("--maxw", tweaks.contentWidth + "px");
    r.style.setProperty("--scale", tweaks.typeScale);
    r.style.setProperty("--radius-base", tweaks.radius + "px");
    r.style.setProperty("--density", tweaks.density);
    document.body.style.fontSize = tweaks.bodySize + "px";
    document.body.dataset.aesthetic = tweaks.aesthetic;
    document.body.dataset.hero = tweaks.hero;
    document.body.dataset.theme = tweaks.theme;
    document.body.dataset.density = tweaks.density;
    document.body.dataset.grid = tweaks.showGrid ? "yes" : "no";
    document.body.dataset.noise = tweaks.noise ? "yes" : "no";
    document.body.dataset.italic = tweaks.italicEmph ? "yes" : "no";
    document.body.dataset.uppercase = tweaks.uppercaseEyebrows ? "yes" : "no";
    document.body.dataset.bordered = tweaks.borderedSections ? "yes" : "no";
    document.body.dataset.rounded = tweaks.radius >= 12 ? "soft" : (tweaks.radius >= 6 ? "med" : "sharp");
  }, [tweaks]);

  const onScrollHow = () => {
    const el = document.getElementById("how");
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
  };

  return (
    <>
      <Nav lang={lang} setLang={setLang} t={t} accent={accent}
           sticky={tweaks.stickyNav} glyph={tweaks.logoGlyph} onTrialOpen={openTrial} />
      <main>
        {tweaks.showHero && (
          <Hero lang={lang} t={t} headlineIdx={headlineIdx} accent={accent} onScrollHow={onScrollHow} />
        )}
        {tweaks.showStats && <StatsStrip t={t} />}
        {tweaks.showProblem && <Problem t={t} />}
        {tweaks.showProcess && <ProcessTimeline t={t} />}
        {tweaks.showHow && <HowItWorks t={t} accent={accent} />}
        {tweaks.showProof && <Proof t={t} />}
        {tweaks.showRoadmap && <Roadmap t={t} />}
        {tweaks.showPricing && <Pricing t={t} accent={accent} onTrialOpen={openTrial} />}
        {tweaks.showFaq && <FAQ t={t} />}
        <Footer t={t} />
      </main>

      {trialOpen && <TrialModal lang={lang} accent={accent} onClose={closeTrial} />}

      <TweaksPanel title="Tweaks">
        {/* ─── Esthetiek ─────────────────────────── */}
        <TweakSection title="Esthetiek">
          <TweakRadio value={tweaks.aesthetic} onChange={(v) => setTweak("aesthetic", v)}
            options={[
              { value: "hybrid",        label: "Hybrid" },
              { value: "institutional", label: "Institut." },
              { value: "saas",          label: "SaaS" },
              { value: "editorial",     label: "Editorial" },
            ]} />
          <TweakRadio value={tweaks.theme} onChange={(v) => setTweak("theme", v)}
            options={[
              { value: "light", label: "Licht" },
              { value: "dark",  label: "Donker" },
            ]} />
        </TweakSection>

        {/* ─── Kleuren ─────────────────────────── */}
        <TweakSection title="Accent kleur">
          <TweakSelect value={tweaks.accent} onChange={(v) => setTweak("accent", v)}
            options={Object.entries(ACCENT_PRESETS).map(([k, v]) => ({ value: k, label: v.name }))} />
          {tweaks.accent === "custom" && (
            <>
              <TweakColor label="Custom kleur" value={tweaks.customAccent}
                onChange={(v) => setTweak("customAccent", v)} />
              <TweakColor label="Tekst op accent" value={tweaks.customAccentText}
                onChange={(v) => setTweak("customAccentText", v)} />
            </>
          )}
        </TweakSection>

        <TweakSection title="Achtergrond">
          <TweakSelect value={tweaks.bgPreset} onChange={(v) => setTweak("bgPreset", v)}
            options={Object.entries(BG_PRESETS).map(([k, v]) => ({ value: k, label: v.name }))} />
          <TweakToggle label="Subtiele ruis" value={tweaks.noise}
            onChange={(v) => setTweak("noise", v)} />
          <TweakToggle label="Toon kolomraster" value={tweaks.showGrid}
            onChange={(v) => setTweak("showGrid", v)} />
        </TweakSection>

        {/* ─── Typografie ─────────────────────── */}
        <TweakSection title="Typografie">
          <TweakSelect value={tweaks.fontPair} onChange={(v) => setTweak("fontPair", v)}
            options={[
              { value: "serif",     label: "Source Serif + Inter" },
              { value: "geometric", label: "Space Grotesk + Inter" },
              { value: "classic",   label: "Playfair + Inter" },
              { value: "modern",    label: "Inter + Inter" },
              { value: "editorial", label: "Fraunces + Inter" },
              { value: "technical", label: "JetBrains Mono + Inter" },
            ]} />
          <TweakSlider label="Body grootte" value={tweaks.bodySize} min={13} max={20} step={1} unit="px"
            onChange={(v) => setTweak("bodySize", v)} />
          <TweakSlider label="Headline schaal" value={tweaks.typeScale} min={0.8} max={1.5} step={0.05}
            onChange={(v) => setTweak("typeScale", v)} />
          <TweakToggle label="Cursief in headline" value={tweaks.italicEmph}
            onChange={(v) => setTweak("italicEmph", v)} />
          <TweakToggle label="Eyebrows in HOOFDLETTERS" value={tweaks.uppercaseEyebrows}
            onChange={(v) => setTweak("uppercaseEyebrows", v)} />
        </TweakSection>

        {/* ─── Layout ─────────────────────────── */}
        <TweakSection title="Layout">
          <TweakSlider label="Content breedte" value={tweaks.contentWidth} min={960} max={1600} step={20} unit="px"
            onChange={(v) => setTweak("contentWidth", v)} />
          <TweakRadio value={tweaks.density} onChange={(v) => setTweak("density", v)}
            options={[
              { value: "compact", label: "Compact" },
              { value: "regular", label: "Regular" },
              { value: "spacious", label: "Lucht" },
            ]} />
          <TweakSlider label="Hoek-radius" value={tweaks.radius} min={0} max={20} step={1} unit="px"
            onChange={(v) => setTweak("radius", v)} />
          <TweakToggle label="Sectie-randen" value={tweaks.borderedSections}
            onChange={(v) => setTweak("borderedSections", v)} />
          <TweakToggle label="Sticky navigatie" value={tweaks.stickyNav}
            onChange={(v) => setTweak("stickyNav", v)} />
        </TweakSection>

        {/* ─── Hero ─────────────────────────── */}
        <TweakSection title="Hero">
          <TweakRadio value={tweaks.hero} onChange={(v) => setTweak("hero", v)}
            options={[
              { value: "widget",     label: "Widget" },
              { value: "screenshot", label: "Shot" },
              { value: "map",        label: "Kaart" },
            ]} />
          <TweakSelect value={tweaks.headline} onChange={(v) => setTweak("headline", Number(v))}
            options={[
              { value: 0, label: "1 — 26 weken (probleem)" },
              { value: 1, label: "2 — 342/35+ (cijfers)" },
              { value: 2, label: "3 — Afgewezen? (urgentie)" },
              { value: 3, label: "4 — Compliance (sober)" },
            ]} />
          <TweakToggle label="Headline auto-cyclen" value={tweaks.autoCycle}
            onChange={(v) => setTweak("autoCycle", v)} />
        </TweakSection>

        {/* ─── Brand ─────────────────────────── */}
        <TweakSection title="Brand">
          <TweakText label="Logo glyph" value={tweaks.logoGlyph}
            onChange={(v) => setTweak("logoGlyph", v.slice(0, 3))} />
        </TweakSection>

        {/* ─── Secties tonen ─────────────────── */}
        <TweakSection title="Secties">
          <TweakToggle label="Hero" value={tweaks.showHero} onChange={(v) => setTweak("showHero", v)} />
          <TweakToggle label="Statistieken" value={tweaks.showStats} onChange={(v) => setTweak("showStats", v)} />
          <TweakToggle label="Probleem" value={tweaks.showProblem} onChange={(v) => setTweak("showProblem", v)} />
          <TweakToggle label="Vergunningsproces" value={tweaks.showProcess} onChange={(v) => setTweak("showProcess", v)} />
          <TweakToggle label="Hoe het werkt" value={tweaks.showHow} onChange={(v) => setTweak("showHow", v)} />
          <TweakToggle label="Proof" value={tweaks.showProof} onChange={(v) => setTweak("showProof", v)} />
          <TweakToggle label="Roadmap" value={tweaks.showRoadmap} onChange={(v) => setTweak("showRoadmap", v)} />
          <TweakToggle label="Prijzen" value={tweaks.showPricing} onChange={(v) => setTweak("showPricing", v)} />
          <TweakToggle label="FAQ" value={tweaks.showFaq} onChange={(v) => setTweak("showFaq", v)} />
        </TweakSection>

        {/* ─── Resetten ─────────────────────── */}
        <TweakSection title="Reset">
          <TweakButton label="Defaults herstellen" onClick={() => {
            Object.entries(window.TWEAK_DEFAULTS_ORIGINAL).forEach(([k, v]) => setTweak(k, v));
          }} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
