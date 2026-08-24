"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Trophy, Sparkles, BookMarked, Plus, HelpCircle,
  Quote, Heart, Calendar, Bookmark, FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

export default function ReadingHubPage() {
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [reflections, setReflections] = useState("");
  const [logs, setLogs] = useState<{ id: string; chapter: number; verse: number; note: string }[]>([]);

  const handleLogGita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter || !verse) return;

    const newLog = {
      id: Math.random().toString(),
      chapter,
      verse,
      note: reflections || "Read and meditated.",
    };

    setLogs((prev) => [newLog, ...prev]);
    setReflections("");
    toast.success(`Logged progress: Chapter ${chapter}, Verse ${verse}! 🛐`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader title="📖 Reading Hub" description="Track textbooks, self-help books, and Bhagavad Gita progress" />

      {/* Gita Progress Widget & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gita Card */}
        <Card className="md:col-span-2 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-500">
              🛐 Bhagavad Gita Study
            </CardTitle>
            <CardDescription>Daily spiritual wisdom check-in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogGita} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Chapter</label>
                  <Input type="number" min={1} max={18} value={chapter} onChange={e => setChapter(Number(e.target.value))} required />
                </div>
                <div className="w-1/3">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Verse</label>
                  <Input type="number" min={1} max={78} value={verse} onChange={e => setVerse(Number(e.target.value))} required />
                </div>
                <div className="w-1/3 flex items-end">
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-1.5">
                    <Bookmark className="w-4 h-4" /> Log Verse
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Personal Reflection / Notes</label>
                <Textarea placeholder="What did you learn? How does it apply to your day?" value={reflections} onChange={e => setReflections(e.target.value)} />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Reading stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Reading Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Reading Speed</span>
                <span className="text-blue-500">0 Pages / hr</span>
              </div>
              <Progress value={0} className="h-1.5" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Weekly Goal (140 Pages)</span>
                <span className="text-emerald-500">0 / 140 Pg</span>
              </div>
              <Progress value={0} className="h-1.5" />
            </div>

            <div className="p-3 bg-muted/40 border rounded-lg text-xs leading-relaxed italic flex gap-2">
              <Quote className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                &ldquo;Focus on the process, not the outcome.&rdquo;
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Books queue and Gita Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Books Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-blue-500" />
              General Reading Shelf
            </CardTitle>
            <CardDescription>Pages logged per book</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_BOOKS.map((book, idx) => (
              <div key={idx} className="p-3 bg-muted/40 border rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold">{book.title}</h4>
                    <span className="text-[10px] text-muted-foreground">by {book.author}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{book.category}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Progress</span>
                    <span>{book.read} / {book.total} pages ({Math.round(book.read / book.total * 100)}%)</span>
                  </div>
                  <Progress value={book.read / book.total * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Gita logs reflections list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Spiritual Gita Reflections
            </CardTitle>
            <CardDescription>Historical review of read verses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-muted/40 border rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-orange-500 font-mono">BG Ch {log.chapter}, Verse {log.verse}</span>
                  <span className="text-[10px] text-muted-foreground">Logged recently</span>
                </div>
                <p className="text-xs text-foreground/95 italic">&ldquo;{log.note}&rdquo;</p>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

const MOCK_BOOKS = [
  { title: "Atomic Habits", author: "James Clear", read: 0, total: 320, category: "Mindset" },
  { title: "Grokking Algorithms", author: "Aditya Bhargava", read: 0, total: 256, category: "Technical" },
  { title: "The 5 AM Club", author: "Robin Sharma", read: 0, total: 450, category: "Self-Help" }
];
