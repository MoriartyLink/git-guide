const DEFAULT_FILES = ["README.md", "community.md"];

function clone(value) {
  return structuredClone(value);
}

function baseState() {
  return {
    branches: { main: "C0" },
    commits: [
      {
        id: "C0",
        lane: "main",
        message: "Initial project",
        parents: [],
      },
    ],
    detached: null,
    flags: {},
    head: "main",
    initialized: true,
    nextCommit: 1,
    reflog: ["HEAD@{0}: repository initialized"],
    remoteBranches: { "origin/main": "C0" },
    staged: [],
    stash: [],
    tags: {},
    working: [...DEFAULT_FILES],
  };
}

function headCommit(state) {
  return state.detached || state.branches[state.head];
}

function addCommit(state, message, parents = [headCommit(state)], lane = state.head) {
  const id = `C${state.nextCommit}`;
  state.nextCommit += 1;
  state.commits.push({ id, lane, message, parents: parents.filter(Boolean) });
  if (state.detached) state.detached = id;
  else state.branches[state.head] = id;
  state.reflog.unshift(`HEAD@{0}: commit: ${message}`);
  return id;
}

function seedCommit(state, branch, message) {
  state.head = branch;
  state.detached = null;
  return addCommit(state, message);
}

function seedBranch(state, name, from = headCommit(state)) {
  state.branches[name] = from;
  state.head = name;
  state.detached = null;
}

function findCommit(state, id) {
  return state.commits.find((commit) => commit.id === id);
}

function walkFirstParents(state, start) {
  const result = [];
  let current = start;
  while (current) {
    result.push(current);
    current = findCommit(state, current)?.parents?.[0];
  }
  return result;
}

function ancestors(state, start) {
  const found = new Set();
  const pending = start ? [start] : [];
  while (pending.length) {
    const id = pending.pop();
    if (!id || found.has(id)) continue;
    found.add(id);
    pending.push(...(findCommit(state, id)?.parents || []));
  }
  return found;
}

function isAncestor(state, possibleAncestor, child) {
  return ancestors(state, child).has(possibleAncestor);
}

function commonAncestor(state, left, right) {
  const rightAncestors = ancestors(state, right);
  return walkFirstParents(state, left).find((id) => rightAncestors.has(id)) || "C0";
}

function resolveRef(state, rawRef = "HEAD") {
  let value = rawRef.trim();
  const operations = [];
  const suffixPattern = /(\^(\d*)|~(\d+))$/;
  let match = value.match(suffixPattern);
  while (match) {
    operations.unshift(match[1]);
    value = value.slice(0, -match[1].length);
    match = value.match(suffixPattern);
  }

  let current =
    value === "HEAD" || value === ""
      ? headCommit(state)
      : state.branches[value] ||
        state.remoteBranches[value] ||
        state.tags[value] ||
        (findCommit(state, value) ? value : null);
  if (!current) return null;

  for (const operation of operations) {
    if (operation.startsWith("~")) {
      const distance = Number(operation.slice(1) || 1);
      for (let index = 0; index < distance; index += 1) {
        current = findCommit(state, current)?.parents?.[0];
        if (!current) return null;
      }
    } else {
      const parentIndex = Number(operation.slice(1) || 1) - 1;
      current = findCommit(state, current)?.parents?.[parentIndex];
      if (!current) return null;
    }
  }
  return current;
}

function words(command) {
  const result = [];
  const matcher = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match = matcher.exec(command);
  while (match) {
    result.push(match[1] ?? match[2] ?? match[3]);
    match = matcher.exec(command);
  }
  return result;
}

function statusLines(state) {
  const location = state.detached
    ? `HEAD detached at ${state.detached}`
    : `On branch ${state.head}`;
  if (!state.working.length && !state.staged.length) {
    return [location, "nothing to commit, working tree clean"];
  }
  return [
    location,
    ...(state.staged.length
      ? ["Changes to be committed:", ...state.staged.map((file) => `  modified: ${file}`)]
      : []),
    ...(state.working.length
      ? ["Changes not staged for commit:", ...state.working.map((file) => `  modified: ${file}`)]
      : []),
  ];
}

