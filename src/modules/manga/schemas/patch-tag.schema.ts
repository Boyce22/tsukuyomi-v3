import { z } from 'zod';
import { createTagSchema } from './create-tag.schema';

export const patchTagSchema = createTagSchema.partial().extend({ isActive: z.boolean().optional() });

export type PatchTagInput = z.infer<typeof patchTagSchema>;
