// Global theme manager for all pages
// Handles dark/light mode switching and persistence via localStorage

(function() {
  const THEME_KEY = "permit-intelligence-theme";
  const DARK = "dark";
  const LIGHT = "light";

  // Initialize theme on page load
  function initTheme() {
    // 1. Try to get saved preference
    let savedTheme = localStorage.getItem(THEME_KEY);

    // 2. If no saved preference, check system preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      savedTheme = prefersDark ? DARK : LIGHT;
    }

    // 3. Apply theme to document
    applyTheme(savedTheme);
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

  // Initialize on DOMContentLoaded or immediately if already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();
