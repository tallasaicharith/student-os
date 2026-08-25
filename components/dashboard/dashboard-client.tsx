"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare, Flame, Clock, BookOpen, Code2, Dumbbell, Trophy, Sparkles,
  Calendar, Check, AlertCircle, Play, Pause, ChevronRight, Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { cn, getGreeting } from "@/lib/utils";
import { usePomodoroStore } from "@/stores/pomodoro.store";

// Framer Motion presets
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as any } }
};

interface DashboardProps {
  userId: string;
}

export function DashboardClient({ userId }: DashboardProps) {
  const [xp, setXp] = useState(780);
  const [level, setLevel] = useState(4);

  // Queries
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetch("/api/tasks").then(r => r.json())
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["habits"],
    queryFn: () => fetch("/api/habits").then(r => r.json())
  });

  // Calculate stats
  const completedTasks = tasks.filter((t: any) => t.done).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Today's Score: Combined metric of tasks and habits progress starting at 0%
  const completedHabits = habits.filter((h: any) => h.logs?.length > 0).length;
  const totalHabits = habits.length;
  const habitProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  
  const todayScore = totalTasks === 0 && totalHabits === 0 
    ? 0 
    : Math.round((taskProgress + habitProgress) / 2);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Top Banner Row */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border rounded-2xl backdrop-blur-md relative overflow-hidden">
        <div className="space-y-1 z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            {getGreeting()} ⚡
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Gamification Profile Status */}
        <div className="flex items-center gap-4 bg-background/40 backdrop-blur border p-3.5 rounded-xl z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 relative">
            <span className="font-bold text-lg text-primary">{level}</span>
            <span className="absolute -bottom-1 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">LVL</span>
          </div>
          <div className="space-y-1 min-w-[120px]">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">XP Progress</span>
              <span>{xp % 1000}/1000</span>
            </div>
            <Progress value={(xp % 1000) / 10} className="h-2 w-full" />
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-500" />
              Top 3% this week (+240 XP)
            </p>
          </div>
        </div>

        {/* Backdrop decorative light */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </motion.div>

      {/* Main Apple/Notion Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Focus & Score */}
        <div className="space-y-6">
          
          {/* Today's Score Widget */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                  Today&apos;s Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                    <circle
                      cx="50" cy="50" r="42" stroke="url(#scoreGradient)" strokeWidth="8" fill="transparent"
                      strokeDasharray={263.8}
                      strokeDashoffset={263.8 - (263.8 * todayScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold tracking-tight">{todayScore}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Score</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 w-full justify-around text-center text-xs border-t pt-4">
                  <div>
                    <span className="block font-bold text-base text-blue-500">4.5h</span>
                    <span className="text-muted-foreground">Study Time</span>
                  </div>
                  <div className="border-r" />
                  <div>
                    <span className="block font-bold text-base text-purple-500">2.5h</span>
                    <span className="text-muted-foreground">Coding</span>
                  </div>
                  <div className="border-r" />
                  <div>
                    <span className="block font-bold text-base text-emerald-500">5.2K</span>
                    <span className="text-muted-foreground">Running</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Pomodoro Timer Widget */}
          <motion.div variants={itemVariants}>
            <PomodoroWidget />
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Action Deck</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-14 flex flex-col items-center justify-center gap-1 hover:bg-muted/80">
                  <span className="text-lg">🏋️</span>
                  <span className="text-[11px] font-semibold">Log Gym Set</span>
                </Button>
                <Button variant="outline" className="h-14 flex flex-col items-center justify-center gap-1 hover:bg-muted/80">
                  <span className="text-lg">🏃</span>
                  <span className="text-[11px] font-semibold">Start Running</span>
                </Button>
                <Button variant="outline" className="h-14 flex flex-col items-center justify-center gap-1 hover:bg-muted/80">
                  <span className="text-lg">📖</span>
                  <span className="text-[11px] font-semibold">Log Reading</span>
                </Button>
                <Button variant="outline" className="h-14 flex flex-col items-center justify-center gap-1 hover:bg-muted/80">
                  <span className="text-lg">✍️</span>
                  <span className="text-[11px] font-semibold">New Journal Entry</span>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Center & Right Column Combined: Charts, AI Advice, Lists */}
        <div className="lg:col-span-2 space-y-6">

          {/* Premium AI suggestions & motivation widget */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 relative overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-500">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  StudentOS AI Mentor Copilot
                </CardTitle>
                <CardDescription>Real-time personalized coaching insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-background/60 rounded-xl border border-indigo-500/10 text-sm leading-relaxed text-foreground/90">
                  ⚡ <strong>Linear Algebra Strategy:</strong> Term II has 4 math-heavy credits (MA113). Spend 30 mins tonight implementing Matrix Multiplications in Python to visualize eigenvalue mappings.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10">
                    Ask Mentor <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
              {/* Decorative side glow */}
              <div className="absolute right-0 top-0 w-24 h-full bg-indigo-500/10 blur-xl opacity-50 pointer-events-none" />
            </Card>
          </motion.div>

          {/* Time Analytics Area Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Focus Hours Trend
                  </CardTitle>
                  <CardDescription>Productivity breakdown of study vs coding time</CardDescription>
                </div>
                <Badge variant="secondary">Weekly view</Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={MOCK_ANALYTICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="codeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis dataKey="day" className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" unit="h" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area name="Study Hours" type="monotone" dataKey="study" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#studyGrad)" />
                    <Area name="Coding Hours" type="monotone" dataKey="coding" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#codeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Academic & Assignment Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Assignments & Exams Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>📚 Deliverables</span>
                    <Badge variant="destructive" className="text-[10px]">3 Pending</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DELIVERABLES.map((del) => (
                    <div key={del.id} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg border border-transparent hover:border-border transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-blue-500 font-mono">{del.subject}</span>
                        <p className="text-xs font-semibold">{del.title}</p>
                      </div>
                      <Badge variant={del.urgency === "Immediate" ? "destructive" : "secondary"} className="text-[9px]">
                        {del.due}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Attendance & GPA Tracker Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">🏆 Academic Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Attendance */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Average Attendance</span>
                      <span className="text-emerald-500">88%</span>
                    </div>
                    <Progress value={88} className="h-1.5 bg-emerald-500/10" />
                    <p className="text-[10px] text-muted-foreground">Min. 75% required for exams</p>
                  </div>
                  
                  {/* CGPA */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Cumulative GPA Goal</span>
                      <span className="text-indigo-500">9.2 / 10</span>
                    </div>
                    <Progress value={92} className="h-1.5 bg-indigo-500/10" />
                    <p className="text-[10px] text-muted-foreground font-semibold text-emerald-500">Target Achieved</p>
                  </div>

                  {/* Achievements Checklist */}
                  <div className="border-t pt-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Latest Achievements</span>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-yellow-500/5 text-yellow-500 border-yellow-500/20 py-0.5">🎖️ Code King</Badge>
                      <span className="text-muted-foreground">Solved 50 LeetCode Mediums</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

        </div>

      </div>
    </motion.div>
  );
}

// ─── Pomodoro Widget Sub-Component ────────────────────────────────────────────
function PomodoroWidget() {
  const { mode, secondsLeft, isRunning, cycle, start, pause, reset, tick } = usePomodoroStore();

  React.useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const modeLabel = { focus: "Focus Session", break: "Short Break", longBreak: "Long Break" }[mode];
  const modeColor = {
    focus: "text-blue-500",
    break: "text-emerald-500",
    longBreak: "text-purple-500"
  }[mode];

  return (
    <Card>
      <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Study Timer</CardTitle>
        <Badge variant="outline" className={modeColor}>{modeLabel}</Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <div className={cn("font-mono text-3xl font-bold tracking-tight", modeColor)}>{mm}:{ss}</div>
          <span className="text-[10px] text-muted-foreground font-medium">Cycle {cycle} of 4</span>
        </div>
        <div className="flex gap-1.5">
          <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl" onClick={reset}>
            <RotateCcwIcon className="w-4 h-4" />
          </Button>
          <Button size="icon" className={cn("h-9 w-9 rounded-xl", isRunning ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/95")} onClick={isRunning ? pause : start}>
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_ANALYTICS = [
  { day: "Mon", study: 3.5, coding: 2.0 },
  { day: "Tue", study: 4.0, coding: 3.0 },
  { day: "Wed", study: 3.0, coding: 2.5 },
  { day: "Thu", study: 5.0, coding: 3.5 },
  { day: "Fri", study: 4.5, coding: 4.0 },
  { day: "Sat", study: 6.0, coding: 2.0 },
  { day: "Sun", study: 3.5, coding: 1.5 }
];

const DELIVERABLES: any[] = [
  { id: "d1", subject: "MA113", title: "Linear Algebra Eigenvalues Problem Set", due: "Tomorrow, 11:59 PM", urgency: "Immediate" },
  { id: "d2", subject: "CS201", title: "Data Structures Red-Black Tree Implementation", due: "Friday, 5:00 PM", urgency: "Normal" },
  { id: "d3", subject: "CS204", title: "Operating Systems System Calls Lab", due: "Sunday, 11:59 PM", urgency: "Normal" }
];
