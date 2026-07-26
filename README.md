# learnGit

learnGit is a public, bilingual Git and GitHub learning guide for community contributors. It
combines short lessons, a stateful guided terminal, practical cheat sheets, randomized
knowledge checks, a guide-grounded AI helper, and a downloadable completion certificate.

Learners can create an optional account or sign in with email and password. Learning progress still
stays in the learner's browser.

## Features

- English and Burmese interfaces
- Optional Supabase email/password accounts with persistent sessions
- 7 learning modules with 34 beginner-focused lessons
- 49 searchable Git and GitHub knowledge topics
- Stateful client-side guided terminal with a synchronized commit map
- Guided scenarios for commits, branches, merges, rebases, conflicts, history, releases, remotes,
  pull requests, and free play
- Real isolated terminal option clearly marked **Coming soon**
- Groq-powered AI helper grounded only in the website’s lessons and knowledge topics
- Task-based cheat sheets for daily work, features, conflicts, pull requests, and releases
- Randomized quiz-answer positions
- Local progress tracking and an A4 PDF completion certificate
- Responsive Apple HIG-inspired black and green interface

## Technology

- React 18 and Vite
- Express 5
- Supabase Auth
- Groq Chat Completions API
- jsPDF for client-side certificate generation
- Plain CSS
- ESLint

## Quick start

Requirements:

- Node.js 20.12 or newer
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
| `SUPABASE_URL` | Express | Requested project URL | Issuer used to verify account JWTs |
| `GROQ_API_KEY` | Express/Vercel | — | Server-only key for the guide assistant |
| `GROQ_MODEL` | Express/Vercel | `openai/gpt-oss-20b` | Production Groq model |

The production Express process serves both `dist/` and the API.

Copy `.env.example` to `.env` for local development and set the project's public publishable key
and a newly rotated Groq key. The exact key name is `GROQ_API_KEY`—provider credentials must never
use the `VITE_` prefix. Restart `npm run dev` after changing `.env`. In a hosted environment, add
the same server variables to the deployment configuration and redeploy.

## Project structure

```text
.
├── docs/                  System and architecture documentation
├── api/                   Vercel Function entry points
├── sandbox/               Future real-terminal prototype (not exposed in the current UI)
├── server/
│   ├── guide.js           Authoritative modules, lessons, and knowledge topics
│   ├── chat.js            Guide-only retrieval and Groq request
│   ├── auth.js            Supabase JWT verification
│   ├── app.js             Shared Express API application
│   └── index.js           Local/Node production listener and static server
├── src/
│   ├── assets/            learnGit brand asset
│   ├── App.jsx            Views, state, interactions, and certificate generation
│   ├── GuidedGitSimulator.jsx Synchronized map-and-terminal practice interface
│   ├── GuideChat.jsx      Floating guide-grounded AI helper
│   ├── gitSimulator.js    In-browser Git state and scenario engine
│   ├── SandboxTerminal.jsx Future xterm/WebSocket client
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

The AI helper builds its context from the same `server/guide.js` content. It selects relevant
excerpts locally before contacting Groq and is instructed to decline questions the excerpts do not
cover.

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
| `POST` | `/api/chat` | Answer an authenticated, guide-grounded Git question |

The guided terminal runs entirely in browser memory and never executes operating-system commands.

## Deploy on Vercel

Import the repository into Vercel and keep the framework preset set to Vite. The committed
[`vercel.json`](vercel.json) builds `dist/`, supports SPA navigation, and preserves API routes.

The files in [`api/`](api/) expose the shared Express API as Vercel Functions:

- `api/health.js` → `/api/health`
- `api/guide.js` → `/api/guide`
- `api/chat.js` → `/api/chat`

No `VITE_API_URL` value is needed when the frontend and functions are in the same Vercel project.
Set the rotated `GROQ_API_KEY` as a Vercel secret before using the AI helper.

## Real sandbox status

The real isolated terminal is intentionally disabled and labelled **Coming soon**. The prototype
under `sandbox/` is retained for future work, but it is not part of the current learner flow and no
`VITE_SANDBOX_URL` is required. The guided terminal deploys with the normal Vite application.

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
Guided terminal commands change only an in-memory educational repository model in the browser.
AI questions, recent chat turns, and selected website excerpts are sent to Groq to generate answers.
The certificate is rendered and downloaded in the browser.

## Contact

Developer: MoriartyLink — [moriartylink@gmail.com](mailto:moriartylink@gmail.com)

## License

Licensed under the [MIT License](LICENSE).
