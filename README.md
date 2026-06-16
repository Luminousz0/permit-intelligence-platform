# Permit Intelligence Platform

Reference tool for Dutch municipal compliance under the Omgevingswet. Built for real estate developers and advisors who need to know exactly what permits a project requires — by municipality, by project type, by location.

**[permit-intelligence-platform.vercel.app](https://permit-intelligence-platform.vercel.app/)**

---

## What it does

28 Dutch municipalities, 3-step flow: pick a location on the map, classify your project, and get a complete compliance document. The platform maps Omgevingswet requirements at the municipal level so developers don't have to dig through PDFs manually.

- **Interactive Leaflet map** — click any location in the Netherlands to start
- **3-step flow** — Locate → Classify → Document
- **28 municipalities profiled** with their specific permit requirements under Omgevingswet
- **PDOK integration** — official Dutch geodata services for parcel and address lookups
- **Document generation** — export a Word (.docx) compliance summary
- **i18n** — Dutch and English
- **Auth** — JWT-based user accounts
- **Payments** — Stripe integration

---

## Tech stack

| | |
|---|---|
| Frontend | React 18 + Vanilla JS |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcryptjs |
| Payments | Stripe |
| Map | Leaflet + PDOK geodata |
| Document export | docx |
| i18n | i18next |
| Deploy | Railway |

---

## Local development

```bash
npm install
npm run build   # TypeScript compile
npm run dev     # Start Node server (served on localhost:3000)
```

Requires Node 16+. Copy `.env.example` to `.env` and fill in values.

---

## Environment variables

See `.env.example` for the full list. Minimum required:

```
NODE_ENV=development
PORT=3000
```

Optional for production features: Stripe keys, Google Analytics, PDOK API key.

---

## Municipalities covered

28 municipalities across the Netherlands are profiled with Omgevingswet-specific permit matrices. Coverage focused on active real estate markets: Amsterdam, Rotterdam, Den Haag, Utrecht, and surrounding regions.

---

## License

Proprietary. All rights reserved.
