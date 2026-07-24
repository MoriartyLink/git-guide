import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  Copy,
  GraduationCap,
  Menu,
  RotateCcw,
  Search,
  TerminalSquare,
  X,
  Zap,
} from "lucide-react";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const LanguageContext = createContext(null);

function useLanguage() {
  return useContext(LanguageContext);
}

function localize(item, field, language) {
  if (language === "my") return item?.my?.[field] ?? item?.[field];
  return item?.[field];
}

const fallbackGuide = {
  knowledgeTopics: [],
  modules: [
    {
      id: "loading",
      number: "01",
      title: "Git foundations",
      description: "Learn how repositories, snapshots, and commits fit together.",
      duration: "12 min",
      difficulty: "Beginner",
      lessons: [],
    },
  ],
};

function useStoredProgress() {
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("git-together-progress") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("git-together-progress", JSON.stringify(completed));
  }, [completed]);

  return [completed, setCompleted];
}

function Logo({ compact = false, onClick }) {
  const { t } = useLanguage();
  return (
    <button
      className="brand"
      aria-label="Git Together home"
      data-compact={compact}
      onClick={onClick}
    >
      <span className="brand-mark">
        <Code2 size={18} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span>
          <strong>Git Together</strong>
          <small>{t("Community Guide", "Community လမ်းညွှန်")}</small>
        </span>
      )}
    </button>
  );
}

function TopBar({ currentView, onNavigate, onOpenMenu }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Logo onClick={() => onNavigate("home")} />
        <nav className="desktop-nav" aria-label="Main navigation">
          <button
            className={currentView === "home" ? "active" : ""}
            onClick={() => onNavigate("home")}
          >
            {t("Learn", "လေ့လာရန်")}
          </button>
          <button
            className={currentView === "knowledge" ? "active" : ""}
            onClick={() => onNavigate("knowledge")}
          >
            {t("Knowledge", "အခြေခံ သိရန်")}
          </button>
          <button
            className={currentView === "terminal" ? "active" : ""}
            onClick={() => onNavigate("terminal")}
          >
            {t("Terminal Lab", "Terminal လေ့ကျင့်ခန်း")}
          </button>
          <button
            className={currentView === "cheatsheet" ? "active" : ""}
            onClick={() => onNavigate("cheatsheet")}
          >
            {t("Cheat Sheet", "Command အကျဉ်း")}
          </button>
        </nav>
        <div className="topbar-actions">
          <button
            className="language-toggle"
            onClick={() => setLanguage(language === "en" ? "my" : "en")}
            aria-label={t("Switch to Burmese", "အင်္ဂလိပ်ဘာသာပြောင်းရန်")}
          >
            <span className={language === "en" ? "active" : ""}>EN</span>
            <i />
            <span className={language === "my" ? "active" : ""}>မြန်မာ</span>
          </button>
          <button className="icon-button menu-button" onClick={onOpenMenu} aria-label="Open menu">
            <Menu size={21} />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose, onNavigate }) {
  const { language, setLanguage, t } = useLanguage();
  if (!open) return null;
  return (
    <div className="mobile-drawer">
      <button className="drawer-backdrop" onClick={onClose} aria-label="Close menu" />
      <div className="drawer-panel">
        <div className="drawer-head">
          <Logo />
          <button className="icon-button" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav>
          {[
            ["home", BookOpen, t("Learn", "လေ့လာရန်")],
            ["knowledge", CircleHelp, t("Knowledge", "အခြေခံ သိရန်")],
            ["terminal", TerminalSquare, t("Terminal Lab", "Terminal လေ့ကျင့်ခန်း")],
            ["cheatsheet", Command, t("Cheat Sheet", "Command အကျဉ်း")],
          ].map(([view, Icon, label]) => (
            <button
              key={view}
              onClick={() => {
                onNavigate(view);
                onClose();
              }}
            >
              {createElement(Icon, { size: 18 })}
              {label}
              <ChevronRight size={17} />
            </button>
          ))}
        </nav>
        <button
          className="drawer-language"
          onClick={() => setLanguage(language === "en" ? "my" : "en")}
        >
          {t("မြန်မာဘာသာဖြင့် ကြည့်မယ်", "View in English")}
        </button>
      </div>
    </div>
  );
}

