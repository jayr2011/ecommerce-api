import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class TokenOutput {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field()
  token_type: string;

  @Field()
  expires_in: number;
}
