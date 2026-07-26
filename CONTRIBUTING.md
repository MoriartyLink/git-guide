# Contributing to learnGit

Thank you for helping make Git and GitHub easier for new community contributors.

## Good contributions

- Correct an inaccurate Git explanation
- Make English or Burmese text shorter and clearer
- Add a practical beginner workflow
- Improve accessibility or responsive behavior
- Improve the guided terminal or guide-grounded assistant
- Fix a bug with lessons, progress, quizzes, or certificates
- Improve tests or documentation

Keep the guide focused. The guided terminal must never execute operating-system commands, and AI answers
must stay grounded in the committed learning content.

## Set up the project

```bash
git clone <repository-url>
cd git-guide
npm install
npm run dev
```

Before making changes, read:

- [System documentation](docs/SYSTEM.md)
- [Architecture](docs/ARCHITECTURE.md)

## Contribution workflow

1. Find or create an issue that describes the problem
2. Fork the repository if you do not have write access
3. Create a focused branch from the latest `main`
4. Make one related change
5. Validate the change locally
6. Push the branch and open a pull request

```bash
git switch main
git pull --ff-only
git switch -c docs/clearer-setup

npm run check
npm run build

git add .
git commit -m "Clarify local setup"
git push -u origin docs/clearer-setup
```

Recommended branch names:

- `feat/short-description`
- `fix/short-description`
- `docs/short-description`
- `content/short-description`
- `refactor/short-description`

## Content guidelines

- Write for someone using Git for the first time
- Lead with the action or answer
- Keep paragraphs short
- Explain a command before asking learners to run it
- Use realistic branch names and commit messages
- Use safe commands in beginner examples
- Prefer `git restore`, `git revert`, and `--force-with-lease` over destructive alternatives
- Add both English and Burmese content when the surrounding content is bilingual
- Do not add Burmese full-stop punctuation `။`
- Keep technical terms such as Git, GitHub, branch, commit, and pull request recognizable

For a new lesson, provide:

- A unique lesson `id`
- English and Burmese title and summary
- Three concise learning points
- One command and command label
- One practical tip
- An English and Burmese quick check

The source quiz may keep its correct option at index `0`; the interface shuffles answer positions
before display.

## Code guidelines

- Follow the existing React function-component style
- Keep user-facing strings bilingual through `t(english, burmese)` or the `my` content object
- Never pass terminal input to `child_process`, a shell, or `eval` in Express or Vercel
- Keep Git simulation deterministic and browser-only
- Never expose provider secrets to Vite or browser code
- Keep AI retrieval grounded in `server/guide.js`
- Avoid adding dependencies for behavior that can be implemented clearly with the existing stack
- Keep buttons and interface text direct and minimal

## Validation

Run these commands before opening a pull request:

```bash
npm run check
npm run build
```

Manually verify the affected flow in both languages and at desktop and mobile widths.

For lesson changes, verify:

- The lesson opens from its module
- The visual guide matches the command
- The quick check identifies the correct shuffled answer
- Marking the lesson complete updates progress

For terminal changes, verify:

- The map and terminal update together for each supported command
- Undo, reset, goal detection, and every scenario work
- The side-by-side desktop layout stacks cleanly on mobile
- No command reaches a shell or backend execution API

For AI helper changes, verify:

- Unsigned users are rejected
- The Groq key remains server-side
- Answers cite selected learnGit sources and decline uncovered topics

## Pull request checklist

- [ ] The change solves one clear issue
- [ ] English and Burmese content remain aligned
- [ ] The interface remains readable on mobile
- [ ] Real commands cannot reach the application host
- [ ] No API keys or signing secrets were committed
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] Documentation was updated when behavior or architecture changed

## Review

Maintainers may request smaller wording, a safer Git example, a content correction, or a narrower
pull request. Review comments are part of the learning and collaboration process.

Be respectful, explain decisions clearly, and help contributors complete their work.
