import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import Redis from 'ioredis';
import session from 'express-session';
import connectReddis from 'connect-redis';
import cors from 'cors';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, ___prod___ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './utils/createUserLoader';

dotenv.config();

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'lireddit',
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: 'localhost',
    port: 5432,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User, Updoot],
  });

  await conn.runMigrations();

  // await Post.delete({});

  const app = express();

  const RedisStore = connectReddis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
        disableTTL: true,
      }),
      saveUninitialized: false,
      secret: 'dksuahkasdmasbdgsadjjysays',
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, //? 1 month
        httpOnly: true,
        secure: ___prod___,
        sameSite: 'lax',
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const port = process.env.PORT || 4242;
  app.listen(port, () => {
    console.log(
      `🚀 Lireddit Server has started => http://localhost:${port}/graphql`
    );
  });
};

main().catch((e) => {
  console.log('>>>> !! { ', e.message, ' } !! <<<<');
});
