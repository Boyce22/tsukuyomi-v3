import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Chapter } from './chapter.entity';

@Entity('pages')
@Index(['chapterId', 'number'])
export class Page {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'int' })
  number!: number;

  @Column({ length: 500 })
  imageUrl!: string;

  @Column({ length: 500, nullable: true })
  thumbnailUrl?: string;

  // Informações da imagem
  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ type: 'int', nullable: true })
  fileSize?: number; // em bytes

  @Column({ length: 10, nullable: true })
  format?: string; // jpg, png, webp

  @Column({ length: 64, nullable: true })
  hash?: string; // hash da imagem para verificação

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
  isProcessed!: boolean; // se thumbnail foi gerado, etc

  // Relacionamentos
  @ManyToOne(() => Chapter, (chapter) => chapter.pages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  chapter!: Chapter;

  @Column({ type: 'uuid' })
  @Index()
  chapterId!: string;

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
