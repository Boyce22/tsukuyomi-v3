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
} from 'typeorm';
import { Manga } from './manga.entity';
import { Page } from './page.entity';
import { Comment } from './comment.entity';

@Entity('chapters')
@Index(['mangaId', 'number'], { unique: true })
export class Chapter {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'float' })
  number!: number; // permite 1, 1.5, 2, etc

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255, unique: true })
  @Index({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  // Estatísticas
  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', default: 0 })
  pageCount!: number;

  @Column({ type: 'int', default: 0 })
  commentCount!: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Manga, (manga) => manga.chapters, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  manga!: Manga;

  @Column({ type: 'uuid' })
  @Index()
  mangaId!: string;

  @OneToMany(() => Page, (page) => page.chapter, { cascade: ['remove'] })
  pages!: Page[];

  @OneToMany(() => Comment, (comment) => comment.chapter, { cascade: ['remove'] })
  comments!: Comment[];

  // Usuários responsáveis
  @ManyToOne(() => User, (user) => user.createdMangas, { nullable: true })
  createdBy?: User;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, { nullable: true })
  updatedBy?: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById?: string;
}
