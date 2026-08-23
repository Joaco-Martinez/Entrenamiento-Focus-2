import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  authorName: z.string().default("Entrenamiento Focus"),
});

export const updateArticleSchema = createArticleSchema.partial();
