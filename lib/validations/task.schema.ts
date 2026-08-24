import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.enum(["STUDY", "PROJECT", "PERSONAL", "FITNESS"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  dueDate: z.string().optional().nullable(),
});

export const updateTaskSchema = taskSchema.partial().extend({
  done: z.boolean().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
