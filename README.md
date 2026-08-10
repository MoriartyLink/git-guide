# learnGit

learnGit is an accelerated, bilingual Git guide: the shortest practical path from beginner to
community contributor. Learners study essential commands, practice the workflow, and prepare to
open a real pull request.

Learners sign up or sign in with Google or with email and password before accessing the guide.
Signed-in learning progress is synchronized to Supabase and cached in the learner's browser.

## Features

- English and Burmese interfaces
- Required Supabase accounts with Google OAuth or email/password sign-in and persistent sessions
- 8 learning modules from foundations to real contribution
- 63 searchable Git and GitHub FAQ topics
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

- Node.js 22 or newer
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

For signup-confirmation and forgot-password links, set the deployed app as **Supabase →
Authentication → URL Configuration → Site URL**, then add both the local and deployed app URLs to
**Redirect URLs**. The app sends new-account confirmations back to the current origin and requests a
password-reset return URL such as `https://your-domain.example/?password-reset=1`.

To enable Google sign-in:

1. In Google Cloud, configure the OAuth consent screen and create a **Web application** OAuth client.
2. Add `https://hiedkdrurpjriccflyph.supabase.co/auth/v1/callback` as an authorized redirect URI in
   that Google OAuth client. Replace the project URL if `VITE_SUPABASE_URL` points elsewhere.
3. In **Supabase → Authentication → Sign In / Providers → Google**, enable Google and enter the
   Google client ID and client secret.
4. In **Supabase → Authentication → URL Configuration**, keep `http://localhost:5173` and every
   deployed app origin in the redirect allow list. OAuth returns learners to the page where they
   started signing in.

Production signup also requires working credentials under **Supabase → Authentication → Emails →
SMTP Settings**. Check the Supabase Auth logs if account creation reports that the confirmation
email service is unavailable. A Gmail SMTP account must use a current Google App Password rather
than the account's normal password; Google revokes existing App Passwords after the Google Account
password changes.

Lesson completion is stored in `public.lesson_progress`. Apply the included migration after
authenticating the CLI with an account that can manage the configured project:

```bash
npx supabase link --project-ref hiedkdrurpjriccflyph
npx supabase db push --linked
```

The table enables row-level security and allows authenticated users to read and change only rows
whose `user_id` matches their Supabase Auth user ID.

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
up. Signed-in lesson completion is synchronized to Supabase and cached per user on the device.
Signed-out progress stays in `localStorage` and is migrated into the learner's account at sign-in.
Language and the one-time welcome-tour flag remain in `localStorage`.
Profile sharing creates a URL containing only the learner's chosen display name, completed-lesson
count, and account creation date. It does not include the learner's email address or account ID.
Guided terminal commands change only an in-memory educational repository model in the browser.
AI questions, recent chat turns, and selected website excerpts are sent to Groq to generate answers.
The certificate is rendered and downloaded in the browser.

## Contact

Developer: MoriartyLink — [moriartylink@gmail.com](mailto:moriartylink@gmail.com)

## License

Licensed under the [MIT License](LICENSE).
