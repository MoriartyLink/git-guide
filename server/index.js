import compression from "compression";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commandResponses } from "./content.js";
import { knowledgeTopics, modules } from "./guide.js";

const app = express();
const port = Number(process.env.PORT) || 8787;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  if (command.startsWith("git switch -c") || command.startsWith("git checkout -b")) {
    const branch = command.split(" ").at(-1);
    return response.json({
      lines: [`Switched to a new branch '${branch}'`],
      completed: "branch",
    });
  }

  if (command.startsWith("git merge")) {
    return response.json({
      lines: ["Updating 8f31c2a..a92be11", "Fast-forward", " community.md | 12 ++++++++++++"],
      completed: "merge",
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

const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath, { maxAge: "1h" }));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Git Together is running on http://localhost:${port}`);
});
