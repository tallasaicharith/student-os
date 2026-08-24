"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Code, Github, Trophy, BookMarked, Terminal, RefreshCw, GitCommit,
  CheckCircle2, Plus, Trash2, Tag, BookOpen
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

interface SolvedProblem {
  id: string;
  title: string;
  platform: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: string;
  date: string;
}

interface SavedNote {
  id: string;
  tag: string;
  title: string;
  summary: string;
  date: string;
}

export default function CodingDashboardPage() {
  const [syncing, setSyncing] = useState(false);
  const [problems, setProblems] = useState<SolvedProblem[]>([
    { id: "p1", title: "Two Sum", platform: "LeetCode", difficulty: "Easy", language: "C++", date: "Today" },
    { id: "p2", title: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium", language: "C++", date: "Yesterday" },
    { id: "p3", title: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard", language: "C++", date: "3 days ago" }
  ]);

  const [notes, setNotes] = useState<SavedNote[]>([
    { id: "n1", tag: "C++ DSA", title: "Cycle Detection using Fast & Slow Pointers", summary: "Floyd's algorithm uses two pointers moving at different speeds (1x vs 2x). When they meet, a cycle exists in O(N) time and O(1) space.", date: "Today" },
    { id: "n2", tag: "SYSTEM DESIGN", title: "B-Tree Indexing in Databases", summary: "Self-balancing search tree where each node holds multiple keys and children, reducing disk I/O operations drastically.", date: "Yesterday" }
  ]);

  // Dialog state for adding problem
  const [problemOpen, setProblemOpen] = useState(false);
  const [pTitle, setPTitle] = useState("");
  const [pPlatform, setPPlatform] = useState("LeetCode");
  const [pDiff, setPDiff] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [pLang, setPLang] = useState("C++");

  // Dialog state for adding note
  const [noteOpen, setNoteOpen] = useState(false);
  const [nTag, setNTag] = useState("DSA");
  const [nTitle, setNTitle] = useState("");
  const [nSummary, setNSummary] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSyncing(false);
    toast.success("GitHub and LeetCode accounts synchronized!");
  };

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim()) return;

    const prob: SolvedProblem = {
      id: Math.random().toString(),
      title: pTitle.trim(),
      platform: pPlatform,
      difficulty: pDiff,
      language: pLang,
      date: "Just now"
    };

    setProblems((prev) => [prob, ...prev]);
    setPTitle("");
    setProblemOpen(false);
    toast.success(`Logged solved problem: ${prob.title}! 💻`);
  };

  const handleDeleteProblem = (id: string, title: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
    toast.success(`Removed "${title}" from problem logs`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nTitle.trim()) return;

    const note: SavedNote = {
      id: Math.random().toString(),
      tag: nTag.toUpperCase(),
      title: nTitle.trim(),
      summary: nSummary.trim() || "Algorithm revision notes.",
      date: "Just now"
    };

    setNotes((prev) => [note, ...prev]);
    setNTitle("");
    setNSummary("");
    setNoteOpen(false);
    toast.success(`Saved revision note: ${note.title}! 📖`);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success("Revision note deleted");
  };

  // Stats calculation
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;
  const totalSolved = problems.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader title="💻 Coding Dashboard" description="Track LeetCode, GitHub streaks, and algorithmic roadmaps">
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={syncing} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sync Accounts
          </Button>

          <Dialog open={problemOpen} onOpenChange={setProblemOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5">
                <Plus className="w-4 h-4" /> Log Solved Problem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-500" /> Log Coding Problem
                </DialogTitle>
                <DialogDescription>Track problems solved on LeetCode, Codeforces, or HackerRank.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddProblem} className="space-y-3 py-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Problem Title</label>
                  <Input placeholder="e.g., Course Schedule II" value={pTitle} onChange={(e) => setPTitle(e.target.value)} required />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Platform</label>
                    <Select value={pPlatform} onValueChange={setPPlatform}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LeetCode">LeetCode</SelectItem>
                        <SelectItem value="Codeforces">Codeforces</SelectItem>
                        <SelectItem value="HackerRank">HackerRank</SelectItem>
                        <SelectItem value="CodeChef">CodeChef</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Difficulty</label>
                    <Select value={pDiff} onValueChange={(v) => setPDiff(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Language</label>
                    <Input placeholder="C++" value={pLang} onChange={(e) => setPLang(e.target.value)} />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  Log Problem
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LeetCode Profile */}
        <Card className="relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-500" />
                Problem Solving Stats
              </span>
              <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5">Active Solver</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold">{totalSolved}</span>
                <span className="text-muted-foreground text-xs ml-1">Solved</span>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                Target: 300 problems
              </div>
            </div>
            
            {/* Breakdowns */}
            <div className="space-y-2 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-500 font-medium">Easy</span>
                  <span>{easyCount} / 100</span>
                </div>
                <Progress value={(easyCount / 100) * 100} className="h-1.5 bg-emerald-500/10" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-yellow-500 font-medium">Medium</span>
                  <span>{mediumCount} / 150</span>
                </div>
                <Progress value={(mediumCount / 150) * 100} className="h-1.5 bg-yellow-500/10" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-500 font-medium">Hard</span>
                  <span>{hardCount} / 50</span>
                </div>
                <Progress value={(hardCount / 50) * 100} className="h-1.5 bg-red-500/10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Contributions
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active Streak</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-2xl font-extrabold">142</span>
                <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Commits (2026)</p>
              </div>
              <div>
                <span className="text-2xl font-extrabold">12 days</span>
                <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Current Streak</p>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border flex items-center gap-3">
              <GitCommit className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold">Latest Commit: StudentOS Multi-user</p>
                <span className="text-[10px] text-muted-foreground">Pushed to main branch</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solved Problems Log List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Recent Solved Log ({problems.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {problems.map((p) => (
              <div key={p.id} className="p-2 bg-muted/40 border rounded-lg flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-xs truncate max-w-[140px]">{p.title}</p>
                  <span className="text-[10px] text-muted-foreground">{p.platform} • {p.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      p.difficulty === "Easy"
                        ? "text-emerald-500 border-emerald-500/20"
                        : p.difficulty === "Medium"
                        ? "text-yellow-500 border-yellow-500/20"
                        : "text-red-500 border-red-500/20"
                    }`}
                  >
                    {p.difficulty}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteProblem(p.id, p.title)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Algorithm Notes Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-blue-500" />
                Algorithm Revision Deck ({notes.length})
              </CardTitle>
              <CardDescription>Saved DSA notes & interview revision summaries</CardDescription>
            </div>

            <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Save Revision Note</DialogTitle>
                  <DialogDescription>Save quick DSA concepts or problem insights for exams.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddNote} className="space-y-3 py-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-semibold">Tag</label>
                      <Input placeholder="e.g. DSA" value={nTag} onChange={(e) => setNTag(e.target.value)} />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold">Concept Title</label>
                      <Input placeholder="e.g. Fast & Slow Pointers" value={nTitle} onChange={(e) => setNTitle(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Summary / Explanation</label>
                    <Textarea placeholder="Write key formulas or logic steps..." value={nSummary} onChange={(e) => setNSummary(e.target.value)} />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Save Note
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="p-3 bg-muted/40 rounded-xl border flex flex-col gap-2 relative group">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-500 font-mono uppercase">{note.tag}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{note.date}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs font-semibold">{note.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{note.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
