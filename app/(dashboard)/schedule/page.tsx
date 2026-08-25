"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Plus, Trash2, Zap, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DAYS = ["weekday", "saturday", "sunday"] as const;
type DayType = (typeof DAYS)[number];

const DAY_LABELS: Record<DayType, string> = {
  weekday: "Mon – Fri (College)",
  saturday: "Saturday (Extended)",
  sunday: "Sunday (Rest & Gita)",
};

interface Block {
  id: string;
  time: string;
  title: string;
  desc: string;
  tag: string;
  color: string;
}

const INITIAL_SCHEDULE_BLOCKS: Record<DayType, Block[]> = {
  weekday: [
    { id: "w1", time: "04:00 AM", title: "⚡ Wake Up", desc: "500ml water, 5 min gratitude journaling, affirmations", tag: "Morning", color: "text-purple-500 border-purple-500/25 bg-purple-500/5" },
    { id: "w2", time: "04:10 AM", title: "🏋️ Gym Workout", desc: "Chest + Triceps, compound lifts strength routine", tag: "Fitness", color: "text-red-500 border-red-500/25 bg-red-500/5" },
    { id: "w3", time: "06:30 AM", title: "🥗 Breakfast & Routine", desc: "Bath, skincare, breakfast (2 eggs + wheat toast + fruit)", tag: "Routine", color: "text-emerald-500 border-emerald-500/25 bg-emerald-500/5" },
    { id: "w4", time: "09:00 AM", title: "🏫 B-Tech Sophomore Lectures", desc: "Core AI & Data Engineering classes. Sit front, take notes.", tag: "Academic", color: "text-blue-500 border-blue-500/25 bg-blue-500/5" },
    { id: "w5", time: "01:00 PM", title: "🍱 Lunch & Sunlight Walk", desc: "Packed lunch, 20 mins walking in open campus", tag: "Break", color: "text-teal-500 border-teal-500/25 bg-teal-500/5" },
    { id: "w6", time: "04:00 PM", title: "🏫 Labs & Coding Golden Hour", desc: "Stay at library or computer lab for projects", tag: "Academic", color: "text-blue-500 border-blue-500/25 bg-blue-500/5" },
    { id: "w7", time: "08:00 PM", title: "💻 Deep Work Study Session", desc: "DSA implementations, LeetCode solving, or project development", tag: "Study", color: "text-indigo-500 border-indigo-500/25 bg-indigo-500/5" },
    { id: "w8", time: "11:00 PM", title: "😴 Sleep", desc: "7 hours recovery rest for cellular recovery", tag: "Sleep", color: "text-slate-500 border-slate-500/25 bg-slate-500/5" },
  ],
  saturday: [
    { id: "s1", time: "04:00 AM", title: "⚡ Wake Up", desc: "Standard morning routine as weekdays", tag: "Morning", color: "text-purple-500 border-purple-500/25 bg-purple-500/5" },
    { id: "s2", time: "04:10 AM", title: "🏋️ Extended Gym Workout", desc: "Full arms focus and abs sets", tag: "Fitness", color: "text-red-500 border-red-500/25 bg-red-500/5" },
    { id: "s3", time: "08:30 AM", title: "🚀 Deep Portfolio Work", desc: "2.5 hours building your Capstone Projects", tag: "Project", color: "text-indigo-500 border-indigo-500/25 bg-indigo-500/5" },
    { id: "s4", time: "01:00 PM", title: "💻 LeetCode Competition", desc: "Solve 2 Mediums + 1 Easy on time trials", tag: "Coding", color: "text-amber-500 border-amber-500/25 bg-amber-500/5" },
  ],
  sunday: [
    { id: "su1", time: "06:00 AM", title: "🌅 Natural Wake Up", desc: "Let body recover. Rehydrate and stretch", tag: "Rest", color: "text-slate-500 border-slate-500/25 bg-slate-500/5" },
    { id: "su2", time: "08:00 AM", title: "📊 Weekly Review", desc: "Align with next week tasks in StudentOS tracker", tag: "Review", color: "text-indigo-500 border-indigo-500/25 bg-indigo-500/5" },
    { id: "su3", time: "10:00 AM", title: "📚 Self-Improvement Books", desc: "1.5 hours focused reading.", tag: "Reading", color: "text-emerald-500 border-emerald-500/25 bg-emerald-500/5" },
  ],
};

export default function SchedulePage() {
  const [day, setDay] = useState<DayType>("weekday");
  const [schedule, setSchedule] = useState<Record<DayType, Block[]>>(INITIAL_SCHEDULE_BLOCKS);

  // Add block modal state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("09:00 AM");
  const [titleStr, setTitleStr] = useState("");
  const [descStr, setDescStr] = useState("");
  const [tagStr, setTagStr] = useState("Academic");

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleStr.trim()) return;

    const newBlock: Block = {
      id: Math.random().toString(),
      time: timeStr.trim() || "09:00 AM",
      title: titleStr.trim(),
      desc: descStr.trim() || "Scheduled activity block",
      tag: tagStr,
      color: "text-blue-500 border-blue-500/25 bg-blue-500/5",
    };

    setSchedule((prev) => ({
      ...prev,
      [day]: [...prev[day], newBlock],
    }));

    setTitleStr("");
    setDescStr("");
    setDialogOpen(false);
    toast.success(`Added "${newBlock.title}" to ${DAY_LABELS[day]} schedule! ⏰`);
  };

  const handleDeleteBlock = (id: string, title: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((b) => b.id !== id),
    }));
    toast.success(`Removed "${title}" from schedule`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader title="⏰ Daily Schedule" description="Hour-by-hour time boxing for your Sophomore Year study">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Time Block
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" /> Add Schedule Time Block
              </DialogTitle>
              <DialogDescription>Add a new class, study block, gym workout, or activity to your schedule.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddBlock} className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-semibold">Time</label>
                  <Input placeholder="e.g. 08:00 AM" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} required />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Activity Title</label>
                  <Input placeholder="e.g. Computer Networks Lab" value={titleStr} onChange={(e) => setTitleStr(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Category Tag</label>
                <Input placeholder="e.g. Academic, Fitness, Study, Journey" value={tagStr} onChange={(e) => setTagStr(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Description / Notes</label>
                <Input placeholder="e.g. Room 304, sit in front row" value={descStr} onChange={(e) => setDescStr(e.target.value)} />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                Save Time Block
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Day selector tabs */}
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

      {/* Timeline list with Delete actions */}
      {schedule[day].length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground italic">
          No schedule blocks for {DAY_LABELS[day]}. Click "Add Time Block" above to customize your timetable!
        </Card>
      ) : (
        <div className="relative border-l border-muted pl-6 ml-3 space-y-6 pt-2">
          <AnimatePresence>
            {schedule[day].map((block) => (
              <motion.div key={block.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-background bg-muted group-hover:bg-primary transition-colors" />

                <div className={cn("p-4 border rounded-xl shadow-sm transition-all hover:shadow-md relative", block.color)}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono tracking-tight flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {block.time}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-background/80 text-[10px] uppercase font-bold shrink-0">
                        {block.tag}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteBlock(block.id, block.title)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-sm mt-2 text-foreground">{block.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{block.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