function logLines(state) {
  const labelsFor = (id) => {
    const labels = [
      ...Object.entries(state.branches)
        .filter(([, target]) => target === id)
        .map(([name]) => (name === state.head && !state.detached ? `HEAD -> ${name}` : name)),
      ...Object.entries(state.remoteBranches)
        .filter(([, target]) => target === id)
        .map(([name]) => name),
      ...Object.entries(state.tags)
        .filter(([, target]) => target === id)
        .map(([name]) => `tag: ${name}`),
    ];
    return labels.length ? ` (${labels.join(", ")})` : "";
  };
  return [...state.commits]
    .reverse()
    .map((commit) => `* ${commit.id}${labelsFor(commit.id)} ${commit.message}`);
}

function createScenarioState(id) {
  const state = baseState();
  state.working = [];

  if (id === "snapshot") {
    state.working = [...DEFAULT_FILES];
  } else if (id === "branches") {
    seedCommit(state, "main", "Add navigation");
    state.working = ["src/profile.js"];
  } else if (id === "merge") {
    seedCommit(state, "main", "Add homepage");
    const fork = headCommit(state);
    seedBranch(state, "feature", fork);
    seedCommit(state, "feature", "Build profile card");
    state.head = "main";
    seedCommit(state, "main", "Update navigation");
  } else if (id === "rebase") {
    seedCommit(state, "main", "Create app shell");
    const fork = headCommit(state);
    seedBranch(state, "feature", fork);
    seedCommit(state, "feature", "Add profile form");
    state.head = "main";
    seedCommit(state, "main", "Patch accessibility");
    state.head = "feature";
  } else if (id === "conflict") {
    seedCommit(state, "main", "Create README");
    const fork = headCommit(state);
    seedBranch(state, "docs", fork);
    seedCommit(state, "docs", "Rewrite setup section");
    state.head = "main";
    seedCommit(state, "main", "Update setup commands");
    state.flags.forceConflict = true;
  } else if (id === "detached") {
    seedCommit(state, "main", "Add header");
    seedCommit(state, "main", "Add footer");
  } else if (id === "cherry-pick") {
    seedCommit(state, "main", "Release baseline");
    const fork = headCommit(state);
    seedBranch(state, "hotfix", fork);
    seedCommit(state, "hotfix", "Fix login crash");
    state.head = "main";
    seedCommit(state, "main", "Start next feature");
  } else if (id === "undo") {
    seedCommit(state, "main", "Add stable feature");
    seedCommit(state, "main", "Break production styles");
    state.flags.badCommit = headCommit(state);
  } else if (id === "tags") {
    seedCommit(state, "main", "Add release notes");
    seedCommit(state, "main", "Prepare release");
  } else if (id === "remote") {
    seedCommit(state, "main", "Create collaboration guide");
    seedBranch(state, "feature", headCommit(state));
    seedCommit(state, "feature", "Add contributor examples");
  } else if (id === "sync") {
    seedCommit(state, "main", "Local baseline");
    const local = headCommit(state);
    const remoteId = addCommit(state, "Teammate update", [local], "origin/main");
    state.remoteBranches["origin/main"] = remoteId;
    state.branches.main = local;
    state.head = "main";
  } else if (id === "pull-request") {
    seedCommit(state, "main", "Create project");
    seedBranch(state, "feature", headCommit(state));
    seedCommit(state, "feature", "Add community guide");
  }

  state.reflog = [`HEAD@{0}: scenario ${id} loaded`];
  return state;
}

