import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class ChangeRoleDto {
  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  email: string;
}
