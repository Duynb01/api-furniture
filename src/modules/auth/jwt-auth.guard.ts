import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
  handleRequest(err, user, info, context: ExecutionContext){
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập!');
    }

    if (err || !user){
      throw err || new UnauthorizedException('Vui lòng đăng nhập!')
    }
    return user;
  }
}