import { HistoryStatus } from '@/shared/enums/history-status';

export interface ReadingHistoryResponse {
  id: string;
  mangaId: string;
  userId: string;
  status: HistoryStatus;
  chaptersRead: number;
  pagesRead: number;
  lastChapterReadId?: string;
  lastPageReadId?: string;
  lastReadAt?: string;
  createdAt: string;
  updatedAt: string;
}
