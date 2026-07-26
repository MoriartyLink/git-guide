# Architecture

## 1. Architectural style

learnGit is a small client-server single-page application.

- The React client owns presentation, navigation, local progress, interaction state, and PDF output
- The Express server owns guide delivery, grounded AI requests, and production static hosting
- The browser owns an in-memory Git simulator; the real-sandbox prototype is not exposed
- Static JavaScript objects are the content store
- Browser `localStorage` stores learner progress; Supabase Auth manages optional account sessions

This keeps learning data local while allowing learners to use an optional account.

## 2. System context

```mermaid
flowchart LR
    Learner["Learner"] -->|Reads, answers, practices| Browser["React application"]
    Maintainer["Content maintainer"] -->|Edits bilingual content| Source["Git repository"]
    Source -->|Build and deploy| Server["Express + static assets"]
    Browser -->|GET guide / POST chat| Server
    Browser -->|Language and progress| Storage["Browser localStorage"]
    Browser -->|Sign up, sign in, sign out| Supabase["Supabase Auth"]
    Browser -->|Grounded questions| Server
    Server -->|Selected guide excerpts| Groq["Groq API"]
    Browser -->|Commands| Simulator["In-memory Git engine"]
    Browser -->|Generate PDF| Download["Certificate download"]
    Browser -->|Reference links| Docs["Git, GitHub, Talkware"]
```

## 3. Container view

```mermaid
flowchart TB
    subgraph Browser
        UI["React views and components"]
        State["React state"]
        Localize["English/Burmese localization"]
        GitMap["Git map renderer"]
        GitEngine["Git scenario engine"]
        PDF["Canvas + lazy-loaded jsPDF"]
        LS["localStorage"]
        AuthClient["Supabase client"]
        UI <--> State
        UI --> Localize
        UI --> GitMap
        UI <--> GitEngine
        UI --> PDF
        State <--> LS
        UI <--> AuthClient
    end

    AuthClient <--> SupabaseAuth["Supabase Auth"]

    subgraph API_Runtime["API runtime"]
        Express["Express middleware and routing"]
        GuideRoute["GET /api/guide"]
        ChatRoute["POST /api/chat"]
        Static["Static dist hosting"]
        Express --> GuideRoute
        Express --> ChatRoute
        Express --> Static
    end

    GuideData["server/guide.js"] --> GuideRoute
    GuideData --> ChatRoute
    UI -->|fetch JSON| Express
    Vercel["api/*.js on Vercel"] --> Express
    Node["server/index.js on Node"] --> Express
```

## 4. Source dependencies

```mermaid
flowchart LR
    Main["src/main.jsx"] --> App["src/App.jsx"]
    App --> Styles["src/styles.css"]
    App --> Asset["src/assets/git-together-logo.png"]
    App --> SupabaseClient["src/supabase.js"]
    SupabaseClient --> SupabaseJS["@supabase/supabase-js"]
    App --> SimulatorUI["src/GuidedGitSimulator.jsx"]
    SimulatorUI --> GitEngine["src/gitSimulator.js"]
    App --> ChatUI["src/GuideChat.jsx"]
    App --> GuideFallback["server/guide.js"]
    App -. lazy import .-> JsPDF["jspdf"]
    Server["server/app.js"] --> Guide["server/guide.js"]
    Server --> Chat["server/chat.js"]
    NodeEntry["server/index.js"] --> Server
    VercelEntry["api/health.js, guide.js, chat.js"] --> Server
    Vite["vite.config.js"] --> Main
    Server --> Dist["dist/"]
```

The supplied asset is presented as the learnGit brand mark in the header and footer.

## 5. Primary data flow

