import dotenv from 'dotenv';
import { MikroORM } from '@mikro-orm/core';
import { ___prod___ } from './constants';
import { Post } from './entities/Post';
import mikroOrmConfig from './mikro-orm.config';

dotenv.config();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  // const post = orm.em.create(Post, { title: 'my fist post' });
  // await orm.em.persistAndFlush(post);

  const posts = await orm.em.find(Post, {});

  console.log(posts);
};

main().catch((e) => {
  console.log('>>>> !! { ', e.message, ' } !! <<<<');
});
