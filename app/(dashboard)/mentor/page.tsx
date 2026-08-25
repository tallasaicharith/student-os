"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, User, Bot, Paperclip, FileText, Trash2, Key,
  Lightbulb, Code, Calendar, FileCheck, Briefcase, HelpCircle,
  Cpu, StopCircle, RotateCcw, Plus, Search, Edit3, MessageSquare, PanelLeft, ThumbsUp, ThumbsDown, Check, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  attachments?: { name: string; size: string; content?: string }[];
}

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
  selectedProvider?: string;
  selectedModel?: string;
}

type ProviderType = "openai" | "gemini" | "claude" | "groq";

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
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [files, setFiles] = useState<{ name: string; size: string; content?: string }[]>([]);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [dragOver, setDragOver] = useState(false);
  
  const [provider, setProvider] = useState<ProviderType>("gemini");
  const [modelName, setModelName] = useState("gemini-2.5-flash");
  const [selectedMode, setSelectedMode] = useState("general");
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [savedApiKey, setSavedApiKey] = useState<string>("");
  const [tempApiKeyInput, setTempApiKeyInput] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load Saved Key & Conversations on Mount
  useEffect(() => {
    fetchConversations();
    
    // Priority 1: Check localStorage for OpenAI or Gemini key
    const localOpenAIKey = localStorage.getItem("studentos_openai_key");
    const localGeminiKey = localStorage.getItem("studentos_gemini_key");

    if (localOpenAIKey && localOpenAIKey.trim()) {
      setSavedApiKey(localOpenAIKey.trim());
      setTempApiKeyInput(localOpenAIKey.trim());
      setProvider("openai");
      setModelName("gpt-4o-mini");
    } else if (localGeminiKey && localGeminiKey.trim()) {
      setSavedApiKey(localGeminiKey.trim());
      setTempApiKeyInput(localGeminiKey.trim());
      setProvider("gemini");
      setModelName("gemini-2.0-flash");
    }

    // Priority 2: Fetch Server Settings
    fetch("/api/ai/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.rawKeys && data.rawKeys.openai) {
          setSavedApiKey(data.rawKeys.openai);
          setTempApiKeyInput(data.rawKeys.openai);
          localStorage.setItem("studentos_openai_key", data.rawKeys.openai);
          setProvider("openai");
        } else if (data.rawKeys && data.rawKeys.gemini) {
          setSavedApiKey(data.rawKeys.gemini);
          setTempApiKeyInput(data.rawKeys.gemini);
          localStorage.setItem("studentos_gemini_key", data.rawKeys.gemini);
        }
        if (data.defaultProvider) setProvider(data.defaultProvider as ProviderType);
        if (data.defaultModel) setModelName(data.defaultModel);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, streaming]);

  const fetchConversations = async () => {
    const savedLocal = localStorage.getItem("studentos_local_conversations");
    if (savedLocal) {
      try { setConversations(JSON.parse(savedLocal)); } catch (_e) {}
    }

    try {
      const res = await fetch("/api/ai/conversations");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setConversations(data);
          localStorage.setItem("studentos_local_conversations", JSON.stringify(data));
        }
      }
    } catch (_e) {}
  };

  const handleSaveApiKey = async () => {
    if (!tempApiKeyInput.trim()) {
      toast.error("Please enter a valid API Key");
      return;
    }
    const cleanKey = tempApiKeyInput.trim();
    setSavedApiKey(cleanKey);

    const isExplicitOpenAI = cleanKey.startsWith("sk-");
    if (isExplicitOpenAI) {
      localStorage.setItem("studentos_openai_key", cleanKey);
      setProvider("openai");
      setModelName("gpt-4o-mini");
    } else {
      localStorage.setItem("studentos_gemini_key", cleanKey);
    }

    try {
      await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isExplicitOpenAI ? { openaiKey: cleanKey, defaultProvider: "openai", defaultModel: "gpt-4o-mini" } : { geminiKey: cleanKey }),
      });
      toast.success(isExplicitOpenAI ? "OpenAI Key saved permanently! 🟢" : "Google Gemini Key saved! 🔒");
      setApiKeyModalOpen(false);
    } catch (_e) {
      toast.success("API Key saved locally!");
      setApiKeyModalOpen(false);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.success("Message deleted");
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your **StudentOS OpenAI / Multi-Model AI Copilot**. I retain full multi-turn conversational memory, support streaming answers, and understand file uploads. How can I assist you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    toast.success("Started a new conversation!");
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConvId(id);
    try {
      const res = await fetch(`/api/ai/conversations?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: m.createdAt,
              attachments: m.attachments,
            }))
          );
        }
        if (data.selectedProvider) setProvider(data.selectedProvider as ProviderType);
        if (data.selectedModel) setModelName(data.selectedModel);
        if (data.mode) setSelectedMode(data.mode);
      }
    } catch (_e) {}
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/conversations?id=${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) handleNewChat();
      toast.success("Conversation deleted");
    } catch (_e) {}
  };

  const handleStopStream = () => {
    if (abortController) {
      abortController.abort();
      setStreaming(false);
      setLoading(false);
      toast.info("Generation stopped by user");
    }
  };

  const handleRegenerate = () => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setMessages((prev) => prev.filter((m, idx) => !(idx === prev.length - 1 && m.role === "assistant")));
      handleSend(undefined, lastUserMsg.content);
    }
  };

  const handleEditUserMessage = (id: string, content: string) => {
    setEditingMsgId(id);
    setEditingContent(content);
  };

  const handleSaveEditedMessage = (id: string) => {
    if (!editingContent.trim()) return;

    const msgIndex = messages.findIndex((m) => m.id === id);
    if (msgIndex !== -1) {
      const updatedMessages = messages.slice(0, msgIndex);
      setMessages(updatedMessages);
      setEditingMsgId(null);
      handleSend(undefined, editingContent.trim());
    }
  };

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() && files.length === 0) return;

    const keyToUse = savedApiKey || localStorage.getItem("studentos_openai_key") || localStorage.getItem("studentos_gemini_key") || "";

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: promptToSend,
      timestamp: new Date().toISOString(),
      attachments: files.length > 0 ? [...files] : undefined,
    };

    const botMessageId = Math.random().toString();
    const newMessages = [...messages.filter((m) => m.id !== "welcome"), userMessage];
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
          messages: newMessages.map((m) => ({ role: m.role, content: m.content, attachments: m.attachments })),
          apiKey: keyToUse,
          provider,
          model: modelName,
          mode: selectedMode,
          conversationId: activeConvId,
          attachments: userMessage.attachments,
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

      fetchConversations();
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target?.result as string;
        setFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            content: textContent,
          },
        ]);
      };
      reader.readAsText(file);
    });

    toast.success("File attached and content read! 📄");
  };

  const currentModelConfig = MODEL_REGISTRY[modelName];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex h-[calc(100vh-8rem)] max-w-7xl mx-auto border rounded-2xl overflow-hidden shadow-sm bg-background relative"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) {
          Array.from(e.dataTransfer.files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              setFiles((prev) => [
                ...prev,
                { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, content: ev.target?.result as string },
              ]);
            };
            reader.readAsText(file);
          });
          toast.success("Files dropped and read!");
        }
      }}
    >
      {/* Drag & Drop Overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none">
          <div className="text-center">
            <Paperclip className="w-12 h-12 text-primary mx-auto animate-bounce" />
            <p className="font-bold text-lg text-primary mt-2">Drop files to attach to chat</p>
          </div>
        </div>
      )}

      {/* ── Left Sidebar: Conversations Drawer ────────────────────────────────── */}
      <div className={cn("w-64 border-r bg-muted/30 flex flex-col transition-all shrink-0", !sidebarOpen && "hidden md:flex md:w-16")}>
        <div className="p-3 border-b flex items-center justify-between">
          {sidebarOpen ? (
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs" onClick={handleNewChat}>
              <Plus className="w-4 h-4" /> New Chat
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleNewChat} title="New Chat">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {sidebarOpen && (
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectConversation(c.id)}
              className={cn(
                "p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors group",
                activeConvId === c.id ? "bg-muted text-foreground font-semibold border" : "hover:bg-muted text-foreground/80"
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                {sidebarOpen && <span className="truncate">{c.title}</span>}
              </div>
              {sidebarOpen && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <PanelLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              StudentOS AI Mentor Copilot
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive" onClick={() => {
              if (activeConvId) {
                handleDeleteConversation(activeConvId, { stopPropagation: () => {} } as any);
              } else {
                handleNewChat();
              }
            }}>
              <Trash2 className="w-3.5 h-3.5 text-destructive" /> Clear Chat
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={handleNewChat}>
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
          </div>
        </div>

        {/* AI Modes Toolbar */}
        <div className="flex gap-2 overflow-x-auto p-2 border-b scrollbar-none bg-muted/10">
          {AI_MODES.map((mode) => (
            <Button
              key={mode.id}
              variant={selectedMode === mode.id ? "default" : "outline"}
              size="sm"
              className="text-xs rounded-xl h-7 shrink-0"
              onClick={() => {
                setSelectedMode(mode.id);
                if (mode.prompt && mode.id !== "general") setInput(mode.prompt);
              }}
            >
              {mode.label}
            </Button>
          ))}
        </div>

        {/* Messages Stream Pane */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isAssistant = m.role === "assistant";
            return (
              <div key={m.id} className={cn("flex gap-3 max-w-[90%] group relative", isAssistant ? "self-start" : "self-end ml-auto flex-row-reverse")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 mt-0.5", isAssistant ? "bg-muted text-foreground" : "bg-primary text-primary-foreground")}>
                  {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1 max-w-full overflow-hidden">
                  <div className={cn("rounded-2xl p-4 text-sm border shadow-sm relative", isAssistant ? "bg-card text-card-foreground" : "bg-primary text-primary-foreground border-transparent")}>
                    
                    {/* Inline Edit Form for User Messages */}
                    {editingMsgId === m.id ? (
                      <div className="space-y-2">
                        <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="text-xs bg-background text-foreground" />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingMsgId(null)}>Cancel</Button>
                          <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground" onClick={() => handleSaveEditedMessage(m.id)}>Save & Resend</Button>
                        </div>
                      </div>
                    ) : isAssistant ? (
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

                  {/* Message Action Bar */}
                  <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    
                    <div className="flex items-center gap-2">
                      {!isAssistant && (
                        <button type="button" onClick={() => handleEditUserMessage(m.id, m.content)} className="hover:text-primary transition-colors flex items-center gap-1">
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      )}

                      {isAssistant && (
                        <>
                          <button type="button" onClick={handleRegenerate} className="hover:text-primary transition-colors flex items-center gap-1" title="Regenerate answer">
                            <RotateCcw className="w-3 h-3" /> Regenerate
                          </button>
                          <button type="button" onClick={() => toast.success("Feedback recorded 👍")} className="hover:text-emerald-500 transition-colors">
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button type="button" onClick={() => toast.info("Feedback recorded 👎")} className="hover:text-destructive transition-colors">
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </>
                      )}

                      <button type="button" onClick={() => handleDeleteMessage(m.id)} className="hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-muted text-foreground">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-card text-card-foreground rounded-2xl p-4 text-sm border shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar with Multiline Textarea */}
        <div className="p-3 border-t bg-card space-y-2">
          {streaming && (
            <div className="flex justify-center">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-destructive border-destructive/30" onClick={handleStopStream}>
                <StopCircle className="w-3.5 h-3.5" /> ■ Stop Generating
              </Button>
            </div>
          )}

          <form
            onSubmit={(e) => handleSend(e)}
            className="border rounded-2xl p-2 bg-background shadow-inner flex flex-col gap-2"
          >
            <Textarea
              placeholder="Message StudentOS OpenAI Assistant... (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              className="border-0 focus-visible:ring-0 bg-transparent text-sm resize-none min-h-[44px] max-h-[140px]"
            />

            <div className="flex items-center justify-between pt-1 border-t border-muted/50">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.txt,.docx,.js,.ts,.cpp,.py"
                  onChange={handleFileUpload}
                  multiple
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground text-xs gap-1 h-7"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-3.5 h-3.5" /> Attach
                </Button>
              </div>

              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-7 px-3 text-xs gap-1"
                disabled={loading || streaming || (!input.trim() && files.length === 0)}
              >
                <Send className="w-3.5 h-3.5" /> Send
              </Button>
            </div>
          </form>

          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {files.map((f, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1.5 py-1 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="max-w-[140px] truncate">{f.name}</span>
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
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
                <span className="font-semibold text-slate-200">{part.lang}</span>
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
