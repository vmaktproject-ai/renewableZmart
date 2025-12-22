import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from './Order';

export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  INSTALLER = 'installer',
  ADMIN = 'admin',
}

export enum AdminLevel {
  SA00 = 'SA00', // Super Admin - Highest level
  SA10 = 'SA10', // Assistant Admin
  SA20 = 'SA20', // Normal Admin
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  // Admin level (only for admin users)
  @Column({
    type: 'enum',
    enum: AdminLevel,
    nullable: true,
  })
  adminLevel: AdminLevel;

  // Vendor fields
  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true, unique: true })
  businessRegNumber: string;

  // Installer fields
  @Column({ nullable: true })
  certifications: string;

  @Column({ nullable: true })
  yearsOfExperience: string;

  @Column({ nullable: true })
  serviceAreas: string;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  specialties: string;

  @Column({ nullable: true })
  accountType: string;

  // Vendor verification fields
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy: string; // Admin ID who verified

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ default: 'pending' }) // pending, approved, rejected
  verificationStatus: string;

  @Column({ type: 'text', nullable: true })
  verificationNotes: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