export const SIMULATOR_SCENARIOS = [
  {
    id: "snapshot",
    group: "Foundations",
    title: "Stage your first snapshot",
    description: "Move changes from the working tree into a focused commit.",
    goal: "Create one new commit and leave the working tree clean.",
    hint: "Stage with git add ., then commit with a message.",
    commands: ["git status", "git add .", 'git commit -m "Add project files"'],
    complete: (state) => state.commits.length >= 2 && !state.working.length && !state.staged.length,
  },
  {
    id: "branches",
    group: "Foundations",
    title: "Build on a feature branch",
    description: "Create a separate lane and save work without moving main.",
    goal: "Create feature/profile, switch to it, and make a commit.",
    hint: "git switch -c creates and checks out a branch in one step.",
    commands: ["git switch -c feature/profile", "git add .", 'git commit -m "Add profile"'],
    complete: (state) =>
      state.head === "feature/profile" &&
      Boolean(state.branches["feature/profile"]) &&
      state.branches["feature/profile"] !== state.branches.main,
  },
  {
    id: "merge",
    group: "Workflows",
    title: "Merge parallel work",
    description: "Bring a finished feature into main and watch the histories join.",
    goal: "Merge feature into main.",
    hint: "Switch to the receiving branch before git merge.",
    commands: ["git switch main", "git merge feature"],
    complete: (state) =>
      state.head === "main" &&
      isAncestor(state, state.branches.feature, state.branches.main),
  },
  {
    id: "rebase",
    group: "Workflows",
    title: "Rebase onto fresh main",
    description: "Replay feature work above the newest main commit.",
    goal: "Make feature a clean descendant of main.",
    hint: "Stay on feature, then run git rebase main.",
    commands: ["git status", "git rebase main"],
    complete: (state) =>
      state.head === "feature" &&
      isAncestor(state, state.branches.main, state.branches.feature),
  },
  {
    id: "conflict",
    group: "Workflows",
    title: "Resolve a merge conflict",
    description: "Practice the pause, resolve, stage, and continue rhythm.",
    goal: "Merge docs into main after resolving the simulated conflict.",
    hint: "Start the merge, stage the resolved file, then commit.",
    commands: ["git merge docs", "git status", "git add README.md", 'git commit -m "Resolve setup conflict"'],
    complete: (state) => Boolean(state.flags.resolvedConflict),
  },
  {
    id: "detached",
    group: "History",
    title: "Explore detached HEAD",
    description: "Move HEAD to an older commit without moving a branch label.",
    goal: "Detach HEAD at C1.",
    hint: "A commit ID can be checked out directly.",
    commands: ["git log --oneline", "git checkout C1"],
    complete: (state) => state.detached === "C1",
  },
  {
    id: "cherry-pick",
    group: "History",
    title: "Copy one hotfix",
    description: "Apply a useful commit without merging the whole branch.",
    goal: "Copy the hotfix commit onto main.",
    hint: "Find the hotfix ID in the map, then cherry-pick it.",
    commands: ["git log --oneline --all", "git cherry-pick C2"],
    complete: (state) =>
      state.head === "main" &&
      state.commits.some(
        (commit) => commit.lane === "main" && commit.message.includes("Fix login crash") && commit.id !== "C2",
      ),
  },
  {
    id: "undo",
    group: "History",
    title: "Undo shared work safely",
    description: "Create a new commit that reverses a bad shared commit.",
    goal: "Revert the breaking commit without deleting history.",
    hint: "Use git revert with the bad commit ID.",
    commands: ["git log --oneline", "git revert C2"],
    complete: (state) => state.commits.some((commit) => commit.message.startsWith("Revert")),
  },
  {
    id: "tags",
    group: "Release",
    title: "Mark a release",
    description: "Attach a stable version label to the current commit.",
    goal: "Create the v1.0.0 tag at HEAD.",
    hint: "git tag accepts a name and defaults to HEAD.",
    commands: ["git tag v1.0.0", "git show v1.0.0"],
    complete: (state) => state.tags["v1.0.0"] === headCommit(state),
  },
  {
    id: "remote",
    group: "Collaboration",
    title: "Publish a feature branch",
    description: "Push local work and create its origin tracking label.",
    goal: "Make origin/feature point to your local feature commit.",
    hint: "Push the current branch with -u origin.",
    commands: ["git push -u origin feature"],
    complete: (state) =>
      state.remoteBranches["origin/feature"] === state.branches.feature,
  },
  {
    id: "sync",
    group: "Collaboration",
    title: "Sync a teammate update",
    description: "Fetch the remote state and fast-forward local main.",
    goal: "Move main to the same commit as origin/main.",
    hint: "git pull combines fetching and integrating.",
    commands: ["git fetch origin", "git pull --ff-only"],
    complete: (state) => state.branches.main === state.remoteBranches["origin/main"],
  },
  {
    id: "pull-request",
    group: "Collaboration",
    title: "Open a pull request",
    description: "Publish the feature and open a review space.",
    goal: "Push feature and create a simulated pull request.",
    hint: "Push before running gh pr create --fill.",
    commands: ["git push -u origin feature", "gh pr create --fill"],
    complete: (state) => Boolean(state.flags.prCreated),
  },
  {
    id: "freeplay",
    group: "Sandbox",
    title: "Free-play repository",
    description: "Experiment with any supported command and build your own graph.",
    goal: "No fixed goal—explore, undo, and reset freely.",
    hint: "Type help to see the supported command families.",
    commands: ["git status", "git branch demo", "git switch demo", 'git commit -am "Experiment"'],
    complete: () => false,
  },
];

