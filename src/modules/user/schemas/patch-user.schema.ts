import { z } from 'zod';
import { updateUserSchema } from './update-user.schema';

export const patchUserSchema = updateUserSchema.partial();

export type PatchUserInput = z.infer<typeof patchUserSchema>;