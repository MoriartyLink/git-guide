# System documentation

## 1. Purpose

Git Together teaches beginner contributors how to use Git and GitHub. The application is public,
bilingual, and account-free. It provides educational simulations, not a real shell or Git hosting
service.

## 2. System boundaries

The system includes:

- A React single-page application
- Static bilingual learning content
- An Express JSON API
- A deterministic terminal simulator
- Browser-local progress and language preferences
- Browser-side PDF certificate generation

The system does not include:

- Authentication or user accounts
- A database
- Server-side learner progress
- Analytics or behavioral tracking
- Real shell execution
- GitHub OAuth or GitHub API mutations

## 3. Runtime components

| Component | File | Responsibility |
| --- | --- | --- |
| React entry | `src/main.jsx` | Mount the application |
| Application UI | `src/App.jsx` | Navigation, views, local state, quizzes, terminal client, and certificates |
| Design system | `src/styles.css` | Responsive black/green Apple HIG-inspired presentation |
| Learning model | `server/guide.js` | Authoritative modules, lessons, translations, and knowledge topics |
| Terminal fixtures | `server/content.js` | Reusable simulated command responses |
| Web server | `server/index.js` | API routes, command matching, compression, security headers, and static hosting |
| Build configuration | `vite.config.js` | React plugin, development port, and API proxy |

## 4. Development runtime

`npm run dev` starts two processes with `concurrently`:

1. Vite serves the React application on port `5173`
2. Node watches and runs Express on port `8787`
3. Vite proxies requests under `/api` to Express

The browser therefore uses same-origin URLs during local development.

## 5. Production runtime

`npm run build` writes the client bundle to `dist/`. `npm start` runs Express, which:

1. Adds Helmet headers
2. Compresses responses
3. Parses JSON bodies up to 32 KB
4. Serves `/api/*`
5. Serves static files from `dist/`
6. Returns `dist/index.html` for client-side routes

Set `PORT` to change the server port.

If the frontend is hosted separately, set `VITE_API_URL` during the frontend build.

## 6. HTTP API

### `GET /api/health`

Response:

```json
{
  "ok": true,
  "service": "git-together-api"
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
  "name": "Git Together",
  "description": "A practical Git and GitHub guide for community builders.",
  "modules": [],
  "knowledgeTopics": []
}
```

### `POST /api/terminal`

Request:

```json
{
  "command": "git status"
}
```

Successful response:

```json
{
  "lines": [
    "On branch main",
    "Changes not staged for commit:"
  ],
  "completed": "status"
}
```

Possible fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `lines` | `string[]` | Simulated terminal output |
| `completed` | `string` | Optional terminal challenge identifier |
| `clear` | `boolean` | Tells the client to clear terminal history |
| `error` | `string` | Validation error |

Status codes:

- `200` for recognized commands and `clear`
- `400` for empty input
- `422` for unsupported commands

The route normalizes whitespace and compares command strings. It never passes input to an operating
system shell.

## 7. Browser state

Persistent state uses `localStorage`:

| Key | Value | Purpose |
| --- | --- | --- |
| `git-together-language` | `"en"` or `"my"` | Last selected interface language |
| `git-together-progress` | JSON array of lesson IDs | Completed lessons |

Non-persistent React state includes:

- Current view and lesson
- Mobile navigation state
- Terminal history and current input
- Completed terminal challenges
- Open knowledge topic
- Quiz selection
- Git-map phase
- Certificate dialog state

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
- The terminal is a string-matching simulation
- No secrets are required by the application
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
| Terminal API unavailable | Terminal displays a retry message |
| Unsupported command | Simulator returns a helpful `422` response |
| Invalid stored progress JSON | Progress resets to an empty array |
| Certificate name empty | Download button stays disabled |

## 13. Quality checks

Required checks:

```bash
npm run check
npm run build
```

Recommended manual checks:

- English and Burmese navigation
- Desktop and mobile layouts
- Lesson selection and progress persistence
- Quiz answer correctness after shuffling
- Terminal supported and unsupported commands
- Certificate unlock and PDF download

## 14. Maintenance rules

- Keep `server/guide.js` as the authoritative learning-content source
- Keep terminal behavior deterministic and non-executing
- Update this document when routes, storage keys, environment variables, or runtime components change
- Update `ARCHITECTURE.md` when data flow or component boundaries change
