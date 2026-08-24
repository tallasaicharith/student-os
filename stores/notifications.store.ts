import { create } from "zustand";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (n: Omit<NotificationItem, "id" | "time" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    { id: "1", title: "Habit streak! 🔥", body: "7-day streak on Gym Workout", time: "2m ago", read: false },
    { id: "2", title: "Task due soon ⚠️", body: "MA112 Assignment due tomorrow", time: "1h ago", read: false },
    { id: "3", title: "Study goal reached 🎯", body: "2 hours of study logged today", time: "3h ago", read: true },
  ],
  addNotification: (n) =>
    set((state) => ({
      notifications: [
        {
          id: Math.random().toString(),
          ...n,
          time: "Just now",
          read: false,
        },
        ...state.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
