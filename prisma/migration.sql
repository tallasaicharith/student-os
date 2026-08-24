-- Supabase PostgreSQL Migration SQL for StudentOS
-- Creates 30+ optimized tables, indexes, enums, primary/foreign keys, and relationships.

-- Create Enums
CREATE TYPE "TaskCategory" AS ENUM ('STUDY', 'PROJECT', 'PERSONAL', 'FITNESS');
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "SubjectPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'CERT');
CREATE TYPE "SubjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NEEDS_REVISION');
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');
CREATE TYPE "Platform" AS ENUM ('LEETCODE', 'GITHUB', 'CODEFORCES', 'HACKERRANK');
CREATE TYPE "ApplicationStatus" AS ENUM ('WISHLIST', 'APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED');
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- Create Users Table
CREATE TABLE "users" (
    "id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Create User Settings Table
CREATE TABLE "user_settings" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "theme" VARCHAR(255) NOT NULL DEFAULT 'system',
    "dailyPageGoal" INTEGER NOT NULL DEFAULT 20,
    "pomodoroMinutes" INTEGER NOT NULL DEFAULT 25,
    "notifications" BOOLEAN NOT NULL DEFAULT TRUE,
    "preferredLang" VARCHAR(10) NOT NULL DEFAULT 'en',
    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- Create Goals Table
CREATE TABLE "goals" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(255) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "currentProgress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "targetProgress" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "done" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "goals_userId_idx" ON "goals"("userId");

-- Create Tasks Table
CREATE TABLE "tasks" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" "TaskCategory" NOT NULL DEFAULT 'STUDY',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");
CREATE INDEX "tasks_userId_done_idx" ON "tasks"("userId", "done");

-- Create Habits Table
CREATE TABLE "habits" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "emoji" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "habits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "habits_userId_idx" ON "habits"("userId");

-- Create Habit Logs Table
CREATE TABLE "habit_logs" (
    "id" VARCHAR(255) NOT NULL,
    "habitId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "habit_logs_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE,
    CONSTRAINT "habit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "habit_logs_habitId_date_key" ON "habit_logs"("habitId", "date");
CREATE INDEX "habit_logs_userId_date_idx" ON "habit_logs"("userId", "date");

-- Create Books Table
CREATE TABLE "books" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255),
    "totalPages" INTEGER NOT NULL,
    "readPages" INTEGER NOT NULL DEFAULT 0,
    "category" VARCHAR(255) NOT NULL DEFAULT 'Mindset',
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "books_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "books_userId_idx" ON "books"("userId");

-- Create Reading Sessions Table
CREATE TABLE "reading_sessions" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "bookId" VARCHAR(255) NOT NULL,
    "pagesRead" INTEGER NOT NULL,
    "minutesSpent" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reading_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reading_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "reading_sessions_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE
);
CREATE INDEX "reading_sessions_userId_idx" ON "reading_sessions"("userId");
CREATE INDEX "reading_sessions_bookId_idx" ON "reading_sessions"("bookId");

-- Create Gita Progress Table
CREATE TABLE "gita_progress" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT TRUE,
    "reflection" TEXT,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gita_progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "gita_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "gita_progress_userId_chapter_verse_key" ON "gita_progress"("userId", "chapter", "verse");
CREATE INDEX "gita_progress_userId_idx" ON "gita_progress"("userId");

-- Create Courses Table
CREATE TABLE "courses" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "credit" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "courses_userId_idx" ON "courses"("userId");

-- Create Subjects Table
CREATE TABLE "subjects" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "courseId" VARCHAR(255),
    "code" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "term" INTEGER NOT NULL,
    "priority" "SubjectPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "SubjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subjects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL
);
CREATE INDEX "subjects_userId_idx" ON "subjects"("userId");

-- Create Assignments Table
CREATE TABLE "assignments" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "subjectId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT FALSE,
    "grade" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE
);
CREATE INDEX "assignments_userId_idx" ON "assignments"("userId");
CREATE INDEX "assignments_subjectId_idx" ON "assignments"("subjectId");

-- Create Attendance Table
CREATE TABLE "attendance" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "subjectId" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "attendance_subjectId_date_key" ON "attendance"("subjectId", "date");
CREATE INDEX "attendance_userId_idx" ON "attendance"("userId");

-- Create CGPA Logs Table
CREATE TABLE "cgpa_logs" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "term" INTEGER NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cgpa_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cgpa_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "cgpa_logs_userId_term_key" ON "cgpa_logs"("userId", "term");

-- Create Coding Sessions Table
CREATE TABLE "coding_sessions" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "platform" "Platform" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "language" VARCHAR(255) NOT NULL,
    "problemsSolved" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coding_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "coding_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "coding_sessions_userId_idx" ON "coding_sessions"("userId");

