import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

export const createCommentSchema = z.object({
  content: z.string().min(1),
});
