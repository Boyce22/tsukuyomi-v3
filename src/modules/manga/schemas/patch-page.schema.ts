import { z } from 'zod';

export const patchPageSchema = z.object({
  number: z.coerce.number().int().positive().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type PatchPageInput = z.infer<typeof patchPageSchema>;
