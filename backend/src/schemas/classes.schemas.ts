import { z } from "zod";

export const createClassSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  arPrice: z.number().int().min(0).default(0),
  usdPrice: z.number().int().min(0).default(0),
});

export const updateClassSchema = createClassSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export const saveProgressSchema = z.object({
  positionSeconds: z.number().min(0),
});
