import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStatusRoleDto {
  @ApiPropertyOptional({ description: 'ID vai trò mới (roleId)', example: 2 })
  @IsOptional()
  @IsInt()
  roleId?: number;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động của người dùng', example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}