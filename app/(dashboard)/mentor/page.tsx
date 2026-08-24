"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, User, Bot, Paperclip, FileText, Trash2, Key,
  BookOpen, Code, Lightbulb, Check, Settings
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
  timestamp: Date;
  attachments?: { name: string; size: string }[];
}

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your StudentOS AI Mentor. I can explain complex academic concepts, create customized study roadmaps, review your programming code, help with interview preparations, or summarize papers. What are we studying today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [activeProviderName, setActiveProviderName] = useState("Built-in Assistant");

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("studentos_ai_key");
    const savedProvider = localStorage.getItem("studentos_ai_provider");
    if (savedKey) setApiKey(savedKey);
    if (savedProvider === "gemini" || savedProvider === "openai") setProvider(savedProvider);
  }, []);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
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
          timestamp: new Date(),
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
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            StudentOS AI Mentor Copilot
          </h1>
          <p className="text-xs text-muted-foreground">Expert academic & career guidance for students</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-indigo-500/5 text-indigo-500 border-indigo-500/20 hidden sm:inline-flex">
            {activeProviderName}
          </Badge>

          {/* Key Dialog */}
          <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                API Key Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" /> Configure AI Provider
                </DialogTitle>
                <DialogDescription>
                  Enter your Google Gemini or OpenAI API Key for real-time custom AI tutoring.
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
                    Your key is stored locally in your browser and used only for AI responses.
                  </p>
                </div>

                <Button onClick={handleSaveApiKey} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                  <Check className="w-4 h-4" /> Save API Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Suggested prompts list */}
      <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none flex-shrink-0">
        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setInput("Explain Eigenvalues and Eigenvectors in simple terms")}>
          <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" /> Explain concept
        </Button>
        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setInput("Review my C++ code for binary search tree")}>
          <Code className="w-3.5 h-3.5 mr-1 text-blue-500" /> Review code
        </Button>
        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setInput("Generate a 7-day study plan for upcoming exams")}>
          <BookOpen className="w-3.5 h-3.5 mr-1 text-purple-500" /> Study plan
        </Button>
      </div>

      {/* Message Chat Pane */}
      <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
        {messages.map((m) => {
          const isAssistant = m.role === "assistant";
          return (
            <div key={m.id} className={cn("flex gap-3 max-w-[85%]", isAssistant ? "self-start" : "self-end ml-auto flex-row-reverse")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0", isAssistant ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-primary/10 text-primary")}>
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className={cn("rounded-2xl p-4 text-sm leading-relaxed border shadow-sm", isAssistant ? "bg-card text-card-foreground" : "bg-primary text-primary-foreground border-transparent")}>
                  {m.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("###")) {
                      return <h3 key={i} className="font-bold text-base mt-2 mb-1">{para.replace("###", "")}</h3>;
                    }
                    if (para.startsWith("```")) {
                      const codeLines = para.replaceAll("```", "").split("\n").filter(Boolean);
                      const lang = codeLines[0];
                      const code = codeLines.slice(1).join("\n");
                      return (
                        <pre key={i} className="bg-muted p-3.5 rounded-lg text-xs font-mono overflow-x-auto my-2 border text-card-foreground">
                          <code>{code || lang}</code>
                        </pre>
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
                  {m.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
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

      {/* Input row */}
      <form onSubmit={handleSend} className="p-3 bg-card border rounded-2xl flex items-center gap-2 shadow-lg mt-auto">
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
          placeholder="Ask a question or request a study plan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
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
