"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog, Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, Calendar, CheckSquare, Flame,
  BookOpen, Code2, BookMarked, Settings,
  Sparkles, Terminal, Briefcase, Dumbbell, BarChart3
} from "lucide-react";
import { useUIStore } from "@/stores/ui.store";

const PAGES = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "AI Mentor", href: "/mentor", icon: Sparkles },
  { label: "Coding Hub", href: "/coding", icon: Terminal },
  { label: "Internship Hub", href: "/internship", icon: Briefcase },
  { label: "Fitness Hub", href: "/fitness", icon: Dumbbell },
  { label: "Reading Hub", href: "/reading", icon: BookMarked },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Habits", href: "/habits", icon: Flame },
  { label: "Study Tracker", href: "/study", icon: BookOpen },
  { label: "Projects", href: "/projects", icon: Code2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setCommandPaletteOpen(false);
    },
    [router, setCommandPaletteOpen]
  );

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Search pages, tasks, commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem
                key={page.href}
                onSelect={() => navigate(page.href)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                {page.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => navigate("/tasks")}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Add New Task
          </CommandItem>
          <CommandItem onSelect={() => navigate("/projects")}>
            <Code2 className="mr-2 h-4 w-4" />
            Add New Project
          </CommandItem>
          <CommandItem onSelect={() => navigate("/study")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Start Study Session
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
