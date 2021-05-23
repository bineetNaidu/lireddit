import path from 'path';
import { MikroORM } from '@mikro-orm/core';
import { ___prod___ } from './constants';
import { Post } from './entities/Post';
import dotenv from 'dotenv';

dotenv.config();

export default {
  migrations: {
    // default values:
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  type: 'postgresql',
  dbName: 'lireddit',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  debug: !___prod___,
  entities: [Post],
  host: 'localhost',
  port: 5432,
} as Parameters<typeof MikroORM.init>[0];
