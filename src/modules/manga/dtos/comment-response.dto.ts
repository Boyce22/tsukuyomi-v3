export interface CommentResponse {
  id: string;
  content: string;
  isSpoiler: boolean;
  isEdited: boolean;
  isPinned: boolean;
  isActive: boolean;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  mangaId: string;
  chapterId?: string;
  parentCommentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentTreeResponse extends CommentResponse {
  replies: CommentTreeResponse[];
}
