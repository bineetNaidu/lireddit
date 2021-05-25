import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { UserPasswordInput } from '../utils/UserPasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 as uuid } from 'uuid';

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
  @Mutation(() => UserResponse)
  async changePassword(
    @Ctx() { em, redis, req }: MyContext,
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string
  ): Promise<UserResponse> {
    if (newPassword.length <= 6) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Password is too short!',
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const uid = await redis.get(key);
    if (!uid) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: parseInt(uid) });
    if (!user) {
      return {
        errors: [
          {
            field: 'user',
            message: "User doesn's exists",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    await em.persistAndFlush(user);

    //? delete the key value pair from redis
    await redis.del(key);
    //? log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em, redis }: MyContext
  ): Promise<Boolean> {
    const user = await em.findOne(User, { email });

    if (!user) {
      // the email is not in the db
      return true; // for security reasons;
    }

    const token = uuid();

    redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60);

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}"> Reset Password </a>`
    );

    return true;
  }

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
    const errors = validateRegister(options);
    if (errors) return { errors };
    const hashedPassword = await argon2.hash(options.password);
    const user = ctx.em.create(User, {
      username: options.username,
      password: hashedPassword,
      email: options.email,
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
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const user = await ctx.em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "That username doesn't exist!",
          },
        ],
      };
    }

    const validPassword = await argon2.verify(user.password, password);
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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: Error) => {
        if (err) {
          console.log(err.message);

          resolve(false);
          return;
        }

        res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
  }
}
