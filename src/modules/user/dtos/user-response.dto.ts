export interface UserResponse {
  id: string;
  name: string;
  lastName: string;
  fullName: string;
  userName: string;
  email: string;
  profilePictureUrl?: string;
  bannerUrl?: string;
  biography?: string;
  birthDate?: string;
  age: number | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  theme: string;
  preferredLanguage: string;
  showMatureContent: boolean;
  mangasCreated?: number;
  chaptersCreated?: number;
  commentsCount?: number;
  favoritesCount?: number;
  ratingsCount?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}