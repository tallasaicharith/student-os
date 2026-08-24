"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { PomodoroTimer } from "@/components/study/pomodoro-timer";
import { SOPHOMORE_SUBJECTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

const TERMS = [1, 2, 3, 4] as const;
type Term = (typeof TERMS)[number];

const STATUS_OPTIONS = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "NEEDS_REVISION"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const STATUS_LABELS: Record<Status, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  NEEDS_REVISION: "Needs Revision",
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "⭐⭐⭐ Core",
  MEDIUM: "⭐⭐ Important",
  LOW: "⭐ Light",
  CERT: "✅ Certification",
};

interface SubjectItem {
  code: string;
  name: string;
  term: number;
  priority: string;
  status: Status;
  progress: number;
}

export default function StudyPage() {
  const [term, setTerm] = useState<Term>(1);

  // Initialize subjects from SOPHOMORE_SUBJECTS or default lists
  const [allSubjects, setAllSubjects] = useState<SubjectItem[]>(() => {
    const initial: SubjectItem[] = [];
    Object.entries(SOPHOMORE_SUBJECTS).forEach(([termKey, subs]) => {
      subs.forEach((sub) => {
        initial.push({
          code: sub.code,
          name: sub.name,
          term: Number(termKey),
          priority: sub.priority,
          status: "IN_PROGRESS",
          progress: 15,
        });
      });
    });
    return initial;
  });

  // Modal dialog state for adding new subject
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newPriority, setNewPriority] = useState("HIGH");

  const subjectsForTerm = allSubjects.filter((s) => s.term === term);

  const handleStatusChange = (code: string, newStatus: Status) => {
    setAllSubjects((prev) =>
      prev.map((s) => (s.code === code ? { ...s, status: newStatus } : s))
    );
    toast.success(`Updated status to ${STATUS_LABELS[newStatus]}`);
  };

  const handleProgressChange = (code: string, newProgress: number) => {
    setAllSubjects((prev) =>
      prev.map((s) => (s.code === code ? { ...s, progress: newProgress } : s))
    );
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const code = newCode.trim().toUpperCase() || `SUB${Math.floor(Math.random() * 900 + 100)}`;
    const newSub: SubjectItem = {
      code,
      name: newName.trim(),
      term,
      priority: newPriority,
      status: "NOT_STARTED",
      progress: 0,
    };

    setAllSubjects((prev) => [...prev, newSub]);
    setNewCode("");
    setNewName("");
    setAddDialogOpen(false);
    toast.success(`Added ${newSub.name} to Term ${term}! 📚`);
  };

  const handleDeleteSubject = (code: string, name: string) => {
    setAllSubjects((prev) => prev.filter((s) => s.code !== code));
    toast.success(`Removed subject ${name}`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <PageHeader title="📚 Study Tracker" description="Manage term courses, track syllabus progress, and study with Pomodoro timer">
        <PomodoroTimer />
      </PageHeader>

      {/* Term selector & Add Subject button */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {TERMS.map((t) => (
            <Button
              key={t}
              variant={term === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTerm(t)}
            >
              Term {t}
            </Button>
          ))}
        </div>

        {/* Add Subject Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
              <Plus className="w-4 h-4" /> Add Subject to Term {term}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> Add Subject to Term {term}
              </DialogTitle>
              <DialogDescription>Add a new course or subject to track your study progress.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddSubject} className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-semibold">Subject Code</label>
                  <Input placeholder="e.g. CS301" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Subject Name</label>
                  <Input placeholder="e.g. Operating Systems" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Priority</label>
                <select
                  className="w-full bg-background border rounded-lg p-2 text-sm"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option value="HIGH">⭐⭐⭐ Core Course</option>
                  <option value="MEDIUM">⭐⭐ Important</option>
                  <option value="LOW">⭐ Light Elective</option>
                  <option value="CERT">✅ Certification</option>
                </select>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Add Subject
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subjects Cards Grid */}
      {subjectsForTerm.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground italic">
          No subjects listed for Term {term}. Click "Add Subject to Term {term}" above to add your courses!
        </Card>
      ) : (
        <motion.div
          key={term}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {subjectsForTerm.map((sub) => (
            <Card
              key={sub.code}
              className={cn(
                "transition-all hover:shadow-md relative group",
                sub.status === "COMPLETED" && "border-emerald-500/40 bg-emerald-500/5",
                sub.status === "IN_PROGRESS" && "border-blue-500/40",
                sub.status === "NEEDS_REVISION" && "border-red-500/40"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-blue-500 font-semibold">{sub.code}</p>
                    <CardTitle className="text-sm mt-0.5 leading-snug">{sub.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {PRIORITY_LABELS[sub.priority]}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteSubject(sub.code, sub.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status buttons */}
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={sub.status === s ? "default" : "outline"}
                      className="text-xs h-7 px-2"
                      onClick={() => handleStatusChange(sub.code, s)}
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
                {/* Progress slider */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Syllabus Progress</span>
                    <span className="font-semibold">{sub.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sub.progress}
                    onChange={(e) => handleProgressChange(sub.code, Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <Progress value={sub.progress} className="h-1.5 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
