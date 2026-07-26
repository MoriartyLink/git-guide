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
  ExternalLink,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Maximize2,
  Menu,
  RotateCcw,
  Search,
  Share2,
  TerminalSquare,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import {
  createContext,
  createElement,
  forwardRef,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import gitTogetherLogo from "./assets/git-together-logo.png";
import GuidedGitSimulator from "./GuidedGitSimulator";
import GuideChat from "./GuideChat";
import { isSupabaseConfigured, supabase } from "./supabase";

const API_BASE = import.meta.env.VITE_API_URL || "";
const SandboxTerminal = lazy(() => import("./SandboxTerminal"));

const LanguageContext = createContext(null);

function useLanguage() {
  return useContext(LanguageContext);
}

function localize(item, field, language) {
  if (language === "my") return item?.my?.[field] ?? item?.[field];
  return item?.[field];
}

function FirstTimeTour({ onNavigate }) {
  const { t } = useLanguage();
  const storageKey = "learn-git-first-visit-tour";
  const [visible, setVisible] = useState(
    () => localStorage.getItem(storageKey) !== "complete",
  );
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    if (!visible) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const steps = [
    {
      id: "home",
      icon: BookOpen,
      eyebrow: t("LEARN TAB", "LEARN TAB"),
      title: t("Follow a clear learning path.", "ရှင်းလင်းတဲ့ learning path အတိုင်းသွားပါ"),
      copy: t(
        "Begin with Git foundations, continue through team workflows, then reach advanced rebase and contribution modules.",
        "Git foundations ကနေစပြီး team workflows ကိုဆက်ကာ advanced rebase နဲ့ contribution modules အထိလေ့လာပါ",
      ),
      features: [
        t("Beginner → Intermediate → Advanced", "Beginner → Intermediate → Advanced"),
        t("Short lessons with one practical command", "လက်တွေ့ command တစ်ခုပါတဲ့ lesson တိုများ"),
        t("Quick checks and saved completion", "Quick checks နဲ့ သိမ်းထားမယ့် completion"),
      ],
    },
    {
      id: "knowledge",
      icon: CircleHelp,
      eyebrow: t("KNOWLEDGE TAB", "KNOWLEDGE TAB"),
      title: t("Find a simple answer quickly.", "ရိုးရှင်းတဲ့အဖြေကို မြန်မြန်ရှာပါ"),
      copy: t(
        "Search Git ideas, filter topics, and open practical examples whenever a command or workflow feels unclear.",
        "Command သို့ workflow မရှင်းတဲ့အခါ Git အကြောင်းအရာရှာ၊ topic filter လုပ်ပြီး လက်တွေ့ examples ဖွင့်ပါ",
      ),
      features: [
        t("Searchable beginner-friendly answers", "Search လုပ်နိုင်တဲ့ beginner-friendly answers"),
        t("Merge, rebase, GitHub, SSH, and Windows guides", "Merge၊ rebase၊ GitHub၊ SSH နဲ့ Windows guides"),
        t("Trusted documentation and video links", "ယုံကြည်ရတဲ့ documentation နဲ့ video links"),
      ],
    },
    {
      id: "terminal",
      icon: TerminalSquare,
      eyebrow: t("TERMINAL LAB", "TERMINAL LAB"),
      title: t("Practice Git without risk.", "အန္တရာယ်မရှိဘဲ Git လေ့ကျင့်ပါ"),
      copy: t(
        "Run guided commands, watch branches and commits move on the map, and learn from scenario hints.",
        "Guided commands များ run၊ map ပေါ် branches နဲ့ commits ရွေ့တာကြည့်ပြီး scenario hints ကနေ လေ့လာပါ",
      ),
      features: [
        t("Choose a real workflow scenario", "တကယ့် workflow scenario တစ်ခုရွေးပါ"),
        t("Type commands in the large guided terminal", "Guided terminal အကြီးမှာ commands ရိုက်ပါ"),
        t("Inspect the interactive commit map", "Interactive commit map ကိုစစ်ပါ"),
      ],
    },
    {
      id: "cheatsheet",
      icon: Command,
      eyebrow: t("CHEAT SHEET", "CHEAT SHEET"),
      title: t("Keep commands beside your work.", "အလုပ်လုပ်ရင်း commands ကိုဘေးမှာထားပါ"),
      copy: t(
        "Follow complete workflows in order or send any command directly into the guided terminal.",
        "Workflow အပြည့်ကိုအစဉ်လိုက်လုပ် သို့ command တစ်ခုခုကို guided terminal ထဲ တိုက်ရိုက်ပို့ပါ",
      ),
      features: [
        t("Task-based command sequences", "Task အလိုက် command အစဉ်များ"),
        t("Merge, rebase, recovery, and release references", "Merge၊ rebase၊ recovery နဲ့ release references"),
        t("One-click practice in Terminal Lab", "Terminal Lab မှာ တစ်ချက်နှိပ်ပြီးလေ့ကျင့်ပါ"),
      ],
    },
  ];
  const step = steps[activeStep];

  const finish = (navigateTo = null) => {
    localStorage.setItem(storageKey, "complete");
    setVisible(false);
    if (navigateTo) onNavigate(navigateTo);
  };

  if (!visible) return null;

  return (
    <div className="first-visit-tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="tour-backdrop" />
      <section className="tour-screen">
        <header className="tour-header">
          <Logo />
          <button type="button" onClick={() => finish()}>
            {t("Skip tour", "Tour ကျော်မယ်")}
            <X size={16} />
          </button>
        </header>

        <div className="tour-layout">
          <aside className="tour-steps" aria-label={t("Tour steps", "Tour အဆင့်များ")}>
            <small>{t("WELCOME TO LEARNGIT", "LEARNGIT မှ ကြိုဆိုပါတယ်")}</small>
            <h2>{t("Four places. One Git journey.", "နေရာလေးခု Git ခရီးစဉ်တစ်ခု")}</h2>
            {steps.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={activeStep === index ? "active" : ""}
                onClick={() => setActiveStep(index)}
              >
                <span>{index + 1}</span>
                <div>
                  <strong>{item.eyebrow}</strong>
                  <small>{item.title}</small>
                </div>
              </button>
            ))}
          </aside>

          <main className="tour-showcase">
            <div className="tour-window">
              <div className="tour-window-nav">
                {steps.map((item, index) => (
                  <span key={item.id} className={activeStep === index ? "active" : ""}>
                    {createElement(item.icon, { size: 15 })}
                    {item.eyebrow.replace(" TAB", "")}
                  </span>
                ))}
              </div>
              <div className="tour-window-content">
                <span className="tour-feature-icon">{createElement(step.icon, { size: 34 })}</span>
                <small>{step.eyebrow}</small>
                <h1 id="tour-title">{step.title}</h1>
                <p>{step.copy}</p>
                <ul>
                  {step.features.map((feature) => (
                    <li key={feature}><CheckCircle2 size={16} />{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </main>
        </div>

        <footer className="tour-footer">
          <span>{activeStep + 1} / {steps.length}</span>
          <div className="tour-dots">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={activeStep === index ? "active" : ""}
                onClick={() => setActiveStep(index)}
                aria-label={t(`Open step ${index + 1}`, `အဆင့် ${index + 1} ဖွင့်မယ်`)}
              />
            ))}
          </div>
          <div className="tour-actions">
            <button
              type="button"
              className="tour-back"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((index) => Math.max(0, index - 1))}
            >
              <ArrowLeft size={16} />
              {t("Back", "နောက်သို့")}
            </button>
            {activeStep < steps.length - 1 ? (
              <button type="button" className="primary-button" onClick={() => setActiveStep((index) => index + 1)}>
                {t("Next", "ရှေ့သို့")}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={() => finish("home")}>
                {t("Start learning", "စလေ့လာမယ်")}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
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

const GUEST_PROGRESS_KEY = "git-together-progress";

function readProgress(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((item) => typeof item === "string"))]
      : [];
  } catch {
    return [];
  }
}

