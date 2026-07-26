import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { LoaderCircle, LogIn, WifiOff } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const SANDBOX_URL = (import.meta.env.VITE_SANDBOX_URL || "").replace(/\/$/, "");
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function readableConnectionError(error, t) {
  let sandboxHost = "";
  try {
    sandboxHost = new URL(SANDBOX_URL).hostname;
  } catch {
    return t("The Sandbox Worker URL is invalid.", "Sandbox Worker URL မမှန်ပါ");
  }

  const browserHost = window.location.hostname;
  if (
    (sandboxHost === "localhost" || sandboxHost === "127.0.0.1") &&
    browserHost !== "localhost" &&
    browserHost !== "127.0.0.1"
  ) {
    return t(
      "This deployment still points to a local Sandbox Worker. Configure the production Worker URL and rebuild.",
      "ဒီ deployment က local Sandbox Worker ကိုညွှန်နေသည် Production Worker URL သတ်မှတ်ပြီး rebuild လုပ်ပါ",
    );
  }

  if (error?.name === "AbortError") {
    return t(
      "The Sandbox Worker took too long to respond.",
      "Sandbox Worker တုံ့ပြန်ချိန်ကြာလွန်းသည်",
    );
  }

  if (error instanceof TypeError) {
    return t(
      "The Sandbox Worker could not be reached. Check that it is deployed, allows this website origin, and has Containers enabled.",
      "Sandbox Worker ကို မချိတ်ဆက်နိုင်ပါ Deploy လုပ်ထားမှု website origin ခွင့်ပြုမှုနဲ့ Containers ဖွင့်ထားမှုကို စစ်ပါ",
    );
  }

  return error?.message || t("Unable to connect", "ချိတ်ဆက်၍မရပါ");
}

function websocketUrl(ticket) {
  const url = new URL(`${SANDBOX_URL}/ws/terminal`);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("ticket", ticket);
  return url.toString();
}