```mermaid
flowchart TD
    Start["Browser opens application"] --> Init["Read URL and localStorage"]
    Init --> Render["Render shell with loading guide"]
    Render --> Request["GET /api/guide"]
    Request -->|Success| GuideState["Store guide in React state"]
    Request -->|Failure| Fallback["Import bundled server/guide.js"]
    Fallback --> GuideState
    GuideState --> Views["Home, lesson, knowledge, terminal, cheat sheet"]
    Views --> Action{"Learner action"}
    Action -->|Change language| SaveLanguage["Save language locally"]
    Action -->|Complete lesson| SaveProgress["Save lesson ID locally"]
    Action -->|Run command| GitEngine["Update in-memory refs and commits"]
    Action -->|Ask Git question| ChatAPI["POST /api/chat"]
    Action -->|Get certificate| PDF["Generate local PDF"]
    Action -->|Manage account| Auth["Supabase Auth"]
```

## 6. Data schemas

The application uses JavaScript objects rather than a database schema. The following definitions
describe the expected shapes.

### Guide response

```ts
type Guide = {
  name: string;
  description: string;
  modules: Module[];
  knowledgeTopics: KnowledgeTopic[];
};
```

### Module

```ts
type Module = {
  id: string;
  number: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  my: {
    title: string;
    description: string;
    duration: string;
    difficulty: string;
  };
  lessons: Lesson[];
};
```

### Lesson

```ts
type Lesson = {
  id: string;
  title: string;
  eyebrow: string;
  readTime: string;
  summary: string;
  points: Array<{
    title: string;
    copy: string;
  }>;
  command: string;
  commandLabel: string;
  tip: string;
  challenge?: string;
  check: QuickCheck;
  my: {
    title: string;
    eyebrow: string;
    readTime: string;
    summary: string;
    points: Array<{
      title: string;
      copy: string;
    }>;
    commandLabel: string;
    tip: string;
    check: QuickCheck;
  };
};
```

The command is language-independent and therefore stays at the lesson top level.

### Quick check

```ts
type QuickCheck = {
  question: string;
  options: string[];
  correct: number;
  success: string;
};
```

`correct` points to the source option. The client maps correctness onto each option before
shuffling the displayed order.

### Knowledge topic

```ts
type KnowledgeTopic = {
  id: string;
  category: string;
  question: string;
  answer: string;
  example: string;
  my: {
    category: string;
    question: string;
    answer: string;
    example: string;
  };
};
```

### AI chat exchange

```ts
type ChatRequest = {
  language: "en" | "my";
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

type ChatResponse = {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    type: "lesson" | "knowledge";
  }>;
};
```

### Browser persistence

```ts
type StoredLanguage = "en" | "my";
type StoredProgress = string[];
```

## 7. Use cases

| Actor | Use case | Main result |
| --- | --- | --- |
| Learner | Browse learning modules | Sees ordered beginner lessons |
| Learner | Switch language | UI and content change to English or Burmese |
| Learner | Study a lesson | Reads concise content and sees a Git-map visualization |
| Learner | Answer a quick check | Gets immediate feedback with shuffled answer positions |
| Learner | Practice a command | Updates a synchronized, in-browser terminal and commit map |
| Learner | Ask a workflow question | Gets an answer grounded in selected learnGit excerpts |
| Learner | Track progress | Completion persists on the current browser |
| Learner | Download certificate | Gets a locally generated PDF after all lessons are complete |
| Contributor | Improve content | Edits bilingual static content and opens a pull request |
| Maintainer | Deploy a release | Builds the client and starts the Express service |

## 8. Sequence: application load

```mermaid
sequenceDiagram
    actor Learner
    participant Browser
    participant Storage as localStorage
    participant API as Express API
    participant Guide as guide.js

    Learner->>Browser: Open learnGit
    Browser->>Storage: Read language and progress
    Browser->>API: GET /api/guide
    API->>Guide: Read modules and topics
    Guide-->>API: Static objects
    API-->>Browser: Guide JSON
    Browser-->>Learner: Render selected view

    alt API request fails
        Browser->>Browser: Import bundled guide.js fallback
        Browser-->>Learner: Render guide offline from API
    end
```

## 9. Sequence: terminal practice

