// Global preference manager for all pages
// Handles dark/light mode switching, language preference, and persistence via localStorage

(function() {
  const THEME_KEY = "permit-intelligence-theme";
  const LANG_KEY = "permit-intelligence-lang";
  const DARK = "dark";
  const LIGHT = "light";
  const DEFAULT_LANG = "nl";

  // Initialize preferences on page load
  function initPreferences() {
    // Initialize theme
    let savedTheme = localStorage.getItem(THEME_KEY);
    if (!savedTheme) {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      savedTheme = prefersDark ? DARK : LIGHT;
    }
    applyTheme(savedTheme);

    // Initialize language
    let savedLang = localStorage.getItem(LANG_KEY);
    if (!savedLang) {
      savedLang = DEFAULT_LANG;
    }
    // Store in window object so React components can access it
    window.STORED_LANG = savedLang;
  }

  // Apply theme to document
  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);

    // Update all toggle buttons
    updateToggleButtons(theme);
  }

  // Update toggle button states
  function updateToggleButtons(theme) {
    const toggles = document.querySelectorAll(".theme-toggle");
    toggles.forEach((toggle) => {
      const lightSpan = toggle.querySelector(".light-label");
      const darkSpan = toggle.querySelector(".dark-label");
      if (lightSpan) lightSpan.classList.toggle("active", theme === LIGHT);
      if (darkSpan) darkSpan.classList.toggle("active", theme === DARK);
    });
  }

  // Toggle theme function (called from button click)
  window.toggleTheme = function() {
    const currentTheme = document.body.dataset.theme || LIGHT;
    const newTheme = currentTheme === LIGHT ? DARK : LIGHT;
    applyTheme(newTheme);
  };

  // Save language preference (called from React setLang)
  window.saveLangPreference = function(lang) {
    localStorage.setItem(LANG_KEY, lang);
    window.STORED_LANG = lang;
  };

  // Get stored language preference
  window.getStoredLang = function() {
    return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  };

  // Initialize on DOMContentLoaded or immediately if already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPreferences);
  } else {
    initPreferences();
  }
})();
