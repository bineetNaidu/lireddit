import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { MikroORM } from '@mikro-orm/core';
import { ___prod___ } from './constants';
import mikroOrmConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';

dotenv.config();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

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
