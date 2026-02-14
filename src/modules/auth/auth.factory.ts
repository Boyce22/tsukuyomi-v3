import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

const authService = new AuthService();
const authController = new AuthController(authService);

export { authController, authService };
export const authRouter = authController.router;