import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeleteUserInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;
}
