import { IsOptional, IsString, MinLength, ValidateNested, Matches, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdateInfoDto {
  @ApiPropertyOptional({ description: 'Tên người dùng', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "Tên phải từ 2-50 ký tự" })
  name?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0987654321' })
  @IsOptional()
  @Matches(/^[0-9]{10,11}$/, { message: "SĐT không hợp lệ" })
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ người dùng', example: '123 Đường ABC, Quận 1, TP.HCM' })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: "Địa chỉ quá ngắn" })
  address?: string;
}

class UpdatePasswordDto {
  @ApiPropertyOptional({ description: 'Mật khẩu hiện tại', example: 'oldpassword123' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  oldPassword: string;

  @ApiPropertyOptional({ description: 'Mật khẩu mới', example: 'newpassword456' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, {message: 'Mật khẩu phải lớn hơn 8 ký tự!'})
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số',
    })
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
