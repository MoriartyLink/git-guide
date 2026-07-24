import compression from "compression";
import express from "express";
import helmet from "helmet";
import { commandResponses } from "./content.js";
import { knowledgeTopics, modules } from "./guide.js";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "git-together-api" });
});

app.get("/api/guide", (_request, response) => {
  response.set("Cache-Control", "public, max-age=300");
  response.json({
    name: "Git Together",
    description: "A practical Git and GitHub guide for community builders.",
    modules,
    knowledgeTopics,
  });
});

app.post("/api/terminal", (request, response) => {
  const rawCommand = String(request.body?.command || "").trim();
  const command = rawCommand.replace(/\s+/g, " ");

  if (!command) {
    return response.status(400).json({ error: "Type a command first." });
  }

  if (command === "clear") {
    return response.json({ clear: true });
  }

  if (command === "ssh -V") {
    return response.json({
      lines: ["OpenSSH_9.7p1 is installed on this guided device."],
      completed: "ssh-version",
    });
  }

  if (command === "ls -al ~/.ssh") {
    return response.json({
      lines: [
        "drwx------  .",
        "-rw-------  id_ed25519",
        "-rw-r--r--  id_ed25519.pub",
        "-rw-r--r--  known_hosts",
      ],
      completed: "ssh-existing",
    });
  }

  if (command.startsWith("ssh-keygen")) {
    return response.json({
      lines: [
        "Your identification has been saved in ~/.ssh/id_ed25519",
        "Your public key has been saved in ~/.ssh/id_ed25519.pub",
      ],
      completed: "ssh-keygen",
    });
  }

  if (command.startsWith("ssh-add")) {
    return response.json({
      lines: ["Identity added: ~/.ssh/id_ed25519 (you@example.com)"],
      completed: "ssh-agent",
    });
  }

  if (command.startsWith("ssh -vT git@github.com")) {
    return response.json({
      lines: [
        "debug1: Connecting to github.com port 22.",
        "debug1: Offering public key: ~/.ssh/id_ed25519",
        "debug1: Authentication succeeded (publickey).",
        "Hi contributor! You've successfully authenticated with GitHub.",
      ],
      completed: "ssh-debug",
    });
  }

  if (command.startsWith("ssh -T git@github.com")) {
    return response.json({
      lines: ["Hi contributor! You've successfully authenticated with GitHub using SSH."],
      completed: "ssh-test",
    });
  }

  if (command.startsWith("gh issue list")) {
    return response.json({
      lines: [
        "42  Fix mobile navigation spacing  good first issue",
        "57  Improve contributor docs       help wanted",
      ],
      completed: "issue-list",
    });
  }

  if (command.startsWith("gh issue create")) {
    return response.json({
      lines: ["Issue created: https://github.com/talkware/community/issues/63"],
      completed: "issue-create",
    });
  }

  if (command.startsWith("gh issue comment")) {
    return response.json({
      lines: ["Comment added to issue #42: I would like to work on this"],
      completed: "issue-claim",
    });
  }

  if (command.startsWith("gh pr create")) {
    return response.json({
      lines: ["Pull request created: https://github.com/talkware/community/pull/64"],
      completed: "pr-create",
    });
  }

  if (command.startsWith("gh pr checks")) {
    return response.json({
      lines: [
        "✓ lint    pass",
        "✓ build   pass",
        "✓ test    pass",
      ],
      completed: "pr-checks",
    });
  }

  if (command.startsWith("gh project list")) {
    return response.json({
      lines: [
        "1  Community contributions  open",
        "2  Documentation roadmap    open",
      ],
      completed: "project-list",
    });
  }

  if (command.startsWith("gh project item-add")) {
    return response.json({
      lines: ["Issue added to project 1.", "Status: Todo"],
      completed: "project-add",
    });
  }

  if (command.startsWith("gh project item-list")) {
    return response.json({
      lines: [
        "Issue  #42  Fix mobile navigation spacing  In Progress",
        "PR     #64  Improve contributor docs       In Review",
      ],
      completed: "project-status",
    });
  }

  if (command.startsWith("gh release create")) {
    const version = command.split(" ")[3] || "v1.0.0";
    return response.json({
      lines: [
        `Release ${version} created with generated notes.`,
        `https://github.com/talkware/community/releases/tag/${version}`,
      ],
    });
  }

  if (command.startsWith("gh run list")) {
    return response.json({
      lines: [
        "✓  CI / test     main  completed  success",
        "✓  Deploy       main  completed  success",
      ],
    });
  }

  if (command.startsWith("git clone")) {
    return response.json({
      lines: [
        "Cloning into 'community'...",
        "Receiving objects: 100% (42/42), done.",
        "Repository and its full history are ready.",
      ],
    });
  }

  if (command.startsWith("git commit")) {
    return response.json({
      lines: [
        "[main 4e8b6c1] Add community guide",
        " 2 files changed, 34 insertions(+), 3 deletions(-)",
      ],
      completed: "commit",
    });
  }

  if (command.startsWith("git config")) {
    return response.json({
      lines: ["Git identity saved for this guided computer."],
      completed: "config",
    });
  }

  if (command.startsWith("git add ")) {
    const target = command.slice("git add ".length);
    return response.json({
      lines: [`${target} is staged. Run git diff --staged to review it.`],
      completed: "add",
    });
  }

  if (command === "git diff") {
    return response.json({
      lines: [
        "diff --git a/README.md b/README.md",
        "+Add contributor setup steps",
        "This change is not staged yet.",
      ],
    });
  }

  if (command.startsWith("git diff --staged")) {
    return response.json({
      lines: [
        "diff --git a/README.md b/README.md",
        "+Add contributor setup steps",
        "This change will be included in the next commit.",
      ],
    });
  }

  if (command.startsWith("git show")) {
    return response.json({
      lines: [
        "commit 8f31c2a",
        "Author: Community Contributor",
        "    Add contributor setup steps",
        "+New setup instructions",
      ],
    });
  }

  if (command.startsWith("git branch -d")) {
    const branch = command.split(" ").at(-1);
    return response.json({ lines: [`Deleted branch ${branch} (was a92be11).`] });
  }

  if (command.startsWith("git branch")) {
    return response.json({
      lines: ["* main", "  feat/community-guide", "  remotes/origin/main"],
    });
  }

  if (command.startsWith("git switch -c") || command.startsWith("git checkout -b")) {
    const branch = command.split(" ").at(-1);
    return response.json({
      lines: [`Switched to a new branch '${branch}'`],
      completed: "branch",
    });
  }

  if (command.startsWith("git switch ")) {
    const branch = command.split(" ").at(-1);
    return response.json({ lines: [`Switched to branch '${branch}'`] });
  }

  if (command.startsWith("git merge")) {
    return response.json({
      lines: ["Updating 8f31c2a..a92be11", "Fast-forward", " community.md | 12 ++++++++++++"],
      completed: "merge",
    });
  }

  if (command === "git rebase --continue") {
    return response.json({
      lines: ["Successfully rebased and updated the current branch."],
      completed: "rebase",
    });
  }

  if (command === "git rebase --abort") {
    return response.json({
      lines: ["Rebase aborted. Your branch is back to its previous state."],
    });
  }

  if (command.startsWith("git rebase")) {
    return response.json({
      lines: [
        "Successfully rebased and updated refs/heads/feat/community-guide.",
        "Your branch now starts from the newest main commit.",
      ],
      completed: "rebase",
    });
  }

  if (command.startsWith("git remote set-url")) {
    return response.json({
      lines: [
        "origin now uses git@github.com:OWNER/REPO.git",
        "Future fetch and push commands will authenticate with SSH.",
      ],
      completed: "ssh-remote",
    });
  }

  if (command.startsWith("git remote add upstream")) {
    return response.json({
      lines: [
        "upstream added: https://github.com/OWNER/REPO.git",
        "Run git fetch upstream before starting new work.",
      ],
      completed: "upstream",
    });
  }

  if (command.startsWith("git remote")) {
    return response.json({
      lines: [
        "origin  https://github.com/community/git-together.git (fetch)",
        "origin  https://github.com/community/git-together.git (push)",
      ],
      completed: "remote",
    });
  }

  if (command.startsWith("git fetch")) {
    return response.json({
      lines: [
        "From github.com:talkware/community",
        "   8f31c2a..b47ad90  main -> origin/main",
        "Remote history downloaded. Your working files did not change.",
      ],
    });
  }

  if (command.startsWith("git pull")) {
    return response.json({
      lines: ["Updating 8f31c2a..b47ad90", "Fast-forward", "Already up to date with origin/main."],
    });
  }

  if (command.startsWith("git restore")) {
    return response.json({
      lines: ["README.md removed from staging. Your file changes are still here."],
      completed: "restore",
    });
  }

  if (command.startsWith("git revert")) {
    return response.json({
      lines: ["[main d81c43a] Revert \"Add community guide\"", " 2 files changed, 3 insertions(+), 34 deletions(-)"],
      completed: "revert",
    });
  }

  if (command.startsWith("git stash")) {
    return response.json({
      lines: ["Saved working directory and index state WIP on main"],
      completed: "stash",
    });
  }

  if (command.startsWith("git push origin v")) {
    const version = command.split(" ").at(-1);
    return response.json({
      lines: [`Tag ${version} published to origin.`],
    });
  }

  if (command.startsWith("git push --force-with-lease")) {
    return response.json({
      lines: [
        "Rebased branch updated safely.",
        "--force-with-lease confirmed that no teammate's newer remote work was overwritten.",
      ],
      completed: "push",
    });
  }

  if (command.startsWith("git push")) {
    return response.json({
      lines: [
        "Enumerating objects: 7, done.",
        "Writing objects: 100% (7/7), done.",
        "branch 'feat/community-guide' set up to track 'origin/feat/community-guide'.",
      ],
      completed: "push",
    });
  }

  if (command.startsWith("git tag")) {
    const version = command.split(" ").find((part) => /^v\d/.test(part)) || "v1.0.0";
    return response.json({
      lines: [`Annotated tag ${version} created on the current commit.`],
    });
  }

  if (command.startsWith("git log")) {
    return response.json(commandResponses["git log"]);
  }

  const result = commandResponses[command];
  if (result) {
    return response.json(result);
  }

  if (!command.startsWith("git ")) {
    return response.status(422).json({
      lines: [`command not found: ${command}`, "Type help to see the available commands."],
    });
  }

  return response.status(422).json({
    lines: [`git: '${command.slice(4)}' is not available in this guided lab.`, "Type help to see the available commands."],
  });
});

export default app;
