"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────── types ─────────────────────────── */
type Role = "user" | "ai";

interface Message {
    id: string;
    role: Role;
    text: string;
    ts: Date;
}

/* ─────────────────────────── constants ──────────────────────── */
const STARTER_PROMPTS = [
    "What clauses should I watch in an NDA?",
    "How do I analyse my contract?",
    "Is my non-compete enforceable?",
    "Summarise risks in an employment contract",
];

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

/* ─────────────────────────── component ─────────────────────── */
export default function AIChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: uid(),
            role: "ai",
            text: "👋 Hi! I'm AICounsel. Ask me anything about contracts, how to use the platform, or upload a document for a full AI analysis.",
            ts: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    /* auto-scroll to bottom */
    const scrollToBottom = useCallback(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        if (open) {
            setHasUnread(false);
            setTimeout(scrollToBottom, 50);
            setTimeout(() => inputRef.current?.focus(), 120);
        }
    }, [open, scrollToBottom]);

    useEffect(scrollToBottom, [messages, scrollToBottom]);

    /* send message → real Groq API */
    const send = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;

            const userMsg: Message = { id: uid(), role: "user", text: trimmed, ts: new Date() };
            setMessages((m) => [...m, userMsg]);
            setInput("");
            setTyping(true);

            try {
                // Build conversation history for the API (exclude the initial greeting)
                const history = [...messages, userMsg]
                    .filter((m) => m.id !== messages[0]?.id || messages[0]?.role !== "ai")
                    .map((m) => ({
                        role: m.role === "ai" ? "assistant" : "user",
                        content: m.text,
                    }));

                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: history }),
                });

                const data = await res.json();
                const replyText = res.ok
                    ? data.reply
                    : data.error ?? "Something went wrong. Please try again.";

                const aiMsg: Message = { id: uid(), role: "ai", text: replyText, ts: new Date() };
                setMessages((m) => [...m, aiMsg]);
                if (!open) setHasUnread(true);
            } catch {
                const aiMsg: Message = {
                    id: uid(),
                    role: "ai",
                    text: "⚠️ I couldn't reach the server right now. Please try again in a moment.",
                    ts: new Date(),
                };
                setMessages((m) => [...m, aiMsg]);
            } finally {
                setTyping(false);
            }
        },
        [messages, open]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    /* ────────────────────── render ────────────────────── */
    return (
        <>
            {/* ── Floating trigger button ── */}
            <button
                id="ai-chat-trigger"
                aria-label={open ? "Close AI chat" : "Open AI chat"}
                onClick={() => setOpen((v) => !v)}
                className={`fixed bottom-7 right-7 z-[60] w-14 h-14 border-2 border-charcoal brutal-shadow flex items-center justify-center transition-all duration-200 group
                    ${open ? "bg-charcoal hover:bg-charcoal/80" : "bg-golden hover:bg-charcoal hover:text-golden"}
                    hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}
            >
                {/* unread dot */}
                {hasUnread && !open && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-charcoal border-2 border-white rounded-full animate-bounce" />
                )}

                {/* icon: chat ↔ close */}
                {open ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" className="text-white">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" className="text-charcoal group-hover:text-golden transition-colors">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>

            {/* ── Chat panel ── */}
            <div
                role="dialog"
                aria-label="AI Chat assistant"
                aria-modal="false"
                className={`fixed bottom-28 right-7 z-[59] w-[min(380px,calc(100vw-2rem))] border-4 border-charcoal bg-white brutal-shadow
                    flex flex-col overflow-hidden
                    transition-all duration-300 ease-in-out origin-bottom-right
                    ${open
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 translate-y-3 pointer-events-none"
                    }`}
                style={{ maxHeight: "min(520px, calc(100dvh - 9rem))" }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b-4 border-charcoal bg-charcoal text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-golden animate-pulse" />
                        <span className="font-anton text-lg uppercase tracking-wide">AICounsel Chat</span>
                    </div>
                    <button
                        aria-label="Close chat"
                        onClick={() => setOpen(false)}
                        className="font-satoshi text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-golden transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* ── Message list ── */}
                <div
                    ref={listRef}
                    id="ai-chat-messages"
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
                    style={{ overscrollBehavior: "contain" }}
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`shrink-0 w-7 h-7 border-2 border-charcoal flex items-center justify-center font-anton text-[10px] uppercase
                                    ${msg.role === "ai" ? "bg-golden text-charcoal" : "bg-charcoal text-golden"}`}
                            >
                                {msg.role === "ai" ? "AI" : "U"}
                            </div>

                            {/* Bubble */}
                            <div
                                className={`max-w-[80%] px-3.5 py-2.5 border-2 border-charcoal font-satoshi text-sm leading-relaxed whitespace-pre-wrap
                                    ${msg.role === "ai"
                                        ? "bg-white text-charcoal"
                                        : "bg-golden text-charcoal brutal-shadow-sm"
                                    }`}
                            >
                                {msg.text}
                                <div className="mt-1 font-satoshi text-[9px] font-black uppercase tracking-widest opacity-30">
                                    {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {typing && (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 border-2 border-charcoal bg-golden flex items-center justify-center font-anton text-[10px]">AI</div>
                            <div className="flex items-center gap-1.5 px-3.5 py-3 border-2 border-charcoal bg-white">
                                {[0, 0.18, 0.36].map((delay) => (
                                    <span
                                        key={delay}
                                        className="block w-1.5 h-1.5 bg-charcoal/50 rounded-full animate-bounce"
                                        style={{ animationDelay: `${delay}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Starter prompts ── */}
                {messages.length <= 1 && !typing && (
                    <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
                        {STARTER_PROMPTS.map((p) => (
                            <button
                                key={p}
                                onClick={() => send(p)}
                                className="font-satoshi text-[10px] font-black uppercase tracking-widest border-2 border-charcoal px-2.5 py-1.5 hover:bg-golden transition-colors text-charcoal/70 hover:text-charcoal"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Input area ── */}
                <div className="px-4 pb-4 pt-2 border-t-2 border-charcoal/20 shrink-0">
                    <div className="flex items-end gap-2 border-2 border-charcoal focus-within:border-charcoal focus-within:brutal-shadow-sm transition-all">
                        <textarea
                            ref={inputRef}
                            id="ai-chat-input"
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your contract or the platform…"
                            aria-label="Chat input"
                            className="flex-1 resize-none bg-transparent px-3.5 py-3 font-satoshi text-sm text-charcoal placeholder:text-charcoal/30 outline-none leading-snug"
                            style={{ maxHeight: "96px" }}
                        />
                        <button
                            id="ai-chat-send"
                            aria-label="Send message"
                            disabled={!input.trim() || typing}
                            onClick={() => send(input)}
                            className="shrink-0 m-1.5 w-9 h-9 border-2 border-charcoal bg-golden text-charcoal flex items-center justify-center
                                hover:bg-charcoal hover:text-golden transition-all
                                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-golden disabled:hover:text-charcoal"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z" />
                            </svg>
                        </button>
                    </div>
                    <p className="mt-1.5 font-satoshi text-[9px] font-black uppercase tracking-widest text-charcoal/25 text-center">
                        Enter ↵ to send · Shift+Enter for new line
                    </p>
                </div>
            </div>
        </>
    );
}
