import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { InstallerProject } from '../models/InstallerProject';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'ecommerce_db',
  synchronize: process.env.NODE_ENV === 'development' && process.env.DATABASE_SYNC === 'true',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Store, Product, Order, Review, InstallerProject],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  subscribers: [],
});
