"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckSquare, Trash2, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task.schema";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const INITIAL_LOCAL_TASKS: Task[] = [
  { id: "seed-1", userId: "guest", title: "Wake up at 4:00 AM", category: "PERSONAL", priority: "HIGH", done: false, dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "seed-2", userId: "guest", title: "Perform Gym workout (Chest + Triceps)", category: "FITNESS", priority: "HIGH", done: false, dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "seed-3", userId: "guest", title: "Read Bhagavad Gita Chapter 2, Verse 47", category: "STUDY", priority: "MEDIUM", done: false, dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "seed-4", userId: "guest", title: "Solve 5 LeetCode Dynamic Programming challenges", category: "PROJECT", priority: "HIGH", done: false, dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const PRIORITY_COLORS = { HIGH: "destructive", MEDIUM: "secondary", LOW: "outline" } as const;
const CATEGORY_ICONS = { STUDY: "📚", PROJECT: "🛠", PERSONAL: "🙂", FITNESS: "💪" };
const FILTERS = ["All", "STUDY", "PROJECT", "PERSONAL", "FITNESS"] as const;

export default function TasksPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // 1. Sync LocalStorage tasks on mount
  useEffect(() => {
    const saved = localStorage.getItem("studentos_local_tasks");
    if (saved) {
      try {
        setLocalTasks(JSON.parse(saved));
      } catch (_e) {
        setLocalTasks(INITIAL_LOCAL_TASKS);
      }
    } else {
      setLocalTasks(INITIAL_LOCAL_TASKS);
      localStorage.setItem("studentos_local_tasks", JSON.stringify(INITIAL_LOCAL_TASKS));
    }
  }, []);

  const { data: serverTasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) return localTasks;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem("studentos_local_tasks", JSON.stringify(data));
          setLocalTasks(data);
          return data;
        }
        return localTasks;
      } catch (_e) {
        return localTasks;
      }
    },
  });

  const displayTasks = serverTasks.length > 0 ? serverTasks : localTasks;

  const saveLocalTasksState = (newTasks: Task[]) => {
    setLocalTasks(newTasks);
    localStorage.setItem("studentos_local_tasks", JSON.stringify(newTasks));
    qc.setQueryData(["tasks"], newTasks);
  };

  const createTask = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const newTask: Task = {
        id: Math.random().toString(),
        userId: "user",
        title: data.title.trim(),
        category: data.category,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString(),
        done: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [newTask, ...displayTasks];
      saveLocalTasksState(updated);

      try {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (_e) {}
      return newTask;
    },
    onSuccess: () => {
      toast.success("Task added! 🚀");
      setOpen(false);
      form.reset();
    },
    onError: () => toast.error("Failed to create task"),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const updated = displayTasks.map((t) => (t.id === id ? { ...t, done } : t));
      saveLocalTasksState(updated);

      try {
        await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ done }),
        });
      } catch (_e) {}
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const updated = displayTasks.filter((t) => t.id !== id);
      saveLocalTasksState(updated);

      try {
        await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      } catch (_e) {}
    },
    onSuccess: () => {
      toast.success("Task deleted");
    },
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", category: "STUDY", priority: "MEDIUM" },
  });

  const filtered = filter === "All" ? displayTasks : displayTasks.filter((t) => t.category === filter);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <PageHeader title="✅ Tasks" description="Manage your daily study and project to-dos">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createTask.mutate(d))} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Finish Operating Systems Chapter 4" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {["STUDY", "PROJECT", "PERSONAL", "FITNESS"].map((c) => (
                            <SelectItem key={c} value={c}>{CATEGORY_ICONS[c as keyof typeof CATEGORY_ICONS]} {c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="HIGH">🔴 High</SelectItem>
                          <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                          <SelectItem value="LOW">🟢 Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (optional)</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={createTask.isPending}>
                  {createTask.isPending ? "Saving..." : "Save Task"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "All" ? "All Tasks" : `${CATEGORY_ICONS[f as keyof typeof CATEGORY_ICONS]} ${f}`}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description="Add your first task to get started!" />
      ) : (
        <motion.div className="space-y-2" layout>
          <AnimatePresence>
            {filtered.map((task) => (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className={cn("transition-all hover:shadow-sm", task.done && "opacity-60 bg-muted/20 border-muted")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTask.mutate({ id: task.id, done: !task.done })}
                      className={cn(
                        "w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer",
                        task.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground hover:border-primary"
                      )}
                    >
                      {task.done && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                    <span className={cn("flex-1 text-sm font-medium transition-all", task.done && "line-through text-muted-foreground")}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_ICONS[task.category as keyof typeof CATEGORY_ICONS]}</span>
                      <Badge variant={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] ?? "outline"} className="text-xs">
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => deleteTask.mutate(task.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
