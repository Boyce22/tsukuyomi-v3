import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/modules/user/entities/user.entity';
import { RegisterDTO } from './dtos/register.dto';
import { LoginDTO } from './dtos/login.dto';
import { AuthResponseDTO, RefreshTokenResponseDTO } from './dtos/auth-response.dto';
import { AppError } from '@errors';
import { AppDataSource, env } from '@config';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    await this.validateUniqueUser(data.email, data.userName);

    const birthDate = new Date(data.birthDate);
    const user = this.userRepository.create({
      name: data.name,
      lastName: data.lastName,
      userName: data.userName,
      email: data.email.toLowerCase(),
      password: await bcrypt.hash(data.password, 10),
      birthDate,
      lastLoginAt: new Date(),
      showMatureContent: this.calculateAge(birthDate) >= 18,
    });

    await this.userRepository.save(user);

    return this.buildAuthResponse(user);
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.findUserByIdentifier(data.identifier);

    if (!user) throw new AppError('Invalid credentials', 401);
    if (!user.isActive) throw new AppError('Account is deactivated', 403);

    await this.verifyPassword(data.password, user.password);

    await this.updateLastLogin(user.id);

    return this.buildAuthResponse(user);
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDTO> {
    const payload = this.verifyToken(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await this.getUserById(payload.userId);

    if (!user) throw new AppError('Invalid refresh token', 401);

    return this.generateTokens(user);
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });
  }

  verifyAccessToken(token: string): JWTPayload {
    return this.verifyToken(token, env.JWT_SECRET);
  }

  private async findUserByIdentifier(identifier: string): Promise<User | null> {
    const isEmail = identifier.includes('@');
    
    const whereClause = isEmail ? { email: identifier.toLowerCase() } : { userName: identifier };

    return this.userRepository.findOne({
      where: whereClause,
      select: [
        'id',
        'email',
        'password',
        'isActive',
        'name',
        'lastName',
        'userName',
        'role',
        'profilePictureUrl',
        'isVerified',
        'birthDate',
        'showMatureContent',
      ],
    });
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<void> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isValid) throw new AppError('Invalid credentials', 401);
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  private async validateUniqueUser(email: string, userName: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: email.toLowerCase() }, { userName }],
    });

    if (!existingUser) return;

    throw new AppError(
      existingUser.email === email.toLowerCase() ? 'Email already in use' : 'Username already taken',
      409,
    );
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private verifyToken(token: string, secret: string): JWTPayload {
    try {
      return jwt.verify(token, secret) as JWTPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any }),
      refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }),
    };
  }

  private sanitizeUser(user: User) {
    const { password, resetPasswordToken, verificationToken, ...sanitized } = user;
    return sanitized;
  }

  private buildAuthResponse(user: User): AuthResponseDTO {
    return {
      user: this.sanitizeUser(user),
      ...this.generateTokens(user),
    };
  }
}
