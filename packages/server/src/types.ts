import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { createUpdootLoader } from './utils/createUpdootLoader';
import { createUserLoader } from './utils/createUserLoader';

export interface MyContext {
  // @ts-ignore
  req: Request & { session: Express.Session };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
}