function writeProgress(key, lessons) {
  localStorage.setItem(key, JSON.stringify([...new Set(lessons)]));
}

function useLessonProgress(session, authReady) {
  const userId = session?.user?.id || null;
  const [completed, setCompleted] = useState(() => readProgress(GUEST_PROGRESS_KEY));
  const [syncStatus, setSyncStatus] = useState("local");
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    if (!authReady) return undefined;
    if (!userId || !supabase) {
      setCompleted(readProgress(GUEST_PROGRESS_KEY));
      setSyncStatus("local");
      setSyncError("");
      return undefined;
    }

    let active = true;
    const cacheKey = `learn-git-progress-${userId}`;
    const cached = readProgress(cacheKey);
    const guest = readProgress(GUEST_PROGRESS_KEY);
    const localLessons = [...new Set([...cached, ...guest])];
    setCompleted(localLessons);
    setSyncStatus("syncing");
    setSyncError("");

    const synchronize = async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId);

      if (!active) return;
      if (error) {
        writeProgress(cacheKey, localLessons);
        setSyncStatus("error");
        setSyncError(error.message);
        return;
      }

      const remoteLessons = (data || []).map((row) => row.lesson_id);
      const merged = [...new Set([...remoteLessons, ...localLessons])];
      const missingRemote = merged.filter((lessonId) => !remoteLessons.includes(lessonId));

      if (missingRemote.length) {
        const { error: uploadError } = await supabase
          .from("lesson_progress")
          .upsert(
            missingRemote.map((lessonId) => ({ user_id: userId, lesson_id: lessonId })),
            { onConflict: "user_id,lesson_id" },
          );

        if (!active) return;
        if (uploadError) {
          writeProgress(cacheKey, merged);
          setCompleted(merged);
          setSyncStatus("error");
          setSyncError(uploadError.message);
          return;
        }
      }

      writeProgress(cacheKey, merged);
      localStorage.removeItem(GUEST_PROGRESS_KEY);
      setCompleted(merged);
      setSyncStatus("synced");
    };

    void synchronize();
    return () => {
      active = false;
    };
  }, [authReady, userId]);

  const toggleLesson = useCallback(
    (lessonId) => {
      const isCompleted = completed.includes(lessonId);
      const nextLessons = isCompleted
        ? completed.filter((item) => item !== lessonId)
        : [...completed, lessonId];
      const cacheKey = userId ? `learn-git-progress-${userId}` : GUEST_PROGRESS_KEY;

      setCompleted(nextLessons);
      writeProgress(cacheKey, nextLessons);

      if (!userId || !supabase) {
        setSyncStatus("local");
        return;
      }

      setSyncStatus("syncing");
      setSyncError("");
      void (async () => {
        const result = isCompleted
          ? await supabase
              .from("lesson_progress")
              .delete()
              .eq("user_id", userId)
              .eq("lesson_id", lessonId)
          : await supabase
              .from("lesson_progress")
              .upsert(
                {
                  user_id: userId,
                  lesson_id: lessonId,
                  completed_at: new Date().toISOString(),
                },
                { onConflict: "user_id,lesson_id" },
              );

        if (result.error) {
          setSyncStatus("error");
          setSyncError(result.error.message);
        } else {
          setSyncStatus("synced");
        }
      })();
    },
    [completed, userId],
  );

  return { completed, syncError, syncStatus, toggleLesson };
}

function Logo({ compact = false, onClick }) {
  return (
    <button
      className="brand"
      aria-label="learnGit home"
      data-compact={compact}
      onClick={onClick}
    >
      <span className="brand-mark">
        <img src={gitTogetherLogo} alt="" />
      </span>
      {!compact && (
        <span>
          <strong>learnGit</strong>
        </span>
      )}
    </button>
  );
}

function AccountControl({
  session,
  authReady,
  onOpenAuth,
  onOpenProfile,
  onSignOut,
  compact = false,
}) {
  const { t } = useLanguage();
  const email = session?.user?.email || "";
  const label =
    session?.user?.user_metadata?.full_name || (email ? email.split("@")[0] : t("Account", "အကောင့်"));

  if (!authReady) {
    return (
      <span className="account-loading" aria-label={t("Loading account", "အကောင့် ဖွင့်နေသည်")}>
        <LoaderCircle size={16} />
      </span>
    );
  }

  if (!session) {
    return (
      <button className="account-sign-in" data-compact={compact} onClick={() => onOpenAuth("login")}>
        <LogIn size={15} />
        {t("Sign in", "ဝင်မယ်")}
      </button>
    );
  }

  return (
    <div className="account-signed-in" data-compact={compact}>
      <button
        type="button"
        className="account-profile-button"
        onClick={onOpenProfile}
        aria-label={t("Open profile", "Profile ဖွင့်မယ်")}
      >
        <span className="account-avatar" aria-hidden="true">
          <UserRound size={15} />
        </span>
        <span className="account-identity">
          <strong>{label}</strong>
          {!compact && <small>{email}</small>}
        </span>
      </button>
      <button className="account-sign-out" onClick={onSignOut} aria-label={t("Sign out", "အကောင့်မှ ထွက်မယ်")} title={t("Sign out", "အကောင့်မှ ထွက်မယ်")}>
        <LogOut size={15} />
      </button>
    </div>
  );
}

