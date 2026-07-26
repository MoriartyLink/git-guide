import { Bot, BookOpenCheck, LoaderCircle, LogIn, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

async function readChatResponse(response) {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(
      `The AI API returned an empty response (HTTP ${response.status}). ${
        response.status >= 500
          ? "Check the deployment function logs and environment variables."
          : "Make sure the learnGit API server is running."
      }`,
    );
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    const contentType = response.headers.get("content-type") || "";
    throw new Error(
      contentType.includes("text/html") || body.trimStart().startsWith("<")
        ? "The AI API route returned the website instead of JSON. Deploy the /api/chat function or start the API server."
        : `The AI API returned an invalid response (HTTP ${response.status}). Check the server logs.`,
    );
  }

  if (!response.ok) {
    throw new Error(data?.error || `The AI request failed (HTTP ${response.status}).`);
  }
  if (typeof data?.answer !== "string" || !data.answer.trim()) {
    throw new Error("The AI API returned no answer. Check the server logs.");
  }
  return data;
}

function inlineMarkdown(text, keyPrefix) {
  return String(text)
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={key}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
}

function markdownBlockStart(line) {
  const value = line.trimStart();
  return (
    !value ||
    value.startsWith("```") ||
    /^#{1,6}\s/.test(value) ||
    /^>\s?/.test(value) ||
    /^\d+\.\s+/.test(value) ||
    /^[-*]\s+/.test(value)
  );
}

