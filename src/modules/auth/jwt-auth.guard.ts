import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
  handleRequest(err, user, info, context: ExecutionContext){
    if (err || !user){
      throw err || new UnauthorizedException('Vui lòng đăng nhập!')
    }
    return user;
  }
}