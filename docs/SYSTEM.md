# System documentation

## 1. Purpose

learnGit teaches beginner contributors how to use Git and GitHub. The learning guide is public and
bilingual. The guided terminal is available in the browser, while optional Supabase accounts
unlock the guide-grounded AI helper. Lesson progress remains browser-local.

## 2. System boundaries

The system includes:

- A React single-page application
- Static bilingual learning content
- An Express JSON API
- Supabase email/password authentication
- A Groq-powered assistant grounded in the committed guide content
- A client-side Git state engine with synchronized map and terminal views
- A disabled, clearly labelled future real-sandbox prototype
- Browser-local progress and language preferences
- Browser-side PDF certificate generation

The system does not include:

- A database
- Server-side learner progress
- Analytics or behavioral tracking
- GitHub OAuth or GitHub API mutations
- Shell execution in the Express/Vercel application process
- Open-ended AI answers based on material outside the website

## 3. Runtime components

| Component | File | Responsibility |
| --- | --- | --- |
| React entry | `src/main.jsx` | Mount the application |
| Application UI | `src/App.jsx` | Navigation, views, local state, quizzes, authentication, and certificates |
| Guided terminal | `src/GuidedGitSimulator.jsx` | Scenario browser, commit map, terminal history, and learner controls |
| Git simulator engine | `src/gitSimulator.js` | In-memory refs, commits, commands, remote state, and goal predicates |
| Future terminal client | `src/SandboxTerminal.jsx` | Prototype xterm/WebSocket integration; not exposed in the current UI |
| AI helper | `src/GuideChat.jsx` | Floating authenticated chat interface and source labels |
| Design system | `src/styles.css` | Responsive black/green Apple HIG-inspired presentation |
| Learning model | `server/guide.js` | Authoritative modules, lessons, translations, and knowledge topics |
| Chat retrieval | `server/chat.js` | Select relevant guide excerpts and request a Groq completion |
| API authentication | `server/auth.js` | Verify Supabase access tokens against project JWKS |
| API application | `server/app.js` | Guide and chat routes, compression, and security headers |
| Node server | `server/index.js` | Local/Node listener and production static hosting |
| Vercel adapters | `api/*.js` | Expose the shared API app as Vercel Functions |
| Future Sandbox Worker | `sandbox/worker.ts` | Prototype for a later isolated real terminal |
| Future Sandbox image | `sandbox/Dockerfile` | Prototype container image |
| Build configuration | `vite.config.js` | React plugin, development port, and API proxy |
| Vercel configuration | `vercel.json` | Vite build output and SPA rewrite |

## 4. Development runtime

`npm run dev` starts two processes with `concurrently`:

1. Vite serves the React application on port `5173`
2. Node watches and runs Express on port `8787`

Vite proxies requests under `/api` to Express, so those requests are same-origin in development.
The guided terminal needs no additional service.

## 5. Production runtime

`npm run build` writes the client bundle to `dist/`. For a traditional Node deployment,
`npm start` runs Express, which:

1. Adds Helmet headers
2. Compresses responses
3. Parses JSON bodies up to 32 KB
4. Serves `/api/*`
5. Serves static files from `dist/`
6. Returns `dist/index.html` for client-side routes

Set `PORT` to change the server port.

If the frontend is hosted separately, set `VITE_API_URL` during the frontend build.

### Vercel runtime

Vercel builds the same Vite client and maps each file in `api/` to an endpoint:

| Function file | Public route |
| --- | --- |
| `api/health.js` | `/api/health` |
| `api/guide.js` | `/api/guide` |
| `api/chat.js` | `/api/chat` |
| `api/terminal.js` | `/api/terminal` |

Each function exports the shared Express application from `server/app.js`. The application does not
call `listen()` inside Vercel. Static files come from `dist/`, and the SPA rewrite in `vercel.json`
returns `index.html` for non-file client requests.

The current guided terminal runs in the client and does not call `/api/terminal`. The route remains
for compatibility with the earlier deterministic terminal.

## 6. HTTP API

### `GET /api/health`

Response:

```json
{
  "ok": true,
  "service": "learn-git-api"
}
```

### `GET /api/guide`

Returns the complete learning guide.

Behavior:

- Adds `Cache-Control: public, max-age=300`
- Returns modules and knowledge topics imported from `server/guide.js`
- Contains no learner-specific data

Top-level response:

```json
{
  "name": "learnGit",
  "description": "A practical Git and GitHub guide for community builders.",
  "modules": [],
  "knowledgeTopics": []
}
```

### `POST /api/chat`

Request:

```json
{
  "language": "en",
  "messages": [
    {
      "role": "user",
      "content": "What should I do before opening a pull request?"
    }
  ]
}
```

Successful response:

```json
{
  "answer": "Review your changes, run the project checks, then push your branch.",
  "sources": [
    {
      "id": "lesson:open-pull-request",
      "title": "Open a pull request",
      "type": "lesson"
    }
  ]
}
```

