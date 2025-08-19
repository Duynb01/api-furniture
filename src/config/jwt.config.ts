import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.ACCESS_TOKEN_SECRET,
  signOptions: { expiresIn: '1d' },
});