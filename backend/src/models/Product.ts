import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './Store';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  trackingId: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  image: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[]; // Additional product images

  @Column({ type: 'simple-array', nullable: true })
  videos: string[]; // Product videos

  @Column()
  category: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ nullable: true })
  storeId: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: 'pending' })
  approvalStatus: string; // pending, approved, rejected

  @Column({ nullable: true })
  approvedBy: string; // Admin ID who approved

  @Column({ nullable: true })
  approvedAt: Date;

  // Admin posting fields
  @Column({ default: false })
  postedByAdmin: boolean;

  @Column({ nullable: true })
  adminPosterId: string; // Admin who posted the product

  @Column({ type: 'simple-array', nullable: true })
  availableCountries: string[]; // Countries where product is available

  @ManyToOne(() => Store, store => store.products, { nullable: true })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
