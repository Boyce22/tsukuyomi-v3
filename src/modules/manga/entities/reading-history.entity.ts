import { UUID } from '@/shared/utils/uuid';

import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryColumn, Index } from 'typeorm';
import { Manga } from './manga.entity';
import { Chapter } from './chapter.entity';
import { Page } from './page.entity';

import { User } from '@/modules/user/entities/user.entity';
import { HistoryStatus } from '@/shared/enums/history-status';

@Entity('reading_history')
@Index(['userId', 'mangaId'], { unique: true })
export class ReadingHistory {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Progresso
  @Column({ type: 'int', default: 0 })
  chaptersRead!: number;

  @Column({ type: 'int', default: 0 })
  pagesRead!: number;

  // Última leitura
  @ManyToOne(() => Chapter, { nullable: true, onDelete: 'SET NULL' })
  lastChapterRead?: Chapter;

  @Column({ type: 'uuid', nullable: true })
  lastChapterReadId?: string;

  @ManyToOne(() => Page, { nullable: true, onDelete: 'SET NULL' })
  lastPageRead?: Page;

  @Column({ type: 'uuid', nullable: true })
  lastPageReadId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastReadAt?: Date;

  // Relacionamentos principais
  @ManyToOne(() => User, (user) => user.readingHistory, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => Manga, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  manga!: Manga;

  @Column({ type: 'uuid' })
  @Index()
  mangaId!: string;

  // Status de leitura
  @Column({ type: 'enum', enum: HistoryStatus, default: HistoryStatus.READING })
  status!: HistoryStatus;
}
