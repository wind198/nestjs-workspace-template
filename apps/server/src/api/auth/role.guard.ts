import { IS_PUBLIC, REQUIRE_ROLE } from '@app/server/common/constants/keys';
import { getLangFromRequest } from '@app/server/common/helpers/others';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from 'generated/prisma';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const role = request.user.role;
    // Admin can access all routes without any restrictions
    if (role === UserRole.ROOT_ADMIN) {
      return true;
    }

    const lang = getLangFromRequest(request, this.i18nService);
    if (!role) {
      throw new ForbiddenException(
        this.i18nService.t('auth.roleInfoNotFound', { lang }),
      );
    }
    const requiredRoles = this.reflector.getAllAndOverride<
      (UserRole | 'iam')[]
    >(REQUIRE_ROLE, [context.getHandler(), context.getClass()]);
    if (requiredRoles?.length > 0 && !requiredRoles.includes(role)) {
      throw new ForbiddenException(
        this.i18nService.t('auth.roleNotAllowed', { lang }),
      );
    }
    return true;
  }
}
