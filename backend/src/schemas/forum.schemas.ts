import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  content: z.string().min(1, "El contenido no puede estar vacío"),
  tags: z.array(z.string()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).optional(),
  // JSON.stringify de hasta 48 enteros 0-100: la forma de la onda, calculada
  // en el navegador al grabar. Se re-sanea en el servicio, esto solo la deja
  // pasar por validateBody (que reemplaza req.body por lo que matchea acá).
  audioPeaks: z.string().optional(),
});
