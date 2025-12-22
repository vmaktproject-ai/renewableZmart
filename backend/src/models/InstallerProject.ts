import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('installer_projects')
export class InstallerProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  category: string;

  @Column()
  location: string;

  @Column({ type: 'date' })
  completedDate: Date;

  @Column('simple-array', { nullable: true })
  images: string[];

  @ManyToOne(() => User)
  installer: User;

  @Column()
  installerId: string;

  @CreateDateColumn()
  createdAt: Date;
}
