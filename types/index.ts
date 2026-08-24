// ─── Task Types ───────────────────────────────────────────────────────────────
export type TaskCategory = "STUDY" | "PROJECT" | "PERSONAL" | "FITNESS";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string | null;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Habit Types ──────────────────────────────────────────────────────────────
export interface Habit {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  order: number;
  createdAt: string;
  logs?: HabitLog[];
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  done: boolean;
}

// ─── Subject Types ────────────────────────────────────────────────────────────
export type SubjectPriority = "HIGH" | "MEDIUM" | "LOW" | "CERT";
export type SubjectStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NEEDS_REVISION";

export interface Subject {
  id: string;
  userId: string;
  code: string;
  name: string;
  term: number;
  priority: SubjectPriority;
  status: SubjectStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Project Types ────────────────────────────────────────────────────────────
export type ProjectStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD";

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  stack: string;
  status: ProjectStatus;
  progress: number;
  github?: string;
  liveUrl?: string;
  milestone?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Book Types ───────────────────────────────────────────────────────────────
export interface Book {
  id: string;
  userId: string;
  title: string;
  author?: string;
  totalPages: number;
  readPages: number;
  category: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Study Types ──────────────────────────────────────────────────────────────
export interface StudyLog {
  id: string;
  userId: string;
  subjectId: string;
  minutes: number;
  date: string;
  createdAt: string;
}

// ─── API Types ────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  tasksDoneToday: number;
  habitsCompletedToday: number;
  studyMinutesToday: number;
  currentStreak: number;
  pagesReadToday: number;
  projectsInProgress: number;
}
