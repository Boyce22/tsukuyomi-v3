import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import { Manga } from '@/modules/manga/entities/manga.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';

export enum ReportReason {
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  SPAM = 'SPAM',
  COPYRIGHT = 'COPYRIGHT',
  WRONG_INFO = 'WRONG_INFO',
  OTHER = 'OTHER',
}

@Entity('manga_reports')
@Index(['mangaId', 'userId'], { unique: true })
export class Report {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'enum', enum: ReportReason })
  reason!: ReportReason;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Manga, { nullable: false, onDelete: 'CASCADE' })
  manga!: Manga;

  @Column({ type: 'uuid' })
  @Index()
  mangaId!: string;

  @ManyToOne(() => User, { nullable: false })
  user!: User;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;
}
