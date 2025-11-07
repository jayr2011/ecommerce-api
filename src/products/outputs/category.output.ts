import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class CategoryOutput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;
}
