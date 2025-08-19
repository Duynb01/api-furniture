import { IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdateInfoDto {
  @ApiPropertyOptional({ description: 'Tên người dùng', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ người dùng', example: '123 Đường ABC, Quận 1, TP.HCM' })
  @IsOptional()
  @IsString()
  address?: string;
}

class UpdatePasswordDto {
  @ApiPropertyOptional({ description: 'Mật khẩu hiện tại', example: 'oldpassword123' })
  @IsString()
  oldPassword: string;

  @ApiPropertyOptional({ description: 'Mật khẩu mới', example: 'newpassword456' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ type: () => UpdateInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfoDto)
  infoDto?: UpdateInfoDto;

  @ApiPropertyOptional({ type: () => UpdatePasswordDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePasswordDto)
  passwordDto?: UpdatePasswordDto;
}
