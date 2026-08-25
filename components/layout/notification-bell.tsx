"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, Flame, CheckSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (_e) {}
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read!");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 shadow-xl border-indigo-500/20">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
            <Bell className="w-3.5 h-3.5 text-indigo-500" /> Real-Time Notifications
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-semibold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-y-auto space-y-0.5">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No new notifications</div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => {
                  setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
                }}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer transition-colors border-b last:border-b-0",
                  !n.read ? "bg-indigo-500/5 hover:bg-indigo-500/10" : "hover:bg-muted/50 opacity-80"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={cn("text-xs font-semibold flex items-center gap-1.5", !n.read && "text-indigo-500")}>
                    {n.type === "task" && <CheckSquare className="w-3.5 h-3.5 text-amber-500" />}
                    {n.type === "habit" && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                    {n.type === "ai" && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                    {n.title}
                  </span>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                <span className="text-[10px] text-muted-foreground/70">{n.time}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={markAllRead}
          className="text-center text-xs text-indigo-500 font-semibold justify-center cursor-pointer hover:bg-muted"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark all as read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
