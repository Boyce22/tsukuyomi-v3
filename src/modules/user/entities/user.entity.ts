import { Roles } from '@/shared/security/roles.enum';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
  PrimaryColumn,
} from 'typeorm';

import { UUID } from '@/shared/utils/uuid';

import { Manga } from '@/modules/manga/entities/manga.entity';
import { Chapter } from '@/modules/manga/entities/chapter.entity';
import { Page } from '@/modules/manga/entities/page.entity';
import { Tag } from '@/modules/manga/entities/tag.entity';
import { Comment } from '@/modules/manga/entities/comment.entity';
import { Favorite } from '@/modules/manga/entities/favorite.entity';
import { Rating } from '@/modules/manga/entities/rating.entity';
import { ReadingHistory } from '@/modules/manga/entities/reading-history.entity';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ unique: true, length: 100 })
  userName!: string;

  @Column({ length: 255, select: false }) // Never select password by default
  password!: string;

  @Column({ type: 'text', nullable: true })
  biography?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role!: Roles;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastPasswordChange?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ length: 255, nullable: true, select: false })
  verificationToken?: string;

  @Column({ length: 255, nullable: true, select: false })
  resetPasswordToken?: string;

  @Column({ type: 'timestamptz', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ length: 500, nullable: true })
  profilePictureUrl?: string;

  @Column({ length: 500, nullable: true })
  bannerUrl?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  // Statistics
  @Column({ type: 'int', default: 0 })
  mangasCreated!: number;

  @Column({ type: 'int', default: 0 })
  chaptersCreated!: number;

  @Column({ type: 'int', default: 0 })
  commentsCount!: number;

  @Column({ type: 'int', default: 0 })
  favoritesCount!: number;

  @Column({ type: 'int', default: 0 })
  ratingsCount!: number;

  // Settings
  @Column({ default: true })
  showMatureContent!: boolean;

  @Column({ default: 'en' })
  preferredLanguage!: string;

  @Column({ default: 'light' })
  theme!: string;

  @OneToMany(() => Manga, (manga) => manga.createdBy)
  createdMangas!: Manga[];

  @OneToMany(() => Chapter, (chapter) => chapter.createdBy)
  createdChapters!: Chapter[];

  @OneToMany(() => Page, (page) => page.createdBy)
  createdPages!: Page[];

  @OneToMany(() => Tag, (tag) => tag.createdBy)
  createdTags!: Tag[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings!: Rating[];

  @OneToMany(() => ReadingHistory, (history) => history.user)
  readingHistory!: ReadingHistory[];

  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }

  get age(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  isAdult(): boolean {
    const userAge = this.age;
    return userAge !== null && userAge >= 18;
  }

  hasRole(role: Roles): boolean {
    return this.role === role;
  }

  isAdmin(): boolean {
    return this.role === Roles.ADMIN || this.role === Roles.OWNER;
  }

  isModerator(): boolean {
    return this.role === Roles.MODERATOR || this.isAdmin();
  }
}
