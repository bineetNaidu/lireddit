import { Post } from '../entities/Post';
import {
  Query,
  Resolver,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middlewares/isAuth';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field(() => Boolean)
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    const userId = req.session.userId;
    if (!userId) return null;
    const updoot = await updootLoader.load({ postId: post.id, userId });
    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const { userId } = req.session;

    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const updoot = await Updoot.findOne({ where: { userId, postId } });

    if (updoot && updoot.value !== realValue) {
      // * the user has already voted into this post
      // * and they are changing there votes
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        update updoot
        set value = $1
        where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
        update post
        set points = points + $1
        where id = $2
        `,
          [2 * realValue, postId]
        );
      });
      return true;
    } else if (!updoot) {
      // * the user have not voted yet!

      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        insert into updoot ("userId", "postId", value)
        values ($1, $2, $3);
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
        update post
        set points = points + $1
        where id = $2;
        `,
          [realValue, postId]
        );
      });
      return true;
    }
    return false;
  }

  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50) + '...';
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    // 20 -> 21
    const realLimit = Math.min(50, limit);
    const reaLimitPlusOne = realLimit + 1;

    const replacements: any[] = [reaLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      select
      p.*
      from post as p
      ${cursor ? `where p."createdAt" < $2` : ''}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    // console.log(posts);

    const hasMore = posts.length === reaLimitPlusOne;
    return {
      posts: posts.slice(0, realLimit),
      hasMore,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: parseInt(req.session.userId),
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .update(Post)
        .set({ text, title })
        .where('id = :id and "creatorId" = :creatorId', {
          id,
          creatorId: req.session.userId,
        })
        .returning('*')
        .execute();

      return result.raw[0];
    } catch (e) {
      return null;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    // const post = await Post.findOne(id);

    // if (!post) return false;
    // if (post.creatorId !== req.session.userId) {
    //   throw new Error('Not Authorized');
    // }
    // await Updoot.delete({ postId: id });
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