function MarkdownMessage({ content }) {
  const lines = String(content || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const rawLine = lines[cursor];
    const line = rawLine.trimStart();
    if (!line) {
      cursor += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      cursor += 1;
      while (cursor < lines.length && !lines[cursor].trimStart().startsWith("```")) {
        code.push(lines[cursor].replace(/^\s{0,3}/, ""));
        cursor += 1;
      }
      if (cursor < lines.length) cursor += 1;
      blocks.push(
        <pre key={`code-${blocks.length}`}>
          {language && <span>{language}</span>}
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const Heading = `h${Math.min(heading[1].length + 2, 6)}`;
      blocks.push(
        <Heading key={`heading-${blocks.length}`}>
          {inlineMarkdown(heading[2], `heading-${blocks.length}`)}
        </Heading>,
      );
      cursor += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (cursor < lines.length && /^>\s?/.test(lines[cursor].trimStart())) {
        quote.push(lines[cursor].trimStart().replace(/^>\s?/, ""));
        cursor += 1;
      }
      blocks.push(
        <blockquote key={`quote-${blocks.length}`}>
          {quote.map((value, index) => (
            <p key={`quote-${index}`}>{inlineMarkdown(value, `quote-${index}`)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    const ordered = line.match(/^(\d+)\.\s+(.+)$/);
    if (ordered) {
      const items = [];
      const start = Number(ordered[1]);
      while (cursor < lines.length) {
        const item = lines[cursor].trimStart().match(/^(\d+)\.\s+(.+)$/);
        if (!item) break;
        const itemLines = [item[2]];
        cursor += 1;
        while (
          cursor < lines.length &&
          lines[cursor].trim() &&
          !markdownBlockStart(lines[cursor])
        ) {
          itemLines.push(lines[cursor].trim());
          cursor += 1;
        }
        items.push(itemLines.join(" "));
        while (cursor < lines.length && !lines[cursor].trim()) cursor += 1;
      }
      blocks.push(
        <ol key={`ordered-${blocks.length}`} start={start}>
          {items.map((item, index) => (
            <li key={`ordered-item-${index}`}>
              {inlineMarkdown(item, `ordered-item-${index}`)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (cursor < lines.length) {
        const item = lines[cursor].trimStart().match(/^[-*]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        cursor += 1;
      }
      blocks.push(
        <ul key={`unordered-${blocks.length}`}>
          {items.map((item, index) => (
            <li key={`unordered-item-${index}`}>
              {inlineMarkdown(item, `unordered-item-${index}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraph = [line];
    cursor += 1;
    while (cursor < lines.length && !markdownBlockStart(lines[cursor])) {
      paragraph.push(lines[cursor].trim());
      cursor += 1;
    }
    blocks.push(
      <p key={`paragraph-${blocks.length}`}>
        {inlineMarkdown(paragraph.join(" "), `paragraph-${blocks.length}`)}
      </p>,
    );
  }

  return <div className="chat-markdown">{blocks}</div>;
}

export default function GuideChat({ apiBase, language, onOpenAuth, session, t }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const submit = async (event, suggestedQuestion) => {
    event?.preventDefault();
    const content = String(suggestedQuestion || question).trim();
    if (!content || busy || !session?.access_token) return;

    const userMessage = { role: "user", content };
    const requestMessages = [...messages, userMessage].map(({ role, content: text }) => ({
      role,
      content: text,
    }));
    setMessages((items) => [...items, userMessage]);
    setQuestion("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language, messages: requestMessages }),
      });
      const data = await readChatResponse(response);
      setMessages((items) => [
        ...items,
        { role: "assistant", content: data.answer, sources: data.sources || [] },
      ]);
    } catch (requestError) {
      setError(
        requestError?.message ||
          t("The guide assistant is unavailable.", "Guide assistant ကို အသုံးမပြုနိုင်သေးပါ"),
      );
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [
    t("How should I start a feature branch?", "Feature branch ကို ဘယ်လိုစရမလဲ"),
    t("What should I do before a pull request?", "Pull request မတင်ခင် ဘာလုပ်ရမလဲ"),
  ];

  return (
    <aside className={`guide-chat ${open ? "open" : ""}`}>
      {open && (
        <section className="guide-chat-panel" aria-label={t("learnGit AI helper", "learnGit AI အကူ")}>
          <header>
            <span>
              <Bot size={18} />
            </span>
            <div>
              <strong>{t("Ask learnGit", "learnGit ကို မေးမယ်")}</strong>
              <small>
                <i />
                {t("Guide content only", "Guide အချက်အလက်များသာ")}
              </small>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t("Close chat", "Chat ပိတ်မယ်")}>
              <X size={17} />
            </button>
          </header>

          <div className="guide-chat-messages" ref={messagesRef}>
            <div className="chat-message assistant">
              <span><Bot size={14} /></span>
              <div>
                {t(
                  "Hi! Ask me about a Git workflow in this guide. I’ll only use learnGit’s lessons and examples.",
                  "မင်္ဂလာပါ ဒီ guide ထဲက Git workflow ကို မေးပါ learnGit သင်ခန်းစာနဲ့ ဥပမာများကိုသာ သုံးပြီး ဖြေပေးမယ်",
                )}
              </div>
            </div>

            {!session && (
              <div className="chat-sign-in">
                <LogIn size={21} />
                <strong>{t("Sign in to ask questions", "မေးခွန်းမေးရန် အကောင့်ဝင်ပါ")}</strong>
                <p>
                  {t(
                    "Signing in protects the shared AI helper from misuse.",
                    "အကောင့်ဝင်ခြင်းက AI helper ကို မသင့်တော်စွာ အသုံးပြုမှုမှ ကာကွယ်ပေးသည်",
                  )}
                </p>
                <button className="primary-button" onClick={onOpenAuth}>
                  {t("Sign in", "ဝင်မယ်")}
                </button>
              </div>
            )}

            {session && messages.length === 0 && (
              <div className="chat-suggestions">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} onClick={(event) => submit(event, suggestion)}>
                    <BookOpenCheck size={14} />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) => (
              <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" && <span><Bot size={14} /></span>}
                <div>
                  {message.role === "assistant" ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <p>{message.content}</p>
                  )}
                  {message.sources?.length > 0 && (
                    <div className="chat-sources">
                      {message.sources.map((source) => (
                        <span key={source.id}>{source.title}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="chat-message assistant thinking">
                <span><Bot size={14} /></span>
                <div>
                  <LoaderCircle className="spinning" size={15} />
                  {t("Checking the guide…", "Guide ကို ရှာနေသည်…")}
                </div>
              </div>
            )}
            {error && <div className="chat-error" role="alert">{error}</div>}
          </div>

          <form className="guide-chat-form" onSubmit={submit}>
            <textarea
              aria-label={t("Ask a Git question", "Git မေးခွန်းမေးမယ်")}
              disabled={!session || busy}
              maxLength={1200}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit(event);
                }
              }}
              placeholder={t("Ask about a Git workflow…", "Git workflow ကို မေးပါ…")}
              rows={1}
              value={question}
            />
            <button disabled={!session || busy || !question.trim()} aria-label={t("Send", "ပို့မယ်")}>
              <Send size={16} />
            </button>
          </form>
          <footer>
            {t(
              "Answers are generated from this website’s content only.",
              "ဒီ website ရဲ့ အချက်အလက်များမှသာ အဖြေထုတ်ပေးသည်",
            )}
          </footer>
        </section>
      )}

      <button
        className="guide-chat-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? t("Close AI helper", "AI အကူ ပိတ်မယ်") : t("Ask AI about Git", "Git အကြောင်း AI ကို မေးမယ်")}
      >
        {open ? <X size={20} /> : <Bot size={22} />}
        {!open && <span>{t("Ask AI", "AI ကိုမေး")}</span>}
      </button>
    </aside>
  );
}
