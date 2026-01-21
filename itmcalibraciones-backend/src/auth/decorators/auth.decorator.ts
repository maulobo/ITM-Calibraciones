import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { UserRoles } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export function Auth(...roles: UserRoles[]) {
  if (!roles.length) {
    roles.push(UserRoles.USER);
    roles.push(UserRoles.ADMIN);
    roles.push(UserRoles.TECHNICAL);
  }

  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