function TopBar({
  currentView,
  onNavigate,
  onOpenMenu,
  session,
  authReady,
  onOpenAuth,
  onOpenProfile,
  onSignOut,
}) {
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
          <AccountControl
            session={session}
            authReady={authReady}
            onOpenAuth={onOpenAuth}
            onOpenProfile={onOpenProfile}
            onSignOut={onSignOut}
          />
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

function MobileMenu({
  open,
  onClose,
  onNavigate,
  session,
  authReady,
  onOpenAuth,
  onOpenProfile,
  onSignOut,
}) {
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
        <div className="drawer-account">
          <AccountControl
            compact
            session={session}
            authReady={authReady}
            onOpenAuth={() => {
              onClose();
              onOpenAuth();
            }}
            onOpenProfile={() => {
              onClose();
              onOpenProfile();
            }}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </div>
  );
}

function getAuthErrorMessage(error, t, operation = "") {
  const messagesByCode = {
    email_address_invalid: t(
      "Enter a valid email address.",
      "မှန်ကန်သော Email လိပ်စာ ထည့်ပါ",
    ),
    email_address_not_authorized: t(
      "Confirmation emails are not configured for this address. Please contact the app owner.",
      "ဒီ Email အတွက် confirmation email ပို့ရန် မပြင်ဆင်ရသေးပါ App owner ကို ဆက်သွယ်ပါ",
    ),
    email_provider_disabled: t(
      "Email and password sign-up is currently unavailable.",
      "Email နဲ့ password ဖြင့် အကောင့်ဖန်တီးခြင်းကို လောလောဆယ် အသုံးမပြုနိုင်ပါ",
    ),
    invalid_credentials: t(
      "The email or password is incorrect.",
      "Email သို့မဟုတ် password မှားနေပါသည်",
    ),
    over_email_send_rate_limit: t(
      "Too many emails were requested. Please wait a few minutes and try again.",
      "Email အကြိမ်များလွန်းနေပါသည် မိနစ်အနည်းငယ်စောင့်ပြီး ထပ်စမ်းပါ",
    ),
    over_request_rate_limit: t(
      "Too many attempts. Please wait a few minutes and try again.",
      "ကြိုးစားမှုများလွန်းနေပါသည် မိနစ်အနည်းငယ်စောင့်ပြီး ထပ်စမ်းပါ",
    ),
    signup_disabled: t(
      "New account creation is currently disabled.",
      "အကောင့်အသစ်ဖန်တီးခြင်းကို လောလောဆယ် ပိတ်ထားပါသည်",
    ),
    weak_password: t(
      "Choose a stronger password and try again.",
      "ပိုမိုခိုင်မာသော password ရွေးပြီး ထပ်စမ်းပါ",
    ),
  };

  if (typeof error?.code === "string" && messagesByCode[error.code]) {
    return messagesByCode[error.code];
  }

  const possibleMessages = [
    error?.message,
    error?.error_description,
    error?.msg,
    typeof error === "string" ? error : "",
  ];
  const message = possibleMessages.find((value) => {
    if (typeof value !== "string") return false;
    const normalized = value.trim();
    return (
      normalized &&
      normalized !== "{}" &&
      normalized !== "[]" &&
      normalized !== "null" &&
      normalized !== "[object Object]"
    );
  });

  const isSignupServiceFailure =
    operation === "signup" &&
    (error?.code === "unexpected_failure" ||
      Number(error?.status) >= 500 ||
      /confirmation email|error sending email|unexpected failure/i.test(message || "") ||
      !message);

  if (isSignupServiceFailure) {
    return t(
      "The account confirmation service is unavailable. Please contact the app owner.",
      "Account confirmation service အသုံးမပြုနိုင်ပါ App owner ကို ဆက်သွယ်ပါ",
    );
  }

  return message?.trim() || t(
    "Authentication failed. Please try again.",
    "အကောင့်ဝင်၍မရပါ ထပ်စမ်းပါ",
  );
}

