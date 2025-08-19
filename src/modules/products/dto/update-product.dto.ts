import { IsBoolean, IsOptional, IsString } from 'class-validator';
import {ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  price?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stock?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active? : boolean
}
