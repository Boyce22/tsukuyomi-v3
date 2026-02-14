import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import { NotFoundError } from '@/shared/errors/app-error';
import { QueryUsersInput, CreateUserInput, UpdateUserInput, PatchUserInput, PreferencesInput } from './schemas';

export class UserRepository {
  constructor(private readonly repository: Repository<User>) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUserName(userName: string): Promise<User | null> {
    return this.repository.findOne({ where: { userName } });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findAllPaginated(query: QueryUsersInput): Promise<{ data: User[]; total: number }> {
    const { page, limit, search, role, isVerified, sortBy, sortOrder } = query;

    const qb = this.repository.createQueryBuilder('user');

    if (search) {
      qb.andWhere(
        '(user.name ILIKE :search OR user.lastName ILIKE :search OR user.userName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role !== undefined) {
      qb.andWhere('user.role = :role', { role });
    }

    if (isVerified !== undefined) {
      qb.andWhere('user.isVerified = :isVerified', { isVerified });
    }

    qb.orderBy(`user.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async createUser(input: CreateUserInput & { password: string }): Promise<User> {
    const user = this.repository.create(input);
    await this.repository.save(user);
    return (await this.findById(user.id))!;
  }

  async updateUserById(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findByIdOrFail(id);
    Object.assign(user, input);
    await this.repository.save(user);
    return user;
  }

  async patchUserById(id: string, input: PatchUserInput): Promise<User> {
    const user = await this.findByIdOrFail(id);
    const filteredInput = Object.fromEntries(Object.entries(input).filter(([_, value]) => value !== undefined));
    Object.assign(user, filteredInput);
    await this.repository.save(user);
    return user;
  }

  async softDeleteUserById(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.softDelete(id);
  }

  async updateBiography(id: string, biography: string): Promise<User> {
    const user = await this.findByIdOrFail(id);
    user.biography = biography;
    await this.repository.save(user);
    return user;
  }

  async updatePreferences(id: string, input: PreferencesInput): Promise<User> {
    const user = await this.findByIdOrFail(id);

    if (input.theme !== undefined) {
      user.theme = input.theme;
    }
    if (input.preferredLanguage !== undefined) {
      user.preferredLanguage = input.preferredLanguage;
    }
    if (input.showMatureContent !== undefined) {
      user.showMatureContent = input.showMatureContent;
    }

    await this.repository.save(user);

    return user;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.repository.update(id, {
      password: hashedPassword,
      lastPasswordChange: new Date(),
    });
  }

  async verifyUser(id: string): Promise<User> {
    const user = await this.findByIdOrFail(id);
    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    await this.repository.save(user);
    return user;
  }

  private async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
    return user;
  }
}
