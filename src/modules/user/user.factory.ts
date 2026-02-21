import pino from 'pino';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppDataSource } from '@config';

import { countryService } from '@/modules/country/country.factory';

const logger = pino({ name: 'user-module' });

const userRepository = new UserRepository(AppDataSource.getRepository(User));
const userService = new UserService(userRepository, logger);
const userController = new UserController(userService, countryService);

export { userController, userService, userRepository };
export const userRouter = userController.router;
