import { z } from "zod";

// Shared validation for companion creation. strictObject rejects unknown
// keys, which blocks mass-assignment of unexpected columns on insert.
// Only createCompanion's expected fields and their types are accepted.
export const companionFormSchema = z.strictObject({
  name: z.string().min(1, "name is required.").max(100),
  subject: z.enum([
    "maths",
    "language",
    "science",
    "history",
    "coding",
    "economics",
    "geography",
    "finance",
    "business",
  ]),
  topic: z.string().min(1, { message: "Topic is required." }).max(1000),
  voice: z.enum(["male", "female"]),
  style: z.enum(["formal", "casual"]),
  duration: z
    .number()
    .int()
    .min(1, { message: "Duration is required." })
    .max(240),
});

export type CompanionFormInput = z.infer<typeof companionFormSchema>;