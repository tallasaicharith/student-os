import { z } from "zod";

export const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(100),
  emoji: z.string().min(1, "Emoji is required").max(10),
});

export type HabitFormValues = z.infer<typeof habitSchema>;
