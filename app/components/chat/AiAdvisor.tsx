"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 14px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--text3)",
          animation: `aiDot 1.2s ${i * 0.2}s ease-in-out infinite`,
          display: "inline-block",
        }} />
      ))}
    </div>
  );
}

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} style={{ background: "var(--bg4)", padding: "1px 5px", borderRadius: 4, fontFamily: "'Space Mono',monospace", fontSize: 11 }}>{part.slice(1, -1)}</code>;
    if (part === "\n")
      return <br key={i} />;
    return part;
  });
}

export function AiAdvisor() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [busy,     setBusy]     = useState(false);
  const [typing,   setTyping]   = useState(false);
  const messagesRef             = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg].slice(-20);
    setMessages(history);
    setInput("");
    setBusy(true);
    setTyping(true);

    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = data.reply ?? data.error ?? "Something went wrong.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setBusy(false);
      setTyping(false);
    }
  }, [input, busy, messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  }

  const showWelcome = messages.length === 0 && !typing;

  return (
    <>
      <style>{`
        @keyframes aiDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: .4; }
          40%            { transform: scale(1);   opacity: 1;  }
        }
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Stock AI Advisor"
        style={{
          position:     "fixed",
          bottom:       24,
          right:        24,
          zIndex:       300,
          width:        54,
          height:       54,
          borderRadius: "50%",
          background:   open
            ? "var(--bg3)"
            : "linear-gradient(135deg,var(--gold),#f0c870)",
          border:       open ? "1px solid var(--border2)" : "none",
          cursor:       "pointer",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          fontSize:     22,
          color:        open ? "var(--text3)" : "#07070f",
          boxShadow:    open ? "none" : "0 4px 20px rgba(212,168,67,.35)",
          transition:   "transform .2s, box-shadow .2s, background .2s",
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        {open ? "×" : "✦"}
      </button>

      {/* Chat panel */}
      <div style={{
        position:      "fixed",
        bottom:        90,
        right:         24,
        zIndex:        300,
        width:         370,
        height:        520,
        background:    "var(--bg2)",
        border:        "1px solid var(--border2)",
        borderRadius:  "var(--radius)",
        display:       "flex",
        flexDirection: "column",
        boxShadow:     "0 12px 48px rgba(0,0,0,.65)",
        transform:     open ? "translateY(0) scale(1)" : "translateY(16px) scale(.97)",
        opacity:       open ? 1 : 0,
        pointerEvents: open ? "all" : "none",
        transition:    "transform .22s ease, opacity .22s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "conic-gradient(from 180deg, var(--gold), #9b72cf, var(--gold))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>✦</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Stock AI Advisor</div>
            <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>POWERED BY CLAUDE HAIKU</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 20, padding: "2px 6px", borderRadius: 5, lineHeight: 1 }}
          >×</button>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
        >
          {showWelcome && (
            <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--text3)", fontSize: 12.5, lineHeight: 1.7 }}>
              <div style={{ fontSize: 32, marginBottom: 10, opacity: .6 }}>✦</div>
              <strong style={{ color: "var(--text2)" }}>Your personal stock advisor</strong><br />
              Ask me anything about stocks, your portfolio, market trends, or investment strategies.
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%",
                padding: "9px 13px",
                borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                background: msg.role === "user" ? "var(--gold)" : "var(--bg3)",
                color: msg.role === "user" ? "#07070f" : "var(--text)",
                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                fontSize: 13,
                lineHeight: 1.55,
              }}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {typing && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "12px 12px 12px 3px" }}>
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8, padding: "12px 14px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any stock or your portfolio…"
            rows={1}
            style={{
              flex: 1, background: "var(--bg3)", border: "1.5px solid var(--border2)",
              color: "var(--text)", padding: "9px 12px", borderRadius: 9,
              fontSize: 13, fontFamily: "'Space Grotesk',sans-serif",
              resize: "none", outline: "none", maxHeight: 100, minHeight: 38,
              lineHeight: 1.4, transition: "border-color .2s",
            }}
            onFocus={e  => (e.target.style.borderColor = "var(--gold)")}
            onBlur={e   => (e.target.style.borderColor = "var(--border2)")}
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            style={{
              padding: "9px 14px", borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg,var(--gold),#f0c870)",
              color: "#07070f", border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13, fontFamily: "'Space Grotesk',sans-serif",
              opacity: (busy || !input.trim()) ? 0.4 : 1,
              alignSelf: "flex-end", transition: "opacity .15s",
            }}
          >Send</button>
        </div>
      </div>
    </>
  );
}
