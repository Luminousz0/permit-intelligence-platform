// Shared chrome (Nav, Footer, brand) for all subpages.
// The homepage uses its own copy in app.jsx; subpages use these.

const ACCENT_PRESETS_S = {
  orange: { bg: "oklch(0.68 0.16 50)", fg: "#fff" },
  blue:   { bg: "oklch(0.45 0.13 250)", fg: "#fff" },
  black:  { bg: "oklch(0.18 0.01 250)", fg: "#fff" },
};

const SUBNAV = {
  nl: [
    { href: "index.html",       label: "Home" },
    { href: "regelgeving.html", label: "Regelgeving" },
    { href: "tool.html",        label: "Referentietool" },
    { href: "dashboard.html",   label: "Dashboard" },
    { href: "gemeenten.html",   label: "Gemeenten" },
    { href: "diensten.html",    label: "Diensten" },
    { href: "faq.html",         label: "FAQ" },
  ],
  en: [
    { href: "index.html",       label: "Home" },
    { href: "regelgeving.html", label: "Regulatory" },
    { href: "tool.html",        label: "Reference tool" },
    { href: "dashboard.html",   label: "Dashboard" },
    { href: "gemeenten.html",   label: "Municipalities" },
    { href: "diensten.html",    label: "Services" },
    { href: "faq.html",         label: "FAQ" },
  ],
};

function SubNav({ lang, setLang, current, accent, tryLabel }) {
  const [theme, setThemeState] = React.useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentLang, setCurrentLang] = React.useState(lang || "nl");

  React.useEffect(() => {
    // Read initial theme from body data attribute
    const initialTheme = document.body.dataset.theme || "light";
    setThemeState(initialTheme);
  }, []);

  const handleLangChange = (newLang) => {
    setCurrentLang(newLang);
    setLang(newLang);
    if (window.saveLangPreference) window.saveLangPreference(newLang);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    if (window.toggleTheme) window.toggleTheme();
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="index.html" className="logo">
          <span className="logo-mark"><span className="logo-glyph">PI</span></span>
          <span className="logo-text serif">Permit Intelligence</span>
        </a>
        <nav className={`nav-links${mobileMenuOpen ? " nav-open" : ""}`}>
          {SUBNAV[lang].slice(1).map(l => (
            <a key={l.href} href={l.href} className={current === l.href ? "is-current" : ""} onClick={() => setMobileMenuOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-right">
          <button
            type="button"
            className="theme-toggle mono small"
            onClick={handleThemeToggle}
            title={theme === "light" ? "Donker" : "Licht"}
          >
            <span className={`light-label${theme === "light" ? " active" : ""}`}>Light</span>
            <span className="lang-sep">/</span>
            <span className={`dark-label${theme === "dark" ? " active" : ""}`}>Dark</span>
          </button>
          <button
            type="button"
            className="lang-toggle mono small"
            onClick={() => handleLangChange(currentLang === "nl" ? "en" : "nl")}
          >
            <span className={currentLang === "nl" ? "active" : ""}>NL</span>
            <span className="lang-sep">/</span>
            <span className={currentLang === "en" ? "active" : ""}>EN</span>
          </button>
          <a href="tool.html" className="nav-cta" style={{ background: accent.bg, color: accent.fg }}>
            {tryLabel}
          </a>
          <button
            type="button"
            className={`nav-menu-toggle${mobileMenuOpen ? " open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            title="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

function SubFooter({ t }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-mark"><span>PI</span></div>
            <div className="brand-name serif">Permit Intelligence</div>
            <p className="footer-tagline">{t.footer.tagline}</p>
          </div>
          <div className="footer-cols">
            {t.footer.cols.map((c, i) => (
              <div className="footer-col" key={i}>
                <div className="footer-col-title mono small">{c.title}</div>
                <ul>{c.links.map((l, j) => (
                  <li key={j}>
                    <a
                      href={l.href}
                      target={l.target || undefined}
                      rel={l.target === "_blank" ? "noopener noreferrer" : undefined}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}</ul>
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

// PageHeader — used on every subpage for hero/title block
function PageHeader({ eyebrow, title, sub, breadcrumb }) {
  return (
    <section className="page-header">
      <div className="container">
        {breadcrumb && (
          <div className="breadcrumb mono small">
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {i > 0 && <span className="bc-sep">/</span>}
                {b.href ? <a href={b.href}>{b.label}</a> : <span>{b.label}</span>}
              </span>
            ))}
          </div>
        )}
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="page-title serif">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
    </section>
  );
}

window.SubNav = SubNav;
window.SubFooter = SubFooter;
window.PageHeader = PageHeader;
window.ACCENT_PRESETS_S = ACCENT_PRESETS_S;
