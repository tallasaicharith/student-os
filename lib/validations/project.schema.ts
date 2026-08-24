import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
  stack: z.string().min(1, "Tech stack is required").max(200),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]),
  progress: z.number().min(0).max(100),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  milestone: z.string().max(300).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
