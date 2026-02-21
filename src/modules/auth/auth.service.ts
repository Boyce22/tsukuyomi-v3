import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { RegisterDTO } from './dtos/register.dto';
import { LoginDTO } from './dtos/login.dto';
import { AuthResponseDTO, RefreshTokenResponseDTO } from './dtos/auth-response.dto';

import { AppDataSource, env } from '@config';

import { User } from '@/modules/user/entities/user.entity';

import { toUserResponse } from '@/shared/helpers/user-response.helper';
import { ConflictError, ForbiddenError, UnauthorizedError } from '@errors';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const normalizedEmail = data.email.toLowerCase();
    await this.validateUniqueUser(normalizedEmail, data.userName);

    const birthDate = new Date(data.birthDate);
    const hashedPassword = await bcrypt.hash(data.password, AuthService.SALT_ROUNDS);

    const user = this.userRepository.create({
      name: data.name,
      lastName: data.lastName,
      userName: data.userName,
      email: normalizedEmail,
      password: hashedPassword,
      birthDate,
      lastLoginAt: new Date(),
      showMatureContent: this.calculateAge(birthDate) >= 18,
    });

    await this.userRepository.save(user);

    return this.buildAuthResponse(user);
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.findUserByIdentifier(data.identifier);

    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (!user.isActive) throw new ForbiddenError('Account is deactivated');

    await this.verifyPassword(data.password, user.password);
    await this.updateLastLogin(user.id);

    return this.buildAuthResponse(user);
  }

  // todo: detectar possível invasão e noticar usuário.
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDTO> {
    const payload = this.verifyToken(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await this.findUserWithRefreshToken(payload.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    return {
      accessToken: this.generateAccessToken(user),
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: undefined });
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
        'password',
        'id',
        'name',
        'lastName',
        'userName',
        'email',
        'profilePictureUrl',
        'role',
        'isVerified',
        'isActive',
        'theme',
        'preferredLanguage',
        'showMatureContent',
        'createdAt',
        'updatedAt'
      ],
    });
  }

  private async findUserWithRefreshToken(userId: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :userId', { userId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getOne();
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<void> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  private async validateUniqueUser(email: string, userName: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { userName }],
    });

    if (!existingUser) return;

    const errorMessage = existingUser.email === email ? 'Email already in use' : 'Username already taken';

    throw new ConflictError(errorMessage);
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
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      throw new UnauthorizedError('Invalid token');
    }
  }

  private generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = {
      accessToken: jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
      }),
      refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
      }),
    };

    this.userRepository.update(user.id, { refreshToken: tokens.refreshToken });

    return tokens;
  }

  private buildAuthResponse(user: User): AuthResponseDTO {
    return {
      user: toUserResponse(user),
      ...this.generateTokens(user),
    };
  }
}
