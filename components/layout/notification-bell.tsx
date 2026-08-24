"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  { id: "1", title: "Habit streak! 🔥", body: "7-day streak on Gym Workout", time: "2m ago", read: false },
  { id: "2", title: "Task due soon ⚠️", body: "MA112 Assignment due tomorrow", time: "1h ago", read: false },
  { id: "3", title: "Study goal reached 🎯", body: "2 hours of study logged today", time: "3h ago", read: true },
];

export function NotificationBell() {
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold text-sm">Notifications</span>
          {unread > 0 && (
            <span className="text-xs text-muted-foreground">{unread} unread</span>
          )}
        </div>
        <DropdownMenuSeparator />
        {MOCK_NOTIFICATIONS.map((n) => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
            <div className="flex w-full items-center justify-between">
              <span className={cn("text-sm font-medium", !n.read && "text-foreground")}>
                {n.title}
              </span>
              {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground">{n.body}</p>
            <span className="text-[10px] text-muted-foreground">{n.time}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-xs text-muted-foreground justify-center">
          Mark all as read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
