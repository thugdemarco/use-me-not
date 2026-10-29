import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export function RoastChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending, open]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || pending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setDraft("");
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/groq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      const result = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !result.reply) {
        throw new Error(result.error || "The oracle has misplaced its thoughts.");
      }
      setMessages((current) => [...current, { role: "assistant", content: result.reply! }]);
    } catch (cause) {
      setError((cause as Error).message || "The roast engine is unavailable.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="roast-chat">
      {open && (
        <section className="roast-panel" aria-label="Use-Me-Not chatbot">
          <header className="roast-header">
            <div>
              <span className="eyebrow">USE-ME-NOT / ADVICE DEPARTMENT</span>
              <strong>The Unhelpful One</strong>
            </div>
            <button type="button" className="roast-close" aria-label="Close chat" onClick={() => setOpen(false)}>
              <X size={17} />
            </button>
          </header>
          <div className="roast-messages" aria-live="polite" aria-relevant="additions text">
            <div className="roast-message assistant-message">
              Welcome. Ask me anything and I will make you wish you had simply carried on.
            </div>
            {messages.map((message, index) => (
              <div className={`roast-message ${message.role === "user" ? "user-message" : "assistant-message"}`} key={`${index}-${message.role}`}>
                {message.content}
              </div>
            ))}
            {pending && <div className="roast-message assistant-message roast-thinking">Preparing a disappointing opinion…</div>}
            {error && <p className="roast-error" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>
          <form className="roast-form" onSubmit={(event) => void send(event)}>
            <label className="sr-only" htmlFor="roast-question">Ask a question</label>
            <textarea
              id="roast-question"
              rows={1}
              maxLength={1200}
              placeholder="Ask something. Regret it later."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              disabled={pending}
            />
            <button type="submit" aria-label="Send question" disabled={!draft.trim() || pending}>
              <Send size={16} />
            </button>
          </form>
          <p className="roast-footnote">Answers are intentionally unhelpful. Your question may be judged.</p>
        </section>
      )}
      <button
        type="button"
        className={`roast-launcher${open ? " is-open" : ""}`}
        aria-label={open ? "Close unhelpful chat" : "Open unhelpful chat"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span>{open ? "Close" : "Ask nothing"}</span>
      </button>
    </div>
  );
}
