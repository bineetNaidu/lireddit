import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UserPasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext) {
    if (!ctx.req.session.userId) {
      return null;
    }
    const user = await ctx.em.findOne(User, {
      id: Number(ctx.req.session.userId),
    });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserPasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Username is too short!',
          },
        ],
      };
    }
    if (options.password.length <= 6) {
      return {
        errors: [
          {
            field: 'password',
            message: 'password is too short!',
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = ctx.em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await ctx.em.persistAndFlush(user);
    } catch (e) {
      if (e.code === '23505' || e.detail.includes('already exists')) {
        // duplicate insertions of user
        return {
          errors: [
            {
              field: 'username',
              message: 'user with that username already exists!',
            },
          ],
        };
      }
    }
    ctx.req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg('options') options: UserPasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const user = await ctx.em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "That username doesn't exist!",
          },
        ],
      };
    }

    const validPassword = await argon2.verify(user.password, options.password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Invalid Password!',
          },
        ],
      };
    }

    ctx.req.session.userId = user.id;

    return {
      user,
      errors: [],
    };
  }
}
