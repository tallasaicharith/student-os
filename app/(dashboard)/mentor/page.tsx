"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, User, Bot, Paperclip, FileText, Trash2, Key,
  BookOpen, Code, Lightbulb, Check, Copy, Download, HelpCircle,
  Briefcase, Calendar, Terminal, FileCheck, RefreshCw
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
  timestamp: string; // ISO string for localStorage serialization
  attachments?: { name: string; size: string }[];
}

const AI_MODES = [
  { id: "general", label: "💬 General AI", icon: Sparkles, prompt: "What are we studying today?" },
  { id: "explain", label: "🎓 Concept Explainer", icon: Lightbulb, prompt: "Explain the difference between Dynamic Programming and Greedy Algorithms with examples." },
  { id: "code_review", label: "💻 Code Reviewer", icon: Code, prompt: "Review my code for time & space complexity optimizations:\n\n```cpp\nint findMax(int arr[], int n) {\n  int maxVal = arr[0];\n  for(int i=1; i<n; i++) if(arr[i]>maxVal) maxVal=arr[i];\n  return maxVal;\n}\n```" },
  { id: "study_plan", label: "📅 Study Plan Builder", icon: Calendar, prompt: "Generate a 7-day intensive study plan for my Data Structures & Algorithms exam." },
  { id: "resume_review", label: "📄 ATS Resume Reviewer", icon: FileCheck, prompt: "Review and rewrite these resume bullet points for high ATS pass rates:\n- Built a Next.js web application\n- Fixed bugs and worked on database" },
  { id: "mock_interview", label: "⚡ Mock Interviewer", icon: Briefcase, prompt: "Ask me a technical mock interview question for a Software Engineering Internship." },
  { id: "quiz_gen", label: "🧪 Exam Quiz Generator", icon: HelpCircle, prompt: "Generate 5 multiple-choice questions on Operating Systems (Process Scheduling & Deadlocks)." },
];

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [selectedMode, setSelectedMode] = useState("general");
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [activeProviderName, setActiveProviderName] = useState("✨ Free Unlimited AI Mentor");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persistent state from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("studentos_ai_key");
    const savedProvider = localStorage.getItem("studentos_ai_provider");
    const savedChat = localStorage.getItem("studentos_chat_history");

    if (savedKey) setApiKey(savedKey);
    if (savedProvider === "gemini" || savedProvider === "openai") setProvider(savedProvider);

    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (_e) {}
    }

    // Default welcome message if no history
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your **StudentOS AI Mentor Copilot**. I can explain complex academic concepts, optimize programming code, build exam study plans, review resumes, or run mock technical interviews. How can I help you excel today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // Save chat to localStorage on change
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

  const handleSaveApiKey = () => {
    localStorage.setItem("studentos_ai_key", apiKey.trim());
    localStorage.setItem("studentos_ai_provider", provider);
    setKeyDialogOpen(false);
    toast.success(`API Key saved! Provider: ${provider === "gemini" ? "Google Gemini" : "OpenAI"}`);
  };

  const handleClearChat = () => {
    const defaultMsg: Message[] = [
      {
        id: Math.random().toString(),
        role: "assistant",
        content: "Chat cleared! How can I assist you with your studies or career goals now?",
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(defaultMsg);
    localStorage.removeItem("studentos_chat_history");
    toast.success("Chat history cleared");
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
          mode: selectedMode,
        }),
      });

      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();

      if (data.provider) setActiveProviderName(data.provider);

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: data.reply || "No response received",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      toast.error("Failed to connect to AI Mentor");
    } finally {
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
          <p className="text-xs text-muted-foreground">Expert academic, coding, and career guidance for students</p>
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

          {/* Key Dialog */}
          <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Key className="w-3.5 h-3.5 text-indigo-500" /> API Keys
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" /> Configure API Key (Optional)
                </DialogTitle>
                <DialogDescription>
                  Enter your Google Gemini or OpenAI API Key for custom private model access.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">AI Provider</label>
                  <Select value={provider} onValueChange={(val) => setProvider(val as "gemini" | "openai")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Google Gemini API</SelectItem>
                      <SelectItem value="openai">OpenAI API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    {provider === "gemini" ? "Google Gemini API Key" : "OpenAI API Key"}
                  </label>
                  <Input
                    type="password"
                    placeholder={provider === "gemini" ? "AIzaSy..." : "sk-..."}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Stored locally in your browser. Leave blank to use 100% Free Unlimited AI.
                  </p>
                </div>

                <Button onClick={handleSaveApiKey} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                  <Check className="w-4 h-4" /> Save Key
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

      {/* Message Chat Pane */}
      <div className="flex-1 overflow-y-auto pr-2 py-3 space-y-4">
        {messages.map((m) => {
          const isAssistant = m.role === "assistant";
          return (
            <div key={m.id} className={cn("flex gap-3 max-w-[88%]", isAssistant ? "self-start" : "self-end ml-auto flex-row-reverse")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 mt-0.5", isAssistant ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-primary/10 text-primary")}>
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className={cn("rounded-2xl p-4 text-sm leading-relaxed border shadow-sm relative group", isAssistant ? "bg-card text-card-foreground" : "bg-primary text-primary-foreground border-transparent")}>
                  {m.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("###")) {
                      return <h3 key={i} className="font-bold text-base mt-2 mb-1 border-b pb-1">{para.replace("###", "")}</h3>;
                    }
                    if (para.startsWith("```")) {
                      const codeLines = para.replaceAll("```", "").split("\n").filter(Boolean);
                      const lang = codeLines[0];
                      const codeText = codeLines.slice(1).join("\n");
                      const blockId = `${m.id}-${i}`;

                      return (
                        <div key={i} className="relative my-3 rounded-lg overflow-hidden border bg-slate-950 text-slate-100">
                          <div className="flex justify-between items-center px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                            <span>{lang || "code"}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(codeText || lang, blockId)}
                              className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                              {copiedCodeId === blockId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedCodeId === blockId ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <pre className="p-3.5 text-xs font-mono overflow-x-auto">
                            <code>{codeText || lang}</code>
                          </pre>
                        </div>
                      );
                    }
                    return <p key={i} className="mb-2 last:mb-0">{para}</p>;
                  })}

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
                <span className="text-[9px] text-muted-foreground px-2">
                  {new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
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
          placeholder="Ask any question, request code reviews, or build study plans..."
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
                <Trash2 className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
