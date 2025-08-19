import {IsString, IsEnum, IsDateString, IsNumber} from 'class-validator';

export enum DiscountType{
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export class CreateVoucherDto {
  @IsString()
  name: string

  @IsString()
  code: string

  @IsNumber()
  discount: number

  @IsEnum(DiscountType)
  type: DiscountType;

  @IsDateString()
  startDate: string

  @IsDateString()
  expiryDate: string
}
