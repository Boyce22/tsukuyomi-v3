import bcrypt from 'bcryptjs';
import { Logger } from 'pino';
import { UserRepository } from './user.repository';
import { CreateUserInput, UpdateUserInput, PatchUserInput, ChangePasswordInput, QueryUsersInput } from './schemas';
import { toUserResponse } from './helpers/user-response.helper';
import { NotFoundError, ConflictError, BadRequestError } from '@/shared/errors/app-error';
import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { UserResponse } from './dtos/user-response.dto';
import { User } from './entities/user.entity';

export class UserService {
  private static readonly SALT_ROUNDS = 12;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.findUserOrFail(id);
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
      items: data.map(toUserResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createUser(input: CreateUserInput): Promise<UserResponse> {
    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedUserName = input.userName.trim();

    await this.validateUniqueUser(normalizedEmail, normalizedUserName);

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

  async updateUserById(
    id: string,
    input: Omit<UpdateUserInput, 'address'>,
    address?: string | null,
  ): Promise<UserResponse> {
    const currentUser = await this.findUserOrFail(id);

    const email = input.email.toLowerCase().trim();
    const userName = input.userName.trim();

    await this.validateUniqueFieldsIfChanged(currentUser, email, userName);

    const user = await this.userRepository.updateUserById(id, {
      ...input,
      email,
      userName,
      ...(address !== undefined && { address }),
    });

    this.logger.info({ userId: id }, 'User updated');
    return toUserResponse(user);
  }

  async patchUserById(
    id: string,
    input: Omit<PatchUserInput, 'address'>,
    address?: string | null,
  ): Promise<UserResponse> {
    const currentUser = await this.findUserOrFail(id);

    await this.validateAndNormalizeEmail(input, currentUser);
    await this.validateAndNormalizeUserName(input, currentUser);

    const user = await this.userRepository.patchUserById(id, {
      ...input,
      ...(address !== undefined && { address }),
    });

    this.logger.info({ userId: id }, 'User patched');
    return toUserResponse(user);
  }

  async softDeleteUserById(id: string): Promise<void> {
    await this.findUserOrFail(id);
    await this.userRepository.softDeleteUserById(id);
    this.logger.info({ userId: id }, 'User soft deleted');
  }

  async changePassword(id: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.findUserWithPasswordOrFail(id);

    await this.validateCurrentPassword(user, input.currentPassword);
    await this.validateNewPasswordIsDifferent(user, input.newPassword);

    const hashedPassword = await bcrypt.hash(input.newPassword, UserService.SALT_ROUNDS);
    await this.userRepository.updatePassword(id, hashedPassword);

    this.logger.info({ userId: id }, 'Password changed');
  }

  async verifyUser(id: string): Promise<UserResponse> {
    const currentUser = await this.findUserOrFail(id);

    if (currentUser.isVerified) {
      throw new ConflictError('User is already verified');
    }

    const user = await this.userRepository.verifyUser(id);
    this.logger.info({ userId: id }, 'User verified');
    return toUserResponse(user);
  }

  private async findUserOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  private async findUserWithPasswordOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findByIdWithPassword(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  private async validateUniqueUser(email: string, userName: string): Promise<void> {
    const [existingEmail, existingUserName] = await Promise.all([
      this.userRepository.findByEmail(email),
      this.userRepository.findByUserName(userName),
    ]);

    if (existingEmail) {
      throw new ConflictError('Email already in use');
    }

    if (existingUserName) {
      throw new ConflictError('Username already in use');
    }
  }

  private async validateUniqueFieldsIfChanged(currentUser: User, newEmail: string, newUserName: string): Promise<void> {
    const promises: Promise<void>[] = [];

    if (newEmail !== currentUser.email) {
      promises.push(this.validateEmailUniqueness(newEmail));
    }

    if (newUserName !== currentUser.userName) {
      promises.push(this.validateUserNameUniqueness(newUserName));
    }

    await Promise.all(promises);
  }

  private async validateEmailUniqueness(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }
  }

  private async validateUserNameUniqueness(userName: string): Promise<void> {
    const existingUser = await this.userRepository.findByUserName(userName);
    if (existingUser) {
      throw new ConflictError('Username already in use');
    }
  }

  private async validateAndNormalizeEmail(input: { email?: string }, currentUser: User): Promise<void> {
    if (!input.email) return;

    const email = input.email.toLowerCase().trim();

    if (email !== currentUser.email) {
      await this.validateEmailUniqueness(email);
    }

    input.email = email;
  }

  private async validateAndNormalizeUserName(input: { userName?: string }, currentUser: User): Promise<void> {
    if (!input.userName) return;

    const userName = input.userName.trim();

    if (userName !== currentUser.userName) {
      await this.validateUserNameUniqueness(userName);
    }

    input.userName = userName;
  }

  private async validateCurrentPassword(user: User, currentPassword: string): Promise<void> {
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      this.logger.warn({ userId: user.id }, 'Failed password change attempt');
      throw new BadRequestError('Current password is incorrect');
    }
  }

  private async validateNewPasswordIsDifferent(user: User, newPassword: string): Promise<void> {
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw new BadRequestError('New password must be different from current password');
    }
  }
}
