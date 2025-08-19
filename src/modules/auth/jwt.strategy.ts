import { Injectable, UnauthorizedException } from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import * as process from 'node:process';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // Lấy token từ header Authorization: Bearer <token>
          const authHeader = req.headers['authorization'];
          if (!authHeader) return null;
          const parts = authHeader.split(' ');
          if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
          return parts[1]; // token
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET || 'secretKey'
    });
  }
  async validate(payload: any){
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng.');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      role: user.role.name,
      active: user.active
    };
  }
}