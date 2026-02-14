import bcrypt from 'bcryptjs';
import { Logger } from 'pino';
import { UserRepository } from './user.repository';

import {
  CreateUserInput,
  UpdateUserInput,
  PatchUserInput,
  ChangePasswordInput,
  UpdateBiographyInput,
  PreferencesInput,
  QueryUsersInput,
} from './schemas';

import { toUserResponse } from './helpers/user-response.helper';

import { NotFoundError, ConflictError, BadRequestError } from '@/shared/errors/app-error';
import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { UserResponse } from './dtos/user-response.dto';

export class UserService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 8;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toUserResponse(user);
  }

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    return user ? toUserResponse(user) : null;
  }

  async getUsers(query: QueryUsersInput): Promise<PaginatedResponse<UserResponse>> {
    const { data, total } = await this.userRepository.findAllPaginated(query);
    const { page, limit } = query;

    return {
      items: data.map((user) => toUserResponse(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createUser(input: CreateUserInput): Promise<UserResponse> {
    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedUserName = input.userName.trim();

    const [existingEmail, existingUserName] = await Promise.all([
      this.userRepository.findByEmail(normalizedEmail),
      this.userRepository.findByUserName(normalizedUserName),
    ]);

    if (existingEmail) {
      throw new ConflictError('Email already in use');
    }

    if (existingUserName) {
      throw new ConflictError('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(input.password, UserService.SALT_ROUNDS);

    const user = await this.userRepository.createUser({
      ...input,
      email: normalizedEmail,
      userName: normalizedUserName,
      password: hashedPassword,
    });

    this.logger.info({ userId: user.id }, 'User created');
    return toUserResponse(user);
  }

  async updateUserById(id: string, input: UpdateUserInput): Promise<UserResponse> {
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedUserName = input.userName.trim();

    if (normalizedEmail !== currentUser.email) {
      const existingEmail = await this.userRepository.findByEmail(normalizedEmail);
      if (existingEmail) {
        throw new ConflictError('Email already in use');
      }
    }

    if (normalizedUserName !== currentUser.userName) {
      const existingUserName = await this.userRepository.findByUserName(normalizedUserName);
      if (existingUserName) {
        throw new ConflictError('Username already in use');
      }
    }

    const user = await this.userRepository.updateUserById(id, {
      ...input,
      email: normalizedEmail,
      userName: normalizedUserName,
    });

    this.logger.info({ userId: id }, 'User updated');
    return toUserResponse(user);
  }

  async patchUserById(id: string, input: PatchUserInput): Promise<UserResponse> {
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    const sanitized = { ...input };

    if (sanitized.email) {
      sanitized.email = sanitized.email.toLowerCase().trim();
      if (sanitized.email !== currentUser.email) {
        const existingEmail = await this.userRepository.findByEmail(sanitized.email);
        if (existingEmail) {
          throw new ConflictError('Email already in use');
        }
      }
    }

    if (sanitized.userName) {
      sanitized.userName = sanitized.userName.trim();
      if (sanitized.userName !== currentUser.userName) {
        const existingUserName = await this.userRepository.findByUserName(sanitized.userName);
        if (existingUserName) {
          throw new ConflictError('Username already in use');
        }
      }
    }

    const user = await this.userRepository.patchUserById(id, sanitized);
    this.logger.info({ userId: id }, 'User patched');
    return toUserResponse(user);
  }

  async softDeleteUserById(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userRepository.softDeleteUserById(id);
    this.logger.info({ userId: id }, 'User soft deleted');
  }

  async updateBiography(id: string, input: UpdateBiographyInput): Promise<UserResponse> {
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    const user = await this.userRepository.updateBiography(id, input.biography);
    return toUserResponse(user);
  }

  async updatePreferences(id: string, input: PreferencesInput): Promise<UserResponse> {
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    const user = await this.userRepository.updatePreferences(id, input);
    return toUserResponse(user);
  }

  async changePassword(id: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findByIdWithPassword(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      this.logger.warn({ userId: id }, 'Failed password change attempt');
      throw new BadRequestError('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(input.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestError('New password must be different from current password');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, UserService.SALT_ROUNDS);
    await this.userRepository.updatePassword(id, hashedPassword);

    this.logger.info({ userId: id }, 'Password changed');
  }

  async verifyUser(id: string): Promise<UserResponse> {
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    if (currentUser.isVerified) {
      throw new ConflictError('User is already verified');
    }

    const user = await this.userRepository.verifyUser(id);
    this.logger.info({ userId: id }, 'User verified');
    return toUserResponse(user);
  }
}