function Hero({ onStart, onTerminal }) {
  const { t } = useLanguage();
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="container hero-content">
        <div className="hero-copy">
          <div className="eyebrow-pill">
            <span className="pulse-dot" />
            {t("Made for community learning", "Community အတွက် လုပ်ထားသည်")}
          </div>
          <h1>
            {t("Learn Git.", "Git ကိုလေ့လာ။")}
            <br />
            <span>{t("Build together.", "အတူတူဖန်တီး။")}</span>
          </h1>
          <p>
            {t(
              "Simple Git and GitHub lessons. Read a short step, try a command, and learn with your community.",
              "Git နဲ့ GitHub ကို ရိုးရိုးရှင်းရှင်း လေ့လာမယ်။ အဆင့်တိုတိုဖတ်၊ command စမ်းပြီး community နဲ့အတူ လေ့လာပါ။",
            )}
          </p>
          <div className="hero-actions">
            <button className="primary-button hero-button" onClick={onStart}>
              {t("Start learning", "စလေ့လာမယ်")}
            </button>
            <button className="secondary-button hero-button" onClick={onTerminal}>
              {t("Try terminal", "Terminal စမ်းမယ်")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PathSection({ guide, completed, onOpenLesson, pathRef }) {
  const { language, t } = useLanguage();
  return (
    <section className="path-section" ref={pathRef}>
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="kicker">{t("LEARNING PATH", "လေ့လာမည့် အဆင့်များ")}</span>
            <h2>{t("Learn one small step at a time.", "အဆင့်တိုတို တစ်ခုပြီးတစ်ခု လေ့လာပါ။")}</h2>
          </div>
          <p>
            {t(
              "5 modules. 15 short lessons. Every lesson has one command and one quick check.",
              "Module ၅ ခု၊ သင်ခန်းစာတို ၁၅ ခု။ ခန်းတိုင်းမှာ command တစ်ခုနဲ့ စစ်ဆေးချက်တစ်ခု ပါတယ်။",
            )}
          </p>
        </div>
        <div className="module-grid">
          {guide.modules.map((module) => {
            const moduleDone = module.lessons.filter((item) => completed.includes(item.id)).length;
            const firstLesson = module.lessons[0];
            return (
              <article className="module-card" key={module.id}>
                <div className="module-topline">
                  <span className="module-number">{module.number}</span>
                  <span className="level-badge">{localize(module, "difficulty", language)}</span>
                </div>
                <h3>{localize(module, "title", language)}</h3>
                <p>{localize(module, "description", language)}</p>
                <div className="module-meta">
                  <span>
                    {localize(module, "duration", language)}
                  </span>
                  <span>
                    {moduleDone}/{module.lessons.length} {t("done", "ပြီး")}
                  </span>
                </div>
                <div className="module-progress">
                  <i
                    style={{
                      width: `${
                        module.lessons.length ? (moduleDone / module.lessons.length) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
                <button
                  className="module-link"
                  disabled={!firstLesson}
                  onClick={() => firstLesson && onOpenLesson(firstLesson.id)}
                >
                  {moduleDone ? t("Continue", "ဆက်လေ့လာမယ်") : t("Start", "စမယ်")}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BeginnerQuestions({ onKnowledge }) {
  const { t } = useLanguage();
  const questions = [
    t("What is Git?", "Git ဆိုတာ ဘာလဲ။"),
    t("What is a repository?", "Repository ဆိုတာ ဘာလဲ။"),
    t("Why use a branch?", "Branch ဘာကြောင့်သုံးလဲ။"),
    t("How do teams collaborate?", "Team က ဘယ်လိုအတူလုပ်လဲ။"),
  ];

  return (
    <section className="beginner-section">
      <div className="container beginner-inner">
        <div>
          <span className="kicker">{t("NEW TO GIT?", "GIT ကို အခုမှ စလား")}</span>
          <h2>{t("Start with your questions.", "သိချင်တဲ့ မေးခွန်းကနေ စပါ။")}</h2>
          <p>
            {t(
              "Simple answers to the questions every beginner asks.",
              "အစပြုသူတိုင်း မေးလေ့ရှိတာကို ရိုးရိုးရှင်းရှင်း ဖြေပေးထားတယ်။",
            )}
          </p>
          <button className="primary-button" onClick={onKnowledge}>
            {t("Open beginner knowledge", "အခြေခံဗဟုသုတ ဖွင့်မယ်")}
          </button>
        </div>
        <div className="question-preview">
          {questions.map((question, index) => (
            <div key={question}>
              <span>0{index + 1}</span>
              {question}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home({ guide, completed, onOpenLesson, onTerminal, onKnowledge }) {
  const pathRef = useRef(null);
  return (
    <>
      <Hero
        onStart={() => pathRef.current?.scrollIntoView({ behavior: "smooth" })}
        onTerminal={onTerminal}
      />
      <BeginnerQuestions onKnowledge={onKnowledge} />
      <PathSection
        guide={guide}
        completed={completed}
        onOpenLesson={onOpenLesson}
        pathRef={pathRef}
      />
    </>
  );
}

function KnowledgePage({ topics }) {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openTopic, setOpenTopic] = useState(topics[0]?.id || null);

  const categories = useMemo(() => {
    const values = topics.map((topic) => localize(topic, "category", language));
    return ["all", ...new Set(values)];
  }, [topics, language]);

  const visibleTopics = topics.filter((topic) => {
    const selectedCategory = localize(topic, "category", language);
    const text = `${localize(topic, "question", language)} ${localize(topic, "answer", language)}`
      .toLowerCase();
    return (category === "all" || category === selectedCategory) && text.includes(query.toLowerCase());
  });

  return (
    <main className="knowledge-page">
      <div className="container">
        <div className="page-intro knowledge-intro">
          <span className="kicker">{t("BEGINNER KNOWLEDGE", "အစပြုသူ အခြေခံဗဟုသုတ")}</span>
          <h1>{t("Git questions, answered simply.", "Git မေးခွန်းများကို ရိုးရှင်းစွာ ဖြေမယ်။")}</h1>
          <p>
            {t(
              "No long definitions. Open a question, read the short answer, and see one example.",
              "စာရှည်ကြီး မရှိပါ။ မေးခွန်းဖွင့်၊ အဖြေတိုတိုဖတ်၊ ဥပမာတစ်ခုကြည့်ပါ။",
            )}
          </p>
        </div>

        <div className="knowledge-tools">
          <label>
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search a question…", "မေးခွန်း ရှာမယ်…")}
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>
          <div className="category-tabs">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item === "all" ? t("All", "အားလုံး") : item}
              </button>
            ))}
          </div>
        </div>

        <div className="knowledge-layout">
          <aside className="knowledge-guide">
            <h2>{t("Best order for beginners", "အစပြုသူအတွက် အစဉ်လိုက်")}</h2>
            <ol>
              <li>{t("Understand Git and repos", "Git နဲ့ repo ကိုနားလည်ပါ")}</li>
              <li>{t("Learn commits and branches", "Commit နဲ့ branch လေ့လာပါ")}</li>
              <li>{t("Connect to GitHub", "GitHub နဲ့ချိတ်ပါ")}</li>
              <li>{t("Practice team workflow", "Team workflow လေ့ကျင့်ပါ")}</li>
            </ol>
          </aside>

          <section className="faq-list">
            <div className="faq-count">
              <span>{visibleTopics.length} {t("answers", "အဖြေ")}</span>
              <small>{t("Click a question to open it.", "မေးခွန်းကို နှိပ်ပြီးဖွင့်ပါ။")}</small>
            </div>
            {visibleTopics.map((topic) => {
              const isOpen = openTopic === topic.id;
              return (
                <article className={isOpen ? "open" : ""} key={topic.id}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenTopic(isOpen ? null : topic.id)}
                    aria-expanded={isOpen}
                  >
                    <div>
                      <small>{localize(topic, "category", language)}</small>
                      <strong>{localize(topic, "question", language)}</strong>
                    </div>
                    <ChevronDown size={18} />
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{localize(topic, "answer", language)}</p>
                      <div>
                        <span>
                          <small>{t("EXAMPLE", "ဥပမာ")}</small>
                          {localize(topic, "example", language)}
                        </span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
            {!visibleTopics.length && (
              <div className="empty-knowledge">
                <strong>{t("No answer found.", "အဖြေ မတွေ့ပါ။")}</strong>
                <button onClick={() => { setQuery(""); setCategory("all"); }}>
                  {t("Show all questions", "မေးခွန်းအားလုံး ပြမယ်")}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function GuideSidebar({ guide, activeLesson, completed, onSelect, open, onClose }) {
  const { language, t } = useLanguage();
  return (
    <>
      {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close lessons" />}
      <aside className={`guide-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head">
          <span>{t("Lessons", "သင်ခန်းစာများ")}</span>
          <button className="icon-button sidebar-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-progress">
          <div>
            <span>{t("Progress", "တိုးတက်မှု")}</span>
            <strong>
              {completed.length}/
              {guide.modules.reduce((count, module) => count + module.lessons.length, 0)}
            </strong>
          </div>
          <div>
            <i
              style={{
                width: `${
                  (completed.length /
                    Math.max(
                      guide.modules.reduce(
                        (count, module) => count + module.lessons.length,
                        0,
                      ),
                      1,
                    )) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
        <div className="lesson-groups">
          {guide.modules.map((module) => (
            <section key={module.id}>
              <div className="lesson-group-title">
                <span>{module.number}</span>
                <strong>{localize(module, "title", language)}</strong>
                <ChevronDown size={15} />
              </div>
              {module.lessons.map((lesson) => (
                <button
                  className={activeLesson === lesson.id ? "active" : ""}
                  key={lesson.id}
                  onClick={() => {
                    onSelect(lesson.id);
                    onClose();
                  }}
                >
                  {completed.includes(lesson.id) ? (
                    <CheckCircle2 size={16} className="done-icon" />
                  ) : (
                    <Circle size={15} />
                  )}
                  <span>{localize(lesson, "title", language)}</span>
                </button>
              ))}
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}

function CommandBlock({ label, command, onTry }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="command-block">
      <div>
        <span>{label}</span>
        <button onClick={copyCommand} aria-label="Copy command">
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? t("Copied", "ကူးပြီး") : t("Copy", "ကူးမယ်")}
        </button>
      </div>
      <code>
        <span>$</span> {command}
      </code>
      <button className="try-command" onClick={() => onTry(command)}>
        {t("Try in terminal", "Terminal မှာ စမ်းမယ်")}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

function QuickCheck({ check }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);

  if (!check) return null;
  const isCorrect = selected === check.correct;

  return (
    <section className="quick-check">
      <div className="quick-check-heading">
        <div>
          <small>{t("QUICK CHECK", "အမြန် စစ်မယ်")}</small>
          <h2>{check.question}</h2>
        </div>
      </div>
      <div className="answer-grid">
        {check.options.map((option, index) => (
          <button
            key={option}
            className={
              selected === null
                ? ""
                : index === check.correct
                  ? "correct"
                  : selected === index
                    ? "wrong"
                    : ""
            }
            onClick={() => setSelected(index)}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            {option}
          </button>
        ))}
      </div>
      {selected !== null && (
        <p className={isCorrect ? "check-result correct" : "check-result wrong"}>
          {isCorrect
            ? check.success
            : t("Not yet. Choose another answer.", "မမှန်သေးပါ။ နောက်တစ်ခု ရွေးပါ။")}
        </p>
      )}
    </section>
  );
}

function LessonView({
  guide,
  lessonId,
  completed,
  onSelect,
  onBack,
  onTerminal,
  onToggleComplete,
}) {
  const { language, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const allLessons = useMemo(
    () => guide.modules.flatMap((module) => module.lessons),
    [guide.modules],
  );
  const activeIndex = allLessons.findIndex((lesson) => lesson.id === lessonId);
  const lesson = allLessons[activeIndex] || allLessons[0];
  const nextLesson = allLessons[activeIndex + 1];
  const previousLesson = allLessons[activeIndex - 1];

  if (!lesson) return null;

  return (
    <div className="guide-layout">
      <GuideSidebar
        guide={guide}
        activeLesson={lesson.id}
        completed={completed}
        onSelect={onSelect}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="lesson-main">
        <div className="lesson-mobile-controls">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={17} /> {t("Lessons", "သင်ခန်းစာ")}
          </button>
          <button onClick={onBack}>
            <ArrowLeft size={17} /> {t("Home", "ပင်မ")}
          </button>
        </div>
        <article className="lesson-article">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={15} /> {t("Back to modules", "Module များသို့")}
          </button>
          <div className="lesson-meta">
            <span className="kicker">{localize(lesson, "eyebrow", language)}</span>
            <span>
              <Clock3 size={14} />
              {localize(lesson, "readTime", language)}
            </span>
          </div>
          <h1>{localize(lesson, "title", language)}</h1>
          <p className="lesson-lead">{localize(lesson, "summary", language)}</p>

          <div className="concept-visual">
            {localize(lesson, "points", language).map((point, index) => (
              <div key={point.title}>
                <span>{index + 1}</span>
                <strong>{point.title}</strong>
                <small>{point.copy}</small>
              </div>
            ))}
          </div>

          <h2>{t("Try the command", "Command ကို စမ်းမယ်")}</h2>
          <p>
            {t(
              "Copy it, or open the terminal and run it now.",
              "Copy လုပ်ပါ။ ဒါမှမဟုတ် terminal ဖွင့်ပြီး အခု run ပါ။",
            )}
          </p>
          <CommandBlock
            label={localize(lesson, "commandLabel", language)}
            command={lesson.command}
            onTry={onTerminal}
          />
          <aside className="tip-box">
            <div>
              <strong>{t("Simple tip", "အလွယ် မှတ်ရန်")}</strong>
              <p>{localize(lesson, "tip", language)}</p>
            </div>
          </aside>
          <QuickCheck
            key={`${lesson.id}-${language}`}
            check={localize(lesson, "check", language)}
          />

          <div className="lesson-complete-card">
            <div>
              <div>
                <strong>{t("Done with this lesson?", "ဒီသင်ခန်းစာ ပြီးပြီလား။")}</strong>
                <p>{t("Save your progress.", "သင့်တိုးတက်မှုကို သိမ်းပါ။")}</p>
              </div>
            </div>
            <button
              className={completed.includes(lesson.id) ? "completed" : ""}
              onClick={() => onToggleComplete(lesson.id)}
            >
              {completed.includes(lesson.id) ? <Check size={16} /> : null}
              {completed.includes(lesson.id)
                ? t("Completed", "ပြီးပြီ")
                : t("Mark done", "ပြီးပြီဟု မှတ်မယ်")}
            </button>
          </div>

          <nav className="lesson-pagination">
            <button disabled={!previousLesson} onClick={() => previousLesson && onSelect(previousLesson.id)}>
              <ArrowLeft size={16} />
              <span>
                <small>{t("Previous", "နောက်သို့")}</small>
                {previousLesson ? localize(previousLesson, "title", language) : t("Start", "စမယ်")}
              </span>
            </button>
            <button disabled={!nextLesson} onClick={() => nextLesson && onSelect(nextLesson.id)}>
              <span>
                <small>{t("Next", "ရှေ့သို့")}</small>
                {nextLesson
                  ? localize(nextLesson, "title", language)
                  : t("All lessons done", "အားလုံးပြီးပြီ")}
              </span>
              <ArrowRight size={16} />
            </button>
          </nav>
        </article>
      </main>
    </div>
  );
}

function TerminalLab({ completedChallenges, setCompletedChallenges, initialCommand }) {
  const { t } = useLanguage();
  const [history, setHistory] = useState([
    {
      kind: "system",
      lines: [
        "Welcome to the Git Together terminal lab.",
        "This is a safe simulation—nothing here changes your computer.",
        "Type help to see available commands.",
      ],
    },
  ]);
  const [command, setCommand] = useState(initialCommand || "");
  const [busy, setBusy] = useState(false);
  const outputRef = useRef(null);

  useEffect(() => {
    setCommand(initialCommand || "");
  }, [initialCommand]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const runCommand = async (event) => {
    event?.preventDefault();
    const currentCommand = command.trim();
    if (!currentCommand || busy) return;

    setHistory((items) => [...items, { kind: "command", command: currentCommand }]);
    setCommand("");
    setBusy(true);
    try {
      const result = await fetch(`${API_BASE}/api/terminal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: currentCommand }),
      });
      const data = await result.json();
      if (data.clear) {
        setHistory([]);
      } else {
        setHistory((items) => [
          ...items,
          { kind: result.ok ? "output" : "error", lines: data.lines || [data.error] },
        ]);
      }
      if (data.completed) {
        setCompletedChallenges((items) =>
          items.includes(data.completed) ? items : [...items, data.completed],
        );
      }
    } catch {
      setHistory((items) => [
        ...items,
        { kind: "error", lines: ["The lab backend is unavailable. Please try again."] },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const challenges = [
    ["init", t("Start a repository", "Repository စမယ်"), "git init"],
    ["status", t("Check changed files", "ပြောင်းထားတဲ့ file စစ်မယ်"), "git status"],
    ["add", t("Stage the changes", "Changes ကိုရွေးမယ်"), "git add ."],
    ["commit", t("Save a commit", "Commit သိမ်းမယ်"), 'git commit -m "Add community guide"'],
    ["branch", t("Create a branch", "Branch ဖန်တီးမယ်"), "git switch -c feat/community-guide"],
    ["push", t("Publish the branch", "Branch ကိုတင်မယ်"), "git push -u origin feat/community-guide"],
  ];

  return (
    <main className="lab-page">
      <div className="container">
        <div className="page-intro">
          <span className="kicker">{t("PRACTICE", "လက်တွေ့ လေ့ကျင့်မယ်")}</span>
          <h1>{t("Try Git safely.", "Git ကို လုံခြုံစွာ စမ်းပါ။")}</h1>
          <p>
            {t(
              "Click a task, then press Run. Commands use the backend but never change your computer.",
              "Task တစ်ခုကိုနှိပ်ပြီး Run လုပ်ပါ။ Command တွေက backend ကိုသုံးပေမယ့် သင့် computer ကို မပြောင်းပါ။",
            )}
          </p>
        </div>
        <div className="lab-grid">
          <aside className="challenge-panel">
            <div className="challenge-heading">
              <span>
                <GraduationCap size={18} />
              </span>
              <div>
                <strong>{t("6 simple tasks", "Task လွယ် ၆ ခု")}</strong>
                <small>{completedChallenges.length} / {challenges.length} {t("done", "ပြီး")}</small>
              </div>
            </div>
            <div className="challenge-progress">
              <i style={{ width: `${(completedChallenges.length / challenges.length) * 100}%` }} />
            </div>
            <div className="challenge-list">
              {challenges.map(([id, title, suggestion], index) => {
                const done = completedChallenges.includes(id);
                return (
                  <button key={id} className={done ? "done" : ""} onClick={() => setCommand(suggestion)}>
                    <span>{done ? <Check size={14} /> : index + 1}</span>
                    <div>
                      <strong>{title}</strong>
                      <small>{suggestion}</small>
                    </div>
                    <ChevronRight size={15} />
                  </button>
                );
              })}
            </div>
            <div className="safe-note">
              <Zap size={15} />
              <span>
                <strong>{t("Safe practice", "လုံခြုံသည်")}</strong>
                {t("Commands are simulated.", "Command များကို simulation လုပ်ထားသည်။")}
              </span>
            </div>
          </aside>

          <section className="terminal-card lab-terminal">
            <div className="terminal-titlebar">
              <span className="traffic-lights">
                <i />
                <i />
                <i />
              </span>
              <span>git-together-lab — guided</span>
              <button onClick={() => setHistory([])} aria-label="Clear terminal">
                <RotateCcw size={14} />
              </button>
            </div>
            <div className="lab-output" ref={outputRef}>
              {history.map((item, index) => {
                if (item.kind === "command") {
                  return (
                    <p className="lab-command" key={index}>
                      <span>➜</span> <em>community-project</em>{" "}
                      <b>git:(feat/community-guide)</b> {item.command}
                    </p>
                  );
                }
                return (
                  <div className={`lab-lines ${item.kind}`} key={index}>
                    {item.lines?.map((line, lineIndex) => <p key={lineIndex}>{line}</p>)}
                  </div>
                );
              })}
              {busy && <p className="terminal-muted">Running command…</p>}
            </div>
            <form className="terminal-input-row" onSubmit={runCommand}>
              <span>➜</span>
              <span className="input-path">community-project</span>
              <input
                autoFocus
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder={t("Type a Git command…", "Git command ရိုက်ပါ…")}
                aria-label="Terminal command"
                spellCheck="false"
              />
              <button disabled={busy || !command.trim()}>{t("Run", "စမ်းမယ်")} ↵</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function CheatSheet({ onTry }) {
  const { t } = useLanguage();
  const groups = [
    {
      title: t("Start & check", "စပြီး စစ်မယ်"),
      commands: [
        ["git init", t("Start a repository", "Repository စမယ်")],
        ["git status", t("See changed files", "ပြောင်းထားတဲ့ file ကြည့်မယ်")],
        ["git log --oneline", t("See saved commits", "သိမ်းထားတဲ့ commit ကြည့်မယ်")],
      ],
    },
    {
      title: t("Save work", "အလုပ်သိမ်းမယ်"),
      commands: [
        ["git add .", t("Choose current changes", "လက်ရှိ changes ရွေးမယ်")],
        ['git commit -m "message"', t("Save a snapshot", "Snapshot သိမ်းမယ်")],
        ["git diff --staged", t("Review before commit", "Commit မလုပ်ခင်ကြည့်မယ်")],
      ],
    },
    {
      title: t("Branches", "Branch များ"),
      commands: [
        ["git branch", t("List branches", "Branch list ကြည့်မယ်")],
        ["git switch -c branch-name", t("Create and switch", "ဖန်တီးပြီး ပြောင်းမယ်")],
        ["git merge branch-name", t("Merge a branch", "Branch ကို merge မယ်")],
      ],
    },
    {
      title: t("Share on GitHub", "GitHub မှာ မျှဝေမယ်"),
      commands: [
        ["git remote -v", t("Check remote", "Remote စစ်မယ်")],
        ["git push -u origin branch-name", t("Publish a branch", "Branch တင်မယ်")],
        ["git pull --rebase", t("Get remote changes", "Remote changes ယူမယ်")],
      ],
    },
  ];
  return (
    <main className="cheatsheet-page">
      <div className="container">
        <div className="page-intro">
          <span className="kicker">{t("QUICK COMMANDS", "COMMAND အကျဉ်း")}</span>
          <h1>{t("Git commands you will use.", "အသုံးများတဲ့ Git command များ။")}</h1>
          <p>{t("Click a command to try it.", "စမ်းလိုတဲ့ command ကိုနှိပ်ပါ။")}</p>
        </div>
        <div className="cheat-grid">
          {groups.map(({ title, commands }) => (
            <section className="cheat-card" key={title}>
              <div className="cheat-title">
                <h2>{title}</h2>
              </div>
              {commands.map(([command, description]) => (
                <button key={command} onClick={() => onTry(command)}>
                  <div>
                    <code>{command}</code>
                    <small>{description}</small>
                  </div>
                </button>
              ))}
            </section>
          ))}
        </div>
        <div className="cheat-banner">
          <div>
            <h2>{t("Ready to practice?", "လက်တွေ့ စမ်းမလား။")}</h2>
            <p>{t("Open the safe terminal.", "လုံခြုံတဲ့ terminal ကိုဖွင့်ပါ။")}</p>
          </div>
          <button className="primary-button" onClick={() => onTry("git status")}>
            {t("Open terminal", "Terminal ဖွင့်မယ်")}
          </button>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer>
      <div className="container footer-inner">
        <div>
          <Logo />
          <p>{t("Simple Git lessons for community members.", "Community members များအတွက် ရိုးရှင်းတဲ့ Git သင်ခန်းစာ။")}</p>
        </div>
        <div className="footer-links">
          <a href="https://git-scm.com/doc" target="_blank" rel="noreferrer">
            {t("Git docs", "Git လမ်းညွှန်")}
          </a>
          <a href="https://docs.github.com/" target="_blank" rel="noreferrer">
            {t("GitHub docs", "GitHub လမ်းညွှန်")}
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>{t("Made for community learners.", "Community learners များအတွက်။")}</span>
        <a href="mailto:moriartylink@gmail.com">
          {t("Contact the developer", "Developer ကိုဆက်သွယ်ရန်")} — MoriartyLink:
          moriartylink@gmail.com
        </a>
      </div>
    </footer>
  );
}

export default function App() {
  const [language, setLanguage] = useState(() => {
    const queryLanguage = new URLSearchParams(window.location.search).get("lang");
    return queryLanguage === "my" || queryLanguage === "en"
      ? queryLanguage
      : localStorage.getItem("git-together-language") || "en";
  });
  const [guide, setGuide] = useState(fallbackGuide);
  const [view, setView] = useState(() => {
    const queryView = new URLSearchParams(window.location.search).get("view");
    return ["home", "knowledge", "terminal", "cheatsheet"].includes(queryView)
      ? queryView
      : "home";
  });
  const [lessonId, setLessonId] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [completed, setCompleted] = useStoredProgress();
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [initialCommand, setInitialCommand] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/guide`)
      .then((response) => {
        if (!response.ok) throw new Error("Guide unavailable");
        return response.json();
      })
      .then(setGuide)
      .catch(() => {
        import("../server/guide.js").then((content) =>
          setGuide({ name: "Git Together", modules: content.modules }),
        );
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("git-together-language", language);
    document.documentElement.lang = language === "my" ? "my" : "en";
    document.body.dataset.language = language;
  }, [language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, lessonId]);

  const navigate = useCallback((nextView, scrollToPath = false) => {
    setView(nextView);
    setLessonId(null);
    if (nextView === "home" && scrollToPath) {
      window.setTimeout(() => {
        document.querySelector(".path-section")?.scrollIntoView({ behavior: "smooth" });
      }, 20);
    }
  }, []);

  const openLesson = (id) => {
    setLessonId(id);
    setView("lesson");
  };

  const openTerminal = (command = "") => {
    setInitialCommand(command);
    setView("terminal");
    setLessonId(null);
  };

  const toggleComplete = (id) => {
    setCompleted((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  };

  const languageValue = useMemo(
    () => ({
      language,
      setLanguage,
      t: (english, burmese) => (language === "my" ? burmese : english),
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={languageValue}>
    <div className="app-shell">
      <TopBar currentView={view} onNavigate={navigate} onOpenMenu={() => setMobileMenu(true)} />
      <MobileMenu open={mobileMenu} onClose={() => setMobileMenu(false)} onNavigate={navigate} />
      {view === "home" && (
        <Home
          guide={guide}
          completed={completed}
          onOpenLesson={openLesson}
          onTerminal={() => openTerminal()}
          onKnowledge={() => navigate("knowledge")}
        />
      )}
      {view === "lesson" && (
        <LessonView
          guide={guide}
          lessonId={lessonId}
          completed={completed}
          onSelect={openLesson}
          onBack={() => navigate("home")}
          onTerminal={openTerminal}
          onToggleComplete={toggleComplete}
        />
      )}
      {view === "terminal" && (
        <TerminalLab
          completedChallenges={completedChallenges}
          setCompletedChallenges={setCompletedChallenges}
          initialCommand={initialCommand}
        />
      )}
      {view === "knowledge" && <KnowledgePage topics={guide.knowledgeTopics || []} />}
      {view === "cheatsheet" && <CheatSheet onTry={openTerminal} />}
      {view !== "lesson" && <Footer />}
    </div>
    </LanguageContext.Provider>
  );
}
