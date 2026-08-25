"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Flame, Plus, Trash2, Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

export default function HabitsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("⚡");

  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: () => fetch("/api/habits").then((r) => r.json()),
  });

  const createHabit = useMutation({
    mutationFn: (data: { name: string; emoji: string }) =>
      fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (newHabit) => {
      qc.setQueryData<Habit[]>(["habits"], (old) => (old ? [...old, newHabit] : [newHabit]));
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success("New habit added! 🔥");
      setName("");
      setOpen(false);
    },
  });

  const toggleHabit = useMutation({
    mutationFn: (habitId: string) =>
      fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      }).then((r) => r.json()),
    onMutate: async (habitId) => {
      await qc.cancelQueries({ queryKey: ["habits"] });
      const previousHabits = qc.getQueryData<Habit[]>(["habits"]);
      if (previousHabits) {
        qc.setQueryData<Habit[]>(
          ["habits"],
          previousHabits.map((h) => {
            if (h.id === habitId) {
              const isCurrentlyDone = h.logs && h.logs.length > 0;
              return {
                ...h,
                logs: isCurrentlyDone ? [] : [{ id: "temp", date: new Date(), done: true } as any],
              };
            }
            return h;
          })
        );
      }
      return { previousHabits };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHabits) qc.setQueryData(["habits"], context.previousHabits);
      toast.error("Failed to toggle habit");
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success(data.done ? "Habit completed! 🔥" : "Habit unchecked");
    },
  });

  const deleteHabit = useMutation({
    mutationFn: (id: string) => fetch(`/api/habits/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habit deleted");
    },
  });

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createHabit.mutate({ name: name.trim(), emoji: emoji.trim() || "⚡" });
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <PageHeader title="🔥 Habit Tracker" description="Build the discipline of champions. Track your daily habits.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Create New Habit
              </DialogTitle>
              <DialogDescription>Track daily routine goals for long-term consistency.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddHabit} className="space-y-4 py-2">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-semibold">Emoji</label>
                  <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="text-center text-lg" />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-xs font-semibold">Habit Name</label>
                  <Input placeholder="e.g. Solve 2 LeetCode Problems" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={createHabit.isPending}>
                Save Habit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : habits.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground italic">
          No habits added yet. Click "Add Habit" above to start tracking your daily goals!
        </Card>
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
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 relative group border",
                    isDone ? "border-emerald-500/50 bg-emerald-500/5" : "border-border"
                  )}
                  onClick={() => toggleHabit.mutate(habit.id)}
                >
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{habit.emoji}</span>
                      
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHabit.mutate(habit.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>

                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2",
                          isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/50 hover:border-primary"
                        )}>
                          {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : ""}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className={cn("font-semibold text-sm transition-all", isDone ? "line-through text-muted-foreground" : "")}>
                        {habit.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Flame className={cn("w-3 h-3", isDone ? "text-emerald-500" : "text-orange-400")} />
                        {isDone ? "Completed today!" : "Tap to check off"}
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
