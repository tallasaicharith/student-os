"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { PomodoroTimer } from "@/components/study/pomodoro-timer";
import { SOPHOMORE_SUBJECTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

const STATUS_COLORS: Record<Status, string> = {
  NOT_STARTED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  NEEDS_REVISION: "destructive",
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "⭐⭐⭐ Core",
  MEDIUM: "⭐⭐ Important",
  LOW: "⭐ Light",
  CERT: "✅ Certification",
};

export default function StudyPage() {
  const [term, setTerm] = useState<Term>(1);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});

  const subjects = SOPHOMORE_SUBJECTS[term];

  const setStatus = (code: string, status: Status) =>
    setStatuses((prev) => ({ ...prev, [code]: status }));

  const setSubjectProgress = (code: string, val: number) =>
    setProgress((prev) => ({ ...prev, [code]: val }));

  return (
    <div>
      <PageHeader title="📚 Study Tracker" description="Sophomore Year — AI & Data Engineering">
        <PomodoroTimer />
      </PageHeader>

      {/* Term tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TERMS.map((t) => (
          <Button key={t} variant={term === t ? "default" : "outline"} size="sm" onClick={() => setTerm(t)}>
            Term {t}
          </Button>
        ))}
      </div>

      <motion.div
        key={term}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {subjects.map((sub) => {
          const status = statuses[sub.code] ?? "NOT_STARTED";
          const prog = progress[sub.code] ?? 0;

          return (
            <Card key={sub.code} className={cn(
              "transition-all hover:shadow-md",
              status === "COMPLETED" && "border-emerald-500/40",
              status === "IN_PROGRESS" && "border-blue-500/40",
              status === "NEEDS_REVISION" && "border-red-500/40"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-blue-500 font-semibold">{sub.code}</p>
                    <CardTitle className="text-sm mt-0.5 leading-snug">{sub.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{PRIORITY_LABELS[sub.priority]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status buttons */}
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={status === s ? "default" : "outline"}
                      className="text-xs h-7 px-2"
                      onClick={() => setStatus(sub.code, s)}
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
                {/* Progress slider */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">{prog}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={prog}
                    onChange={(e) => setSubjectProgress(sub.code, Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <Progress value={prog} className="h-1.5 mt-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>
    </div>
  );
}
