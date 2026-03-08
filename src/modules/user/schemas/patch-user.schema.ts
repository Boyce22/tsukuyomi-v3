import { z } from 'zod';
import { updateUserSchema } from '@/modules/user/schemas/update-user.schema';

export const patchUserSchema = updateUserSchema.partial();

export type PatchUserInput = z.infer<typeof patchUserSchema>;
