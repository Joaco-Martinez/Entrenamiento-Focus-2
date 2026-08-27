import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  content: z.string().min(1, "El contenido no puede estar vacío"),
  tags: z.array(z.string()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z.string().min(1, "El comentario no puede estar vacío"),
});
