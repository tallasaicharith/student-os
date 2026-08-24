// ─── Navigation ──────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Schedule", href: "/schedule", icon: "Calendar" },
  { label: "Tasks", href: "/tasks", icon: "CheckSquare" },
  { label: "Habits", href: "/habits", icon: "Flame" },
  { label: "Study", href: "/study", icon: "BookOpen" },
  { label: "Projects", href: "/projects", icon: "Code2" },
  { label: "Reading", href: "/reading", icon: "BookMarked" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

// ─── Default Habits ───────────────────────────────────────────────────────────
export const DEFAULT_HABITS = [
  { name: "Wake at 4 AM", emoji: "⚡" },
  { name: "Gym Workout", emoji: "🏋️" },
  { name: "Read 20 Pages", emoji: "📖" },
  { name: "LeetCode / Coding", emoji: "💻" },
  { name: "Meditate", emoji: "🧘" },
  { name: "Journal", emoji: "📝" },
  { name: "Drink 3L Water", emoji: "💧" },
  { name: "Sleep by 11 PM", emoji: "😴" },
];

// ─── Sophomore Subjects ───────────────────────────────────────────────────────
export const SOPHOMORE_SUBJECTS = {
  1: [
    { code: "MA112", name: "Probability Theory & Statistical Analysis", priority: "HIGH" as const },
    { code: "AI201", name: "Fundamentals of Artificial Intelligence", priority: "HIGH" as const },
    { code: "CS207", name: "Data Structures Using C++", priority: "HIGH" as const },
    { code: "DS204", name: "Advanced Database Management Systems", priority: "MEDIUM" as const },
    { code: "RE101", name: "Research Methodology", priority: "LOW" as const },
    { code: "EC102", name: "MS Office Specialist: Word 2019", priority: "CERT" as const },
    { code: "EC201", name: "English Language Proficiency B2", priority: "CERT" as const },
  ],
  2: [
    { code: "MA113", name: "Linear Algebra Essentials", priority: "HIGH" as const },
    { code: "CS209", name: "Advanced Data Structures", priority: "HIGH" as const },
    { code: "CS210", name: "Backend Development Fundamentals", priority: "HIGH" as const },
    { code: "DS201", name: "Foundations of Data Science", priority: "HIGH" as const },
    { code: "RE102", name: "Research and Publication Ethics", priority: "LOW" as const },
    { code: "EC103", name: "MS Office Specialist: Excel 2019", priority: "CERT" as const },
  ],
  3: [
    { code: "EL101", name: "Digital Electronics", priority: "MEDIUM" as const },
    { code: "AI203", name: "Introduction to Machine Learning", priority: "HIGH" as const },
    { code: "CS211", name: "Analysis of Algorithms", priority: "HIGH" as const },
    { code: "CS212", name: "Software Engineering Fundamentals", priority: "MEDIUM" as const },
    { code: "EC104", name: "MS Office: PowerPoint 2019", priority: "CERT" as const },
  ],
  4: [
    { code: "AI202", name: "Internship II", priority: "HIGH" as const },
    { code: "MS101", name: "Managerial Economics & Financial Accounting", priority: "LOW" as const },
    { code: "RE203", name: "Workshop", priority: "CERT" as const },
  ],
};

// ─── Motivational Quotes ──────────────────────────────────────────────────────
export const QUOTES = [
  { text: "Be so good they can't ignore you.", author: "Steve Martin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "योग: कर्मसु कौशलम् — Yoga is skill in action.", author: "Bhagavad Gita" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "You have power over your mind, not outside events.", author: "Marcus Aurelius" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Do or do not. There is no try.", author: "Yoda" },
];

// ─── Pomodoro ─────────────────────────────────────────────────────────────────
export const POMODORO_FOCUS_MINUTES = 25;
export const POMODORO_BREAK_MINUTES = 5;
export const POMODORO_LONG_BREAK_MINUTES = 15;
