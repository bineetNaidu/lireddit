import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { MikroORM } from '@mikro-orm/core';
import redis from 'redis';
import session from 'express-session';
import connectReddis from 'connect-redis';
import cors from 'cors';
import { ___prod___ } from './constants';
import mikroOrmConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';

dotenv.config();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectReddis(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
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
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const port = process.env.PORT || 4242;
  app.listen(port, () => {
    console.log(
      `🚀 Lireddit Server has started => http:localhost:${port}/graphql`
    );
  });
};

main().catch((e) => {
  console.log('>>>> !! { ', e.message, ' } !! <<<<');
});
