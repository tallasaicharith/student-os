"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, User, Bot, Paperclip, FileText, Trash2, ArrowRight,
  BookOpen, Code, Lightbulb, FileCheck, CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
      content: "Hello! I am your StudentOS AI Mentor. I can explain complex B-Tech concepts, create customized study roadmaps, review your programming code, help with interview preparations, or summarize academic papers. What are we studying today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setFiles([]);
    setLoading(true);

    try {
      // Simulate AI Mentor thinking and responding based on inputs
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      let reply = "";
      const textLower = userMessage.content.toLowerCase();

      if (textLower.includes("explain") || textLower.includes("what is")) {
        reply = `### Concept Explanation\nHere is a conceptual breakdown:\n\n1. **Core Concept:** At its foundation, this is a method to optimize state updates and computation tree structures.\n2. **Mathematical Formulation:** \n   $$\\lim_{x \\to \\infty} \\frac{f(x)}{g(x)} = L$$\n3. **Practical Application:** In Data Engineering, it prevents unnecessary full-table scans by utilizing secondary B-Tree indexing nodes.`;
      } else if (textLower.includes("code") || textLower.includes("review")) {
        reply = `### Code Review Feedback\n\nI reviewed your sample. Here are the optimizations:\n\n\`\`\`python\n# Optimized using Vectorization instead of loops\nimport numpy as np\n\ndef calculate_gpa_optimized(grades, credits):\n    # Vectorized multiplication holds O(1) space complexity\n    return np.dot(grades, credits) / np.sum(credits)\n\`\`\`\n\n**Suggestions:** Avoid explicit pointer iteration in Python where vectorized NumPy dot-products are available.`;
      } else if (textLower.includes("study plan") || textLower.includes("roadmap")) {
        reply = `### 📅 7-Day Study Plan: Data Structures & Algorithms\n\n- **Day 1-2:** Master Binary Search Trees & AVL rotations (2 hrs/day).\n- **Day 3-4:** Build a custom Hash Map implementation in C++ (CS207 prep).\n- **Day 5-6:** Solve 5 LeetCode Medium questions on Graph traversals (DFS/BFS).\n- **Day 7:** Practice Mock Interviews on System Design fundamentals.`;
      } else {
        reply = `I processed your request. Based on your Sophomore Year curriculum (AI & Data Engineering), I recommend focus hours on **Probability & Statistics (MA112)** and **C++ DSA (CS207)** this term. Let me know if you would like a quiz on these!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: reply,
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
    toast.success("File attached successfully!");
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
          <p className="text-xs text-muted-foreground">Expert academic guidance for B-Tech AI & Data Engineering</p>
        </div>
        <Badge variant="outline" className="text-xs bg-indigo-500/5 text-indigo-500 border-indigo-500/20">
          Powered by GPT-4o
        </Badge>
      </div>

      {/* Suggested prompts list */}
      <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none flex-shrink-0">
        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setInput("Explain Eigenvalues and Eigenvectors in simple terms")}>
          <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" /> Explain concept
        </Button>
        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setInput("Review this C++ code for a red-black tree")}>
          <Code className="w-3.5 h-3.5 mr-1 text-blue-500" /> Review code
        </Button>
        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setInput("Generate a study plan for linear algebra exam")}>
          <BookOpen className="w-3.5 h-3.5 mr-1 text-purple-500" /> Study plan
        </Button>
      </div>

      {/* Message Chat Pane */}
      <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
        {messages.map((m) => {
          const isAssistant = m.role === "assistant";
          return (
            <div key={m.id} className={cn("flex gap-3 max-w-[85%]", isAssistant ? "self-start" : "self-end ml-auto flex-row-reverse")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", isAssistant ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-primary/10 text-primary")}>
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className={cn("rounded-2xl p-4 text-sm leading-relaxed border shadow-sm", isAssistant ? "bg-card text-card-foreground" : "bg-primary text-primary-foreground border-transparent")}>
                  {/* Process very basic markdown codeblocks and titles */}
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

                  {/* Attachments */}
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
      {/* File queues */}
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
