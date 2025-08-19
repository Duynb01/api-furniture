import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateVoucherDto {
  @IsOptional()
  @IsString()
  expiryDate?: string

  @IsOptional()
  @IsBoolean()
  active? : boolean
}
