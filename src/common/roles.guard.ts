import {CanActivate, ExecutionContext, Injectable, ForbiddenException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ROLES_KEY} from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate{
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY, [context.getHandler(), context.getClass()]
    )
    if(!requiredRoles){
      return true;
    }
    const {user} = context.switchToHttp().getRequest();
    if(!user){
      throw new ForbiddenException('Không có quyền truy cập')
    }
    const hasRole = requiredRoles.includes(user?.role)
    if (!hasRole) {
      throw new ForbiddenException('Không có quyền truy cập');
    }
    return true;
  }
}