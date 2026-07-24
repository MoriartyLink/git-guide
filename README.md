# Git Together

A public, bilingual Git and GitHub learning guide with an interactive terminal lab. The interface
uses a clean Apple HIG-inspired dark design and does not require accounts.

The guide includes 24 short English/Burmese lessons, quick knowledge checks, and 46 searchable
beginner answers covering Git, repositories, branches, GitHub, command flags, packages, releases,
deployments, CI/CD, collaborators, public contributors, permissions, mistakes, and collaboration.

## Run locally

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to the Node backend on
`http://localhost:8787`.

## Production

```bash
npm run build
npm start
```

The production server serves both the compiled website and these API routes:

- `GET /api/health` — service health
- `GET /api/guide` — modules and lessons
- `POST /api/terminal` — safe Git command simulation

Set `PORT` to choose the production port. If the frontend is deployed separately, set
`VITE_API_URL` while building it to point at the backend origin.

## Content

Course modules and terminal responses live in [`server/content.js`](server/content.js). Progress
is saved locally in each visitor's browser, so there is no authentication or personal data
collection.
