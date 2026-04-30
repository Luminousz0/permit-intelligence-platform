// config.js — Permit Intelligence global config
// ─────────────────────────────────────────────────────
// Contact & inquiries via GitHub
window.CONTACT_URL = "https://github.com/Luminousz0";

window.openContact = function (label) {
  window.open(window.CONTACT_URL, "_blank");
  if (window.trackEvent) trackEvent("contact_request", "conversion", label || "nav");
  return false;
};
