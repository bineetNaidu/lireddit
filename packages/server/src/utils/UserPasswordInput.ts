import { Field, InputType } from 'type-graphql';

@InputType()
export class UserPasswordInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}
