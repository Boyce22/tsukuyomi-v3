export interface RatingResponse {
  id: string;
  score: number;
  review?: string;
  mangaId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