export function scenarioById(id) {
  return SIMULATOR_SCENARIOS.find((scenario) => scenario.id === id) || SIMULATOR_SCENARIOS[0];
}

export function scenarioForCommand(command = "") {
  if (/gh pr/.test(command)) return "pull-request";
  if (/git (push|remote)/.test(command)) return "remote";
  if (/git (pull|fetch)/.test(command)) return "sync";
  if (/git rebase/.test(command)) return "rebase";
  if (/git merge/.test(command)) return "merge";
  if (/git (revert|reflog|reset|restore)/.test(command)) return "undo";
  if (/git (switch|checkout|branch)/.test(command)) return "branches";
  return "snapshot";
}

export function initialSimulatorState(scenarioId) {
  return createScenarioState(scenarioId);
}

export function simulatorHead(state) {
  return headCommit(state);
}

export function isScenarioComplete(state, scenarioId) {
  return scenarioById(scenarioId).complete(state);
}

export function executeSimulatorCommand(currentState, rawCommand, scenarioId) {
  const state = clone(currentState);
  const command = rawCommand.trim().replace(/\s+/g, " ");
  const args = words(command);
  const scenario = scenarioById(scenarioId);
  const fail = (...lines) => ({ state: currentState, lines, type: "error" });
  const done = (...lines) => ({ state, lines, type: "output" });

  if (!command) return fail("Type a command first.");
  if (command === "clear") return { state, lines: [], type: "clear" };
  if (command === "undo") return { state, lines: ["Undoing the last command…"], type: "undo" };
  if (command === "reset") return { state, lines: ["Scenario reset."], type: "reset" };
  if (command === "show goal") return done(`Goal: ${scenario.goal}`, `Hint: ${scenario.hint}`);
  if (command === "show solution") return done(...scenario.commands);
  if (command === "levels") {
    return done(...SIMULATOR_SCENARIOS.map((item) => `${item.id.padEnd(14)} ${item.title}`));
  }
  if (command === "help" || command === "git help") {
    return done(
      "Supported Git: init, status, add, commit, log, diff, show, branch, switch, checkout,",
      "merge, rebase, cherry-pick, reset, restore, revert, reflog, tag, remote, fetch, pull, push, stash",
      "GitHub/SSH: gh issue, gh pr, gh project, ssh",
      "Simulator: levels, show goal, show solution, undo, reset, clear",
      "Separate multiple commands with semicolons.",
    );
  }

  if (command === "git init") {
    return {
      state: createScenarioState("freeplay"),
      lines: ["Initialized empty Git repository in /learnGit/.git/"],
      type: "output",
    };
  }
  if (command === "git status") return done(...statusLines(state));
  if (command.startsWith("git add")) {
    if (state.flags.conflict) {
      state.flags.conflictStaged = true;
      return done("Conflict markers resolved and staged.");
    }
    const files = args.slice(2);
    const selected =
      !files.length || files.includes(".")
        ? [...state.working]
        : state.working.filter((file) => files.includes(file));
    state.staged = [...new Set([...state.staged, ...selected])];
    state.working = state.working.filter((file) => !selected.includes(file));
    return done(selected.length ? `Staged ${selected.join(", ")}.` : "No matching changes to stage.");
  }
  if (command.startsWith("git commit")) {
    if (state.flags.conflict && !state.flags.conflictStaged) {
      return fail("Resolve and stage the conflicted file before committing.");
    }
    const messageIndex = args.findIndex((argument) => argument === "-m");
    const combinedMessageIndex = args.findIndex((argument) => /^-[a-zA-Z]*m[a-zA-Z]*$/.test(argument));
    const message =
      messageIndex >= 0
        ? args[messageIndex + 1] || "Update project"
        : combinedMessageIndex >= 0
          ? args[combinedMessageIndex + 1] || "Update project"
        : args.includes("--amend")
          ? "Amend previous commit"
          : "Practice commit";
    if (args.includes("-a") || args.includes("-am")) {
      state.staged = [...new Set([...state.staged, ...state.working])];
      state.working = [];
    }
    if (!state.staged.length && !state.flags.conflict && scenarioId === "snapshot") {
      return fail("Nothing staged. Run git add first.");
    }
    if (state.flags.conflict) {
      addCommit(state, message, [headCommit(state), state.flags.conflictTarget]);
      state.flags.conflict = false;
      state.flags.conflictStaged = false;
      state.flags.resolvedConflict = true;
    } else {
      addCommit(state, message);
    }
    state.staged = [];
    return done(`[${state.head} ${headCommit(state)}] ${message}`);
  }
  if (command.startsWith("git log")) return done(...logLines(state));
  if (command === "git reflog") return done(...state.reflog.slice(0, 10));
  if (command.startsWith("git diff")) {
    const files = command.includes("--staged") ? state.staged : state.working;
    return done(
      ...(files.length
        ? files.flatMap((file) => [`diff --git a/${file} b/${file}`, "+ simulated learning change"])
        : ["No differences to show."]),
    );
  }
  if (command.startsWith("git show")) {
    const target = resolveRef(state, args[2] || "HEAD");
    const commit = findCommit(state, target);
    return commit
      ? done(`commit ${commit.id}`, `Message: ${commit.message}`, `Parents: ${commit.parents.join(", ") || "none"}`)
      : fail(`Unknown revision: ${args[2] || "HEAD"}`);
  }
  if (command.startsWith("git branch")) {
    if (args.length === 2) {
      return done(
        ...Object.entries(state.branches).map(
          ([name, target]) => `${name === state.head && !state.detached ? "*" : " "} ${name} ${target}`,
        ),
      );
    }
    if (args[2] === "-d" || args[2] === "-D") {
      const name = args[3];
      if (!state.branches[name]) return fail(`Branch '${name}' not found.`);
      if (name === state.head) return fail("Cannot delete the checked out branch.");
      delete state.branches[name];
      return done(`Deleted branch ${name}.`);
    }
    const force = args[2] === "-f";
    const name = force ? args[3] : args[2];
    const targetRef = force ? args[4] : args[3];
    if (!name) return fail("Provide a branch name.");
    if (state.branches[name] && !force) return fail(`Branch '${name}' already exists.`);
    const target = resolveRef(state, targetRef || "HEAD");
    if (!target) return fail(`Unknown start point: ${targetRef}`);
    state.branches[name] = target;
    return done(`Branch ${name} now points to ${target}.`);
  }
  if (command.startsWith("git switch") || command.startsWith("git checkout")) {
    const createIndex = args.findIndex((argument) => argument === "-c" || argument === "-b");
    if (createIndex >= 0) {
      const name = args[createIndex + 1];
      if (!name) return fail("Provide a new branch name.");
      if (state.branches[name]) return fail(`Branch '${name}' already exists.`);
      state.branches[name] = headCommit(state);
      state.head = name;
      state.detached = null;
      state.reflog.unshift(`HEAD@{0}: checkout: moving to ${name}`);
      return done(`Switched to a new branch '${name}'.`);
    }
    const targetName = args[2];
    if (state.branches[targetName]) {
      state.head = targetName;
      state.detached = null;
      state.reflog.unshift(`HEAD@{0}: checkout: moving to ${targetName}`);
      return done(`Switched to branch '${targetName}'.`);
    }
    const target = resolveRef(state, targetName);
    if (!target) return fail(`Unknown branch or commit '${targetName}'.`);
    state.detached = target;
    state.reflog.unshift(`HEAD@{0}: checkout: moving to ${target}`);
    return done(`HEAD is now detached at ${target}.`);
  }
  if (command.startsWith("git merge")) {
    let branchName = args.at(-1);
    if (!state.branches[branchName] && scenarioId === "merge" && branchName.includes("community-guide")) {
      branchName = "feature";
    }
    const target = resolveRef(state, branchName);
    if (!target) return fail(`Unknown branch '${branchName}'.`);
    const current = headCommit(state);
    if (state.flags.forceConflict && branchName === "docs") {
      state.flags.conflict = true;
      state.flags.conflictTarget = target;
      state.working = ["README.md"];
      return {
        state,
        lines: [
          "CONFLICT (content): Merge conflict in README.md",
          "Resolve the file, run git add README.md, then git commit.",
        ],
        type: "error",
      };
    }
    if (isAncestor(state, target, current)) return done("Already up to date.");
    if (isAncestor(state, current, target)) {
      if (state.detached) state.detached = target;
      else state.branches[state.head] = target;
      return done(`Fast-forwarded ${state.head} to ${target}.`);
    }
    const mergeId = addCommit(state, `Merge branch '${branchName}'`, [current, target]);
    return done(`Merge made by the ort strategy at ${mergeId}.`);
  }
  if (command.startsWith("git rebase")) {
    const targetName = args.at(-1);
    const target = resolveRef(state, targetName);
    if (!target) return fail(`Unknown rebase target '${targetName}'.`);
    const current = headCommit(state);
    if (isAncestor(state, target, current)) return done("Current branch is already up to date.");
    const fork = commonAncestor(state, current, target);
    const toReplay = walkFirstParents(state, current)
      .slice(0, walkFirstParents(state, current).indexOf(fork))
      .reverse();
    let parent = target;
    for (const oldId of toReplay) {
      const oldCommit = findCommit(state, oldId);
      const newId = `C${state.nextCommit}`;
      state.nextCommit += 1;
      state.commits.push({
        id: newId,
        lane: state.head,
        message: `${oldCommit.message} (rebased)`,
        parents: [parent],
      });
      parent = newId;
    }
    if (state.detached) state.detached = parent;
    else state.branches[state.head] = parent;
    state.reflog.unshift(`HEAD@{0}: rebase finished onto ${targetName}`);
    return done(`Successfully rebased ${state.head} onto ${targetName}.`);
  }
  if (command.startsWith("git cherry-pick")) {
    const refs = args.slice(2);
    if (!refs.length) return fail("Provide at least one commit to cherry-pick.");
    for (const ref of refs) {
      const target = resolveRef(state, ref);
      const source = findCommit(state, target);
      if (!source) return fail(`Unknown commit '${ref}'.`);
      addCommit(state, `${source.message} (cherry-picked)`);
    }
    return done(`Applied ${refs.length} commit${refs.length === 1 ? "" : "s"} onto ${state.head}.`);
  }
  if (command.startsWith("git reset")) {
    const targetRef = args.at(-1);
    const target = resolveRef(state, targetRef);
    if (!target) return fail(`Unknown revision '${targetRef}'.`);
    if (state.detached) state.detached = target;
    else state.branches[state.head] = target;
    if (args.includes("--hard")) {
      state.staged = [];
      state.working = [];
    }
    state.reflog.unshift(`HEAD@{0}: reset: moving to ${target}`);
    return done(`HEAD moved to ${target}.`);
  }
  if (command.startsWith("git restore")) {
    const file = args.at(-1);
    if (args.includes("--staged")) {
      state.staged = state.staged.filter((item) => item !== file);
      if (!state.working.includes(file)) state.working.push(file);
      return done(`Unstaged ${file}.`);
    }
    state.working = state.working.filter((item) => item !== file);
    return done(`Restored ${file}.`);
  }
  if (command.startsWith("git revert")) {
    const target = resolveRef(state, args[2]) || (scenarioId === "undo" ? state.flags.badCommit : null);
    const source = findCommit(state, target);
    if (!source) return fail(`Unknown commit '${args[2]}'.`);
    const id = addCommit(state, `Revert "${source.message}"`);
    return done(`[${state.head} ${id}] Revert "${source.message}"`);
  }
  if (command.startsWith("git tag")) {
    if (args[2] === "-d") {
      delete state.tags[args[3]];
      return done(`Deleted tag ${args[3]}.`);
    }
    const name = args[2];
    if (!name) return done(...Object.keys(state.tags));
    const target = resolveRef(state, args[3] || "HEAD");
    if (!target) return fail(`Unknown revision '${args[3]}'.`);
    state.tags[name] = target;
    return done(`Tag ${name} created at ${target}.`);
  }
  if (command.startsWith("git remote")) {
    if (args[2] === "add") {
      state.flags.remoteUrl = args[4];
      return done(`Remote ${args[3]} added.`);
    }
    if (args[2] === "set-url") {
      state.flags.remoteUrl = args[4];
      return done(`Remote ${args[3]} URL updated.`);
    }
    return done(`origin  ${state.flags.remoteUrl || "https://github.com/learnGit/community.git"} (fetch)`, `origin  ${state.flags.remoteUrl || "https://github.com/learnGit/community.git"} (push)`);
  }
  if (command.startsWith("git fetch")) {
    state.flags.fetched = true;
    return done("Fetched origin. Remote-tracking labels are up to date.");
  }
  if (command.startsWith("git push")) {
    const explicitBranch = [...args]
      .reverse()
      .find((argument) => state.branches[argument]);
    const branch = explicitBranch || state.head;
    if (!state.branches[branch]) return fail(`Unknown local branch '${branch}'.`);
    state.remoteBranches[`origin/${branch}`] = state.branches[branch];
    return done(`Published ${branch} -> origin/${branch}.`);
  }
  if (command.startsWith("git pull")) {
    const remoteTarget = state.remoteBranches[`origin/${state.head}`];
    if (!remoteTarget) return fail(`No origin/${state.head} branch exists.`);
    const current = headCommit(state);
    if (isAncestor(state, current, remoteTarget)) {
      state.branches[state.head] = remoteTarget;
      return done(`Fast-forwarded ${state.head} to ${remoteTarget}.`);
    }
    addCommit(state, `Merge origin/${state.head}`, [current, remoteTarget]);
    return done(`Merged origin/${state.head}.`);
  }
  if (command === "git stash") {
    state.stash.push({ staged: state.staged, working: state.working });
    state.staged = [];
    state.working = [];
    return done("Saved working directory and index state WIP.");
  }
  if (command === "git stash pop") {
    const saved = state.stash.pop();
    if (!saved) return fail("No stash entries found.");
    state.staged = saved.staged;
    state.working = saved.working;
    return done("Applied the latest stash.");
  }
  if (command.startsWith("git config")) return done("Git configuration updated for this simulation.");

  if (command.startsWith("gh pr create")) {
    const remote = state.remoteBranches[`origin/${state.head}`];
    if (remote !== headCommit(state)) return fail("Push the current branch before opening a pull request.");
    state.flags.prCreated = true;
    return done("Pull request created: learnGit/community #42", `${state.head} → main`);
  }
  if (command.startsWith("gh pr checks")) return done("✓ lint  pass", "✓ build pass", "✓ test   pass");
  if (command.startsWith("gh issue list")) return done("42  Improve Git workflow guide  good first issue", "57  Add rebase diagram          help wanted");
  if (command.startsWith("gh issue create")) return done("Issue created: learnGit/community #63");
  if (command.startsWith("gh issue comment")) return done("Comment added to the issue.");
  if (command.startsWith("gh project list")) return done("1  Community learning roadmap  open");
  if (command.startsWith("gh project item-add")) return done("Issue added to project 1.");
  if (command.startsWith("gh project item-list")) return done("Issue #42  Improve Git workflow guide  In Progress");
  if (command.startsWith("ssh -V")) return done("OpenSSH_9.7p1 is available in this guided simulation.");
  if (command.startsWith("ssh-keygen")) return done("Your simulated key was saved in ~/.ssh/id_ed25519.");
  if (command.startsWith("ssh-add")) return done("Identity added: ~/.ssh/id_ed25519.");
  if (command.startsWith("ssh -T") || command.startsWith("ssh -vT")) return done("Hi contributor! Authentication succeeded (simulated).");
  if (command === "ls -al ~/.ssh") return done("id_ed25519", "id_ed25519.pub", "known_hosts");

  if (!command.startsWith("git ") && !command.startsWith("gh ") && !command.startsWith("ssh")) {
    return fail(`command not found: ${args[0]}`, "Type help to see supported commands.");
  }
  return fail(`This guided engine does not model “${command}” yet.`, "Try help or choose a suggested command.");
}
