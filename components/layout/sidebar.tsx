"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, CheckSquare, Flame, BookOpen,
  Code2, BookMarked, Settings, ChevronLeft, ChevronRight,
  Sparkles, Terminal, Briefcase, Dumbbell, BarChart3, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

export const NAV_ITEMS = [
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

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <span className="text-2xl flex-shrink-0">⚡</span>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg text-foreground tracking-tight whitespace-nowrap"
              >
                StudentOS
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="text-sm font-medium whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-72 max-w-[80vw] h-full bg-sidebar border-r border-sidebar-border flex flex-col z-10 shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-lg text-foreground tracking-tight">
                  StudentOS
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(false)}
                className="h-8 w-8 text-sidebar-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer text-sm font-medium my-0.5",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