const SandboxTerminal = forwardRef(function SandboxTerminal(
  { initialCommand, onOpenAuth, onStatusChange, session, t },
  ref,
) {
  const hostRef = useRef(null);
  const socketRef = useRef(null);
  const terminalRef = useRef(null);
  const pendingCommandRef = useRef(initialCommand || "");
  const retryTimerRef = useRef(null);
  const [retryKey, setRetryKey] = useState(0);
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState("");

  const updateStatus = useCallback((nextStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  }, [onStatusChange]);

  useEffect(() => {
    if (initialCommand) pendingCommandRef.current = initialCommand;
  }, [initialCommand]);

  useImperativeHandle(ref, () => ({
    clear() {
      terminalRef.current?.clear();
      terminalRef.current?.focus();
    },
    run(command) {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(encoder.encode(`${command}\r`));
        terminalRef.current?.focus();
      } else {
        pendingCommandRef.current = command;
        setRetryKey((value) => value + 1);
      }
    },
  }));

  useEffect(() => {
    if (!session?.access_token || !SANDBOX_URL || !hostRef.current) return undefined;

    let disposed = false;
    let reconnectAttempts = 0;
    const terminal = new Terminal({
      allowTransparency: true,
      convertEol: true,
      cursorBlink: true,
      cursorStyle: "bar",
      fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      fontSize: window.innerWidth < 600 ? 11 : 13,
      lineHeight: 1.35,
      rightClickSelectsWord: true,
      scrollback: 5000,
      theme: {
        background: "#090b09",
        black: "#171a18",
        blue: "#64a8ff",
        brightBlack: "#69736c",
        brightBlue: "#8dc0ff",
        brightCyan: "#7ce9df",
        brightGreen: "#65f49a",
        brightMagenta: "#d9a2ff",
        brightRed: "#ff8e8e",
        brightWhite: "#ffffff",
        brightYellow: "#ffe391",
        cursor: "#4ade80",
        cyan: "#55d7cc",
        foreground: "#dce4de",
        green: "#4ade80",
        magenta: "#c47bea",
        red: "#ef6969",
        selectionBackground: "rgba(74, 222, 128, 0.25)",
        white: "#dce4de",
        yellow: "#e8c96b",
      },
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(hostRef.current);
    terminalRef.current = terminal;

    const fit = () => {
      try {
        fitAddon.fit();
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({ type: "resize", cols: terminal.cols, rows: terminal.rows }),
          );
        }
      } catch {
        // The terminal can be between mount and layout during responsive navigation.
      }
    };

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(hostRef.current);
    const inputSubscription = terminal.onData((data) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(encoder.encode(data));
      }
    });

    const connect = async () => {
      if (disposed) return;
      updateStatus("connecting");
      setError("");
      terminal.writeln(
        `\x1b[38;2;74;222;128m${t("Connecting to your isolated workspace…", "သီးသန့် workspace ကို ချိတ်ဆက်နေသည်…")}\x1b[0m`,
      );

      try {
        const controller = new AbortController();
        const requestTimeout = window.setTimeout(() => controller.abort(), 20_000);
        let ticketResponse;
        try {
          ticketResponse = await fetch(`${SANDBOX_URL}/api/terminal/session`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(requestTimeout);
        }

        const contentType = ticketResponse.headers.get("Content-Type") || "";
        const payload = contentType.includes("application/json")
          ? await ticketResponse.json()
          : {};
        if (!ticketResponse.ok || !payload.ticket) {
          throw new Error(
            payload.error ||
              t(
                `Sandbox service returned ${ticketResponse.status}.`,
                `Sandbox service မှ ${ticketResponse.status} ပြန်လာသည်`,
              ),
          );
        }
        if (disposed) return;

        const socket = new WebSocket(websocketUrl(payload.ticket));
        socket.binaryType = "arraybuffer";
        socketRef.current = socket;

        socket.addEventListener("open", () => {
          reconnectAttempts = 0;
        });
        socket.addEventListener("message", (event) => {
          if (event.data instanceof ArrayBuffer) {
            terminal.write(decoder.decode(event.data));
            return;
          }

          try {
            const message = JSON.parse(event.data);
            if (message.type === "ready") {
              updateStatus("connected");
              fit();
              const pendingCommand = pendingCommandRef.current;
              if (pendingCommand) {
                pendingCommandRef.current = "";
                socket.send(encoder.encode(`${pendingCommand}\r`));
              }
            } else if (message.type === "exit") {
              updateStatus("disconnected");
              terminal.writeln(`\r\n[terminal exited with code ${message.code ?? "unknown"}]`);
            } else if (message.type === "error") {
              setError(message.message || "Terminal error");
            }
          } catch {
            terminal.write(event.data);
          }
        });
        socket.addEventListener("close", () => {
          if (disposed) return;
          updateStatus("disconnected");
          reconnectAttempts += 1;
          const delay = Math.min(1000 * 2 ** (reconnectAttempts - 1), 15_000);
          retryTimerRef.current = window.setTimeout(connect, delay);
        });
        socket.addEventListener("error", () => {
          setError(t("The terminal connection was interrupted.", "Terminal ချိတ်ဆက်မှု ပြတ်တောက်သွားသည်"));
        });
      } catch (connectionError) {
        if (disposed) return;
        updateStatus("error");
        setError(readableConnectionError(connectionError, t));
      }
    };

    fit();
    connect();

    return () => {
      disposed = true;
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
      resizeObserver.disconnect();
      inputSubscription.dispose();
      socketRef.current?.close();
      socketRef.current = null;
      terminalRef.current = null;
      terminal.dispose();
    };
  }, [retryKey, session?.access_token, t, updateStatus]);

  if (!SANDBOX_URL) {
    return (
      <div className="terminal-gate">
        <WifiOff size={24} />
        <strong>{t("Sandbox URL is not configured", "Sandbox URL မသတ်မှတ်ရသေးပါ")}</strong>
        <p>Set VITE_SANDBOX_URL to the deployed Sandbox Worker URL.</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="terminal-gate">
        <LogIn size={24} />
        <strong>{t("Sign in to start a real sandbox", "Sandbox အစစ်ကိုသုံးရန် အကောင့်ဝင်ပါ")}</strong>
        <p>
          {t(
            "Your account keeps this isolated workspace separate from other learners.",
            "သင့်အကောင့်က ဒီ workspace ကို အခြားလေ့လာသူများနဲ့ သီးခြားထားပေးသည်",
          )}
        </p>
        <button className="primary-button" onClick={onOpenAuth}>
          {t("Sign in", "ဝင်မယ်")}
        </button>
      </div>
    );
  }

  return (
    <div className="sandbox-terminal-shell">
      <div className="xterm-host" ref={hostRef} onClick={() => terminalRef.current?.focus()} />
      {(status === "connecting" || error) && (
        <div className={`terminal-connection-toast ${error ? "error" : ""}`}>
          {status === "connecting" && <LoaderCircle className="spinning" size={14} />}
          <span>{error || t("Starting sandbox…", "Sandbox စတင်နေသည်…")}</span>
          {error && (
            <button onClick={() => setRetryKey((value) => value + 1)}>
              {t("Retry", "ထပ်စမ်းမယ်")}
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default SandboxTerminal;
