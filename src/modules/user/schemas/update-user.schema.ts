import { z } from 'zod';
import { createUserSchema } from './create-user.schema';

export const updateUserSchema = createUserSchema.omit({ password: true });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;