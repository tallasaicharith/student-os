"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, User, Bot, Paperclip, FileText, Trash2, Key,
  BookOpen, Code, Lightbulb, Check, Copy, Download, HelpCircle,
  Briefcase, Calendar, Terminal, FileCheck, RefreshCw, Cpu, StopCircle, RotateCcw,
  Zap, Award, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MODEL_REGISTRY } from "@/lib/ai/models.config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string }[];
}

type ProviderType = "gemini" | "openai" | "claude" | "groq" | "deepseek";

const BADGE_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  FAST: "secondary",
  BALANCED: "outline",
  POWERFUL: "default",
  REASONING: "destructive",
  VISION: "secondary",
};

const AI_MODES = [
  { id: "general", label: "💬 General AI", icon: Sparkles, prompt: "What pending tasks should I focus on today based on my StudentOS goals?" },
  { id: "explain", label: "🎓 Concept Explainer", icon: Lightbulb, prompt: "Explain the difference between Dynamic Programming and Greedy Algorithms with real-world code examples." },
  { id: "code_review", label: "💻 Code Reviewer", icon: Code, prompt: "Review my C++ code for bugs, edge cases, and O(N) time/space complexity:\n\n```cpp\n#include <vector>\n#include <iostream>\n\nint findMax(const std::vector<int>& arr) {\n  int maxVal = arr[0];\n  for(size_t i=1; i<arr.size(); i++) {\n    if(arr[i] > maxVal) maxVal = arr[i];\n  }\n  return maxVal;\n}\n```" },
  { id: "study_plan", label: "📅 Study Plan Builder", icon: Calendar, prompt: "Build a personalized 7-day intensive study schedule based on my active tasks and subjects." },
  { id: "resume_review", label: "📄 ATS Resume Reviewer", icon: FileCheck, prompt: "Analyze my active StudentOS projects and write 3 high-impact, ATS-optimized bullet points." },
  { id: "mock_interview", label: "⚡ Mock Interviewer", icon: Briefcase, prompt: "Start a technical mock interview. Ask me one question at a time suitable for a Software Engineer role." },
  { id: "quiz_gen", label: "🧪 Exam Quiz Generator", icon: HelpCircle, prompt: "Generate 5 multiple-choice questions on Operating Systems (Process Scheduling & Deadlocks)." },
];

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  
  const [provider, setProvider] = useState<ProviderType>("gemini");
  const [modelName, setModelName] = useState("gemini-2.0-flash");
  const [selectedMode, setSelectedMode] = useState("general");
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProvider = localStorage.getItem("studentos_ai_provider") as ProviderType;
    const savedModel = localStorage.getItem("studentos_ai_model");
    const savedChat = localStorage.getItem("studentos_chat_history");

    if (savedProvider) setProvider(savedProvider);
    if (savedModel) setModelName(savedModel);

    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (_e) {}
    }

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your **StudentOS Multi-Model AI Copilot**. I support real-time token streaming, multi-provider model routing (Gemini, GPT-4o, Claude 3.5, DeepSeek R1), and specialized study tools. How can I assist you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("studentos_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, streaming]);

  const handleStopStream = () => {
    if (abortController) {
      abortController.abort();
      setStreaming(false);
      setLoading(false);
      toast.info("Generation stopped by user");
    }
  };

  const handleClearChat = () => {
    const defaultMsg: Message[] = [
      {
        id: Math.random().toString(),
        role: "assistant",
        content: "Chat cleared! Ask me anything about your active tasks, projects, or study plans.",
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(defaultMsg);
    localStorage.removeItem("studentos_chat_history");
    toast.success("All chat history cleared");
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.success("Message deleted");
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;

    const chatMarkdown = messages
      .map(
        (m) =>
          `### ${m.role === "user" ? "👤 Student" : "🤖 AI Mentor"} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.content}\n`
      )
      .join("\n---\n\n");

    const blob = new Blob([chatMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StudentOS_AI_Mentor_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported chat session to Markdown file! 📄");
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() && files.length === 0) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: promptToSend,
      timestamp: new Date().toISOString(),
      attachments: files.length > 0 ? [...files] : undefined,
    };

    const botMessageId = Math.random().toString();
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setFiles([]);
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          provider,
          model: modelName,
          mode: selectedMode,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("API request failed");

      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      setStreaming(true);

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        streamedContent += text;

        setMessages((prev) =>
          prev.map((m) => (m.id === botMessageId ? { ...m, content: streamedContent } : m))
        );
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Failed to connect to AI Mentor");
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      setAbortController(null);
    }
  };

  const currentModelConfig = MODEL_REGISTRY[modelName];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto space-y-3">
      {/* Top Header & Model Capabilities Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            StudentOS AI Mentor Copilot
          </h1>
          <p className="text-xs text-muted-foreground">Multi-Model AI Platform (Google Gemini, OpenAI, Claude 3.5, DeepSeek, Groq)</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {currentModelConfig && (
            <div className="flex items-center gap-1.5 hidden md:flex">
              {currentModelConfig.capabilities.map((cap) => (
                <Badge key={cap} variant={BADGE_COLORS[cap] || "outline"} className="text-[10px] font-bold">
                  {cap}
                </Badge>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportChat}>
            <Download className="w-3.5 h-3.5" /> Export (.md)
          </Button>

          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive" onClick={handleClearChat}>
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </Button>

          {/* Key & Model Selector Dialog */}
          <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-indigo-500/5 border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/10">
                <Cpu className="w-3.5 h-3.5" /> {currentModelConfig?.name || modelName}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-500" /> Select AI Model Architecture
                </DialogTitle>
                <DialogDescription>
                  Switch between specialized AI provider models and capability tiers.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Provider Engine</label>
                  <Select value={provider} onValueChange={(val) => {
                    const p = val as ProviderType;
                    setProvider(p);
                    if (p === "gemini") setModelName("gemini-2.0-flash");
                    else if (p === "openai") setModelName("gpt-4o-mini");
                    else if (p === "claude") setModelName("claude-3-5-sonnet-20241022");
                    else setModelName("llama-3.3-70b-versatile");
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="claude">Anthropic Claude</SelectItem>
                      <SelectItem value="groq">Groq / DeepSeek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Model Version</label>
                  <Select value={modelName} onValueChange={setModelName}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(MODEL_REGISTRY)
                        .filter((m) => m.provider === provider)
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} ({m.speed})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentModelConfig && (
                  <div className="p-3 bg-muted/40 border rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reasoning Score:</span>
                      <span className="font-bold text-indigo-500">{currentModelConfig.reasoningScore}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Context Window:</span>
                      <span className="font-mono">{(currentModelConfig.contextWindow / 1000).toFixed(0)}k tokens</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      {currentModelConfig.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-[10px]">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={() => {
                  localStorage.setItem("studentos_ai_provider", provider);
                  localStorage.setItem("studentos_ai_model", modelName);
                  setKeyDialogOpen(false);
                  toast.success(`Model switched to ${modelName}`);
                }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                  <Check className="w-4 h-4" /> Apply Model Selection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mode Selection Toolbar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
        {AI_MODES.map((mode) => (
          <Button
            key={mode.id}
            variant={selectedMode === mode.id ? "default" : "outline"}
            size="sm"
            className="text-xs rounded-xl h-8 shrink-0"
            onClick={() => {
              setSelectedMode(mode.id);
              if (mode.prompt && mode.id !== "general") setInput(mode.prompt);
            }}
          >
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Context Action Quick Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] text-muted-foreground">
        <span className="shrink-0 font-semibold self-center">💡 Quick Prompts:</span>
        <button
          type="button"
          onClick={() => handleSend(undefined, "What pending tasks should I focus on today based on my active tasks list?")}
          className="bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-full border shrink-0 text-foreground transition-colors"
        >
          📋 What tasks to do today?
        </button>
        <button
          type="button"
          onClick={() => handleSend(undefined, "Analyze my active projects and suggest what milestone to build next.")}
          className="bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-full border shrink-0 text-foreground transition-colors"
        >
          🛠️ Analyze my active projects
        </button>
        <button
          type="button"
          onClick={() => handleSend(undefined, "Build an exam study plan based on my current subjects and progress.")}
          className="bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-full border shrink-0 text-foreground transition-colors"
        >
          📅 Exam study plan for my subjects
        </button>
      </div>

      {/* Message Chat Pane */}
      <div className="flex-1 overflow-y-auto pr-2 py-3 space-y-4">
        {messages.map((m) => {
          const isAssistant = m.role === "assistant";
          return (
            <div key={m.id} className={cn("flex gap-3 max-w-[90%] group relative", isAssistant ? "self-start" : "self-end ml-auto flex-row-reverse")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 mt-0.5", isAssistant ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-primary/10 text-primary")}>
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="space-y-1 max-w-full overflow-hidden">
                <div className={cn("rounded-2xl p-4 text-sm border shadow-sm relative", isAssistant ? "bg-card text-card-foreground" : "bg-primary text-primary-foreground border-transparent")}>
                  
                  {isAssistant ? (
                    <FormattedMarkdown content={m.content} messageId={m.id} onCopy={handleCopyText} copiedCodeId={copiedCodeId} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}

                  {m.attachments && (
                    <div className="mt-3 space-y-1 pt-2 border-t border-primary-foreground/20">
                      {m.attachments.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs opacity-90">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{f.name}</span>
                          <span className="text-[10px] opacity-70">({f.size})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-2 text-[9px] text-muted-foreground">
                  <span>{new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(m.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity px-1 flex items-center gap-1"
                    title="Delete message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
              <Bot className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="bg-card text-card-foreground rounded-2xl p-4 text-sm border shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Row & Controls */}
      <div className="space-y-2 mt-auto">
        {streaming && (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-destructive border-destructive/30" onClick={handleStopStream}>
              <StopCircle className="w-3.5 h-3.5" /> Stop Generation
            </Button>
          </div>
        )}

        <form onSubmit={(e) => handleSend(e)} className="p-3 bg-card border rounded-2xl flex items-center gap-2 shadow-lg">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.txt,.docx,.js,.ts,.cpp,.py"
            onChange={(e) => {
              if (e.target.files) {
                const fl = Array.from(e.target.files).map(f => ({ name: f.name, size: `${(f.size/1024).toFixed(1)} KB` }));
                setFiles(prev => [...prev, ...fl]);
                toast.success("File attached!");
              }
            }}
            multiple
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            placeholder="Ask any question about your tasks, projects, or study concepts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 bg-transparent text-sm"
          />
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2"
            disabled={loading || streaming}
          >
            <Send className="w-4 h-4 mr-1.5" /> Send
          </Button>
        </form>
      </div>

      {files.length > 0 && (
        <div className="flex gap-2 p-2 flex-wrap">
          {files.map((f, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1.5 py-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function FormattedMarkdown({ content, messageId, onCopy, copiedCodeId }: {
  content: string;
  messageId: string;
  onCopy: (text: string, id: string) => void;
  copiedCodeId: string | null;
}) {
  if (!content) return null;

  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: { type: "code" | "markdown"; content: string; lang?: string }[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "markdown", content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1] || "code", content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "markdown", content: content.slice(lastIndex) });
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.type === "code") {
          const blockId = `${messageId}-code-${pIdx}`;
          return (
            <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                <span className="font-semibold text-indigo-400">{part.lang}</span>
                <button
                  type="button"
                  onClick={() => onCopy(part.content, blockId)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md text-[11px]"
                >
                  {copiedCodeId === blockId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeId === blockId ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-normal text-slate-200">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }

        const lines = part.content.split("\n");
        const renderedBlocks: React.ReactNode[] = [];
        let inTable = false;
        let tableRows: string[][] = [];

        lines.forEach((line, lIdx) => {
          const trimmed = line.trim();

          if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            if (!inTable) {
              inTable = true;
              tableRows = [];
            }
            if (!trimmed.includes(":---") && !trimmed.includes("---")) {
              const cells = trimmed.split("|").slice(1, -1).map(c => c.trim());
              tableRows.push(cells);
            }
            return;
          } else if (inTable) {
            inTable = false;
            if (tableRows.length > 0) {
              const headers = tableRows[0];
              const body = tableRows.slice(1);
              renderedBlocks.push(
                <div key={`table-${lIdx}`} className="overflow-x-auto my-3 border rounded-xl shadow-sm bg-card">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/80 border-b">
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-2.5 text-left font-bold border-r last:border-r-0">{h.replaceAll("**", "")}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {body.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b last:border-b-0 hover:bg-muted/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 border-r last:border-r-0">{cell.replaceAll("**", "")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
              tableRows = [];
            }
          }

          if (trimmed.startsWith("###")) {
            renderedBlocks.push(<h3 key={lIdx} className="font-bold text-base mt-3 mb-1 text-foreground border-b pb-1">{trimmed.replace("###", "").trim()}</h3>);
          } else if (trimmed.startsWith("##")) {
            renderedBlocks.push(<h2 key={lIdx} className="font-bold text-lg mt-4 mb-2 text-foreground border-b pb-1">{trimmed.replace("##", "").trim()}</h2>);
          } else if (trimmed.startsWith("#")) {
            renderedBlocks.push(<h1 key={lIdx} className="font-extrabold text-xl mt-4 mb-2 text-foreground">{trimmed.replace("#", "").trim()}</h1>);
          } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            renderedBlocks.push(
              <li key={lIdx} className="ml-4 list-disc text-sm text-foreground/90 my-1">
                {trimmed.slice(2)}
              </li>
            );
          } else if (trimmed) {
            renderedBlocks.push(
              <p key={lIdx} className="my-1.5 leading-relaxed text-foreground/90">
                {trimmed}
              </p>
            );
          }
        });

        if (inTable && tableRows.length > 0) {
          const headers = tableRows[0];
          const body = tableRows.slice(1);
          renderedBlocks.push(
            <div key={`table-end`} className="overflow-x-auto my-3 border rounded-xl shadow-sm bg-card">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/80 border-b">
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-2.5 text-left font-bold border-r last:border-r-0">{h.replaceAll("**", "")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b last:border-b-0 hover:bg-muted/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 border-r last:border-r-0">{cell.replaceAll("**", "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <div key={pIdx}>{renderedBlocks}</div>;
      })}
    </div>
  );
}