```mermaid
sequenceDiagram
    actor Learner
    participant UI as Guided terminal
    participant Engine as In-memory Git engine
    participant Map as Commit map

    Learner->>UI: Type command
    UI->>Engine: Execute supported command against current state
    Engine-->>UI: New state and terminal lines
    UI->>Map: Render commits, parents, refs, tags, and remotes
    UI-->>Learner: Show synchronized terminal and graph
```

No command is executed by the operating system or API runtime.

## 10. Sequence: lesson completion and certificate

```mermaid
sequenceDiagram
    actor Learner
    participant Lesson as Lesson UI
    participant Storage as localStorage
    participant Card as Certificate card
    participant Canvas
    participant PDF as jsPDF

    Learner->>Lesson: Mark lesson complete
    Lesson->>Storage: Save completed lesson IDs
    Lesson->>Card: Recalculate completed count

    alt All lessons complete
        Card-->>Learner: Enable Get certificate
        Learner->>Card: Enter name
        Card->>Canvas: Draw bilingual certificate
        Card->>PDF: Lazy-load and embed canvas
        PDF-->>Learner: Download A4 PDF
    else Lessons remain
        Card-->>Learner: Show remaining lesson count
    end
```

## 11. Contributor workflow

```mermaid
flowchart LR
    Issue["Find or create issue"] --> Fork["Fork if needed"]
    Fork --> Branch["Create focused branch"]
    Branch --> Change["Change code, content, or docs"]
    Change --> Check["npm run check"]
    Check --> Build["npm run build"]
    Build --> Commit["Create clear commit"]
    Commit --> Push["Push branch"]
    Push --> PR["Open pull request"]
    PR --> Review["Review and revisions"]
    Review --> Merge["Merge to main"]
```

## 12. Runtime workflow

```mermaid
flowchart LR
    Source["Source files"] --> Vite["Vite production build"]
    Vite --> Dist["dist/ assets"]
    Dist --> Host{"Deployment target"}
    Host -->|Node| Express["Express static hosting"]
    Host -->|Vercel| CDN["Vercel static hosting"]
    Guide["Guide content"] --> API["Shared Express API"]
    API --> Express
    API --> Functions["Vercel Functions"]
    Express --> Browser["Learner browser"]
    CDN --> Browser
    Functions --> Browser
    Prototype["sandbox/ (future prototype)"] -. not deployed .-> Browser
```

## 13. Architectural decisions

### Static content instead of a database

Benefits:

- Content changes are reviewed in Git
- No database operations or migrations
- Simple and inexpensive deployment

Tradeoff:

- Editors must change source code and redeploy

### Local progress alongside optional accounts

Benefits:

- No signup barrier for reading lessons
- Minimal privacy risk
- Learning progress remains independent from identity data

Tradeoff:

- Progress does not follow a learner to another browser or device, even after sign-in

### In-browser Git model

Benefits:

- Instant interaction with no service dependency
- Terminal output and commit map stay synchronized
- Commands cannot reach the learner device or application host

Tradeoff:

- The model supports educational workflows rather than every behavior of the Git executable

### Guide-grounded AI instead of open-ended chat

The server selects relevant documents from `server/guide.js` and provides only those excerpts to
Groq. Authentication, payload limits, and server-only credentials reduce abuse and secret exposure.

### Client-side certificate generation

Benefits:

- Names stay in the browser
- No file storage or certificate endpoint
- Works without an account

Tradeoff:

- Certificate issuance is based on browser-local progress and is not independently verifiable

### Focused interactive components

The primary views remain in `src/App.jsx`, while the terminal and AI helper are separate components
because they own independent connection lifecycles. Additional views can be extracted when feature
ownership or testing benefits from a smaller boundary.

## 14. Extension points

Future changes can add:

- Automated content-schema validation
- Component and API tests
- A service worker for full offline use
- More guided terminal exercises
- Verified certificates through an optional backend

Any extension should preserve the public no-login learning path unless the product scope explicitly
changes.