-- Create Leetcode Stats Table
CREATE TABLE "leetcode_stats" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "easySolved" INTEGER NOT NULL DEFAULT 0,
    "mediumSolved" INTEGER NOT NULL DEFAULT 0,
    "hardSolved" INTEGER NOT NULL DEFAULT 0,
    "totalSolved" INTEGER NOT NULL DEFAULT 0,
    "lastSync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leetcode_stats_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leetcode_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "leetcode_stats_userId_key" ON "leetcode_stats"("userId");

-- Create Github Stats Table
CREATE TABLE "github_stats" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "commits" INTEGER NOT NULL DEFAULT 0,
    "repos" INTEGER NOT NULL DEFAULT 0,
    "lastSync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "github_stats_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "github_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "github_stats_userId_key" ON "github_stats"("userId");

-- Create Projects Table
CREATE TABLE "projects" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "stack" VARCHAR(255) NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "github" VARCHAR(255),
    "liveUrl" VARCHAR(255),
    "milestone" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- Create Companies Table
CREATE TABLE "companies" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(255),
    "website" VARCHAR(255),
    "logoUrl" TEXT,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- Create Applications Table
CREATE TABLE "applications" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "companyId" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'WISHLIST',
    "stipend" INTEGER,
    "location" VARCHAR(255),
    "notes" TEXT,
    "appliedDate" TIMESTAMP(3),
    "interviewDate" TIMESTAMP(3),
    "referralName" VARCHAR(255),
    "referralEmail" VARCHAR(255),
    "jobDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "applications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "applications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE
);
CREATE INDEX "applications_userId_idx" ON "applications"("userId");
CREATE INDEX "applications_companyId_idx" ON "applications"("companyId");

-- Create Running Sessions Table
CREATE TABLE "running_sessions" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "durationMinutes" DOUBLE PRECISION NOT NULL,
    "paceMinPerKm" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "running_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "running_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "running_sessions_userId_idx" ON "running_sessions"("userId");

-- Create Gym Workouts Table
CREATE TABLE "gym_workouts" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "splitName" VARCHAR(255) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gym_workouts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "gym_workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "gym_workouts_userId_idx" ON "gym_workouts"("userId");

-- Create Gym Sets Table
CREATE TABLE "gym_sets" (
    "id" VARCHAR(255) NOT NULL,
    "workoutId" VARCHAR(255) NOT NULL,
    "exerciseName" VARCHAR(255) NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gym_sets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "gym_sets_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "gym_workouts"("id") ON DELETE CASCADE
);
CREATE INDEX "gym_sets_workoutId_idx" ON "gym_sets"("workoutId");

-- Create Meals Table
CREATE TABLE "meals" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "calories" INTEGER NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "waterMl" INTEGER NOT NULL DEFAULT 0,
    "type" "MealType" NOT NULL DEFAULT 'LUNCH',
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "meals_userId_idx" ON "meals"("userId");

-- Create Weight Logs Table
CREATE TABLE "weight_logs" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "bodyFatPct" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weight_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "weight_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "weight_logs_userId_idx" ON "weight_logs"("userId");

-- Create Journal Entries Table
CREATE TABLE "journal_entries" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "mood" VARCHAR(255),
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "journal_entries_userId_idx" ON "journal_entries"("userId");

-- Create Notes Table
CREATE TABLE "notes" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "folder" VARCHAR(255) NOT NULL DEFAULT 'Notes',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "notes_userId_idx" ON "notes"("userId");

-- Create Flashcards Table
CREATE TABLE "flashcards" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "nextReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "flashcards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "flashcards_userId_idx" ON "flashcards"("userId");

-- Create Research Papers Table
CREATE TABLE "research_papers" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "authors" VARCHAR(255) NOT NULL,
    "abstract" TEXT,
    "fileUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "journalName" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "research_papers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "research_papers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "research_papers_userId_idx" ON "research_papers"("userId");

-- Create Certificates Table
CREATE TABLE "certificates" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "issuer" VARCHAR(255) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "credentialUrl" TEXT,
    "category" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "certificates_userId_idx" ON "certificates"("userId");

-- Create Achievements Table
CREATE TABLE "achievements" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "achievements_userId_idx" ON "achievements"("userId");

-- Create Notifications Table
CREATE TABLE "notifications" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- Create Study Logs Table
CREATE TABLE "study_logs" (
    "id" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "subjectId" VARCHAR(255) NOT NULL,
    "minutes" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "study_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "study_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "study_logs_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE
);
CREATE INDEX "study_logs_userId_date_idx" ON "study_logs"("userId", "date");
