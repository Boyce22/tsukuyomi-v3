import { TreeRepository } from 'typeorm';

import { Comment } from '@/modules/manga/entities/comment.entity';
import { CreateCommentInput, PatchCommentInput, QueryCommentsInput } from '@/modules/manga/schemas';
import { NotFoundError } from '@errors';

export class CommentRepository {
  constructor(private readonly repository: TreeRepository<Comment>) {}

  async findById(id: string): Promise<Comment | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByManga(query: QueryCommentsInput): Promise<{ data: Comment[]; total: number }> {
    const { mangaId, chapterId, page, limit } = query;

    const qb = this.repository
      .createQueryBuilder('comment')
      .where('comment.mangaId = :mangaId', { mangaId })
      .andWhere('comment.parentCommentId IS NULL');

    if (chapterId) {
      qb.andWhere('comment.chapterId = :chapterId', { chapterId });
    }
    
    qb.orderBy('comment.isPinned', 'DESC').addOrderBy('comment.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async create(
    input: Pick<CreateCommentInput, 'content' | 'mangaId' | 'chapterId' | 'parentCommentId' | 'isSpoiler'> & {
      userId: string;
    },
  ): Promise<Comment> {
    const comment = this.repository.create(input as Partial<Comment>);

    if (input.parentCommentId) {
      const parent = await this.repository.findOne({ where: { id: input.parentCommentId } });
      if (parent) comment.parentComment = parent;
    }

    await this.repository.save(comment);
    return (await this.findById(comment.id))!;
  }

  async patch(
    id: string,
    input: PatchCommentInput & { isEdited?: boolean },
  ): Promise<Comment> {
    const comment = await this.findByIdOrFail(id);
    const filtered = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));
    Object.assign(comment, filtered);
    await this.repository.save(comment);
    return comment;
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.softDelete(id);
  }

  async findTree(mangaId: string, chapterId?: string): Promise<Comment[]> {
    const qb = this.repository
      .createQueryBuilder('comment')
      .where('comment.mangaId = :mangaId', { mangaId })
      .andWhere('comment.parentCommentId IS NULL');

    if (chapterId) {
      qb.andWhere('comment.chapterId = :chapterId', { chapterId });
    }

    qb.orderBy('comment.isPinned', 'DESC').addOrderBy('comment.createdAt', 'DESC');

    const roots = await qb.getMany();
    return Promise.all(roots.map((root) => this.repository.findDescendantsTree(root)));
  }

  async findReplies(
    parentCommentId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Comment[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { parentCommentId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async incrementReplyCount(parentId: string): Promise<void> {
    await this.repository.increment({ id: parentId }, 'replyCount', 1);
  }

  async decrementReplyCount(parentId: string): Promise<void> {
    await this.repository.decrement({ id: parentId }, 'replyCount', 1);
  }

  private async findByIdOrFail(id: string): Promise<Comment> {
    const comment = await this.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');
    return comment;
  }
}
