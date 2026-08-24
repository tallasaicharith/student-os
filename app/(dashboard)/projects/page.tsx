"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Github, ExternalLink, Code2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      toast.success("Project added! 🚀");
      setOpen(false);
      form.reset();
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
    <div>
      <PageHeader title="🛠️ Projects" description="Build your portfolio. One commit at a time.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createProject.mutate(d))} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl><Input placeholder="e.g. AI Chatbot with Memory" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stack" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tech Stack</FormLabel>
                    <FormControl><Input placeholder="e.g. Python, FastAPI, LangChain" {...field} /></FormControl>
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
                      <FormLabel>Progress %</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="milestone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Milestone</FormLabel>
                    <FormControl><Input placeholder="What's the next thing to build?" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="github" render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createProject.isPending}>
                  {createProject.isPending ? "Saving..." : "Create Project"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={Code2} title="No projects yet" description="Start building your portfolio today!" />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {projects.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
                <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">{p.name}</CardTitle>
                      <Badge variant={STATUS_COLORS[p.status] ?? "secondary"} className="text-xs shrink-0">
                        {STATUS_EMOJI[p.status]} {p.status.replace("_"," ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-500 font-mono mt-1">⚙ {p.stack}</p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    {p.milestone && (
                      <p className="text-xs text-muted-foreground">
                        🎯 Next: <span className="text-foreground font-medium">{p.milestone}</span>
                      </p>
                    )}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span><span className="font-semibold">{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-2">
                        {p.github && (
                          <a href={p.github} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Github className="w-3.5 h-3.5" /></Button>
                          </a>
                        )}
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
                          </a>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteProject.mutate(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
