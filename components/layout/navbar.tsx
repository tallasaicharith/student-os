"use client";

import { Search, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useUIStore } from "@/stores/ui.store";
import { getGreeting } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { toggleMobileSidebar, setCommandPaletteOpen } = useUIStore();
  const { user, isLoaded } = useUser();
  const firstName = user?.firstName || "Student";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6"
    >
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Greeting */}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground hidden sm:block">
          {getGreeting()},{" "}
          <span className="font-semibold text-foreground">{firstName} 👋</span>
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search / Command palette */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex items-center gap-2 text-muted-foreground w-48 justify-between"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">Search...</span>
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        <NotificationBell />
        <ThemeToggle />
        
        {/* Clerk User Button with Profile & Sign Out */}
        {isLoaded && user ? (
          <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
        ) : (
          <Avatar className="h-8 w-8 border border-primary/20">
            <AvatarFallback>{firstName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </motion.header>
  );
}
