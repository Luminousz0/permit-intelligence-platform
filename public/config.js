// config.js — Permit Intelligence global config
// ─────────────────────────────────────────────────────
// TODO: Update CALENDLY_URL before launch
//   1. Create a free Calendly account at calendly.com
//   2. Create a "Demo" event type (30 min)
//   3. Paste your Calendly link below
window.CALENDLY_URL = "https://calendly.com/ashwinramcharan21/new-meeting";

window.openCalendly = function (label) {
  var url = window.CALENDLY_URL;
  var isPlaceholder = !url || url.includes("YOUR-LINK");
  if (!isPlaceholder && window.Calendly) {
    Calendly.initPopupWidget({ url: url });
  } else {
    window.open("mailto:info@permitintelligence.nl?subject=Demo aanvraag", "_blank");
  }
  if (window.trackEvent) trackEvent("demo_request", "conversion", label || "nav");
  return false;
};
