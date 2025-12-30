import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
  DeleteDateColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { Manga } from './manga.entity';
import { Chapter } from './chapter.entity';

@Entity('comments')
@Tree('closure-table')
export class Comment {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'text' })
  content!: string;

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  // Estado
  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isEdited!: boolean;

  @Column({ default: false })
  isPinned!: boolean;

  @Column({ default: false })
  isSpoiler!: boolean;

  // Estatísticas
  @Column({ type: 'int', default: 0 })
  likeCount!: number;

  @Column({ type: 'int', default: 0 })
  dislikeCount!: number;

  @Column({ type: 'int', default: 0 })
  replyCount!: number;

  // Relacionamentos - Manga OU Chapter (um dos dois deve existir)
  @ManyToOne(() => Manga, (manga) => manga.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  manga?: Manga;

  @Column({ type: 'uuid', nullable: true })
  mangaId?: string;

  @ManyToOne(() => Chapter, (chapter) => chapter.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  chapter?: Chapter;

  @Column({ type: 'uuid', nullable: true })
  chapterId?: string;

  // Usuário autor
  @ManyToOne(() => User, (user) => user.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  // Sistema de respostas (thread)
  @TreeParent()
  parentComment?: Comment;

  @TreeChildren()
  replies!: Comment[];

  @Column({ type: 'uuid', nullable: true })
  parentCommentId?: string;
}