import { Logger } from 'pino';

import { CommentRepository } from '@/modules/manga/repositories/comment.repository';
import { MangaRepository } from '@/modules/manga/repositories/manga.repository';
import { ChapterRepository } from '@/modules/manga/repositories/chapter.repository';
import { CreateCommentInput, PatchCommentInput, QueryCommentsInput } from '@/modules/manga/schemas';
import { CommentResponse, CommentTreeResponse } from '@/modules/manga/dtos/comment-response.dto';
import { Comment } from '@/modules/manga/entities/comment.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { Roles } from '@/shared/security';

import { ForbiddenError, NotFoundError } from '@errors';

export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly mangaRepository: MangaRepository,
    private readonly chapterRepository: ChapterRepository,
    private readonly logger: Logger,
  ) {}

  async getComments(query: QueryCommentsInput): Promise<PaginatedResponse<CommentResponse>> {
    const { data, total } = await this.commentRepository.findByManga(query);
    const { page, limit } = query;

    return {
      items: data.map(toCommentResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCommentTree(mangaId: string, chapterId?: string): Promise<CommentTreeResponse[]> {
    const roots = await this.commentRepository.findTree(mangaId, chapterId);
    return roots.map(toCommentTreeResponse);
  }

  async getCommentReplies(
    id: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<CommentResponse>> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    const { data, total } = await this.commentRepository.findReplies(id, page, limit);

    return {
      items: data.map(toCommentResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createComment(input: CreateCommentInput, userId: string): Promise<CommentResponse> {
    const manga = await this.mangaRepository.findById(input.mangaId);
    if (!manga) throw new NotFoundError('Manga not found');

    if (input.chapterId) {
      const chapter = await this.chapterRepository.findById(input.chapterId);
      if (!chapter || chapter.mangaId !== manga.id) throw new NotFoundError('Chapter not found');
    }

    if (input.parentCommentId) {
      const parent = await this.commentRepository.findById(input.parentCommentId);
      if (!parent || parent.mangaId !== manga.id) throw new NotFoundError('Parent comment not found');
    }

    const comment = await this.commentRepository.create({ ...input, userId });

    await this.mangaRepository.increment(input.mangaId, 'commentCount', 1);

    if (input.chapterId) {
      await this.chapterRepository.increment(input.chapterId, 'commentCount', 1);
    }

    if (input.parentCommentId) {
      await this.commentRepository.incrementReplyCount(input.parentCommentId);
    }

    this.logger.info({ commentId: comment.id, mangaId: input.mangaId }, 'Comment created');
    return toCommentResponse(comment);
  }

  async patchComment(id: string, input: PatchCommentInput, userId: string, userRole: Roles): Promise<CommentResponse> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    const isPrivileged = userRole === Roles.ADMIN || userRole === Roles.OWNER || userRole === Roles.MODERATOR;

    if (comment.userId !== userId && !isPrivileged) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    // Regular users can only change content and isSpoiler
    const patchData: PatchCommentInput & { isEdited?: boolean } = isPrivileged
      ? { ...input }
      : { content: input.content, isSpoiler: input.isSpoiler };

    if (patchData.content !== undefined) {
      patchData.isEdited = true;
    }

    const updated = await this.commentRepository.patch(id, patchData);
    this.logger.info({ commentId: id }, 'Comment patched');
    return toCommentResponse(updated);
  }

  async deleteComment(id: string, userId: string, userRole: Roles): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    const isPrivileged = userRole === Roles.ADMIN || userRole === Roles.OWNER || userRole === Roles.MODERATOR;

    if (comment.userId !== userId && !isPrivileged) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await this.commentRepository.softDelete(id);

    await this.mangaRepository.decrement(comment.mangaId!, 'commentCount', 1);

    if (comment.chapterId) {
      await this.chapterRepository.decrement(comment.chapterId, 'commentCount', 1);
    }

    if (comment.parentCommentId) {
      await this.commentRepository.decrementReplyCount(comment.parentCommentId);
    }

    this.logger.info({ commentId: id }, 'Comment deleted');
  }
}

export function toCommentTreeResponse(comment: Comment): CommentTreeResponse {
  return {
    ...toCommentResponse(comment),
    replies: (comment.replies ?? []).map(toCommentTreeResponse),
  };
}

export function toCommentResponse(comment: Comment): CommentResponse {
  return {
    id: comment.id,
    content: comment.content,
    isSpoiler: comment.isSpoiler,
    isEdited: comment.isEdited,
    isPinned: comment.isPinned,
    isActive: comment.isActive,
    likeCount: comment.likeCount,
    dislikeCount: comment.dislikeCount,
    replyCount: comment.replyCount,
    mangaId: comment.mangaId!,
    chapterId: comment.chapterId,
    parentCommentId: comment.parentCommentId,
    userId: comment.userId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}
