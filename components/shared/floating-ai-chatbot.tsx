"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, User, X, Send, Minimize2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function FloatingAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! How can I help with your study, coding, or tasks today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Math.random().toString(), role: "user", content: input.trim() };
    const newMessages = [...messages.filter((m) => m.id !== "welcome"), userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const botMessageId = Math.random().toString();
    const savedKey = localStorage.getItem("studentos_gemini_key") || localStorage.getItem("studentos_openai_key") || "";

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          apiKey: savedKey,
          provider: "gemini",
          model: "gemini-2.5-flash",
          mode: "general",
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setMessages((prev) => [...prev, { id: botMessageId, role: "assistant", content: "" }]);
      setLoading(false);

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === botMessageId ? { ...m, content: fullContent } : m))
        );
      }
    } catch (_e) {
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: "assistant",
          content: "I am ready to assist! Ask me any questions about your tasks, coding, or study timetable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-3.5 py-2.5 rounded-full shadow-lg border border-border text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              <span>StudentOS AI</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 h-[460px] bg-background/95 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-3 border-b bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold flex items-center gap-1">
                    StudentOS AI Copilot
                  </h3>
                  <span className="text-[9px] text-emerald-500 font-semibold block">● Online (Google AI Studio Gemini Powered)</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2 max-w-[85%]",
                    m.role === "assistant" ? "self-start" : "self-end ml-auto flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-2xl shadow-sm border",
                      m.role === "assistant"
                        ? "bg-card text-card-foreground"
                        : "bg-indigo-600 text-white border-transparent"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 max-w-[80%]">
                  <div className="bg-card rounded-2xl p-2.5 border text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-2 border-t bg-card flex gap-1.5 items-center">
              <Input
                placeholder="Ask StudentOS AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-8 text-xs border-0 focus-visible:ring-0 bg-muted/50"
              />
              <Button
                type="submit"
                size="sm"
                className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shrink-0"
                disabled={loading || !input.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
