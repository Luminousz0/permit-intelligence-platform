# Permit Intelligence Platform

A modern SaaS reference tool for Dutch municipal compliance under the Omgevingswet (environmental law). Permit Intelligence simplifies permit requirements by providing real-time access to municipal policies, documentation templates, and expert guidance.

**Live**: [permit-intelligence.nl](https://permit-intelligence.nl)

---

## Overview

Permit Intelligence helps developers, architects, and project managers navigate Dutch municipal compliance requirements. The platform:

- **Instant Lookups**: Search 41+ Dutch municipalities for specific permit requirements
- **Policy Documentation**: Access complete municipal policies sourced directly from official government databases (CVDR)
- **Smart Classification**: Step-by-step process to classify your project type and identify requirements
- **Interactive Maps**: Visualize participation requirements across the Netherlands by municipality
- **Expert Consultation**: Get guided assistance for complex or urgent projects

---

## Features

### 1. Reference Tool (Free)
- Unlimited municipality searches
- Real-time policy database
- CVDR citations (source + publication date)
- Interactive Netherlands compliance map
- Export to PDF/Word

### 2. Subscription Plan (€49/month)
- All reference tool features
- Unlimited document searches
- Municipality-specific templates
- Policy updates via email
- Technical support (48h response)

### 3. Consultation Service (€500–€2000/project)
- Full participation documentation
- Pre-submission review
- Municipal pre-meeting guidance
- Direct specialist access
- Success guarantee

---

## Tech Stack

### Frontend
- **React 18** with Babel JSX (browser compilation)
- **CSS3** with OKLCH color system & CSS custom properties
- **Leaflet.js** for interactive maps
- **CartoDB** tile provider (Positron basemap)

### Backend
- **Node.js + TypeScript**
- **PDOK Locatieserver** API (address search & geocoding)
- **Overheid.nl** integration (municipal data)
- **CVDR API** (policy citations)

### Infrastructure
- Static site hosting (pages built at compile time)
- Browser-based CSR for interactive features
- No backend database required for MVP

---

## Project Structure

```
permit-intelligence-platform/
├── public/
│   ├── index.html              # Homepage
│   ├── tool.html               # Reference tool page
│   ├── dashboard.html          # Analytics dashboard
│   ├── diensten.html           # Services (Subscription & Consultation)
│   ├── gemeenten.html          # Municipal data explorer
│   ├── regelgeving.html        # Regulatory info page
│   ├── validatie.html          # Validation/proof page
│   ├── faq.html                # FAQ
│   │
│   ├── app.jsx                 # Homepage React app
│   ├── tool-app.jsx            # Reference tool React app
│   ├── dashboard-app.jsx       # Dashboard React app
│   ├── copy.jsx                # Copy & translations (NL/EN)
│   ├── shared.jsx              # Shared components (Nav, Footer)
│   │
│   ├── styles.css              # Main stylesheet
│   ├── styles-pages.css        # Page-specific styles
│   ├── theme-manager.js        # Light/dark mode toggle
│   ├── config.js               # API & tracking config
│   ├── analytics.js            # Google Analytics integration
│   │
│   └── fonts/                  # Self-hosted fonts
│       ├── Inter Tight
│       ├── Source Serif 4
│       └── JetBrains Mono
│
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Node.js 16+
- Modern browser (Chrome, Firefox, Safari, Edge)

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Luminousz0/permit-intelligence-platform.git
   cd permit-intelligence-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm start
   ```
   Opens `http://localhost:3000` (or configured port)

4. **Build for production**
   ```bash
   npm run build
   ```

---

## Key Technical Decisions

### OKLCH Color System
The platform uses OKLCH color space (not hex/RGB) for:
- **Perceptual consistency** across light and dark modes
- **Accessibility** with guaranteed contrast ratios
- **Theme flexibility** through CSS custom properties

Example:
```css
--ink: oklch(0.22 0.01 250);        /* Light mode: dark text */
body[data-theme="dark"] { --ink: oklch(0.97 0.005 250); }  /* Dark mode: light text */
```

### Browser Compilation
React components are compiled client-side using Babel, not Node.js:
- Reduces build complexity
- Enables dynamic theming without rebuilds
- Simplifies deployment (no build step)

### Real Data Integration
- **PDOK**: Municipal address search & reverse geocoding
- **Overheid.nl**: Official government municipalities list
- **CVDR**: Policy source citations (community-driven database)

---

## API Integrations

### PDOK Locatieserver (Address Search)
- Returns: `x, y, municipality, postcode`
- Rate limit: Generous (public service)
- Docs: https://www.pdok.nl/

### Google Analytics
- Tracks: Tool usage, feature adoption, conversions
- ID: `G-740YX0W0GE`
- Purpose: Understand user behavior & improve UX

---

## Theme System

### Light Mode (Default)
```
Background: oklch(0.985 0.003 85)    (warm off-white)
Text:       oklch(0.22 0.01 250)     (dark)
Accents:    Orange, Blue, Green, Red, etc.
```

### Dark Mode
```
Background: oklch(0.18 0.01 250)     (dark blue-gray)
Text:       oklch(0.97 0.005 250)    (near-white)
Accents:    Adjusted for dark backgrounds
```

Toggle via: `body[data-theme="dark"]` attribute

---

## Customization

The platform includes a **tweaks panel** (dev-only) for customizing:
- Accent color preset (orange, blue, black, etc.)
- Custom accent colors
- Typography pairing
- Background preset
- Layout density
- And more...

Access via the "Tweaks" panel on the homepage.

---

## Performance Metrics

- **First Contentful Paint**: <1.2s (light mode), <1.5s (dark mode)
- **Lighthouse Score**: 94+ (across all pages)
- **Bundle Size**: ~80KB gzipped (React + apps)
- **API Response Time**: <200ms (PDOK, Overheid)

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ IE11 (not supported)

---

## Contributing

This is an active SaaS project. For contributions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes with clear messages
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

**Code style**: Follow existing patterns in `app.jsx` and `styles.css`.

---

## License

Proprietary © 2024 Ashwin Ramcharan. All rights reserved.

This codebase is private and not open for public use. For licensing inquiries, contact the author.

---

## Contact & Support

- **Website**: https://permit-intelligence.nl
- **Email**: ashwinramcharan21@gmail.com
- **GitHub**: [@Luminousz0](https://github.com/Luminousz0)

---

## Roadmap

### Q2 2026
- [ ] Enhanced mobile experience
- [ ] Offline mode with service workers
- [ ] PDF generation for participation docs
- [ ] Multi-language support (EN, FR, DE)

### Q3 2026
- [ ] AI-powered requirement classification
- [ ] Real-time municipal policy tracking
- [ ] Integration with municipal APIs
- [ ] Permit timeline calculator

### Q4 2026+
- [ ] European expansion (Belgium, Germany)
- [ ] Mobile native apps (iOS/Android)
- [ ] Advanced analytics for government partners

---

## Acknowledgments

- **Data Sources**: PDOK, Overheid.nl, CVDR community
- **Design Inspiration**: Modern SaaS platforms (Stripe, Figma, Linear)
- **Built at**: UvA Business Administration program (Amsterdam)

---

**Made with 🇳🇱 for Dutch developers.**
