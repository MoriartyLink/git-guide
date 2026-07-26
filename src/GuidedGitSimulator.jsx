import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  GitBranch,
  GitCommit,
  GitMerge,
  Lightbulb,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Play,
  RotateCcw,
  Target,
  TerminalSquare,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  executeSimulatorCommand,
  initialSimulatorState,
  isScenarioComplete,
  scenarioById,
  scenarioForCommand,
  SIMULATOR_SCENARIOS,
  simulatorHead,
} from "./gitSimulator";

const LANE_COLORS = ["#30d158", "#64a8ff", "#ff9f0a", "#bf5af2", "#ff6b6b", "#5ac8fa"];

function laneColor(lane, lanes) {
  return LANE_COLORS[Math.max(0, lanes.indexOf(lane)) % LANE_COLORS.length];
}

function RepoMap({ onRunCommand, state, t }) {
  const [hoveredId, setHoveredId] = useState(() => simulatorHead(state));
  const [zoom, setZoom] = useState(100);
  const [zoomOpen, setZoomOpen] = useState(true);
  const lanes = useMemo(() => {
    const values = [
      "main",
      ...state.commits.map((commit) => commit.lane),
      ...Object.keys(state.branches),
      ...Object.keys(state.remoteBranches),
    ];
    return [...new Set(values.filter(Boolean))];
  }, [state]);

  const width = Math.max(620, lanes.length * 112 + 210);
  const height = Math.max(330, state.commits.length * 74 + 80);
  const coordinate = (commit) => ({
    x: 70 + lanes.indexOf(commit.lane) * 112,
    y: 54 + state.commits.indexOf(commit) * 74,
  });
  const commitById = new Map(state.commits.map((commit) => [commit.id, commit]));
  const refs = [
    ...Object.entries(state.branches).map(([name, target]) => ({
      kind: name === state.head && !state.detached ? "head" : "branch",
      name,
      target,
    })),
    ...Object.entries(state.remoteBranches).map(([name, target]) => ({
      kind: "remote",
      name,
      target,
    })),
    ...Object.entries(state.tags).map(([name, target]) => ({ kind: "tag", name, target })),
    ...(state.detached ? [{ kind: "head", name: "HEAD", target: state.detached }] : []),
  ];
  const hoveredCommit =
    state.commits.find((commit) => commit.id === hoveredId) ||
    state.commits.find((commit) => commit.id === simulatorHead(state));
  const hoveredRefs = refs.filter((ref) => ref.target === hoveredCommit?.id);

  useEffect(() => {
    setHoveredId(simulatorHead(state));
  }, [state]);

  return (
    <>
      <div className={`map-zoom-control ${zoomOpen ? "open" : "closed"}`}>
        <div className="map-zoom-heading">
          <span>{t("View size", "View size")}</span>
          <div>
            <output htmlFor="map-zoom">{zoom}%</output>
            <button
              className="map-zoom-toggle"
              onClick={() => setZoomOpen((open) => !open)}
              aria-expanded={zoomOpen}
            >
              {zoomOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {zoomOpen ? t("Hide", "ပိတ်မယ်") : t("Show", "ပြမယ်")}
            </button>
          </div>
        </div>
        {zoomOpen && <div className="map-zoom-slider">
          <small>0%</small>
          <input
            id="map-zoom"
            type="range"
            min="0"
            max="200"
            step="10"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label={t("Interactive map size", "Interactive map size")}
          />
          <small>200%</small>
          <button onClick={() => setZoom(100)} disabled={zoom === 100}>
            {t("Reset", "Reset")}
          </button>
        </div>}
      </div>
      <div className="git-map-scroll">
        <svg
          className="git-repo-map"
          width={Math.max(1, width * (zoom / 100))}
          height={Math.max(1, height * (zoom / 100))}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={t("Virtual Git commit map", "Virtual Git commit map")}
        >
        <defs>
          <filter id="commit-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {lanes.map((lane, index) => (
          <g key={lane}>
            <line
              className="lane-guide"
              x1={70 + index * 112}
              x2={70 + index * 112}
              y1={26}
              y2={height - 28}
            />
            <text className="lane-name" x={70 + index * 112} y={20} textAnchor="middle">
              {lane}
            </text>
          </g>
        ))}

        {state.commits.flatMap((commit) => {
          const child = coordinate(commit);
          return commit.parents.map((parentId, parentIndex) => {
            const parent = commitById.get(parentId);
            if (!parent) return null;
            const parentPoint = coordinate(parent);
            const middleY = (child.y + parentPoint.y) / 2;
            return (
              <path
                className={`commit-edge ${parentIndex > 0 ? "merge-edge" : ""}`}
                d={`M ${parentPoint.x} ${parentPoint.y} C ${parentPoint.x} ${middleY}, ${child.x} ${middleY}, ${child.x} ${child.y}`}
                key={`${commit.id}-${parentId}`}
                stroke={laneColor(commit.lane, lanes)}
              />
            );
          });
        })}

        {state.commits.map((commit) => {
          const point = coordinate(commit);
          const commitRefs = refs.filter((ref) => ref.target === commit.id);
          const isHead = simulatorHead(state) === commit.id;
          return (
            <g
              aria-label={`${commit.id}: ${commit.message}`}
              className={`map-commit ${hoveredId === commit.id ? "inspected" : ""}`}
              key={commit.id}
              onClick={() => setHoveredId(commit.id)}
              onFocus={() => setHoveredId(commit.id)}
              onMouseEnter={() => setHoveredId(commit.id)}
              role="button"
              tabIndex="0"
            >
              <title>{`${commit.id}: ${commit.message}. ${commit.parents.length ? `Parent ${commit.parents.join(", ")}` : "Root commit"}.`}</title>
              <circle
                className={isHead ? "active" : ""}
                cx={point.x}
                cy={point.y}
                fill={laneColor(commit.lane, lanes)}
                filter={isHead ? "url(#commit-glow)" : undefined}
                r={isHead ? 12 : 10}
              />
              <circle className="commit-core" cx={point.x} cy={point.y} r={4} />
              <text className="commit-id" x={point.x + 18} y={point.y + 4}>
                {commit.id}
              </text>
              <text className="commit-message" x={point.x + 54} y={point.y + 4}>
                {commit.message}
              </text>
              {commitRefs.map((ref, index) => (
                <g
                  className={`map-ref ${ref.kind}`}
                  key={`${ref.kind}-${ref.name}`}
                  transform={`translate(${point.x - 48}, ${point.y + 18 + index * 22})`}
                >
                  <rect width={96} height={18} rx={9} />
                  <text x={48} y={12} textAnchor="middle">
                    {ref.kind === "head" ? `HEAD → ${ref.name}` : ref.name}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
        </svg>
      </div>
      {hoveredCommit && (
        <div className="commit-inspector" aria-live="polite">
          <div>
            <span>{hoveredCommit.id}</span>
            <strong>{hoveredCommit.message}</strong>
          </div>
          <dl>
            <div>
              <dt>{t("Lane", "Lane")}</dt>
              <dd>{hoveredCommit.lane}</dd>
            </div>
            <div>
              <dt>{t("Parent", "Parent")}</dt>
              <dd>{hoveredCommit.parents.join(", ") || t("root", "root")}</dd>
            </div>
            <div>
              <dt>{t("Labels", "Labels")}</dt>
              <dd>{hoveredRefs.map((ref) => ref.name).join(", ") || t("none", "none")}</dd>
            </div>
          </dl>
          <p>
            {t(
              "Hover or focus another point to inspect it. Choose an action to learn how refs move.",
              "အခြား point ကို hover သို့ focus လုပ်ပြီး ကြည့်ပါ Ref ရွေ့ပုံလေ့လာရန် action ရွေးပါ",
            )}
          </p>
          <div>
            <button onClick={() => onRunCommand(`git show ${hoveredCommit.id}`)}>
              show {hoveredCommit.id}
            </button>
            <button onClick={() => onRunCommand(`git checkout ${hoveredCommit.id}`)}>
              checkout
            </button>
            <button onClick={() => onRunCommand(`git branch explore-${hoveredCommit.id.toLowerCase()} ${hoveredCommit.id}`)}>
              branch here
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function GuidedGitSimulator({
  completedScenarios,
  initialCommand,
  onCompleted,
  t,
}) {
  const initialScenario = scenarioForCommand(initialCommand);
  const [scenarioId, setScenarioId] = useState(initialScenario);
  const [repo, setRepo] = useState(() => initialSimulatorState(initialScenario));
  const [history, setHistory] = useState(() => [
    {
      type: "system",
      lines: [
        t(
          "Visual Git engine ready. The map changes with every supported command.",
          "Visual Git engine အသင့်ဖြစ်ပါပြီ Command တစ်ခုစီနဲ့ map ပြောင်းလဲမည်",
        ),
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [inputHistory, setInputHistory] = useState([]);
  const [historyCursor, setHistoryCursor] = useState(-1);
  const [undoStack, setUndoStack] = useState([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth > 820,
  );
  const [mapOpen, setMapOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth > 1050,
  );
  const [mapExpanded, setMapExpanded] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const initialCommandRef = useRef("");
  const scenario = scenarioById(scenarioId);

  const changeScenario = useCallback((nextId) => {
    const nextScenario = scenarioById(nextId);
    setScenarioId(nextScenario.id);
    setRepo(initialSimulatorState(nextScenario.id));
    setUndoStack([]);
    setJustCompleted(false);
    setHistory([
      {
        type: "system",
        lines: [`${nextScenario.title}`, `Goal: ${nextScenario.goal}`, `Hint: ${nextScenario.hint}`],
      },
    ]);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const runCommand = useCallback(
    (rawCommand, override) => {
      const commandText = String(rawCommand || "").trim();
      if (!commandText) return;

      let workingRepo = override?.repo || repo;
      let workingScenarioId = override?.scenarioId || scenarioId;
      let workingUndo = override?.undoStack || undoStack;
      const entries = [];
      let shouldClear = false;

      const commands = commandText
        .split(";")
        .map((command) => command.trim())
        .filter(Boolean);

      for (const command of commands) {
        entries.push({ command, type: "command" });
        const result = executeSimulatorCommand(workingRepo, command, workingScenarioId);

        if (result.type === "clear") {
          shouldClear = true;
          continue;
        }
        if (result.type === "reset") {
          workingRepo = initialSimulatorState(workingScenarioId);
          workingUndo = [];
        } else if (result.type === "undo") {
          const previous = workingUndo.at(-1);
          if (previous) {
            workingRepo = previous;
            workingUndo = workingUndo.slice(0, -1);
            result.lines = ["Restored the state before your last graph-changing command."];
          } else {
            result.lines = ["Nothing to undo yet."];
          }
        } else {
          const changed = JSON.stringify(result.state) !== JSON.stringify(workingRepo);
          if (changed) workingUndo = [...workingUndo, workingRepo];
          workingRepo = result.state;
        }

        if (result.lines.length) {
          entries.push({ lines: result.lines, type: result.type === "error" ? "error" : "output" });
        }
      }

      setRepo(workingRepo);
      setUndoStack(workingUndo);
      setInput("");
      setInputHistory((items) => [...items, ...commands]);
      setHistoryCursor(-1);
      setHistory((items) => (shouldClear ? entries.filter((entry) => entry.type !== "command") : [...items, ...entries]));

      const complete = isScenarioComplete(workingRepo, workingScenarioId);
      setJustCompleted(complete);
      if (complete) onCompleted?.(workingScenarioId);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    [onCompleted, repo, scenarioId, undoStack],
  );

  useEffect(() => {
    if (!initialCommand || initialCommandRef.current === initialCommand) return;
    initialCommandRef.current = initialCommand;
    const nextScenarioId = scenarioForCommand(initialCommand);
    const nextRepo = initialSimulatorState(nextScenarioId);
    changeScenario(nextScenarioId);
    window.setTimeout(
      () => runCommand(initialCommand, { repo: nextRepo, scenarioId: nextScenarioId, undoStack: [] }),
      0,
    );
  }, [changeScenario, initialCommand, runCommand]);

  useEffect(() => {
    outputRef.current?.scrollTo({
      top: outputRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  useEffect(() => {
    if (!mapExpanded) return undefined;
    const restoreMap = (event) => {
      if (event.key === "Escape") setMapExpanded(false);
    };
    window.addEventListener("keydown", restoreMap);
    return () => window.removeEventListener("keydown", restoreMap);
  }, [mapExpanded]);

  const nextScenario = () => {
    const index = SIMULATOR_SCENARIOS.findIndex((item) => item.id === scenarioId);
    changeScenario(SIMULATOR_SCENARIOS[(index + 1) % SIMULATOR_SCENARIOS.length].id);
  };

  const branchCount = Object.keys(repo.branches).length;
  const remoteCount = Object.keys(repo.remoteBranches).length;

  return (
    <div
      className={`visual-simulator ${scenarioOpen ? "scenarios-open" : "scenarios-closed"} ${mapOpen ? "map-open" : "map-closed"}`}
    >
      {scenarioOpen && <aside className="scenario-browser">
        <header>
          <span><Target size={17} /></span>
          <div>
            <strong>{t("Practice scenarios", "လေ့ကျင့်ခန်းများ")}</strong>
            <small>{completedScenarios.length} / {SIMULATOR_SCENARIOS.length - 1} {t("solved", "ပြီး")}</small>
          </div>
          <button
            onClick={() => setScenarioOpen(false)}
            aria-label={t("Hide scenarios", "Scenario များကို ပိတ်မယ်")}
          >
            <PanelLeftClose size={15} />
          </button>
        </header>
        <div className="scenario-progress">
          <i
            style={{
              width: `${Math.min(100, (completedScenarios.length / (SIMULATOR_SCENARIOS.length - 1)) * 100)}%`,
            }}
          />
        </div>
        <div className="scenario-list">
          {SIMULATOR_SCENARIOS.map((item, index) => {
            const active = item.id === scenarioId;
            const completed = completedScenarios.includes(item.id);
            const showGroup = index === 0 || SIMULATOR_SCENARIOS[index - 1].group !== item.group;
            return (
              <div key={item.id}>
                {showGroup && <small className="scenario-group">{item.group}</small>}
                <button
                  className={`${active ? "active" : ""} ${completed ? "completed" : ""}`}
                  onClick={() => changeScenario(item.id)}
                >
                  <span>{completed ? <Check size={13} /> : index + 1}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </div>
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>}

      <section className="simulator-stage">
        <div className="simulator-toolbar">
          <button
            className={scenarioOpen ? "active" : ""}
            onClick={() => setScenarioOpen((open) => !open)}
            aria-pressed={scenarioOpen}
          >
            {scenarioOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
            {t("Scenarios", "Scenario များ")}
          </button>
          <span>{t("Terminal workspace", "Terminal workspace")}</span>
          <button
            className={mapOpen ? "active" : ""}
            onClick={() => {
              setMapOpen((open) => !open);
              setMapExpanded(false);
            }}
            aria-pressed={mapOpen}
          >
            {mapOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
            {t("Map", "Map")}
          </button>
        </div>
        <div className="scenario-objective">
          <div>
            <span className="scenario-kicker">{scenario.group}</span>
            <h2>{scenario.title}</h2>
            <p>{scenario.goal}</p>
          </div>
          <div className="scenario-actions">
            <button onClick={() => runCommand("undo")} disabled={!undoStack.length}>
              <Undo2 size={14} />
              {t("Undo", "Undo")}
            </button>
            <button onClick={() => changeScenario(scenarioId)}>
              <RotateCcw size={14} />
              {t("Reset", "Reset")}
            </button>
          </div>
        </div>

        <section className="visual-terminal">
            <div className="terminal-titlebar">
              <span className="traffic-lights"><i /><i /><i /></span>
              <span className="terminal-window-name">
                learnGit visual engine
                <i className="terminal-status-dot connected" />
              </span>
              <button onClick={() => setHistory([])} aria-label={t("Clear terminal", "Terminal ရှင်းမယ်")}>
                <RotateCcw size={14} />
              </button>
            </div>
            <div className="visual-terminal-output" ref={outputRef} aria-live="polite">
              {history.map((entry, index) =>
                entry.type === "command" ? (
                  <p className="visual-command" key={`${entry.command}-${index}`}>
                    <span>learner@learnGit</span>
                    <span> ~/scenario</span>
                    <b> $ {entry.command}</b>
                  </p>
                ) : (
                  <div className={`visual-output ${entry.type}`} key={`${entry.type}-${index}`}>
                    {entry.lines.map((text, lineIndex) => (
                      <p key={`${text}-${lineIndex}`}>{text || "\u00a0"}</p>
                    ))}
                  </div>
                ),
              )}
            </div>
            <div className="command-suggestions">
              <span><Lightbulb size={12} /> {t("Try", "စမ်းပါ")}</span>
              {scenario.commands.map((command) => (
                <button key={command} onClick={() => runCommand(command)}>
                  {command}
                </button>
              ))}
              <button onClick={() => runCommand("show goal")}>
                <CircleHelp size={12} /> goal
              </button>
            </div>
            <form
              className="visual-terminal-input"
              onSubmit={(event) => {
                event.preventDefault();
                runCommand(input);
              }}
            >
              <span>$</span>
              <input
                ref={inputRef}
                autoComplete="off"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp" && inputHistory.length) {
                    event.preventDefault();
                    const nextCursor = Math.min(historyCursor + 1, inputHistory.length - 1);
                    setHistoryCursor(nextCursor);
                    setInput(inputHistory[inputHistory.length - 1 - nextCursor]);
                  } else if (event.key === "ArrowDown" && historyCursor >= 0) {
                    event.preventDefault();
                    const nextCursor = historyCursor - 1;
                    setHistoryCursor(nextCursor);
                    setInput(nextCursor < 0 ? "" : inputHistory[inputHistory.length - 1 - nextCursor]);
                  } else if (event.key === "Tab") {
                    const match = scenario.commands.find((command) => command.startsWith(input));
                    if (match) {
                      event.preventDefault();
                      setInput(match);
                    }
                  }
                }}
                placeholder={t("Type a Git command; use ; for multiple commands", "Git command ရိုက်ပါ ; နဲ့ command များ ခွဲနိုင်သည်")}
                spellCheck="false"
                value={input}
              />
              <button disabled={!input.trim()} aria-label={t("Run command", "Command run မယ်")}>
                <Play size={14} />
              </button>
            </form>
        </section>

        {justCompleted && scenario.id !== "freeplay" && (
          <div className="scenario-complete" role="status">
            <span><Check size={17} /></span>
            <div>
              <strong>{t("Scenario solved", "Scenario ပြီးပါပြီ")}</strong>
              <small>{t("The live map matches this workflow’s goal.", "Live map က workflow goal နဲ့ကိုက်ညီပါပြီ")}</small>
            </div>
            <button onClick={nextScenario}>
              {t("Next scenario", "နောက် scenario")}
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <div className="simulator-disclaimer">
          <TerminalSquare size={14} />
          {t(
            "This is an original educational model. It never runs commands on your device.",
            "ဒီ educational model က သင့် device ပေါ်မှာ command အစစ် မ run ပါ",
          )}
        </div>
      </section>

      {mapOpen && (
        <aside className={`simulator-map-panel ${mapExpanded ? "expanded" : ""}`}>
          <div className="repo-map-card">
            <header>
              <div>
                <GitMerge size={15} />
                <strong>{t("Interactive map", "Interactive map")}</strong>
              </div>
              <div className="map-panel-actions">
                <button
                  onClick={() => setMapExpanded((expanded) => !expanded)}
                  aria-label={
                    mapExpanded
                      ? t("Restore map size", "Map size ပြန်ချုံ့မယ်")
                      : t("Expand map workspace", "Map workspace ချဲ့မယ်")
                  }
                >
                  {mapExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  onClick={() => {
                    setMapOpen(false);
                    setMapExpanded(false);
                  }}
                  aria-label={t("Hide map", "Map ပိတ်မယ်")}
                >
                  <PanelRightClose size={15} />
                </button>
              </div>
            </header>
            <div className="map-stats">
              <span><GitCommit size={12} /> {repo.commits.length} commits</span>
              <span><GitBranch size={12} /> {branchCount} branches</span>
              <span>remote {remoteCount}</span>
            </div>
            <RepoMap onRunCommand={runCommand} state={repo} t={t} />
            <footer>
              <span><i className="legend-head" /> HEAD: {repo.detached || repo.head}</span>
              <span><i className="legend-work" /> {repo.working.length} working</span>
              <span><i className="legend-stage" /> {repo.staged.length} staged</span>
            </footer>
          </div>
        </aside>
      )}
    </div>
  );
}
