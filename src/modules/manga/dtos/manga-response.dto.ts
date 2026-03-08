export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  type: string;
  color?: string;
}

export interface MangaResponse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverUrl: string;
  bannerUrl?: string;
  isMature: boolean;
  status: string;
  publicationDate?: Date;
  completionDate?: Date;
  averageRating: number;
  ratingCount: number;
  viewCount: number;
  favoriteCount: number;
  commentCount: number;
  chapterCount: number;
  author?: string;
  artist?: string;
  publisher?: string;
  alternativeTitles?: string[];
  originalLanguage: string;
  tags: TagResponse[];
  createdAt: string;
  updatedAt: string;
}
