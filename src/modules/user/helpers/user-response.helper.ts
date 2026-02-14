import { User } from '../entities/user.entity';
import { UserResponse } from '../dtos/user-response.dto';

export function toUserResponse(user: User): UserResponse {
  const response: UserResponse = {
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    fullName: user.fullName,
    userName: user.userName,
    email: user.email,
    profilePictureUrl: user.profilePictureUrl,
    bannerUrl: user.bannerUrl,
    biography: user.biography,
    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : undefined,
    age: user.age,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    theme: user.theme,
    preferredLanguage: user.preferredLanguage,
    showMatureContent: user.showMatureContent,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
  };

  return response;
}
