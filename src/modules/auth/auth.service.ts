import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as process from 'node:process';
import {v4 as uuidv4} from 'uuid'
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly MailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: {
          connect: { id: 2 },
        },
      },
      include: {role: true},
    });

    return {
      message: 'Đăng ký thành công!',
      user: {
        email: user.email,
        name: user.name,
        role: user.role?.name || 'USER',
      },
    };
  }

  async login(dto: LoginDto, deviceName:string, ipAddress:string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user || !user.password) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    if (!(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    if(!user.active) throw new ForbiddenException('Tài khoản của bạn đã bị vô hiệu hóa');

    const role = (user.role?.name || 'USER').toUpperCase()
    const {accessToken, refreshToken} = await this.handleToken(user.id, role, deviceName, ipAddress)
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user.role?.name || 'USER').toUpperCase(),
      },
    };
  }

  async googleLogin(token: string, deviceName: string, ipAddress:string){
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
    const {email, name} = await googleRes.json();
    if(!email) throw new UnauthorizedException('Google token không hợp lệ')
    let user = await this.prisma.user.findUnique({
      where: {email},
      include: { role: true },
    })
    if(!user){
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: null,
          role: {
            connect: { id: 2 },
          },
        },
        include: {role: true},
      })
    }

    const role = (user.role?.name || 'USER').toUpperCase()
    const {accessToken, refreshToken} = await this.handleToken(user.id,role, deviceName, ipAddress)

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user.role?.name || 'USER').toUpperCase(),
      },
    };
  }

  async reload(userId:string){
    const user = await this.prisma.user.findUnique({
      where:{id: userId},
      include: {role: true}
    })
    if (!user) {
      throw new ForbiddenException('Không tìm thấy người dùng.');
    }
    if (!user.active) {
      throw new ForbiddenException('Vui lòng đăng nhập lại');
    }
    return {
      status: 'success',
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role?.name || 'USER').toUpperCase(),
    };
  }

  async refresh(token: string, deviceName: string, ipAddress: string){
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: process.env.REFRESH_TOKEN_SECRET
    })
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {userId: decoded.sub, deviceName: deviceName, ipAddress: ipAddress}
    })

    if(!tokenRecord) throw new UnauthorizedException('Token không tồn tại!')
    const checked = await bcrypt.compare(token, tokenRecord.token);
    if (!checked) throw new ForbiddenException('Refresh token không hợp lệ.');
    if (tokenRecord.expiryDate <= new Date()) {
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new ForbiddenException('Refresh token đã hết hạn.');
    }
    const user = await this.prisma.user.findUnique({
      where:{id: decoded.sub},
      include:{role: true}
    })
   if (!user) throw new UnauthorizedException('User không tồn tại');
   const role:string = (user.role?.name || 'USER').toUpperCase()
   const {accessToken, refreshToken} = await this.handleToken(user.id, role, deviceName, ipAddress)
   return {
     access_token: accessToken,
     refresh_token: refreshToken,
   };
  }

  async forgotPassword(email: string){
    const user = await this.prisma.user.findUnique({
      where: {email},
    })
    if(!user) {
      return { message: 'Nếu thông tin hợp lệ, thông báo sẽ được gửi qua Email' };
    }

    const resetToken = uuidv4();
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expires = new Date(Date.now() + 15*60*1000)

    console.log("Check ResetToken",resetToken);
    console.log("Check ResetHashToken",hashedToken);

    await this.prisma.passwordResetToken.deleteMany({
      where: {userId: user.id}
    })

    await this.prisma.passwordResetToken.create({
      data:{
        token: hashedToken,
        userId: user.id,
        expiresAt: expires,
      }
    })
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${email}&token=${resetToken}`
    await this.MailService.sendPasswordReset(user.email, resetLink)
    return { message: 'Nếu thông tin hợp lệ, thông báo sẽ được gửi qua Email' };
  }

  async resetPassword(dto: ResetPasswordDto){
    const user = await this.prisma.user.findUnique({
      where:{email: dto.email}
    })
    if(!user) {
      return { message: 'Nếu thông tin hợp lệ, mật khẩu sẽ được cập nhật' };
    }
    const resetRecord = await this.prisma.passwordResetToken.findFirst({
      where:{
        userId: user.id,
        expiresAt: {gt: new Date()}
      }
    })
    if(!resetRecord) {
      return { message: 'Nếu thông tin hợp lệ, mật khẩu sẽ được cập nhật' };
    }
    const isValid = await bcrypt.compare(dto.token, resetRecord.token)
    if(!isValid) {
      return { message: 'Nếu thông tin hợp lệ, mật khẩu sẽ được cập nhật' };
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: {email: user.email},
      data:{ password: hashedPassword }
    })
    await this.prisma.passwordResetToken.delete({
      where: {id: resetRecord.id}
    })
    return { message: 'Nếu thông tin hợp lệ, mật khẩu sẽ được cập nhật' };

  }

  async verifyResetToken( token: string, email: string ) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException("Người dùng không tồn tại");

    const tokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: { token, userId: user.id },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
    }
    return { success: true };
  }


  private async signRefreshToken(userId: string){
    return await this.jwtService.signAsync({ sub: userId },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d'
      })
  }
  private async signAccessToken(userId: string, role: string){
    return await this.jwtService.signAsync({ sub: userId, role: role },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m'
      })
  }
  private async handleToken(userId: string, role:string, deviceName: string, ipAddress:any){
    const accessToken = await this.signAccessToken(userId, role);
    const refreshToken = await this.signRefreshToken(userId)
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const checkRefreshToken = await this.prisma.refreshToken.findFirst({
      where: { userId, deviceName, ipAddress, } })
    if(checkRefreshToken){
      await this.prisma.refreshToken.update({
        where:{ id: checkRefreshToken.id },
        data:{
          token: hashedToken,
        }
      })
    }else{
      const decoded = this.jwtService.decode(refreshToken)
      const expiryDate = new Date(decoded.exp * 1000)
      await this.prisma.refreshToken.create({
        data: {
          token: hashedToken,
          expiryDate,
          deviceName,
          ipAddress,
          userId
        },
      });
    }
    return {
      accessToken,
      refreshToken
    }
  }
}
