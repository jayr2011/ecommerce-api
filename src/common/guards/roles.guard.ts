import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../auth/decorators/roles.decoretor';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RequestWithUser } from 'src/types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required?.length) {
      this.logger.debug('No roles required');
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const req = (ctx.getContext().req ||
      context.switchToHttp().getRequest<RequestWithUser>()) as RequestWithUser;
    const user = req.user;

    if (!user) {
      this.logger.warn(`Unauthorized request to ${context.getHandler().name}`);
      throw new UnauthorizedException('User not authenticated');
    }

    const userRoles = Array.isArray(user.role)
      ? (user.role as string[])
      : ([user.role].filter(Boolean) as string[]);

    if (!userRoles.length) {
      this.logger.warn(`User ${user.sub ?? 'unknown'} has no roles`);
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    const roleSet = new Set(userRoles);
    const allowed = required.some((r) => roleSet.has(r));

    if (!allowed) {
      this.logger.warn(
        `User ${user.sub ?? 'unknown'} lacks required roles [${required.join(',')}]`,
      );
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    this.logger.verbose(`Access granted to user ${user.sub ?? 'unknown'}`);
    return true;
  }
}