The route requires a valid Supabase bearer token, keeps only the eight most recent turns, limits
each message to 1,200 characters, retrieves relevant excerpts from `server/guide.js`, and sends
those excerpts to Groq with a strict guide-only system instruction. Provider credentials remain on
the server.

### Future Sandbox Worker API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Worker health |
| `POST` | `/api/terminal/session` | Verify a Supabase token, prepare a user sandbox, and return a two-minute ticket |
| `DELETE` | `/api/terminal/session` | Destroy the signed-in user's sandbox |
| `GET` upgrade | `/ws/terminal?ticket=…` | Attach a browser WebSocket to the sandbox PTY |

These prototype routes are not exposed by the current interface. The real-terminal option remains
disabled and labelled **Coming soon**.

## 7. Browser state

Persistent state uses `localStorage`:

| Key | Value | Purpose |
| --- | --- | --- |
| `git-together-language` | `"en"` or `"my"` | Last selected interface language |
| `git-together-progress` | JSON array of lesson IDs | Completed lessons |

Supabase Auth separately persists the optional account session through the Supabase client. Lesson
progress and language preferences are not synchronized to Supabase.

Non-persistent React state includes:

- Current view and lesson
- Mobile navigation state
- Completed guided terminal scenarios
- Open knowledge topic
- Quiz selection
- Git-map phase
- Certificate dialog state
- Authentication dialog and current session state
- AI chat messages for the current page session
- In-memory Git repository and terminal history

Simulator history and repository state live only in React memory and reset with the page.

No state is synchronized between devices.

## 8. Navigation

The application supports these query parameters:

| Parameter | Values | Example |
| --- | --- | --- |
| `lang` | `en`, `my` | `?lang=my` |
| `view` | `home`, `knowledge`, `terminal`, `cheatsheet` | `?view=knowledge` |
| `lesson` | A lesson ID | `?lesson=rebase-branch` |

The current implementation initializes from the URL and then manages navigation with React state.

## 9. Learning and quiz behavior

- Modules and lessons are loaded from `/api/guide`
- If that request fails, the client dynamically imports `server/guide.js` as a bundled fallback
- `localize` reads the top-level English field or the nested Burmese `my` field
- Quick checks convert source options into answer objects and apply a stable seeded shuffle
- The displayed answer position remains unchanged while the learner answers
- Lesson completion IDs are saved locally

## 10. Certificate behavior

The completion certificate becomes available after all lessons are marked complete.

1. The learner enters a name or GitHub username
2. The client waits for web fonts
3. The client draws an A4 landscape certificate on a canvas
4. jsPDF is loaded only when needed
5. The canvas is embedded in a PDF
6. The browser downloads the file

The entered name and generated certificate are not sent to the backend.

## 11. Security and privacy

- Helmet provides standard HTTP security headers
- JSON request bodies are limited to 32 KB
- Supabase JWTs are verified using the project's signed JWKS
- Simulator commands never reach a shell or operating-system process
- `GROQ_API_KEY` is a server secret and never a Vite variable
- AI context is selected only from `server/guide.js`
- No learner profile is stored on the server
- Certificate generation is client-side
- External documentation and community links open with `rel="noreferrer"`

Content Security Policy is currently disabled in the Helmet configuration because the interface
loads Google Fonts and creates client-side download data. Add a tested explicit policy before
enabling it.

## 12. Failure behavior

| Failure | User-visible behavior |
| --- | --- |
| Guide API unavailable | Bundled guide content is loaded |
| User is signed out | AI helper displays a sign-in action; guided simulation remains available |
| Real sandbox selected | Disabled option displays **Coming soon** |
| Groq is unconfigured or unavailable | AI helper returns a safe temporary-unavailable message |
| Question is outside retrieved guide content | Assistant says learnGit does not cover it yet |
| Invalid stored progress JSON | Progress resets to an empty array |
| Certificate name empty | Download button stays disabled |

## 13. Quality checks

Required checks:

```bash
npm run check
npm run build
npm run check:sandbox
npm run build:sandbox
```

Recommended manual checks:

- English and Burmese navigation
- Desktop and mobile layouts
- Lesson selection and progress persistence
- Quiz answer correctness after shuffling
- Every guided scenario goal, reset, undo, and responsive map/terminal layout
- AI sign-in gate, grounded answers, and uncovered-topic refusal
- Certificate unlock and PDF download

## 14. Maintenance rules

- Keep `server/guide.js` as the authoritative learning-content source
- Keep the guided terminal deterministic and prevent operating-system command execution
- Keep provider secrets out of client bundles and Git
- Keep AI answers grounded in retrieved `server/guide.js` excerpts
- Update this document when routes, storage keys, environment variables, or runtime components change
- Update `ARCHITECTURE.md` when data flow or component boundaries change
