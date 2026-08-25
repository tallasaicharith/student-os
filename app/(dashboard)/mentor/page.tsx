"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, User, Bot, Paperclip, FileText, Trash2, Key,
  BookOpen, Code, Lightbulb, Check, Copy, Download, HelpCircle,
  Briefcase, Calendar, Terminal, FileCheck, RefreshCw, Cpu
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string }[];
}

type ProviderType = "gemini" | "openai" | "claude" | "deepseek" | "groq";

const MODEL_OPTIONS: Record<ProviderType, { id: string; name: string }[]> = {
  gemini: [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Next-Gen)" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Deep Reasoning)" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Fast)" },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o (Omniscience)" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini (Efficient)" },
    { id: "o3-mini", name: "o3-mini (STEM & Code Reasoning)" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  ],
  claude: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Best Coding)" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Lightning Fast)" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus (High Intelligence)" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek-V3 (General Chat)" },
    { id: "deepseek-reasoner", name: "DeepSeek-R1 (Full Reasoning)" },
  ],
  groq: [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Groq Ultra Fast)" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (MoE Architecture)" },
    { id: "gemma2-9b-it", name: "Gemma 2 9B (Google Lightweight)" },
  ],
};

const AI_MODES = [
  { id: "general", label: "💬 General AI", icon: Sparkles, prompt: "What should I focus on today based on my active tasks and projects?" },
  { id: "explain", label: "🎓 Concept Explainer", icon: Lightbulb, prompt: "Explain the difference between Dynamic Programming and Greedy Algorithms with real-world code examples." },
  { id: "code_review", label: "💻 Code Reviewer", icon: Code, prompt: "Review my code for bugs, edge cases, and time/space complexity:\n\n```cpp\nint findMax(int arr[], int n) {\n  int maxVal = arr[0];\n  for(int i=1; i<n; i++) if(arr[i]>maxVal) maxVal=arr[i];\n  return maxVal;\n}\n```" },
  { id: "study_plan", label: "📅 Study Plan Builder", icon: Calendar, prompt: "Build a personalized 7-day intensive study schedule based on my active tasks and subjects." },
  { id: "resume_review", label: "📄 ATS Resume Reviewer", icon: FileCheck, prompt: "Analyze my active StudentOS projects and write 3 high-impact, ATS-optimized resume bullet points." },
  { id: "mock_interview", label: "⚡ Mock Interviewer", icon: Briefcase, prompt: "Ask me a technical mock interview question suitable for my active tech stack." },
  { id: "quiz_gen", label: "🧪 Exam Quiz Generator", icon: HelpCircle, prompt: "Generate 5 multiple-choice questions on Operating Systems (Process Scheduling & Deadlocks)." },
];

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<ProviderType>("gemini");
  const [modelName, setModelName] = useState("gemini-2.0-flash");
  const [selectedMode, setSelectedMode] = useState("general");
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [activeProviderName, setActiveProviderName] = useState("✨ Free Unlimited AI (gemini-2.0-flash)");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("studentos_ai_key");
    const savedProvider = localStorage.getItem("studentos_ai_provider") as ProviderType;
    const savedModel = localStorage.getItem("studentos_ai_model");
    const savedChat = localStorage.getItem("studentos_chat_history");

    if (savedKey) setApiKey(savedKey);
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
        content: "Hello! I am your **StudentOS AI Mentor Copilot**. I support ChatGPT-style markdown tables, code syntax highlighting, and real-time streaming answers. How can I help you today?",
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
  }, [messages, loading]);

  const handleProviderChange = (val: ProviderType) => {
    setProvider(val);
    const firstModel = MODEL_OPTIONS[val][0].id;
    setModelName(firstModel);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("studentos_ai_key", apiKey.trim());
    localStorage.setItem("studentos_ai_provider", provider);
    localStorage.setItem("studentos_ai_model", modelName);
    setKeyDialogOpen(false);
    toast.success(`Model updated to ${modelName} (${provider.toUpperCase()})`);
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
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (updated.length === 0) {
        localStorage.removeItem("studentos_chat_history");
      } else {
        localStorage.setItem("studentos_chat_history", JSON.stringify(updated));
      }
      return updated;
    });
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

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          apiKey: apiKey.trim(),
          provider,
          modelName,
          mode: selectedMode,
        }),
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
    } catch {
      toast.error("Failed to connect to AI Mentor");
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    const fileList = Array.from(uploadedFiles).map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    }));

    setFiles((prev) => [...prev, ...fileList]);
    toast.success("File attached!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto space-y-3">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            StudentOS AI Mentor Copilot
          </h1>
          <p className="text-xs text-muted-foreground">ChatGPT-Grade Real-Time AI Copilot (Gemini 2.0, GPT-4o, Claude 3.5, DeepSeek R1, Llama 3.3)</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs bg-indigo-500/5 text-indigo-500 border-indigo-500/20">
            {activeProviderName}
          </Badge>

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportChat}>
            <Download className="w-3.5 h-3.5" /> Export (.md)
          </Button>

          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive" onClick={handleClearChat}>
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </Button>

          {/* Key & Model Selector Dialog */}
          <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" /> Switch Model & Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-500" /> Choose AI Model Version & Key
                </DialogTitle>
                <DialogDescription>
                  Select your preferred AI provider, model version, and enter your key.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">AI Provider</label>
                  <Select value={provider} onValueChange={(val) => handleProviderChange(val as ProviderType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="claude">Anthropic Claude</SelectItem>
                      <SelectItem value="deepseek">DeepSeek AI</SelectItem>
                      <SelectItem value="groq">Groq (Ultra Fast Open Source)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Specific Model Version</label>
                  <Select value={modelName} onValueChange={setModelName}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Model Version" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS[provider].map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    API Key for {provider.toUpperCase()}
                  </label>
                  <Input
                    type="password"
                    placeholder={
                      provider === "gemini" ? "AIzaSy..." :
                      provider === "openai" ? "sk-..." :
                      provider === "claude" ? "sk-ant-..." :
                      provider === "groq" ? "gsk_..." : "sk-..."
                    }
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Leave blank to use 100% Free Unlimited AI with full student database context.
                  </p>
                </div>

                <Button onClick={handleSaveApiKey} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                  <Check className="w-4 h-4" /> Save Model Selection
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
                  
                  {/* ChatGPT-Grade Rich Markdown Renderer */}
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
                    title="Delete this message"
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

      {/* Input Row */}
      <form onSubmit={(e) => handleSend(e)} className="p-3 bg-card border rounded-2xl flex items-center gap-2 shadow-lg mt-auto">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.txt,.docx"
          onChange={handleFileUpload}
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
          disabled={loading}
        >
          <Send className="w-4 h-4 mr-1.5" /> Send
        </Button>
      </form>

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

  // Split by code blocks first
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

          // Table detection
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
