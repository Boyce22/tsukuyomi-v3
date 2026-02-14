import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryColumn, Index } from 'typeorm';
import { Manga } from './manga.entity';

@Entity('ratings')
@Index(['userId', 'mangaId'], { unique: true })
export class Rating {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  score!: number; // 0.00 a 10.00

  @Column({ type: 'text', nullable: true })
  review?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relacionamentos
  @ManyToOne(() => User, (user) => user.ratings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => Manga, (manga) => manga.ratings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  manga!: Manga;

  @Column({ type: 'uuid' })
  @Index()
  mangaId!: string;
}
