"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Github, ExternalLink, Code2, Check, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
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
import { projectSchema, type ProjectFormValues } from "@/lib/validations/project.schema";
import type { Project } from "@/types";

const STATUS_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  NOT_STARTED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  ON_HOLD: "destructive",
};

const STATUS_EMOJI: Record<string, string> = {
  NOT_STARTED: "🔘",
  IN_PROGRESS: "🚧",
  COMPLETED: "✅",
  ON_HOLD: "⏸",
};

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then((r) => r.json()),
  });

  const createProject = useMutation({
    mutationFn: (data: ProjectFormValues) =>
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created! 🚀");
      setOpen(false);
      form.reset();
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectFormValues> }) =>
      fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => fetch(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "", description: "", stack: "",
      status: "NOT_STARTED", progress: 0,
      github: "", liveUrl: "", milestone: "",
    },
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <PageHeader title="🛠️ Projects" description="Build your portfolio. Track progress from idea to deployment.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createProject.mutate(d))} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl><Input placeholder="e.g. StudentOS Academic Platform" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stack" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tech Stack</FormLabel>
                    <FormControl><Input placeholder="e.g. Next.js, TypeScript, Tailwind, Supabase" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {["NOT_STARTED","IN_PROGRESS","COMPLETED","ON_HOLD"].map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_EMOJI[s]} {s.replace("_"," ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="progress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Progress %</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="milestone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Milestone</FormLabel>
                    <FormControl><Input placeholder="What's the next feature to build?" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="github" render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repo URL</FormLabel>
                    <FormControl><Input placeholder="https://github.com/username/repo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={createProject.isPending}>
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={Code2} title="No projects yet" description="Start building your portfolio today!" />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdateStatus={(id, status) => updateProject.mutate({ id, data: { status: status as any } })}
                onUpdateProgress={(id, progress) => updateProject.mutate({ id, data: { progress } })}
                onDelete={(id) => deleteProject.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onUpdateStatus,
  onUpdateProgress,
  onDelete,
}: {
  project: Project;
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
}) {
  const [localProgress, setLocalProgress] = useState(project.progress);

  // Sync local progress when server project updates
  useEffect(() => {
    setLocalProgress(project.progress);
  }, [project.progress]);

  const handleSliderCommit = (val: number) => {
    setLocalProgress(val);
    onUpdateProgress(project.id, val);
    toast.success(`Updated "${project.name}" progress to ${val}%! 🚀`);
  };

  const handleAddProgress = (delta: number) => {
    const nextVal = Math.min(100, Math.max(0, localProgress + delta));
    setLocalProgress(nextVal);
    onUpdateProgress(project.id, nextVal);
    toast.success(`Progress set to ${nextVal}%!`);
  };

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
      <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 h-full flex flex-col group relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight font-bold">{project.name}</CardTitle>
            
            {/* Status Selector */}
            <Select value={project.status} onValueChange={(val) => onUpdateStatus(project.id, val)}>
              <SelectTrigger className="h-7 text-xs w-32 px-2 border-primary/20">
                <SelectValue>{STATUS_EMOJI[project.status]} {project.status.replace("_", " ")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {["NOT_STARTED","IN_PROGRESS","COMPLETED","ON_HOLD"].map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_EMOJI[s]} {s.replace("_"," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-blue-500 font-mono mt-1">⚙ {project.stack}</p>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {project.milestone && (
            <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border">
              🎯 Next: <span className="text-foreground font-medium">{project.milestone}</span>
            </p>
          )}

          {/* Smooth Interactive Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Completion Progress</span>
              <span className="font-semibold text-foreground">{localProgress}%</span>
            </div>
            
            <input
              type="range"
              min={0}
              max={100}
              value={localProgress}
              onChange={(e) => setLocalProgress(Number(e.target.value))}
              onMouseUp={(e) => handleSliderCommit(Number((e.target as HTMLInputElement).value))}
              onTouchEnd={(e) => handleSliderCommit(Number((e.target as HTMLInputElement).value))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-muted rounded-lg appearance-none"
            />
            
            <Progress value={localProgress} className="h-1.5" />

            {/* Quick Action Progress Buttons */}
            <div className="flex gap-1.5 pt-1 justify-between">
              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => handleAddProgress(10)}>
                +10%
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => handleAddProgress(25)}>
                +25%
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20" onClick={() => handleAddProgress(100 - localProgress)}>
                100% Done ✓
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              {project.github && (
                <a href={project.github} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Github className="w-3.5 h-3.5" /></Button>
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500"><ExternalLink className="w-3.5 h-3.5" /></Button>
                </a>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
