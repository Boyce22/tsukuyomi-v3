import { MangaStatus } from '@/shared/enums/manga-status';
import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Chapter } from './chapter.entity';
import { Comment } from './comment.entity';
import { Rating } from './rating.entity';
import { Favorite } from './favorite.entity';

@Entity('mangas')
export class Manga {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ length: 255 })
  @Index()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  coverUrl!: string;

  @Column({ length: 500, nullable: true })
  bannerUrl?: string;

  @Column({ default: false })
  isMature!: boolean;

  @Column({ type: 'enum', enum: MangaStatus, default: MangaStatus.ACTIVED })
  status!: MangaStatus;

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  // Publicação
  @Column({ type: 'date', nullable: true })
  publicationDate?: Date;

  @Column({ type: 'date', nullable: true })
  completionDate?: Date;

  // Estatísticas (calculadas via queries ou triggers)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating!: number;

  @Column({ type: 'int', default: 0 })
  ratingCount!: number;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', default: 0 })
  favoriteCount!: number;

  @Column({ type: 'int', default: 0 })
  commentCount!: number;

  @Column({ type: 'int', default: 0 })
  chapterCount!: number;

  // Informações de autoria
  @Column({ length: 255, nullable: true })
  author?: string;

  @Column({ length: 255, nullable: true })
  artist?: string;

  @Column({ length: 255, nullable: true })
  publisher?: string;

  @Column({ type: 'simple-array', nullable: true })
  alternativeTitles?: string[];

  // Idioma original
  @Column({ length: 10, default: 'ja' })
  originalLanguage!: string;

  // SEO
  @Column({ length: 255, unique: true })
  @Index({ unique: true })
  slug!: string;

  // Usuários responsáveis
  // Usuários responsáveis
  @ManyToOne(() => User, (user) => user.createdMangas, { nullable: true })
  createdBy?: User;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, { nullable: true })
  updatedBy?: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById?: string;

  // Relacionamentos
  @ManyToMany(() => Tag, (tag) => tag.mangas)
  @JoinTable({
    name: 'manga_tags',
    joinColumn: { name: 'manga_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  @OneToMany(() => Chapter, (chapter) => chapter.manga, { cascade: ['remove'] })
  chapters!: Chapter[];

  @OneToMany(() => Comment, (comment) => comment.manga, { cascade: ['remove'] })
  comments!: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.manga, { cascade: ['remove'] })
  favorites!: Favorite[];

  @OneToMany(() => Rating, (rating) => rating.manga, { cascade: ['remove'] })
  ratings!: Rating[];
}
