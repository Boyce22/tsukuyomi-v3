import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import { Entity, ManyToOne, CreateDateColumn, PrimaryColumn, Index, Column } from 'typeorm';
import { Manga } from './manga.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  // Relacionamentos
  @ManyToOne(() => User, (user) => user.favorites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => Manga, (manga) => manga.favorites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  manga!: Manga;

  @Column({ type: 'uuid' })
  @Index()
  mangaId!: string;
}
