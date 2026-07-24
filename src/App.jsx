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
import gitTogetherLogo from "./assets/git-together-logo.png";

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
  return (
    <button
      className="brand"
      aria-label="Git Together home"
      data-compact={compact}
      onClick={onClick}
    >
      <span className="brand-mark">
        <img src={gitTogetherLogo} alt="" />
      </span>
      {!compact && (
        <span>
          <strong>Git Together</strong>
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

function Hero({ onStart }) {
  const { t } = useLanguage();
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="container hero-content">
        <div className="hero-copy">
          <div className="eyebrow-pill">
            <span className="pulse-dot" />
            {t("For Talkware Community", "Talkware Community အတွက်")}
          </div>
          <h1>
            {t("Learn Git.", "Git ကိုလေ့လာ")}
            <br />
            <span>{t("Build together.", "အတူတူတည်ဆောက်")}</span>
          </h1>
          <p>
            {t(
              "Simple Git and GitHub lessons. Read a short step, try a command, and learn with your community.",
              "အဆင့်တိုတိုဖတ်၊ command တစ်ခုစီစမ်း၊ Git နဲ့ GitHub ကို community နဲ့အတူ တစ်လှမ်းချင်း လေ့လာမယ်",
            )}
          </p>
          <div className="hero-actions">
            <button className="primary-button hero-button" onClick={onStart}>
              {t("Start learning", "စလေ့လာမယ်")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function fitCertificateText(context, text, maxWidth, startSize, fontFamily) {
  let size = startSize;
  do {
    context.font = `700 ${size}px ${fontFamily}`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > 34);
  return size;
}

async function downloadCertificate(name, language) {
  await document.fonts.ready;
  const { jsPDF } = await import("jspdf");
  const canvas = document.createElement("canvas");
  canvas.width = 1684;
  canvas.height = 1190;
  const context = canvas.getContext("2d");
  const isBurmese = language === "my";
  const fontFamily = isBurmese ? '"Noto Sans Myanmar", sans-serif' : '"DM Sans", sans-serif';

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#080b09");
  background.addColorStop(1, "#111713");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const glow = context.createRadialGradient(842, 80, 10, 842, 80, 650);
  glow.addColorStop(0, "rgba(48, 209, 88, 0.22)");
  glow.addColorStop(1, "rgba(48, 209, 88, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, 720);

  context.strokeStyle = "#30d158";
  context.lineWidth = 3;
  context.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);
  context.strokeStyle = "rgba(48, 209, 88, 0.25)";
  context.lineWidth = 1;
  context.strokeRect(72, 72, canvas.width - 144, canvas.height - 144);

  context.textAlign = "center";
  context.fillStyle = "#30d158";
  context.font = `700 24px ${fontFamily}`;
  context.fillText("GIT TOGETHER · TALKWARE", 842, 160);

  context.fillStyle = "#f5f5f7";
  context.font = `700 ${isBurmese ? 58 : 72}px ${fontFamily}`;
  context.fillText(isBurmese ? "ပြီးမြောက်ကြောင်း လက်မှတ်" : "Certificate of Completion", 842, 285);

  context.fillStyle = "#a1a1a6";
  context.font = `500 30px ${fontFamily}`;
  context.fillText("Git Guide Class", 842, 350);
  context.fillText(
    isBurmese ? "ဤလက်မှတ်ကို ချီးမြှင့်သည်" : "This certificate is presented to",
    842,
    465,
  );

  context.fillStyle = "#f5f5f7";
  const nameSize = fitCertificateText(context, name, 1320, 78, fontFamily);
  context.font = `700 ${nameSize}px ${fontFamily}`;
  context.fillText(name, 842, 575);

  context.strokeStyle = "rgba(48, 209, 88, 0.55)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(350, 620);
  context.lineTo(1334, 620);
  context.stroke();

  context.fillStyle = "#c7c7cc";
  context.font = `400 ${isBurmese ? 26 : 28}px ${fontFamily}`;
  context.fillText(
    isBurmese
      ? "Git Together ရှိ Git နှင့် GitHub သင်ခန်းစာများအားလုံးကို ပြီးမြောက်သည့်အတွက်"
      : "for completing all Git and GitHub lessons in the Git Together guide",
    842,
    705,
  );

  context.fillStyle = "#8e8e93";
  context.font = `500 22px ${fontFamily}`;
  context.fillText(
    new Intl.DateTimeFormat(isBurmese ? "my-MM" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    420,
    920,
  );
  context.fillText(isBurmese ? "ထုတ်ပေးသည့်နေ့" : "Date issued", 420, 960);

  context.fillStyle = "#f5f5f7";
  context.font = `700 28px ${fontFamily}`;
  context.fillText("Min Thu Khaing", 1264, 920);
  context.fillStyle = "#8e8e93";
  context.font = `500 22px ${fontFamily}`;
  context.fillText("Talkware Lead", 1264, 960);

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 297, 210);
  const safeName = name.replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-|-$/g, "") || "learner";
  pdf.save(`git-together-certificate-${safeName}.pdf`);
}

function CompletionCertificateCard({ completed, lessonCount }) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const allDone = lessonCount > 0 && completed.length >= lessonCount;
  const remaining = Math.max(lessonCount - completed.length, 0);

  const createCertificate = async (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || creating) return;
    setCreating(true);
    try {
      await downloadCertificate(cleanName.slice(0, 80), language);
      setOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <article className={`certificate-card ${allDone ? "unlocked" : ""}`}>
        <div>
          <span className="kicker">{t("GIT GUIDE CLASS", "GIT GUIDE CLASS")}</span>
          <h3>{t("Certificate of completion", "ပြီးမြောက်ကြောင်း လက်မှတ်")}</h3>
          <p>
            {allDone
              ? t(
                  "You finished every lesson. Your certificate is ready.",
                  "သင်ခန်းစာအားလုံး ပြီးပါပြီ သင့်လက်မှတ် အဆင်သင့်ဖြစ်ပါပြီ",
                )
              : t(
                  `Complete ${remaining} more ${remaining === 1 ? "lesson" : "lessons"} to unlock your certificate.`,
                  `လက်မှတ်ရရန် သင်ခန်းစာ ${remaining} ခု ထပ်ပြီးအောင်လုပ်ပါ`,
                )}
          </p>
        </div>
        <button
          className="primary-button"
          disabled={!allDone}
          onClick={() => setOpen(true)}
        >
          {allDone ? t("Get certificate", "လက်မှတ်ရယူမယ်") : t("Not ready yet", "မပြီးသေးပါ")}
        </button>
      </article>

      {open && (
        <div className="certificate-dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-title">
          <button
            className="certificate-backdrop"
            onClick={() => setOpen(false)}
            aria-label={t("Close", "ပိတ်မယ်")}
          />
          <form className="certificate-panel" onSubmit={createCertificate}>
            <span className="kicker">{t("CERTIFICATE", "လက်မှတ်")}</span>
            <h2 id="certificate-title">
              {t("Name on your certificate", "လက်မှတ်ပေါ် ထည့်မည့်နာမည်")}
            </h2>
            <p>
              {t(
                "Enter your name or GitHub username exactly as you want it to appear.",
                "လက်မှတ်ပေါ် ပေါ်စေလိုသည့် နာမည် သို့မဟုတ် GitHub username ကို ထည့်ပါ",
              )}
            </p>
            <label htmlFor="certificate-name">
              {t("Name or username", "နာမည် သို့မဟုတ် username")}
            </label>
            <input
              id="certificate-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              autoFocus
              required
              placeholder={t("Your name", "သင့်နာမည်")}
            />
            <small>
              {t(
                "Issued by Min Thu Khaing, Talkware Lead",
                "Min Thu Khaing, Talkware Lead မှ ထုတ်ပေးသည်",
              )}
            </small>
            <div>
              <button type="button" className="secondary-button" onClick={() => setOpen(false)}>
                {t("Cancel", "မလုပ်တော့ပါ")}
              </button>
              <button type="submit" className="primary-button" disabled={!name.trim() || creating}>
                {creating ? t("Creating…", "ပြုလုပ်နေသည်…") : t("Download PDF", "PDF ရယူမယ်")}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function PathSection({ guide, completed, onOpenLesson, pathRef }) {
  const { language, t } = useLanguage();
  const moduleCount = guide.modules.length;
  const lessonCount = guide.modules.reduce((total, module) => total + module.lessons.length, 0);
  return (
    <section className="path-section" ref={pathRef}>
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="kicker">{t("LEARNING PATH", "လေ့လာမည့် အဆင့်များ")}</span>
            <h2>{t("Learn one small step at a time.", "အဆင့်တိုတို တစ်ခုပြီးတစ်ခု လေ့လာပါ")}</h2>
          </div>
          <p>
            {t(
              `${moduleCount} modules. ${lessonCount} short lessons. Every lesson has one command and one quick check.`,
              `Module ${moduleCount} ခု သင်ခန်းစာတို ${lessonCount} ခု ခန်းတိုင်းမှာ command တစ်ခုနဲ့ စစ်ဆေးချက်တစ်ခု ပါတယ်`,
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
        <CompletionCertificateCard completed={completed} lessonCount={lessonCount} />
      </div>
    </section>
  );
}

function BeginnerQuestions({ onKnowledge }) {
  const { t } = useLanguage();
  const questions = [
    t("What is Git?", "Git ဆိုတာ ဘာလဲ"),
    t("What is a repository?", "Repository ဆိုတာ ဘာလဲ"),
    t("Why use a branch?", "Branch ဘာကြောင့်သုံးလဲ"),
    t("How do teams collaborate?", "Team က ဘယ်လိုအတူလုပ်လဲ"),
  ];

  return (
    <section className="beginner-section">
      <div className="container beginner-inner">
        <div>
          <span className="kicker">{t("NEW TO GIT?", "GIT ကို အခုမှ စလား")}</span>
          <h2>{t("Start with your questions.", "သိချင်တဲ့ မေးခွန်းကနေ စပါ")}</h2>
          <p>
            {t(
              "Simple answers to the questions every beginner asks.",
              "အစပြုသူတိုင်း မေးလေ့ရှိတာကို ရိုးရိုးရှင်းရှင်း ဖြေပေးထားတယ်",
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

function ReferenceRepositories() {
  const { t } = useLanguage();
  const repositories = [
    {
      name: "torvalds/linux",
      owner: "Linus Torvalds & Linux maintainers",
      url: "https://github.com/torvalds/linux",
      copy: t(
        "Study a large maintainer-led project, its history, reviews, and contribution rules",
        "Maintainer ဦးဆောင်တဲ့ project ကြီးရဲ့ history review နဲ့ contribution rules ကိုကြည့်ပါ",
      ),
    },
    {
      name: "git/git",
      owner: "Git project",
      url: "https://github.com/git/git",
      copy: t(
        "See how the Git project documents patches, reviews, and contribution standards",
        "Git project က patch review နဲ့ contribution standards ကို ဘယ်လိုရေးထားလဲ ကြည့်ပါ",
      ),
    },
    {
      name: "firstcontributions/first-contributions",
      owner: "First Contributions",
      url: "https://github.com/firstcontributions/first-contributions",
      copy: t(
        "Practice the beginner fork, branch, commit, and pull-request workflow",
        "အစပြုသူ fork branch commit နဲ့ pull request workflow ကိုလေ့ကျင့်ပါ",
      ),
    },
    {
      name: "github/docs",
      owner: "GitHub",
      url: "https://github.com/github/docs",
      copy: t(
        "Read a clear public contribution guide from a documentation project",
        "Documentation project ရဲ့ ရှင်းတဲ့ public contribution guide ကိုဖတ်ပါ",
      ),
    },
  ];

  return (
    <section className="reference-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="kicker">{t("WORKFLOW REFERENCES", "WORKFLOW ကို လေ့လာရန်")}</span>
            <h2>{t("Learn from real repositories", "Repository အစစ်တွေကနေ လေ့လာပါ")}</h2>
          </div>
          <p>
            {t(
              "Open the repository, read CONTRIBUTING, inspect branches and commits, then compare its workflow with this guide",
              "Repository ကိုဖွင့်၊ CONTRIBUTING ဖတ်၊ branches နဲ့ commits ကြည့်ပြီး ဒီ guide နဲ့ workflow နှိုင်းယှဉ်ပါ",
            )}
          </p>
        </div>
        <div className="reference-grid">
          {repositories.map((repository) => (
            <a key={repository.name} href={repository.url} target="_blank" rel="noreferrer">
              <small>{repository.owner}</small>
              <strong>{repository.name}</strong>
              <p>{repository.copy}</p>
              <span>{t("Open repository", "Repository ဖွင့်မယ်")}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home({ guide, completed, onOpenLesson, onKnowledge }) {
  const pathRef = useRef(null);
  return (
    <>
      <Hero
        onStart={() => pathRef.current?.scrollIntoView({ behavior: "smooth" })}
      />
      <BeginnerQuestions onKnowledge={onKnowledge} />
      <PathSection
        guide={guide}
        completed={completed}
        onOpenLesson={onOpenLesson}
        pathRef={pathRef}
      />
      <ReferenceRepositories />
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
          <h1>{t("Git questions, answered simply.", "Git မေးခွန်းများကို ရိုးရှင်းစွာ ဖြေမယ်")}</h1>
          <p>
            {t(
              "No long definitions. Open a question, read the short answer, and see one example.",
              "စာရှည်ကြီး မရှိပါ မေးခွန်းဖွင့်၊ အဖြေတိုတိုဖတ်၊ ဥပမာတစ်ခုကြည့်ပါ",
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
              <small>{t("Click a question to open it.", "မေးခွန်းကို နှိပ်ပြီးဖွင့်ပါ")}</small>
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
                <strong>{t("No answer found.", "အဖြေ မတွေ့ပါ")}</strong>
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

function shuffleCheckAnswers(check) {
  if (!check) return [];
  const answers = check.options.map((text, index) => ({
    text,
    correct: index === check.correct,
  }));
  let seed = Array.from(check.question).reduce(
    (value, character) => ((value * 31) + character.codePointAt(0)) >>> 0,
    2166136261,
  );

  for (let index = answers.length - 1; index > 0; index -= 1) {
    seed = ((seed * 1664525) + 1013904223) >>> 0;
    const target = seed % (index + 1);
    [answers[index], answers[target]] = [answers[target], answers[index]];
  }
  return answers;
}

function QuickCheck({ check }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);
  const answers = useMemo(() => shuffleCheckAnswers(check), [check]);

  if (!check) return null;
  const isCorrect = selected !== null && answers[selected]?.correct;

  return (
    <section className="quick-check">
      <div className="quick-check-heading">
        <div>
          <small>{t("QUICK CHECK", "အမြန် စစ်မယ်")}</small>
          <h2>{check.question}</h2>
        </div>
      </div>
      <div className="answer-grid">
        {answers.map((answer, index) => (
          <button
            key={answer.text}
            className={
              selected === null
                ? ""
                : answer.correct
                  ? "correct"
                  : selected === index
                    ? "wrong"
                    : ""
            }
            onClick={() => setSelected(index)}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            {answer.text}
          </button>
        ))}
      </div>
      {selected !== null && (
        <p className={isCorrect ? "check-result correct" : "check-result wrong"}>
          {isCorrect
            ? check.success
            : t("Not yet. Choose another answer.", "မမှန်သေးပါ နောက်တစ်ခု ရွေးပါ")}
        </p>
      )}
    </section>
  );
}

function getGitMap(lessonId, phase, t) {
  const baseNodes = [
    { id: "a", x: 42, y: 72 },
    { id: "b", x: 110, y: 72 },
    { id: "c", x: 178, y: 72 },
  ];
  const baseEdges = [
    ["a", "b"],
    ["b", "c"],
  ];
  const mainOnly = {
    nodes: baseNodes,
    edges: baseEdges,
    labels: [{ x: 178, y: 44, text: "main • HEAD", tone: "main" }],
    note: t("HEAD points to the latest commit on main.", "HEAD က main ရဲ့ နောက်ဆုံး commit ကိုညွှန်တယ်"),
  };

  if (lessonId === "first-repository") {
    return phase === "before"
      ? {
          nodes: [],
          edges: [],
          labels: [{ x: 35, y: 73, text: t("No Git history yet", "Git history မရှိသေး") }],
          note: t("This folder is not a repository yet.", "ဒီ folder က repository မဖြစ်သေးပါ"),
        }
      : {
          nodes: [{ id: "a", x: 70, y: 72 }],
          edges: [],
          labels: [{ x: 70, y: 44, text: "main • HEAD", tone: "main" }],
          note: t("Git is ready to record the first commit.", "Git က ပထမ commit သိမ်းဖို့ အဆင်သင့်ဖြစ်ပြီ"),
        };
  }

  if (lessonId === "create-branch" || lessonId === "fork-solve-issue") {
    return phase === "before"
      ? mainOnly
      : {
          nodes: baseNodes,
          edges: baseEdges,
          labels: [
            { x: 178, y: 42, text: "main", tone: "main" },
            { x: 178, y: 111, text: "feat/community • HEAD", tone: "feature" },
          ],
          pointers: [{ x1: 178, y1: 98, x2: 178, y2: 82, tone: "feature" }],
          note: t("The new branch starts at the same commit as main.", "Branch အသစ်က main နဲ့ commit တစ်ခုတည်းမှာ စတယ်"),
        };
  }

  const diverged = {
    nodes: [
      ...baseNodes,
      { id: "d", x: 178, y: 144, tone: "feature" },
      { id: "e", x: 246, y: 144, tone: "feature" },
    ],
    edges: [
      ...baseEdges,
      ["b", "d", "feature"],
      ["d", "e", "feature"],
    ],
    labels: [
      { x: 178, y: 44, text: "main", tone: "main" },
      { x: 246, y: 178, text: "feat/community • HEAD", tone: "feature" },
    ],
    note: t("The feature branch has two commits not on main.", "Feature branch မှာ main မရှိသေးတဲ့ commit နှစ်ခုရှိတယ်"),
  };

  if (lessonId === "switch-merge") {
    if (phase === "before") return diverged;
    return {
      nodes: [
        ...diverged.nodes,
        { id: "f", x: 298, y: 72, tone: "merge" },
      ],
      edges: [
        ...diverged.edges,
        ["c", "f"],
        ["e", "f", "feature"],
      ],
      labels: [
        { x: 298, y: 44, text: "main • HEAD", tone: "main" },
        { x: 246, y: 178, text: "feat/community", tone: "feature" },
      ],
      note: t("Main moves to a merge commit that joins both histories.", "Main က history နှစ်ခုကို ဆက်တဲ့ merge commit ဆီရွှေ့တယ်"),
    };
  }

  if (lessonId === "rebase-branch") {
    if (phase === "before") return diverged;
    return {
      nodes: [
        ...baseNodes,
        { id: "d2", x: 246, y: 72, tone: "feature" },
        { id: "e2", x: 314, y: 72, tone: "feature" },
      ],
      edges: [
        ...baseEdges,
        ["c", "d2", "feature"],
        ["d2", "e2", "feature"],
      ],
      labels: [
        { x: 178, y: 44, text: "main", tone: "main" },
        { x: 286, y: 112, text: "feat/community • HEAD", tone: "feature" },
      ],
      note: t("Feature commits move after the newest main commit.", "Feature commits က main အသစ်ဆုံး commit နောက်ကို ရွှေ့သွားတယ်"),
    };
  }

  if (lessonId === "merge-conflicts") {
    if (phase === "before") {
      return {
        ...diverged,
        nodes: diverged.nodes.map((node) =>
          node.id === "c" || node.id === "e" ? { ...node, tone: "conflict" } : node,
        ),
        note: t("Main and feature changed the same code.", "Main နဲ့ feature က code တစ်နေရာတည်းကို ပြင်ထားတယ်"),
      };
    }
    return {
      nodes: [
        ...diverged.nodes,
        { id: "f", x: 298, y: 72, tone: "merge" },
      ],
      edges: [
        ...diverged.edges,
        ["c", "f"],
        ["e", "f", "feature"],
      ],
      labels: [
        { x: 298, y: 44, text: "main • HEAD", tone: "main" },
        { x: 246, y: 178, text: "conflict resolved", tone: "feature" },
      ],
      note: t("After you choose the correct code, both lines can join.", "မှန်တဲ့ code ရွေးပြီးရင် branch နှစ်ခု ပြန်ပေါင်းနိုင်တယ်"),
    };
  }

  const commitLessons = ["make-commit", "revert-commit"];
  if (commitLessons.includes(lessonId) && phase === "after") {
    return {
      nodes: [...baseNodes, { id: "d", x: 246, y: 72, tone: "new" }],
      edges: [...baseEdges, ["c", "d"]],
      labels: [{ x: 246, y: 44, text: "main • HEAD", tone: "main" }],
      note: t("A new commit is added. HEAD and main move to it.", "Commit အသစ်ထည့်ပြီး HEAD နဲ့ main က အဲဒီဆီရွှေ့တယ်"),
    };
  }

  if (lessonId === "stage-files") {
    return {
      ...mainOnly,
      note:
        phase === "before"
          ? t("Your file is changed but not staged.", "File ပြင်ထားပေမယ့် stage မလုပ်ရသေး")
          : t("Staging changes files, but the Git map does not move until commit.", "Stage လုပ်တာနဲ့ Git map မရွှေ့သေးပါ Commit လုပ်မှရွှေ့တယ်"),
    };
  }

  return mainOnly;
}

function GitMap({ lesson }) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState("after");
  const graph = getGitMap(lesson.id, phase, t);
  const nodeById = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));

  return (
    <>
      <div className="map-switch" aria-label={t("Git map state", "Git map အခြေအနေ")}>
        <button className={phase === "before" ? "active" : ""} onClick={() => setPhase("before")}>
          {t("Before", "မလုပ်ခင်")}
        </button>
        <button className={phase === "after" ? "active" : ""} onClick={() => setPhase("after")}>
          {t("After command", "Command ပြီး")}
        </button>
      </div>
      <svg className="git-map" viewBox="0 0 350 210" role="img" aria-label={t("Git branch and commit map", "Git branch နဲ့ commit map")}>
        {graph.edges.map(([from, to, tone = "main"]) => {
          const start = nodeById[from];
          const end = nodeById[to];
          return (
            <line
              className={`map-edge ${tone}`}
              key={`${from}-${to}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
            />
          );
        })}
        {graph.pointers?.map((pointer, index) => (
          <line
            className={`map-edge ${pointer.tone || "main"}`}
            key={index}
            x1={pointer.x1}
            y1={pointer.y1}
            x2={pointer.x2}
            y2={pointer.y2}
          />
        ))}
        {graph.nodes.map((node, index) => (
          <g key={node.id}>
            <circle className={`map-node ${node.tone || "main"}`} cx={node.x} cy={node.y} r="9" />
            <text className="map-hash" x={node.x} y={node.y + 25} textAnchor="middle">
              {String.fromCharCode(97 + index)}{index + 1}
            </text>
          </g>
        ))}
        {graph.labels.map((label) => (
          <text
            className={`map-label ${label.tone || ""}`}
            key={`${label.text}-${label.x}-${label.y}`}
            x={label.x}
            y={label.y}
            textAnchor="middle"
          >
            {label.text}
          </text>
        ))}
      </svg>
      <p className="map-note">{graph.note}</p>
      <div className="map-legend">
        <span><i className="main" /> main</span>
        <span><i className="feature" /> feature</span>
        <span><i className="merge" /> merge / new</span>
      </div>
    </>
  );
}

function LessonVisual({ lesson, onClose }) {
  const { language, t } = useLanguage();

  return (
    <aside className="lesson-visual">
      <div className="visual-header">
        <span>{t("VISUAL GUIDE", "ပုံစံဖြင့် ကြည့်ရန်")}</span>
        <button onClick={onClose}>{t("Hide", "ပိတ်မယ်")}</button>
      </div>
      <h2>{t("Git map", "Git map")}</h2>
      <p>{localize(lesson, "title", language)}</p>
      <GitMap key={lesson.id} lesson={lesson} />
      <div className="visual-command">
        <small>{t("COMMAND", "COMMAND")}</small>
        <code>{lesson.command}</code>
      </div>
    </aside>
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
  const [visualOpen, setVisualOpen] = useState(true);
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
        <div className={`lesson-content-shell ${visualOpen ? "" : "visual-closed"}`}>
        <article className="lesson-article">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={15} /> {t("Back to modules", "Module များသို့")}
          </button>
          {!visualOpen && (
            <button className="show-visual-button" onClick={() => setVisualOpen(true)}>
              {t("Show visual guide", "ပုံစံလမ်းညွှန် ပြမယ်")}
            </button>
          )}
          <div className="lesson-meta">
            <span className="kicker">{localize(lesson, "eyebrow", language)}</span>
            <span>
              <Clock3 size={14} />
              {localize(lesson, "readTime", language)}
            </span>
          </div>
          <h1>{localize(lesson, "title", language)}</h1>
          <p className="lesson-lead">{localize(lesson, "summary", language)}</p>

          <h2>{t("Try the command", "Command ကို စမ်းမယ်")}</h2>
          <p>
            {t(
              "Copy it, or open the terminal and run it now.",
              "Copy လုပ်ပါ ဒါမှမဟုတ် terminal ဖွင့်ပြီး အခု run ပါ",
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
                <strong>{t("Done with this lesson?", "ဒီသင်ခန်းစာ ပြီးပြီလား")}</strong>
                <p>{t("Save your progress.", "သင့်တိုးတက်မှုကို သိမ်းပါ")}</p>
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
        {visualOpen && <LessonVisual lesson={lesson} onClose={() => setVisualOpen(false)} />}
        </div>
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
          <h1>{t("Try Git safely.", "Git ကို လုံခြုံစွာ စမ်းပါ")}</h1>
          <p>
            {t(
              "Click a task, then press Run. Commands use the backend but never change your computer.",
              "Task တစ်ခုကိုနှိပ်ပြီး Run လုပ်ပါ Command တွေက backend ကိုသုံးပေမယ့် သင့် computer ကို မပြောင်းပါ",
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
                {t("Commands are simulated.", "Command များကို simulation လုပ်ထားသည်")}
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
  const workflows = [
    {
      title: t("Save today’s work", "ဒီနေ့အလုပ်ကို သိမ်းမယ်"),
      description: t(
        "Check, review, stage, then commit one clear change.",
        "စစ်မယ်၊ ပြန်ကြည့်မယ်၊ stage လုပ်မယ်၊ ပြီးရင် ရှင်းတဲ့ commit တစ်ခု သိမ်းမယ်",
      ),
      steps: [
        ["git status", t("See what changed", "ဘာပြောင်းထားလဲ ကြည့်မယ်")],
        ["git diff", t("Review unstaged changes", "Stage မလုပ်ရသေးတဲ့ changes ကြည့်မယ်")],
        ["git add README.md", t("Stage only the file you want", "လိုတဲ့ file ကိုပဲ stage လုပ်မယ်")],
        ['git commit -m "Update README"', t("Save with a clear message", "ရှင်းတဲ့ message နဲ့ သိမ်းမယ်")],
      ],
    },
    {
      title: t("Start a feature", "Feature အသစ် စမယ်"),
      description: t(
        "Update main first, then work on a separate branch.",
        "main ကို အရင် update လုပ်ပြီး branch သီးသန့်မှာ အလုပ်လုပ်မယ်",
      ),
      steps: [
        ["git switch main", t("Move to main", "main ကိုပြောင်းမယ်")],
        ["git pull --ff-only", t("Get the newest safe update", "နောက်ဆုံး update ကို လုံခြုံစွာယူမယ်")],
        ["git switch -c feat/profile", t("Create the feature branch", "Feature branch ဖန်တီးမယ်")],
        ["git push -u origin feat/profile", t("Publish and track the branch", "Branch တင်ပြီး track လုပ်မယ်")],
      ],
    },
    {
      title: t("Update your branch", "ကိုယ့် branch ကို update လုပ်မယ်"),
      description: t(
        "Bring the newest main commits into your feature before a PR.",
        "PR မတင်ခင် main ရဲ့ နောက်ဆုံး commits ကို ကိုယ့် feature ထဲယူမယ်",
      ),
      steps: [
        ["git fetch origin", t("Download remote history", "Remote history ကိုယူမယ်")],
        ["git rebase origin/main", t("Replay your work on new main", "ကိုယ့်အလုပ်ကို main အသစ်ပေါ် ပြန်တင်မယ်")],
        ["git push --force-with-lease", t("Update a rebased branch safely", "Rebase လုပ်ထားတဲ့ branch ကို လုံခြုံစွာ update မယ်")],
      ],
    },
    {
      title: t("Resolve a conflict", "Conflict ဖြေရှင်းမယ်"),
      description: t(
        "Find the files, choose the final code, then continue.",
        "Conflict ဖြစ်တဲ့ files ရှာ၊ နောက်ဆုံးထားမယ့် code ရွေးပြီး ဆက်လုပ်မယ်",
      ),
      steps: [
        ["git status", t("Find conflicted files", "Conflict ဖြစ်တဲ့ files ရှာမယ်")],
        ["git add src/App.jsx", t("Mark the resolved file", "ဖြေရှင်းပြီးတဲ့ file ကိုမှတ်မယ်")],
        ["git rebase --continue", t("Continue the stopped rebase", "ရပ်ထားတဲ့ rebase ကိုဆက်မယ်")],
        ["git rebase --abort", t("Or return to before the rebase", "မလုပ်လိုရင် rebase မတိုင်ခင်ကို ပြန်မယ်")],
      ],
    },
    {
      title: t("Open a contribution PR", "Contribution PR တင်မယ်"),
      description: t(
        "Pick an issue, publish your fix, and open a focused PR.",
        "Issue ရွေး၊ fix ကိုတင်၊ ရည်ရွယ်ချက်ရှင်းတဲ့ PR ဖွင့်မယ်",
      ),
      steps: [
        ["gh issue list --label \"good first issue\"", t("Find a beginner issue", "အစပြုသူ issue ရှာမယ်")],
        ["git push -u origin fix/issue-42", t("Publish your fix branch", "Fix branch ကိုတင်မယ်")],
        ["gh pr create --fill", t("Create a PR from your commits", "Commits ကနေ PR ဖန်တီးမယ်")],
      ],
    },
    {
      title: t("Create a release", "Release ထုတ်မယ်"),
      description: t(
        "Tag a tested commit, publish it, then create release notes.",
        "စမ်းသပ်ပြီးတဲ့ commit ကို tag တပ်၊ တင်၊ release notes ဖန်တီးမယ်",
      ),
      steps: [
        ["git tag -a v1.0.0 -m \"v1.0.0\"", t("Create an annotated version tag", "Version tag ဖန်တီးမယ်")],
        ["git push origin v1.0.0", t("Publish the tag", "Tag ကိုတင်မယ်")],
        ["gh release create v1.0.0 --generate-notes", t("Publish the GitHub release", "GitHub release ထုတ်မယ်")],
        ["gh run list", t("Check CI and deployment runs", "CI နဲ့ deploy runs စစ်မယ်")],
      ],
    },
  ];

  const groups = [
    {
      title: t("Create & identify", "Project စပြီး identity သတ်မှတ်မယ်"),
      description: t(
        "Use once when you start on a device or project.",
        "Device သို့မဟုတ် project အသစ်မှာ တစ်ကြိမ်သုံးမယ်",
      ),
      commands: [
        ["git init", t("Turn this folder into a repository", "ဒီ folder ကို repository လုပ်မယ်")],
        ["git clone URL", t("Download a repository and its history", "Repository နဲ့ history ကို download လုပ်မယ်")],
        ['git config --global user.name "Your Name"', t("Set the commit author name", "Commit author နာမည် သတ်မှတ်မယ်")],
        ['git config --global user.email "you@example.com"', t("Set the commit author email", "Commit author email သတ်မှတ်မယ်")],
      ],
    },
    {
      title: t("Inspect before saving", "မသိမ်းခင် စစ်မယ်"),
      description: t(
        "Read the current state before changing history.",
        "History မပြောင်းခင် လက်ရှိအခြေအနေကို ကြည့်မယ်",
      ),
      commands: [
        ["git status", t("See staged, changed, and new files", "Staged၊ changed နဲ့ file အသစ်တွေ ကြည့်မယ်")],
        ["git diff", t("See unstaged line changes", "Stage မလုပ်ရသေးတဲ့ line changes ကြည့်မယ်")],
        ["git diff --staged", t("See what the next commit will save", "နောက် commit ထဲဝင်မယ့် changes ကြည့်မယ်")],
        ["git log --oneline --graph --all", t("See compact history and branches", "History နဲ့ branches ကို ကျစ်လျစ်စွာကြည့်မယ်")],
        ["git show COMMIT", t("Inspect one commit and its patch", "Commit တစ်ခုနဲ့ သူ့ patch ကိုကြည့်မယ်")],
      ],
    },
    {
      title: t("Stage & commit", "Stage နဲ့ commit"),
      description: t(
        "Save one focused piece of work.",
        "ရည်ရွယ်ချက်တစ်ခုတည်းပါတဲ့ အလုပ်ကို သိမ်းမယ်",
      ),
      commands: [
        ["git add FILE", t("Stage one file", "File တစ်ခုကို stage လုပ်မယ်")],
        ["git add -p", t("Choose individual changed parts", "ပြောင်းထားတဲ့ အပိုင်းတစ်ခုချင်း ရွေးမယ်")],
        ['git commit -m "Clear message"', t("-m adds the commit message", "-m က commit message ထည့်ပေးတယ်")],
        ["git commit --amend", t("Correct the latest local commit", "နောက်ဆုံး local commit ကိုပြင်မယ်")],
      ],
    },
    {
      title: t("Branches & integration", "Branches နဲ့ code ပေါင်းမယ်"),
      description: t(
        "Keep work separate, then merge or rebase.",
        "အလုပ်ကိုခွဲထားပြီး merge သို့မဟုတ် rebase လုပ်မယ်",
      ),
      commands: [
        ["git branch --all", t("List local and remote branches", "Local နဲ့ remote branches အားလုံးကြည့်မယ်")],
        ["git switch -c branch-name", t("Create and enter a branch", "Branch ဖန်တီးပြီး ဝင်မယ်")],
        ["git merge branch-name", t("Join a branch into the current branch", "Branch ကို လက်ရှိ branch ထဲ ပေါင်းမယ်")],
        ["git rebase main", t("Move your commits onto the newest main", "ကိုယ့် commits ကို main အသစ်ပေါ် ရွှေ့မယ်")],
        ["git branch -d branch-name", t("Delete a merged local branch", "Merge ပြီးတဲ့ local branch ဖျက်မယ်")],
      ],
    },
    {
      title: t("Remote & GitHub", "Remote နဲ့ GitHub"),
      description: t(
        "Synchronize work and create contributions.",
        "အလုပ်တွေ update လုပ်ပြီး contribution တင်မယ်",
      ),
      commands: [
        ["git remote -v", t("-v shows remote names and URLs", "-v က remote နာမည်နဲ့ URL ပြတယ်")],
        ["git fetch origin", t("Download history without merging", "Merge မလုပ်ဘဲ remote history ယူမယ်")],
        ["git pull --ff-only", t("Update without creating a merge commit", "Merge commit မဖန်တီးဘဲ update လုပ်မယ်")],
        ["git push -u origin branch-name", t("-u links the local and remote branch", "-u က local နဲ့ remote branch ကိုချိတ်တယ်")],
        ["gh pr create --fill", t("Open a PR using commit details", "Commit အချက်အလက်နဲ့ PR ဖွင့်မယ်")],
      ],
    },
    {
      title: t("Undo safely", "လုံခြုံစွာ ပြန်ပြင်မယ်"),
      description: t(
        "Use the least destructive command that solves the problem.",
        "ပြဿနာကိုဖြေရှင်းနိုင်တဲ့ အန္တရာယ်အနည်းဆုံး command သုံးမယ်",
      ),
      commands: [
        ["git restore FILE", t("Discard unstaged changes in one file", "File တစ်ခုရဲ့ unstaged changes ပယ်မယ်")],
        ["git restore --staged FILE", t("Unstage but keep the file changes", "Changes မပျောက်ဘဲ file ကို unstage လုပ်မယ်")],
        ["git revert COMMIT", t("Undo a shared commit with a new commit", "Shared commit ကို commit အသစ်နဲ့ ပြန်ပြင်မယ်")],
        ["git reflog", t("Find recent HEAD positions", "HEAD အဟောင်းတွေ ရှာမယ်")],
        ["git stash push -m \"work in progress\"", t("Temporarily store unfinished changes", "မပြီးသေးတဲ့ changes ကို ခဏသိမ်းမယ်")],
      ],
    },
  ];

  return (
    <main className="cheatsheet-page">
      <div className="container">
        <div className="page-intro">
          <span className="kicker">{t("PRACTICAL CHEAT SHEETS", "လက်တွေ့ CHEAT SHEETS")}</span>
          <h1>{t("Git commands for real work.", "တကယ့်အလုပ်မှာသုံးမယ့် Git commands")}</h1>
          <p>
            {t(
              "Follow a workflow in order, or tap any command to try it in the safe terminal.",
              "Workflow တစ်ခုကို အစဉ်လိုက်လုပ်ပါ ဒါမှမဟုတ် command ကိုနှိပ်ပြီး safe terminal မှာ စမ်းပါ",
            )}
          </p>
        </div>

        <section className="workflow-section">
          <div className="cheat-section-heading">
            <span className="kicker">{t("DO THE TASK", "အလုပ်အလိုက် ကြည့်မယ်")}</span>
            <h2>{t("Practical workflows", "လက်တွေ့ workflows")}</h2>
          </div>
          <div className="workflow-grid">
            {workflows.map((workflow) => (
              <article className="workflow-card" key={workflow.title}>
                <h3>{workflow.title}</h3>
                <p>{workflow.description}</p>
                <ol>
                  {workflow.steps.map(([command, description]) => (
                    <li key={command}>
                      <button onClick={() => onTry(command)}>
                        <span>
                          <code>{command}</code>
                          <small>{description}</small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <div className="cheat-section-heading command-reference-heading">
          <span className="kicker">{t("LOOK UP A COMMAND", "COMMAND ရှာမယ်")}</span>
          <h2>{t("Command reference", "Command အညွှန်း")}</h2>
        </div>
        <div className="cheat-grid">
          {groups.map(({ title, description, commands }) => (
            <section className="cheat-card" key={title}>
              <div className="cheat-title">
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
              </div>
              {commands.map(([command, description]) => (
                <button key={command} onClick={() => onTry(command)}>
                  <div>
                    <code>{command}</code>
                    <small>{description}</small>
                  </div>
                  <span>{t("Try", "စမ်းမယ်")}</span>
                </button>
              ))}
            </section>
          ))}
        </div>
        <div className="cheat-banner">
          <div>
            <h2>{t("Ready to practice?", "လက်တွေ့ စမ်းမလား")}</h2>
            <p>{t("Open the safe terminal.", "လုံခြုံတဲ့ terminal ကိုဖွင့်ပါ")}</p>
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
          <p>{t("Simple Git lessons for community members.", "Community members များအတွက် ရိုးရှင်းတဲ့ Git သင်ခန်းစာ")}</p>
        </div>
        <div className="footer-links">
          <a href="https://www.talkware.click/" target="_blank" rel="noreferrer">
            Talkware Community
          </a>
          <a href="https://git-scm.com/doc" target="_blank" rel="noreferrer">
            {t("Git docs", "Git လမ်းညွှန်")}
          </a>
          <a href="https://docs.github.com/" target="_blank" rel="noreferrer">
            {t("GitHub docs", "GitHub လမ်းညွှန်")}
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>{t("Made for community learners.", "Community learners များအတွက်")}</span>
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
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("lesson")) return "lesson";
    const queryView = searchParams.get("view");
    return ["home", "knowledge", "terminal", "cheatsheet"].includes(queryView)
      ? queryView
      : "home";
  });
  const [lessonId, setLessonId] = useState(
    () => new URLSearchParams(window.location.search).get("lesson"),
  );
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
          setGuide({
            name: "Git Together",
            modules: content.modules,
            knowledgeTopics: content.knowledgeTopics,
          }),
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
