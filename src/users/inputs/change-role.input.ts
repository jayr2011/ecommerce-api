import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { InputType, Field, registerEnumType } from '@nestjs/graphql';

registerEnumType(Role, { name: 'Role' });

@InputType()
export class ChangeRoleInput {
  @Field(() => Role)
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @Field()
  @IsString()
  @IsNotEmpty()
  email: string;
}
