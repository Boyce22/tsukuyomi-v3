export interface ChapterResponse {
  id: string;
  mangaId: string;
  number: number;
  title: string;
  slug: string;
  description?: string;
  publishedAt?: string;
  viewCount: number;
  pageCount: number;
  commentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse {
  id: string;
  chapterId: string;
  number: number;
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  format?: string;
}
