import { Controller, Post, Body, Res, Req, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {Response, Request} from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({passthrough: true}) res: Response, @Req() req: Request) {
    const ipAddress: string = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || "Unknown"
    const {access_token, refresh_token, user } = await this.authService.login(dto, userAgent, ipAddress)
    await this.saveToken(res, access_token, refresh_token);
    return {
      status: 'success',
      message: 'Đăng nhập thành công',
      access_token,
      user,
    };
  }

  @Post('google')
  async googleLogin(@Body('token') token: string, @Res({passthrough: true}) res: Response, @Req() req: Request){
    const ipAddress: string = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    const userAgent:string = req.headers['user-agent'] || "Unknown"
    const {access_token, refresh_token, user } = await this.authService.googleLogin(token, userAgent, ipAddress)
    await this.saveToken(res, access_token, refresh_token);
    return {
      status: 'success',
      message: 'Đăng nhập thành công',
      access_token,
      user,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return {
      status:'success',
      message: 'Đăng xuất thành công' };
  }

  @Get('reload')
  @UseGuards(JwtAuthGuard)
  reload(@Req() request: any ){
    const userId = request.user?.id
    return this.authService.reload(userId)
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({passthrough: true}) response: Response){
    const refreshToken:string = request.cookies['refresh_token'];
    const ipAddress: string = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.socket?.remoteAddress || '';
    const userAgent:string = request.headers['user-agent'] || "Unknown";
    const {access_token, refresh_token} = await this.authService.refresh(refreshToken, userAgent, ipAddress);
    await this.saveToken(response, access_token, refresh_token);
    return { message: 'Successful', access_token };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto){
    return this.authService.forgotPassword(dto.email)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-reset-token')
  async verifyResetToken(@Body() token: string, @Body() email: string ){
    return this.authService.verifyResetToken(token, email)
  }

  private async saveToken(res: Response, accessToken:string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    });
  }


}
