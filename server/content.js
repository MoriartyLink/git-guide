export const modules = [
  {
    id: "foundations",
    number: "01",
    title: "Git foundations",
    description: "Build a mental model for snapshots, repositories, and the three Git areas.",
    duration: "12 min",
    difficulty: "Beginner",
    lessons: [
      {
        id: "what-is-git",
        title: "What Git actually does",
        eyebrow: "Start here",
        readTime: "4 min read",
        summary:
          "Git records meaningful snapshots of your project so you can experiment, collaborate, and recover with confidence.",
        points: [
          {
            title: "Working directory",
            copy: "The files you are editing right now. Changes begin here.",
          },
          {
            title: "Staging area",
            copy: "A deliberate shortlist of changes for your next snapshot.",
          },
          {
            title: "Repository",
            copy: "The permanent history of commits stored inside the hidden .git directory.",
          },
        ],
        command: "git status",
        commandLabel: "See which area your files are in",
        tip: "Run git status often. It is the safest way to understand what Git thinks is happening.",
        challenge: "status",
      },
      {
        id: "first-repository",
        title: "Create your first repository",
        eyebrow: "Foundations",
        readTime: "5 min read",
        summary:
          "Turn an ordinary project folder into a Git repository, then record its first snapshot.",
        points: [
          { title: "Initialize", copy: "Create Git’s local history database with git init." },
          { title: "Stage", copy: "Choose the work to include using git add." },
          { title: "Commit", copy: "Save the staged snapshot with a clear message." },
        ],
        command: "git init",
        commandLabel: "Initialize the current folder",
        tip: "A commit message should finish the sentence: “If applied, this commit will…”",
        challenge: "init",
      },
    ],
  },
  {
    id: "daily-workflow",
    number: "02",
    title: "The daily workflow",
    description: "Make focused commits and understand the rhythm of add, commit, and review.",
    duration: "18 min",
    difficulty: "Beginner",
    lessons: [
      {
        id: "stage-and-commit",
        title: "Stage and commit",
        eyebrow: "Daily workflow",
        readTime: "7 min read",
        summary:
          "Small, focused commits make your history easy to review and safe to change later.",
        points: [
          { title: "Inspect", copy: "Review the current state before staging anything." },
          { title: "Select", copy: "Stage only changes that belong to one idea." },
          { title: "Describe", copy: "Write a concise message explaining the outcome." },
        ],
        command: 'git commit -m "Add contributor guide"',
        commandLabel: "Record the staged changes",
        tip: "Prefer one complete idea per commit. Future you—and your reviewers—will thank you.",
        challenge: "commit",
      },
      {
        id: "read-history",
        title: "Read project history",
        eyebrow: "Daily workflow",
        readTime: "5 min read",
        summary:
          "Use the commit log and diffs to understand why a codebase looks the way it does.",
        points: [
          { title: "Scan", copy: "Use a compact graph to see branches and merges." },
          { title: "Inspect", copy: "Open a single commit to understand its patch." },
          { title: "Compare", copy: "Review unstaged or staged changes before saving." },
        ],
        command: "git log --oneline --graph --all",
        commandLabel: "View a compact history graph",
        tip: "History is a communication tool, not just a backup.",
        challenge: "log",
      },
    ],
  },
  {
    id: "branching",
    number: "03",
    title: "Branches without fear",
    description: "Create safe lanes for new ideas, switch context, and merge completed work.",
    duration: "20 min",
    difficulty: "Intermediate",
    lessons: [
      {
        id: "feature-branches",
        title: "Work on a feature branch",
        eyebrow: "Branching",
        readTime: "8 min read",
        summary:
          "A branch is a movable label for a line of work—not a heavyweight copy of your project.",
        points: [
          { title: "Name clearly", copy: "Use a short name that explains the goal." },
          { title: "Commit locally", copy: "Experiment freely without changing main." },
          { title: "Merge intentionally", copy: "Bring the finished work back after review." },
        ],
        command: "git switch -c feat/community-guide",
        commandLabel: "Create and switch to a feature branch",
        tip: "Delete merged branches. Your commits remain safely in project history.",
        challenge: "branch",
      },
    ],
  },
  {
    id: "github",
    number: "04",
    title: "Collaborate on GitHub",
    description: "Push a branch, open a pull request, review kindly, and resolve conflicts.",
    duration: "24 min",
    difficulty: "Intermediate",
    lessons: [
      {
        id: "pull-requests",
        title: "Your first pull request",
        eyebrow: "GitHub collaboration",
        readTime: "10 min read",
        summary:
          "Pull requests create a shared space to discuss, review, and improve a proposed change.",
        points: [
          { title: "Push", copy: "Publish your feature branch to the shared remote." },
          { title: "Explain", copy: "Describe what changed, why it matters, and how it was tested." },
          { title: "Respond", copy: "Treat review as collaboration and update the same branch." },
        ],
        command: "git push -u origin feat/community-guide",
        commandLabel: "Publish and track your branch",
        tip: "A great pull request is small enough to review in one focused sitting.",
        challenge: "push",
      },
    ],
  },
  {
    id: "recovery",
    number: "05",
    title: "Undo things safely",
    description: "Recover from common mistakes without losing good work.",
    duration: "15 min",
    difficulty: "Intermediate",
    lessons: [
      {
        id: "safe-undo",
        title: "Choose the right undo tool",
        eyebrow: "Recovery",
        readTime: "8 min read",
        summary:
          "Git has a different recovery tool for working changes, staged changes, and shared commits.",
        points: [
          { title: "Restore", copy: "Discard or unstage local file changes carefully." },
          { title: "Revert", copy: "Create a new commit that safely reverses shared history." },
          { title: "Reflog", copy: "Find commits that seem lost after a branch or reset mistake." },
        ],
        command: "git reflog",
        commandLabel: "View recent movements of HEAD",
        tip: "Avoid rewriting commits that other people may already have pulled.",
        challenge: "reflog",
      },
    ],
  },
];

export const commandResponses = {
  help: {
    lines: [
      "Available commands:",
      "  git init          create a repository",
      "  git status        inspect the working tree",
      "  git add .         stage changes",
      "  git commit -m     create a commit",
      "  git log           inspect history",
      "  git switch -c     create a branch",
      "  git push          publish a branch",
      "  git reflog        find recent HEAD positions",
      "  clear             clear this terminal",
    ],
  },
  "git init": {
    lines: ["Initialized empty Git repository in /workshop/community-project/.git/"],
    completed: "init",
  },
  "git status": {
    lines: [
      "On branch main",
      "Changes not staged for commit:",
      "  modified:   README.md",
      "Untracked files:",
      "  community.md",
    ],
    completed: "status",
  },
  "git add .": {
    lines: ["Changes staged. Run git status to review them."],
    completed: "add",
  },
  "git log": {
    lines: [
      "* 8f31c2a (HEAD -> main) Add community welcome",
      "* 294fa13 Create project structure",
      "* 6b18a0e Initial commit",
    ],
    completed: "log",
  },
  "git reflog": {
    lines: [
      "8f31c2a HEAD@{0}: commit: Add community welcome",
      "294fa13 HEAD@{1}: checkout: moving from feat/guide to main",
      "c90af2e HEAD@{2}: commit: Draft Git guide",
    ],
    completed: "reflog",
  },
};
