"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ChevronRight, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const DAYS = ["weekday", "saturday", "sunday"] as const;
type DayType = (typeof DAYS)[number];

const DAY_LABELS: Record<DayType, string> = {
  weekday: "Mon – Fri (College)",
  saturday: "Saturday (Extended)",
  sunday: "Sunday (Rest & Gita)",
};

interface Block {
  time: string;
  title: string;
  desc: string;
  tag: string;
  color: string;
}

const SCHEDULE_BLOCKS: Record<DayType, Block[]> = {
  weekday: [
    { time: "04:00 AM", title: "⚡ Wake Up", desc: "500ml water, 5 min gratitude journaling, affirmations", tag: "Morning", color: "text-purple-500 border-purple-500/25 bg-purple-500/5" },
    { time: "04:10 AM", title: "🏋️ Gym Workout", desc: "Chest + Triceps, compound lifts strength routine", tag: "Fitness", color: "text-red-500 border-red-500/25 bg-red-500/5" },
    { time: "06:30 AM", title: "🥗 Breakfast & Routine", desc: "Bath, skincare, breakfast (2 eggs + wheat toast + fruit)", tag: "Routine", color: "text-emerald-500 border-emerald-500/25 bg-emerald-500/5" },
    { time: "07:30 AM", title: "🚌 College Bus journey", desc: "Morning read: Gita (1 chapter), or listen to technical podcasts", tag: "Journey", color: "text-amber-500 border-amber-500/25 bg-amber-500/5" },
    { time: "09:00 AM", title: "🏫 B-Tech Sophomore Lectures", desc: "Core AI & Data Engineering classes. Sit front, take notes.", tag: "Academic", color: "text-blue-500 border-blue-500/25 bg-blue-500/5" },
    { time: "01:00 PM", title: "🍱 Lunch & Sunlight Walk", desc: "CURD & packed lunch, 20 mins walking in open campus", tag: "Break", color: "text-teal-500 border-teal-500/25 bg-teal-500/5" },
    { time: "04:00 PM", title: "🏫 Labs & Coding Golden Hour", desc: "Stay at library or computer lab for projects, alumni networks", tag: "Academic", color: "text-blue-500 border-blue-500/25 bg-blue-500/5" },
    { time: "05:00 PM", title: "🚌 Return Bus journey", desc: "Analyze LeetCode problems (think, outline solutions)", tag: "Journey", color: "text-amber-500 border-amber-500/25 bg-amber-500/5" },
    { time: "06:30 PM", title: "🏠 Reach Home — Power Nap", desc: "20 min power nap to restore cognitive recovery. Non-negotiable.", tag: "Rest", color: "text-pink-500 border-pink-500/25 bg-pink-500/5" },
    { time: "08:00 PM", title: "💻 Deep Work Study Session", desc: "DSA implementations, LeetCode solving, or project development", tag: "Study", color: "text-indigo-500 border-indigo-500/25 bg-indigo-500/5" },
    { time: "10:30 PM", title: "📖 Wind Down", desc: "Read non-technical book (Atomic Habits), prep bag for tomorrow", tag: "Night", color: "text-purple-500 border-purple-500/25 bg-purple-500/5" },
    { time: "11:00 PM", title: "😴 Sleep", desc: "7 hours recovery rest for cellular recovery", tag: "Sleep", color: "text-slate-500 border-slate-500/25 bg-slate-500/5" },
  ],
  saturday: [
    { time: "04:00 AM", title: "⚡ Wake Up", desc: "Standard morning routine as weekdays", tag: "Morning", color: "text-purple-500 border-purple-500/25 bg-purple-500/5" },
    { time: "04:10 AM", title: "🏋️ Extended Gym Workout", desc: "Full arms focus and abs sets", tag: "Fitness", color: "text-red-500 border-red-500/25 bg-red-500/5" },
    { time: "06:00 AM", title: "🏃 Cardio Running", desc: "4-5 km outdoor running. Building monthly endurance.", tag: "Fitness", color: "text-red-500 border-red-500/25 bg-red-500/5" },
    { time: "08:30 AM", title: "🚀 Deep Portfolio Work", desc: "2.5 hours building your Capstone Projects", tag: "Project", color: "text-indigo-500 border-indigo-500/25 bg-indigo-500/5" },
    { time: "11:00 AM", title: "📜 Online Certifications", desc: "AWS / Google Data Analytics course study", tag: "Study", color: "text-blue-500 border-blue-500/25 bg-blue-500/5" },
    { time: "01:00 PM", title: "💻 LeetCode Competition", desc: "Solve 2 Mediums + 1 Easy on time trials", tag: "Coding", color: "text-amber-500 border-amber-500/25 bg-amber-500/5" },
    { time: "05:00 PM", title: "📖 Read Mindset Books", desc: "30 pages target reading", tag: "Reading", color: "text-emerald-500 border-emerald-500/25 bg-emerald-500/5" },
    { time: "08:00 PM", title: "📊 Week Summary Review", desc: "Log achievements, weekly wins, and goal sheets", tag: "Review", color: "text-indigo-500 border-indigo-500/25 bg-indigo-500/5" },
  ],
  sunday: [
    { time: "06:00 AM", title: "🌅 Natural Wake Up", desc: "Let body recover. Rehydrate and stretch", tag: "Rest", color: "text-slate-500 border-slate-500/25 bg-slate-500/5" },
    { time: "08:00 AM", title: "📊 Weekly Review", desc: "Align with next week tasks in StudentOS tracker", tag: "Review", color: "text-indigo-500 border-indigo-500/25 bg-indigo-500/5" },
    { time: "09:00 AM", title: "🛐 Bhagavad Gita Study", desc: "Read 2-3 chapters. Meditate and log reflections.", tag: "Spiritual", color: "text-orange-500 border-orange-500/25 bg-orange-500/5" },
    { time: "10:00 AM", title: "📚 Self-Improvement Books", desc: "1.5 hours focused reading. How to Win Friends, etc.", tag: "Reading", color: "text-emerald-500 border-emerald-500/25 bg-emerald-500/5" },
    { time: "01:00 PM", title: "😴 Recovery Nap", desc: "60-90 min rest to catch up on sleep debt", tag: "Rest", color: "text-slate-500 border-slate-500/25 bg-slate-500/5" },
    { time: "05:00 PM", title: "🏃 Sunday Running", desc: "Cardio running 4-5 km. Increase pace slowly.", tag: "Fitness", color: "text-red-500 border-red-500/25 bg-red-500/5" },
  ],
};

export default function SchedulePage() {
  const [day, setDay] = useState<DayType>("weekday");

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader title="⏰ Daily Schedule" description="Hour-by-hour time boxing for your Sophomore Year study" />

      {/* Day tabs selection */}
      <div className="flex gap-2 bg-muted p-1 rounded-xl w-full max-w-[500px]">
        {DAYS.map((d) => (
          <Button
            key={d}
            variant={day === d ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-lg text-xs"
            onClick={() => setDay(d)}
          >
            {DAY_LABELS[d].split(" ")[0]}
          </Button>
        ))}
      </div>

      {/* Timeline items list */}
      <div className="relative border-l border-muted pl-6 ml-3 space-y-6 pt-2">
        {SCHEDULE_BLOCKS[day].map((block, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-background bg-muted group-hover:bg-primary transition-colors" />

            <div className={cn("p-4 border rounded-xl shadow-sm transition-all hover:shadow-md", block.color)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold font-mono tracking-tight flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {block.time}
                </span>
                <Badge variant="secondary" className="bg-background/80 text-[10px] uppercase font-bold shrink-0 self-start sm:self-center">
                  {block.tag}
                </Badge>
              </div>
              <h3 className="font-extrabold text-sm mt-2 text-foreground">{block.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{block.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
