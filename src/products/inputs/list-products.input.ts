import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class ListProductsInput {
  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => Int, { nullable: true })
  take?: number;
}