function AuthModal({ open, onClose, initialMode = "login", required = false }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const emailRef = useRef(null);

  const resetFeedback = () => {
    setError("");
    setNotice("");
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setPassword("");
    setConfirmation("");
    resetFeedback();
  };

  useEffect(() => {
    if (!open) return undefined;
    setMode(initialMode);
    setError("");
    setNotice("");
    const closeOnEscape = (event) => {
      if (!required && event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", closeOnEscape);
    window.setTimeout(() => emailRef.current?.focus(), 20);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [initialMode, open, onClose, required]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!isSupabaseConfigured) {
      setError(
        t(
          "Supabase is not configured yet. Add VITE_SUPABASE_PUBLISHABLE_KEY to your environment.",
          "Supabase မချိတ်ရသေးပါ VITE_SUPABASE_PUBLISHABLE_KEY ကို environment ထဲထည့်ပါ",
        ),
      );
      return;
    }
    if ((mode === "signup" || mode === "recovery") && password !== confirmation) {
      setError(t("Passwords do not match.", "Password နှစ်ခု မတူပါ"));
      return;
    }
    if (mode !== "forgot" && password.length < 8) {
      setError(t("Use at least 8 characters for your password.", "Password ကို အနည်းဆုံး ၈ လုံး သုံးပါ"));
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onClose?.();
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          onClose?.();
        } else {
          setMode("login");
          setFullName("");
          setNotice(
            t(
              "Account created. Check your email to confirm your address, then sign in.",
              "အကောင့် ဖန်တီးပြီးပါပြီ Email မှာ အတည်ပြုပြီး ဝင်ပါ",
            ),
          );
          setPassword("");
          setConfirmation("");
        }
      } else if (mode === "forgot") {
        const resetUrl = new URL(`${window.location.origin}${window.location.pathname}`);
        resetUrl.searchParams.set("password-reset", "1");
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetUrl.toString(),
        });
        if (resetError) throw resetError;
        setNotice(
          t(
            "Password reset email sent. Open its link on this device to choose a new password.",
            "Password reset email ပို့ပြီးပါပြီ Password အသစ်ရွေးဖို့ ဒီ device မှာ link ကိုဖွင့်ပါ",
          ),
        );
      } else if (mode === "recovery") {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setNotice(t("Password updated. You can continue learning.", "Password ပြောင်းပြီးပါပြီ ဆက်လေ့လာနိုင်ပါပြီ"));
        setPassword("");
        setConfirmation("");
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError, t, mode));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`auth-modal${required ? " auth-required" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      {required ? (
        <div className="auth-backdrop" aria-hidden="true" />
      ) : (
        <button className="auth-backdrop" onClick={onClose} aria-label={t("Close", "ပိတ်မယ်")} />
      )}
      <section className="auth-card">
        <div className="auth-card-head">
          {required ? (
            <Logo />
          ) : (
            <span className="auth-mark">
              <UserRound size={20} />
            </span>
          )}
          {!required && (
            <button className="icon-button" onClick={onClose} aria-label={t("Close", "ပိတ်မယ်")}>
              <X size={18} />
            </button>
          )}
        </div>
        <span className="kicker">
          {required
            ? t("SIGN IN TO CONTINUE", "ဆက်သွားရန် အကောင့်ဝင်ပါ")
            : t("YOUR ACCOUNT", "သင့်အကောင့်")}
        </span>
        <h2 id="auth-title">
          {mode === "login" && t("Welcome back.", "ပြန်လည် ကြိုဆိုပါတယ်")}
          {mode === "signup" && t("Learn with an account.", "အကောင့်နဲ့ လေ့လာမယ်")}
          {mode === "forgot" && t("Reset your password.", "Password ပြန်သတ်မှတ်မယ်")}
          {mode === "recovery" && t("Choose a new password.", "Password အသစ်ရွေးမယ်")}
        </h2>
        <p>
          {mode === "login" && t("Sign in to your learnGit account.", "learnGit အကောင့်ထဲ ဝင်ပါ")}
          {mode === "signup" && t("Create an account with your email and password.", "Email နဲ့ password သုံးပြီး အကောင့်ဖန်တီးပါ")}
          {mode === "forgot" && t("Enter your account email and we will send a secure recovery link.", "အကောင့် email ထည့်ပါ လုံခြုံတဲ့ recovery link ပို့ပေးမယ်")}
          {mode === "recovery" && t("Use at least eight characters, then confirm the new password.", "အနည်းဆုံး ၈ လုံးသုံးပြီး password အသစ်ကို အတည်ပြုပါ")}
        </p>
        {required && (mode === "login" || mode === "signup") && (
          <p className="auth-required-note">
            <LockKeyhole size={14} />
            {t(
              "An account is required to access lessons, practice tools, and saved progress.",
              "Lessons၊ practice tools နဲ့ progress များကိုသုံးရန် အကောင့်လိုအပ်ပါသည်",
            )}
          </p>
        )}

        {(mode === "login" || mode === "signup") && (
          <div className="auth-tabs" role="tablist" aria-label={t("Account options", "အကောင့် ရွေးချယ်မှု")}>
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")} role="tab" aria-selected={mode === "login"}>
              {t("Sign in", "ဝင်မယ်")}
            </button>
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")} role="tab" aria-selected={mode === "signup"}>
              {t("Create account", "အကောင့်ဖန်တီးမယ်")}
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && (
            <label>
              <span>{t("Name", "နာမည်")}</span>
              <span className="auth-input">
                <UserRound size={16} />
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder={t("Your name", "သင့်နာမည်")} required />
              </span>
            </label>
          )}
          {mode !== "recovery" && (
            <label>
              <span>{t("Email", "Email")}</span>
              <span className="auth-input">
                <Mail size={16} />
                <input ref={emailRef} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required />
              </span>
            </label>
          )}
          {mode !== "forgot" && (
            <label>
              <span>{mode === "recovery" ? t("New password", "Password အသစ်") : t("Password", "Password")}</span>
              <span className="auth-input">
                <LockKeyhole size={16} />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={t("At least 8 characters", "အနည်းဆုံး ၈ လုံး")} minLength={8} required />
              </span>
            </label>
          )}
          {(mode === "signup" || mode === "recovery") && (
            <label>
              <span>{t("Confirm password", "Password ထပ်ရိုက်ပါ")}</span>
              <span className="auth-input">
                <LockKeyhole size={16} />
                <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" placeholder={t("Type it again", "ထပ်ရိုက်ပါ")} minLength={8} required />
              </span>
            </label>
          )}
          {mode === "login" && (
            <button type="button" className="auth-text-button" onClick={() => changeMode("forgot")}>
              {t("Forgot password?", "Password မေ့နေပါသလား")}
            </button>
          )}
          {error && <div className="auth-message error" role="alert">{error}</div>}
          {notice && <div className="auth-message success" role="status">{notice}</div>}
          <button className="primary-button auth-submit" disabled={busy}>
            {busy && <LoaderCircle className="spinning" size={16} />}
            {mode === "login" && t("Sign in", "ဝင်မယ်")}
            {mode === "signup" && t("Create account", "အကောင့်ဖန်တီးမယ်")}
            {mode === "forgot" && t("Send reset email", "Reset email ပို့မယ်")}
            {mode === "recovery" && t("Update password", "Password ပြောင်းမယ်")}
          </button>
          {mode === "forgot" && (
            <button type="button" className="auth-back-link" onClick={() => changeMode("login")}>
              <ArrowLeft size={14} />
              {t("Back to sign in", "Sign in ကိုပြန်မယ်")}
            </button>
          )}
        </form>
        <small className="auth-privacy">
          {t(
            "Authentication is securely handled by Supabase.",
            "အကောင့် လုံခြုံရေးကို Supabase ဖြင့် စီမံထားသည်",
          )}
        </small>
      </section>
    </div>
  );
}

function encodeSharedProfile(profile) {
  const bytes = new TextEncoder().encode(JSON.stringify(profile));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeSharedProfile(value) {
  if (!value) return null;
  try {
    const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = window.atob(normalized + padding);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const profile = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof profile?.name !== "string") return null;
    return {
      name: profile.name.slice(0, 80),
      completed: Math.max(0, Math.min(999, Number(profile.completed) || 0)),
      joined: typeof profile.joined === "string" ? profile.joined : "",
    };
  } catch {
    return null;
  }
}

function ProfileModal({
  open,
  onClose,
  session,
  completedCount,
  progressStatus,
  progressError,
  sharedProfile,
}) {
  const { language, t } = useLanguage();
  const user = session?.user;
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
    setPassword("");
    setConfirmation("");
    setError("");
    setNotice("");
    setShareUrl("");
  }, [open, user]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  const resetFeedback = () => {
    setError("");
    setNotice("");
  };

  const updateName = async (event) => {
    event.preventDefault();
    resetFeedback();
    if (!name.trim()) return;
    setBusyAction("name");
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });
    if (updateError) setError(updateError.message);
    else setNotice(t("Profile name updated.", "Profile နာမည်ပြောင်းပြီးပါပြီ"));
    setBusyAction("");
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    resetFeedback();
    if (password.length < 8) {
      setError(t("Use at least 8 characters for your password.", "Password ကို အနည်းဆုံး ၈ လုံး သုံးပါ"));
      return;
    }
    if (password !== confirmation) {
      setError(t("Passwords do not match.", "Password နှစ်ခု မတူပါ"));
      return;
    }
    setBusyAction("password");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else {
      setNotice(t("Password changed successfully.", "Password ပြောင်းပြီးပါပြီ"));
      setPassword("");
      setConfirmation("");
    }
    setBusyAction("");
  };

  const sendResetEmail = async () => {
    resetFeedback();
    if (!user?.email) return;
    setBusyAction("reset");
    const resetUrl = new URL(`${window.location.origin}${window.location.pathname}`);
    resetUrl.searchParams.set("password-reset", "1");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: resetUrl.toString(),
    });
    if (resetError) setError(resetError.message);
    else setNotice(t("Password reset email sent.", "Password reset email ပို့ပြီးပါပြီ"));
    setBusyAction("");
  };

  const shareProfile = async () => {
    resetFeedback();
    const profile = {
      name: name.trim() || user?.email?.split("@")[0] || "learnGit learner",
      completed: completedCount,
      joined: user?.created_at || "",
    };
    const url = new URL(`${window.location.origin}${window.location.pathname}`);
    url.searchParams.set("profile", encodeSharedProfile(profile));
    if (language === "my") url.searchParams.set("lang", "my");
    const nextShareUrl = url.toString();
    setShareUrl(nextShareUrl);
    try {
      if (navigator.share) {
        await navigator.share({
          title: t(`${profile.name}'s learnGit profile`, `${profile.name} ရဲ့ learnGit profile`),
          text: t(
            `${profile.name} completed ${profile.completed} learnGit lessons.`,
            `${profile.name} က learnGit lessons ${profile.completed} ခု ပြီးထားပါတယ်`,
          ),
          url: nextShareUrl,
        });
        setNotice(t("Profile shared.", "Profile မျှဝေပြီးပါပြီ"));
      } else {
        await navigator.clipboard.writeText(nextShareUrl);
        setNotice(t("Share link copied.", "Share link copy လုပ်ပြီးပါပြီ"));
      }
    } catch (shareError) {
      if (shareError?.name !== "AbortError") {
        setNotice(t("Copy the share link below.", "အောက်က share link ကို copy လုပ်ပါ"));
      }
    }
  };

  const profile = sharedProfile || {
    name: name || user?.email?.split("@")[0] || t("Learner", "လေ့လာသူ"),
    completed: completedCount,
    joined: user?.created_at || "",
  };
  const joinedValue = profile.joined ? new Date(profile.joined) : null;
  const joinedDate = joinedValue && !Number.isNaN(joinedValue.getTime())
    ? new Intl.DateTimeFormat(language === "my" ? "my-MM" : "en", {
        year: "numeric",
        month: "short",
      }).format(joinedValue)
    : t("Not shared", "မမျှဝေထားပါ");

  return (
    <div className="auth-modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <button className="auth-backdrop" onClick={onClose} aria-label={t("Close", "ပိတ်မယ်")} />
      <section className="auth-card profile-card">
        <div className="auth-card-head">
          <span className="auth-mark"><UserRound size={20} /></span>
          <button className="icon-button" onClick={onClose} aria-label={t("Close", "ပိတ်မယ်")}>
            <X size={18} />
          </button>
        </div>
        <span className="kicker">
          {sharedProfile ? t("SHARED LEARNER PROFILE", "မျှဝေထားသော LEARNER PROFILE") : t("YOUR PROFILE", "သင့် PROFILE")}
        </span>
        <h2 id="profile-title">{profile.name}</h2>
        <div className="profile-stats">
          <div><strong>{profile.completed}</strong><span>{t("lessons completed", "lessons ပြီး")}</span></div>
          <div><strong>{joinedDate}</strong><span>{t("joined learnGit", "learnGit စဝင်")}</span></div>
        </div>
        {!sharedProfile && progressStatus !== "synced" && (
          <div className={`progress-sync-status ${progressStatus}`}>
            {progressStatus === "syncing" && <LoaderCircle className="spinning" size={14} />}
            {progressStatus === "local" && <CircleHelp size={14} />}
            {progressStatus === "error" && <CircleHelp size={14} />}
            <span>
              {progressStatus === "syncing" && t("Saving lesson progress…", "Lesson progress သိမ်းနေသည်…")}
              {progressStatus === "local" && t("Progress is stored on this device until you sign in.", "Sign in မလုပ်မချင်း progress ကို ဒီ device မှာသိမ်းထားမယ်")}
              {progressStatus === "error" && t("Database sync is unavailable; progress is cached on this device.", "Database sync မရသေးလို့ progress ကို ဒီ device မှာ cache လုပ်ထားတယ်")}
            </span>
            {progressStatus === "error" && progressError && <small title={progressError}>{progressError}</small>}
          </div>
        )}

        {sharedProfile ? (
          <p className="profile-public-note">
            {t(
              "This public link contains only the learner name, progress count, and join month.",
              "ဒီ public link မှာ learner နာမည်၊ progress count နဲ့ စဝင်တဲ့လပဲ ပါတယ်",
            )}
          </p>
        ) : (
          <>
            <form className="profile-section" onSubmit={updateName}>
              <div>
                <strong>{t("Profile details", "Profile အချက်အလက်")}</strong>
                <small>{user?.email}</small>
              </div>
              <label className="auth-input">
                <UserRound size={16} />
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} aria-label={t("Profile name", "Profile နာမည်")} />
              </label>
              <button className="secondary-button" disabled={busyAction === "name"}>
                {busyAction === "name" ? t("Saving…", "သိမ်းနေသည်…") : t("Save name", "နာမည်သိမ်းမယ်")}
              </button>
            </form>

            <section className="profile-section">
              <div>
                <strong>{t("Share your learning profile", "Learning profile မျှဝေမယ်")}</strong>
                <small>{t("Your email and account ID are never included.", "Email နဲ့ account ID လုံးဝမပါပါ")}</small>
              </div>
              <button type="button" className="primary-button profile-share-button" onClick={shareProfile}>
                <Share2 size={16} />
                {t("Share profile", "Profile မျှဝေမယ်")}
              </button>
              {shareUrl && <input className="profile-share-url" readOnly value={shareUrl} aria-label={t("Profile share URL", "Profile share URL")} />}
            </section>

            <form className="profile-section" onSubmit={updatePassword}>
              <div>
                <strong>{t("Change password", "Password ပြောင်းမယ်")}</strong>
                <small>{t("Use a new password with at least 8 characters.", "အနည်းဆုံး ၈ လုံးပါတဲ့ password အသစ်သုံးပါ")}</small>
              </div>
              <label className="auth-input">
                <KeyRound size={16} />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} placeholder={t("New password", "Password အသစ်")} />
              </label>
              <label className="auth-input">
                <LockKeyhole size={16} />
                <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={8} placeholder={t("Confirm new password", "Password အသစ် အတည်ပြုပါ")} />
              </label>
              <button className="secondary-button" disabled={busyAction === "password"}>
                {busyAction === "password" ? t("Updating…", "ပြောင်းနေသည်…") : t("Update password", "Password ပြောင်းမယ်")}
              </button>
              <button type="button" className="auth-text-button profile-reset-button" onClick={sendResetEmail} disabled={busyAction === "reset"}>
                <Mail size={14} />
                {busyAction === "reset" ? t("Sending…", "ပို့နေသည်…") : t("Email me a reset link instead", "Reset link ကို email နဲ့ပို့ပါ")}
              </button>
            </form>
            {error && <div className="auth-message error" role="alert">{error}</div>}
            {notice && <div className="auth-message success" role="status">{notice}</div>}
          </>
        )}
      </section>
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
          <h1>
            {t("Learn Git.", "Git ကိုလေ့လာ")}
            <br />
            <span>{t("Build together.", "အတူတူတည်ဆောက်")}</span>
          </h1>
          <p>
            {t(
              "Simple Git and GitHub lessons. Read a short step, try a command, and learn with your community.",
              " Git နဲ့ GitHub ကို community နဲ့အတူ တစ်လှမ်းချင်း လေ့လာမယ်",
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
  context.fillText("learnGit · TALKWARE", 842, 160);

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
      ? "learnGit ရှိ Git နှင့် GitHub သင်ခန်းစာများအားလုံးကို ပြီးမြောက်သည့်အတွက်"
      : "for completing all Git and GitHub lessons in the learnGit guide",
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
  pdf.save(`learn-git-certificate-${safeName}.pdf`);
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
  const levels = [
    {
      id: "Beginner",
      label: t("Beginner", "အစပြုသူ"),
      copy: t("Start here and build a safe Git foundation.", "ဒီကနေစပြီး လုံခြုံတဲ့ Git အခြေခံ တည်ဆောက်ပါ"),
    },
    {
      id: "Intermediate",
      label: t("Intermediate", "အလယ်အလတ်"),
      copy: t("Work with branches, GitHub, and recovery.", "Branches၊ GitHub နဲ့ recovery ကိုလေ့ကျင့်ပါ"),
    },
    {
      id: "Advanced",
      label: t("Advanced", "အဆင့်မြင့်"),
      copy: t("Rewrite history carefully and contribute to real projects.", "History ကိုသေချာစွာပြန်ရေးပြီး project အစစ်များမှာ contribute လုပ်ပါ"),
    },
  ];

  const orderedModules = [...guide.modules].sort((left, right) => {
    const leftLevel = levels.findIndex((level) => level.id === left.difficulty);
    const rightLevel = levels.findIndex((level) => level.id === right.difficulty);
    return (leftLevel === -1 ? levels.length : leftLevel) -
      (rightLevel === -1 ? levels.length : rightLevel) ||
      Number(left.number) - Number(right.number);
  });

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
        <div className="learning-levels">
          {levels.map((level) => {
            const modules = orderedModules.filter((module) => module.difficulty === level.id);
            if (!modules.length) return null;
            return (
              <section className="learning-level" key={level.id}>
                <div className="learning-level-heading">
                  <span>{level.label}</span>
                  <p>{level.copy}</p>
                </div>
                <div className="module-grid">
                  {modules.map((module) => {
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
                          <span>{localize(module, "duration", language)}</span>
                          <span>{moduleDone}/{module.lessons.length} {t("done", "ပြီး")}</span>
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
              </section>
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
    {
      name: "aungkokothet/talkwaremm-member-app-factory",
      owner: t("Talkware Myanmar reference", "Talkware Myanmar reference"),
      url: "https://github.com/aungkokothet/talkwaremm-member-app-factory",
      copy: t(
        "Inspect a public Talkware Myanmar member-app project, its main branch, commit history, and project structure",
        "Public Talkware Myanmar member-app project ရဲ့ main branch၊ commit history နဲ့ project structure ကိုလေ့လာပါ",
      ),
    },
    {
      name: "freeCodeCamp/freeCodeCamp",
      owner: t("Popular open-source learning repository", "နာမည်ကြီး open-source learning repository"),
      url: "https://github.com/freeCodeCamp/freeCodeCamp",
      copy: t(
        "Explore a widely starred education codebase with a documented, beginner-friendly contribution workflow",
        "လူကြိုက်များတဲ့ education codebase နဲ့ အစပြုသူအတွက် ရှင်းပြထားတဲ့ contribution workflow ကိုလေ့လာပါ",
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
                      {topic.links?.length > 0 && (
                        <div className="knowledge-links">
                          <small>{t("LEARNING LINKS", "လေ့လာရန် LINKS")}</small>
                          {topic.links.map((link) => (
                            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                              {language === "my" ? link.myLabel || link.label : link.label}
                              <ExternalLink size={14} />
                            </a>
                          ))}
                        </div>
                      )}
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

function LessonMedia({ lesson }) {
  const { language, t } = useLanguage();
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    setExpandedImage(null);
  }, [lesson.id]);

  useEffect(() => {
    if (!expandedImage) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setExpandedImage(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [expandedImage]);

  if (!lesson.media?.length) return null;

  const points = localize(lesson, "points", language) || [];
  const sections = localize(lesson, "sections", language) || [];
  return (
    <>
    <section className="lesson-media">
      <div className="lesson-flow-summary">
        {points.map((point, index) => (
          <div key={point.title}>
            <span>{index + 1}</span>
            <strong>{point.title}</strong>
            <small>{point.copy}</small>
          </div>
        ))}
      </div>
      <div className="lesson-image-grid">
        {lesson.media.map((item) => (
          <figure key={item.src}>
            <button
              type="button"
              className="lesson-image-button"
              onClick={() => setExpandedImage(item)}
              aria-label={t("Expand lesson image", "Lesson ပုံကို ချဲ့ကြည့်မယ်")}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span><Maximize2 size={15} />{t("Expand", "ချဲ့မယ်")}</span>
            </button>
            <figcaption>
              {language === "my" ? item.captionMy || item.caption : item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      {sections.length > 0 && (
        <section className="lesson-reference-details">
          <div>
            <small>{t("ARTICLE-BASED REFERENCE", "ARTICLE ကိုအခြေခံသော REFERENCE")}</small>
            <h2>{t("The Git basics you will use most", "အသုံးအများဆုံး Git အခြေခံများ")}</h2>
            <p>
              {t(
                "Read one card at a time. The commands show the practical order.",
                "Card တစ်ခုချင်းဖတ်ပါ Commands များက လက်တွေ့အစဉ်ကိုပြတယ်",
              )}
            </p>
          </div>
          <div className="lesson-reference-grid">
            {sections.map((section, index) => (
              <article key={section.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{section.title}</h3>
                <p>{section.copy}</p>
                {section.commands?.length > 0 && (
                  <div>
                    {section.commands.map((command) => <code key={command}>{command}</code>)}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      {lesson.source && (
        <div className="lesson-source">
          <span>
            {language === "my"
              ? lesson.source.creditMy || lesson.source.credit
              : lesson.source.credit}
          </span>
          <a href={lesson.source.url} target="_blank" rel="noreferrer">
            {language === "my"
              ? lesson.source.labelMy || lesson.source.label
              : lesson.source.label}
            <ExternalLink size={14} />
          </a>
        </div>
      )}
      <p className="lesson-media-note">
        {t(
          "Remember: edit → add → commit → push.",
          "မှတ်ရန် — edit → add → commit → push",
        )}
      </p>
    </section>
    {expandedImage && (
      <div className="lesson-image-lightbox" role="dialog" aria-modal="true" aria-label={t("Expanded lesson image", "ချဲ့ထားသော lesson ပုံ")}>
        <button
          type="button"
          className="lesson-image-backdrop"
          onClick={() => setExpandedImage(null)}
          aria-label={t("Close expanded image", "ချဲ့ထားသောပုံ ပိတ်မယ်")}
        />
        <figure>
          <button type="button" onClick={() => setExpandedImage(null)} aria-label={t("Close", "ပိတ်မယ်")}>
            <X size={20} />
          </button>
          <img src={expandedImage.src} alt={expandedImage.alt} referrerPolicy="no-referrer" />
          <figcaption>
            {language === "my"
              ? expandedImage.captionMy || expandedImage.caption
              : expandedImage.caption}
          </figcaption>
        </figure>
      </div>
    )}
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
          <LessonMedia lesson={lesson} />

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

function TerminalLab({
  completedChallenges,
  setCompletedChallenges,
  initialCommand,
  onOpenAuth,
  session,
}) {
  const { t } = useLanguage();
  const terminalRef = useRef(null);
  const terminalMode = "simulated";
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

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
        </div>
        {terminalMode === "simulated" ? (
          <GuidedGitSimulator
            completedScenarios={completedChallenges}
            initialCommand={initialCommand}
            onCompleted={(id) =>
              setCompletedChallenges((items) =>
                items.includes(id) ? items : [...items, id],
              )
            }
            t={t}
          />
        ) : (
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
                  <button
                    key={id}
                    className={done ? "done" : ""}
                    disabled={connectionStatus !== "connected"}
                    onClick={() => {
                      terminalRef.current?.run(suggestion);
                      setCompletedChallenges((items) =>
                        items.includes(id) ? items : [...items, id],
                      );
                    }}
                  >
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
              {terminalMode === "sandbox" ? <Zap size={15} /> : <GraduationCap size={15} />}
              <span>
                <strong>
                  {terminalMode === "sandbox"
                    ? t("Container isolated", "Container သီးသန့်")
                    : t("Guided and simulated", "Guided simulation")}
                </strong>
                {terminalMode === "sandbox"
                  ? t(
                    "Commands are real, but cannot touch your device.",
                    "Command များက အစစ်ဖြစ်ပေမယ့် သင့် device ကို မထိနိုင်ပါ",
                  )
                  : t(
                    "Responses are examples and no shell command is executed.",
                    "အဖြေများက ဥပမာဖြစ်ပြီး shell command အစစ် run မည်မဟုတ်ပါ",
                  )}
              </span>
            </div>
          </aside>

          <section className="terminal-card lab-terminal">
            <div className="terminal-titlebar">
              <span className="terminal-window-name">
                {terminalMode === "sandbox" ? "learn-git-sandbox" : "learn-git-guided"}
                <i className={`terminal-status-dot ${connectionStatus}`} />
              </span>
              <button onClick={() => terminalRef.current?.clear()} aria-label="Clear terminal">
                <RotateCcw size={14} />
              </button>
            </div>
            {terminalMode === "simulated" ? (
              <SimulatedTerminal
                ref={terminalRef}
                initialCommand={initialCommand}
                onStatusChange={setConnectionStatus}
                onCompleted={(id) =>
                  setCompletedChallenges((items) =>
                    items.includes(id) ? items : [...items, id],
                  )
                }
                t={t}
              />
            ) : (
              <Suspense
                fallback={
                  <div className="terminal-gate">
                    <LoaderCircle className="spinning" size={22} />
                    <strong>{t("Loading terminal…", "Terminal ဖွင့်နေသည်…")}</strong>
                  </div>
                }
              >
                <SandboxTerminal
                  ref={terminalRef}
                  initialCommand={initialCommand}
                  onOpenAuth={onOpenAuth}
                  onStatusChange={setConnectionStatus}
                  session={session}
                  t={t}
                />
              </Suspense>
            )}
          </section>
          </div>
        )}
      </div>
    </main>
  );
}

const SimulatedTerminal = forwardRef(function SimulatedTerminal(
  { initialCommand, onCompleted, onStatusChange, t },
  ref,
) {
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    {
      type: "system",
      lines: [
        t(
          "Guided terminal ready. Try git status or type help.",
          "Guided terminal အသင့်ဖြစ်ပါပြီ git status စမ်းပါ သို့မဟုတ် help ရိုက်ပါ",
        ),
      ],
    },
  ]);
  const lastInitialCommand = useRef("");
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    onStatusChange("connected");
    return () => onStatusChange("disconnected");
  }, [onStatusChange]);

  useEffect(() => {
    outputRef.current?.scrollTo({
      top: outputRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, busy]);

  const runCommand = useCallback(async (rawCommand) => {
    const command = String(rawCommand || "").trim();
    if (!command || busy) return;

    setInput("");
    setBusy(true);
    setHistory((items) => [...items, { type: "command", command }]);

    try {
      const response = await fetch(`${API_BASE}/api/terminal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const payload = await response.json();

      if (payload.clear) {
        setHistory([]);
      } else {
        const lines = Array.isArray(payload.lines)
          ? payload.lines
          : [payload.error || t("No guided response is available.", "Guided response မရှိသေးပါ")];
        setHistory((items) => [
          ...items,
          { type: response.ok ? "output" : "error", lines },
        ]);
      }
      if (payload.completed) onCompleted?.(payload.completed);
    } catch {
      setHistory((items) => [
        ...items,
        {
          type: "error",
          lines: [
            t(
              "The guided terminal API is unavailable. Try again.",
              "Guided terminal API ကို အသုံးမပြုနိုင်သေးပါ ထပ်စမ်းပါ",
            ),
          ],
        },
      ]);
    } finally {
      setBusy(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [busy, onCompleted, t]);

  useEffect(() => {
    if (!initialCommand || lastInitialCommand.current === initialCommand) return;
    lastInitialCommand.current = initialCommand;
    runCommand(initialCommand);
  }, [initialCommand, runCommand]);

  useImperativeHandle(ref, () => ({
    clear() {
      setHistory([]);
      inputRef.current?.focus();
    },
    run(command) {
      runCommand(command);
    },
  }), [runCommand]);

  return (
    <div className="simulated-terminal">
      <div className="lab-output" ref={outputRef} aria-live="polite">
        {history.map((entry, index) =>
          entry.type === "command" ? (
            <p className="lab-command" key={`${entry.command}-${index}`}>
              <span>student@learnGit</span>
              <span className="input-path"> ~/guide</span>
              <span> $ {entry.command}</span>
            </p>
          ) : (
            <div className={`lab-lines ${entry.type}`} key={`${entry.type}-${index}`}>
              {entry.lines.map((line, lineIndex) => (
                <p key={`${line}-${lineIndex}`}>{line || "\u00a0"}</p>
              ))}
            </div>
          ),
        )}
        {busy && <p className="terminal-muted">{t("Running guided example…", "Guided example run နေသည်…")}</p>}
      </div>
      <form
        className="terminal-input-row"
        onSubmit={(event) => {
          event.preventDefault();
          runCommand(input);
        }}
      >
        <span>student@learnGit</span>
        <span className="input-path">~/guide $</span>
        <input
          ref={inputRef}
          autoComplete="off"
          disabled={busy}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("Type a guided command…", "Guided command ရိုက်ပါ…")}
          spellCheck="false"
          value={input}
        />
        <button disabled={busy || !input.trim()}>{t("Run", "Run")}</button>
      </form>
    </div>
  );
});

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
  const initialSearchParams = new URLSearchParams(window.location.search);
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
  const [authMode, setAuthMode] = useState(
    initialSearchParams.get("password-reset") === "1" ? "recovery" : "login",
  );
  const [authOpen, setAuthOpen] = useState(
    initialSearchParams.get("password-reset") === "1",
  );
  const [sharedProfile] = useState(() =>
    decodeSharedProfile(initialSearchParams.get("profile")),
  );
  const [profileOpen, setProfileOpen] = useState(Boolean(sharedProfile));
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const {
    completed,
    syncError: progressError,
    syncStatus: progressStatus,
    toggleLesson,
  } = useLessonProgress(session, authReady);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [initialCommand, setInitialCommand] = useState("");

  useEffect(() => {
    if (!session) return undefined;

    let active = true;
    fetch(`${API_BASE}/api/guide`)
      .then((response) => {
        if (!response.ok) throw new Error("Guide unavailable");
        return response.json();
      })
      .then((content) => {
        if (active) setGuide(content);
      })
      .catch(() => {
        import("../server/guide.js").then((content) => {
          if (active) {
            setGuide({
              name: "learnGit",
              modules: content.modules,
              knowledgeTopics: content.knowledgeTopics,
            });
          }
        });
      });

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    const loadVerifiedSession = async () => {
      const {
        data: { session: storedSession },
      } = await supabase.auth.getSession();

      if (!storedSession) {
        if (active) setSession(null);
        return;
      }

      const { data, error } = await supabase.auth.getClaims();
      if (active) setSession(!error && data?.claims ? storedSession : null);
    };

    void loadVerifiedSession()
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;
      setSession(nextSession);
      setAuthReady(true);
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("recovery");
        setAuthOpen(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
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

  const openAuth = useCallback((mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has("password-reset")) {
      url.searchParams.delete("password-reset");
      window.history.replaceState({}, "", url);
    }
  }, []);

  const closeProfile = useCallback(() => {
    setProfileOpen(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has("profile")) {
      url.searchParams.delete("profile");
      window.history.replaceState({}, "", url);
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

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthMode("login");
    setAuthOpen(false);
    setProfileOpen(false);
    setMobileMenu(false);
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
      {!authReady ? (
        <main className="auth-loading-screen" aria-live="polite">
          <Logo />
          <LoaderCircle className="spinning" size={24} />
          <p>{languageValue.t("Checking your account…", "သင့်အကောင့်ကို စစ်ဆေးနေသည်…")}</p>
        </main>
      ) : !session ? (
        <AuthModal
          open
          required
          initialMode={authMode === "recovery" ? "login" : authMode}
        />
      ) : (
        <div className="app-shell">
          <FirstTimeTour onNavigate={navigate} />
          <TopBar
            currentView={view}
            onNavigate={navigate}
            onOpenMenu={() => setMobileMenu(true)}
            session={session}
            authReady={authReady}
            onOpenAuth={openAuth}
            onOpenProfile={() => setProfileOpen(true)}
            onSignOut={signOut}
          />
          <MobileMenu
            open={mobileMenu}
            onClose={() => setMobileMenu(false)}
            onNavigate={navigate}
            session={session}
            authReady={authReady}
            onOpenAuth={openAuth}
            onOpenProfile={() => setProfileOpen(true)}
            onSignOut={signOut}
          />
          <AuthModal open={authOpen} onClose={closeAuth} initialMode={authMode} />
          <ProfileModal
            open={profileOpen}
            onClose={closeProfile}
            session={session}
            completedCount={completed.length}
            progressStatus={progressStatus}
            progressError={progressError}
            sharedProfile={sharedProfile}
          />
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
              onToggleComplete={toggleLesson}
            />
          )}
          {view === "terminal" && (
            <TerminalLab
              completedChallenges={completedChallenges}
              setCompletedChallenges={setCompletedChallenges}
              initialCommand={initialCommand}
              onOpenAuth={openAuth}
              session={session}
            />
          )}
          {view === "knowledge" && <KnowledgePage topics={guide.knowledgeTopics || []} />}
          {view === "cheatsheet" && <CheatSheet onTry={openTerminal} />}
          {view !== "lesson" && <Footer />}
          <GuideChat
            apiBase={API_BASE}
            language={language}
            onOpenAuth={openAuth}
            session={session}
            t={languageValue.t}
          />
        </div>
      )}
    </LanguageContext.Provider>
  );
}
