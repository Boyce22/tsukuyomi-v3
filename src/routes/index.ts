import { Router } from 'express';
import { authRouter } from '@/modules/auth/auth.controller';

const routes = Router();

// Auth routes
routes.use('/auth', authRouter);

// TODO: Add other routes
// routes.use('/mangas', mangaRouter);
// routes.use('/chapters', chapterRouter);
// routes.use('/users', userRouter);
// routes.use('/tags', tagRouter);

export default routes;