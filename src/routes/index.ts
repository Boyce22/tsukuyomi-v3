import { Router } from 'express';
import { userRouter } from '@/modules/user/user.factory';
import { authRouter } from '@/modules/auth/auth.factory';
import { countryRouter } from '@/modules/country/country.factory';


const routes = Router();

routes.use('/auth', authRouter);

routes.use('/users', userRouter)

routes.use('/countries', countryRouter)

// TODO: Add other routes
// routes.use('/mangas', mangaRouter);
// routes.use('/chapters', chapterRouter);
// routes.use('/users', userRouter);
// routes.use('/tags', tagRouter);

export default routes;