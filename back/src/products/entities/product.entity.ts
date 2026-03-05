import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ResourceType } from '../enums/resource-type.enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceUsd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceArs?: number;

  @Column({ default: false })
  isSubscription: boolean;

  // 👉 NUEVO
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  paypalPlanId: string | null;

  @Column({ default: false })
  requiresPremium: boolean;

  @Column({ nullable: true })
  coverImageUrl?: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
    default: ResourceType.LINK,
  })
  resourceType: ResourceType;

  // 🔐 NO SE DEVUELVE EN GET (solo se usa internamente)
  @Column({ type: 'text', nullable: true, select: false })
  resourceUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
