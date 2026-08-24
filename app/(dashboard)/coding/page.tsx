"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Code, Github, Trophy, BookMarked, Terminal, RefreshCw, GitCommit,
  CheckCircle2, Plus, Calendar, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

export default function CodingDashboardPage() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSyncing(false);
    toast.success("GitHub and LeetCode accounts synchronized!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader title="💻 Coding Dashboard" description="Track LeetCode, GitHub streaks, and algorithmic roadmaps">
        <Button onClick={handleSync} disabled={syncing} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          Sync Accounts
        </Button>
      </PageHeader>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LeetCode Profile */}
        <Card className="relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-500" />
                LeetCode Stats
              </span>
              <Badge variant="outline" className="text-muted-foreground border-border bg-muted/5">Unranked</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold">0</span>
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
                  <span>0 / 100</span>
                </div>
                <Progress value={0} className="h-1.5 bg-emerald-500/10" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-yellow-500 font-medium">Medium</span>
                  <span>0 / 150</span>
                </div>
                <Progress value={0} className="h-1.5 bg-yellow-500/10" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-500 font-medium">Hard</span>
                  <span>0 / 50</span>
                </div>
                <Progress value={0} className="h-1.5 bg-red-500/10" />
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
                GitHub Contribution
              </span>
              <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted/80">No Streak</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-2xl font-extrabold">0</span>
                <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Commits (2026)</p>
              </div>
              <div>
                <span className="text-2xl font-extrabold">0 days</span>
                <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Current Streak</p>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border border-dashed flex items-center gap-3">
              <GitCommit className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold">No commits logged yet</p>
                <span className="text-[10px] text-muted-foreground">Sync your account to begin</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges & Unlocked achievements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap items-center text-xs text-muted-foreground py-2 justify-center border border-dashed rounded-lg bg-muted/10">
              No badges unlocked yet
            </div>
            <div className="border-t pt-3 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Upcoming Achievement</span>
              <div className="flex items-center justify-between text-xs">
                <span>Medium Master (0 / 100)</span>
                <span className="font-semibold text-primary">0%</span>
              </div>
              <Progress value={0} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Weekly Coding Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Weekly Coding vs LeetCode Time</CardTitle>
          <CardDescription>Minutes logged on platforms this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MOCK_CODING_ANALYTICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
              <XAxis dataKey="day" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" unit="m" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar name="Project Code (mins)" dataKey="projectMins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar name="LeetCode practice" dataKey="leetcodeMins" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Grid: Roadmap & Algorithms bookmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Algorithmic Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              DSA Learning Roadmap
            </CardTitle>
            <CardDescription>Sophomore Syllabus Alignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ROADMAP_ITEMS.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold">{item.name}</p>
                  <span className="text-[10px] text-muted-foreground">{item.description}</span>
                </div>
                <Badge variant={item.status === "Completed" ? "outline" : "default"} className={item.status === "Completed" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : ""}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Algorithm revision list / bookmarks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-blue-500" />
              Saved Algorithm Notes
            </CardTitle>
            <CardDescription>Revision deck before technical exams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SAVED_NOTES.map((note, idx) => (
              <div key={idx} className="p-3 bg-muted/40 rounded-xl border flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-500 font-mono uppercase">{note.tag}</span>
                  <span className="text-[10px] text-muted-foreground">Saved {note.date}</span>
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

const MOCK_CODING_ANALYTICS = [
  { day: "Mon", projectMins: 0, leetcodeMins: 0 },
  { day: "Tue", projectMins: 0, leetcodeMins: 0 },
  { day: "Wed", projectMins: 0, leetcodeMins: 0 },
  { day: "Thu", projectMins: 0, leetcodeMins: 0 },
  { day: "Fri", projectMins: 0, leetcodeMins: 0 },
  { day: "Sat", projectMins: 0, leetcodeMins: 0 },
  { day: "Sun", projectMins: 0, leetcodeMins: 0 }
];

const ROADMAP_ITEMS = [
  { name: "1. Advanced Data Structures (CS209)", description: "Red-Black Trees, Splay Trees, Tries", status: "Locked" },
  { name: "2. Graph Algorithms", description: "Dijkstra, Bellman-Ford, Kruskal & Prim MST", status: "Locked" },
  { name: "3. Dynamic Programming (CS211)", description: "Knapsack problems, LCS, matrix chain multiplication", status: "Locked" },
  { name: "4. Database indexing & Queries", description: "B-Trees, transaction concurrency locks", status: "Locked" }
];

const SAVED_NOTES: any[] = [];
