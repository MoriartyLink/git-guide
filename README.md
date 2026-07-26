# Git Together

Git Together is a public, bilingual Git and GitHub learning guide for community contributors. It
combines short lessons, visual Git maps, practical cheat sheets, randomized knowledge checks, a
safe terminal simulator, and a downloadable completion certificate.

Learners can create an optional account or sign in with email and password. Learning progress still
stays in the learner's browser.

## Features

- English and Burmese interfaces
- Optional Supabase email/password accounts with persistent sessions
- 7 learning modules with 34 beginner-focused lessons
- 49 searchable Git and GitHub knowledge topics
- Interactive branch, merge, rebase, and conflict visualizations
- Safe simulated terminal with practical Git, GitHub CLI, and SSH commands
- Task-based cheat sheets for daily work, features, conflicts, pull requests, and releases
- Randomized quiz-answer positions
- Local progress tracking and an A4 PDF completion certificate
- Responsive Apple HIG-inspired black and green interface

## Technology

- React 18 and Vite
- Express 5
- Supabase Auth
- jsPDF for client-side certificate generation
- Plain CSS
- ESLint

## Quick start

Requirements:

- Node.js 20 or newer
- npm 10 or newer

```bash
git clone <repository-url>
cd git-guide
npm install
npm run dev
```

The development services are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

Vite proxies `/api` requests to the backend during development.

## Available commands

```bash
npm run dev      # Run frontend and backend with file watching
npm run check    # Run ESLint
npm run build    # Create the production frontend in dist/
npm start        # Serve the API and production frontend
npm run preview  # Preview the Vite production build
```

## Production

```bash
npm install
npm run build
npm start
```

Configuration:

| Variable | Used by | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | Express | `8787` | Production server port |
| `VITE_API_URL` | Vite build | Same origin | Backend origin when frontend and API are deployed separately |
| `VITE_SUPABASE_URL` | Vite build | Requested Supabase project URL | Supabase project API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Vite build | — | Public Supabase publishable key used by Auth |

The production Express process serves both `dist/` and the API.

Copy `.env.example` to `.env.local` for local development and set the project's public publishable
key. In a hosted environment, add the same variables to the deployment configuration.

## Project structure

```text
.
├── docs/                  System and architecture documentation
├── api/                   Vercel Function entry points
├── server/
│   ├── guide.js           Authoritative modules, lessons, and knowledge topics
│   ├── content.js         Terminal response fixtures
│   ├── app.js             Shared Express API application
│   └── index.js           Local/Node production listener and static server
├── src/
│   ├── assets/            Git Together brand asset
│   ├── App.jsx            Views, state, interactions, and certificate generation
│   ├── main.jsx           React entry point
│   └── styles.css         Responsive design system and component styles
├── CONTRIBUTING.md
├── vercel.json            Vite output and SPA routing on Vercel
└── vite.config.js
```

## Content editing

Learning content is defined in [`server/guide.js`](server/guide.js). Each module contains lessons,
and each lesson includes English content plus a Burmese `my` object. Searchable knowledge topics
are exported from the same file.

Terminal output is simulated. Command fixtures and command routing live in
[`server/content.js`](server/content.js) and [`server/index.js`](server/index.js).

When changing content:

1. Keep English and Burmese versions aligned
2. Use short, direct explanations for beginners
3. Avoid Burmese full-stop punctuation `။` to match the interface style
4. Confirm every lesson has a unique `id`
5. Run `npm run check` and `npm run build`

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health |
| `GET` | `/api/guide` | Modules, lessons, and knowledge topics |
| `POST` | `/api/terminal` | Execute a safe simulated command |

The terminal never runs commands on the host operating system.

## Deploy on Vercel

Import the repository into Vercel and keep the framework preset set to Vite. The committed
[`vercel.json`](vercel.json) builds `dist/`, supports SPA navigation, and preserves API routes.

The files in [`api/`](api/) expose the shared Express API as Vercel Functions:

- `api/health.js` → `/api/health`
- `api/guide.js` → `/api/guide`
- `api/terminal.js` → `/api/terminal`

No `VITE_API_URL` value is needed when the frontend and functions are in the same Vercel project.
After deployment, verify `/api/health` before testing the terminal.

References: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) and
[Express on Vercel](https://vercel.com/docs/frameworks/backend/express).

## Documentation

- [Documentation index](docs/README.md)
- [System documentation](docs/SYSTEM.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Contribution guide](CONTRIBUTING.md)

## Privacy

Account email and authentication metadata are handled by Supabase when a learner chooses to sign
up. Language and lesson completion remain in `localStorage`; they are not synced to the account.
The certificate is rendered and downloaded in the browser.

## Contact

Developer: MoriartyLink — [moriartylink@gmail.com](mailto:moriartylink@gmail.com)

## License

Licensed under the [MIT License](LICENSE).
