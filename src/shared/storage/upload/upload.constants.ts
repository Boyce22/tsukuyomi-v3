const MB = (size: number) => size * 1024 * 1024;

export const UPLOAD_LIMITS = {
  PROFILE_PICTURE: MB(5), // 5MB  - Avatar/foto de perfil
  BANNER: MB(10), // 10MB - Banner de perfil
  MANGA_COVER: MB(15), // 15MB - Capa de mangá (alta qualidade)
  MANGA_PAGE: MB(20), // 20MB - Página de mangá (alta resolução)
} as const;

export const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
