"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import type { Habit } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

export default function HabitsPage() {
  const qc = useQueryClient();

  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: () => fetch("/api/habits").then((r) => r.json()),
  });

  const toggleHabit = useMutation({
    mutationFn: (habitId: string) =>
      fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success(data.done ? "Habit completed! 🔥" : "Habit unchecked");
    },
  });

  return (
    <div>
      <PageHeader title="🔥 Habit Tracker" description="Build the discipline of champions. Track daily." />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {habits.map((habit) => {
            const isDone = habit.logs && habit.logs.length > 0;
            return (
              <motion.div key={habit.id} variants={item}>
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    isDone ? "border-emerald-500/50 bg-emerald-500/5" : ""
                  }`}
                  onClick={() => toggleHabit.mutate(habit.id)}
                >
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{habit.emoji}</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        isDone ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/50"
                      }`}>
                        {isDone ? "✓" : ""}
                      </div>
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isDone ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {isDone ? "Done today!" : "Tap to complete"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
