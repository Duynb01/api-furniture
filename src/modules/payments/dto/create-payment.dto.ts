import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export enum PaymentMethod{
  COD = 'cod',
  VNPAY = 'vnpay',
}

export class CreatePaymentDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  orderId: string

  @IsEnum(PaymentMethod)
  method: PaymentMethod

  @IsNumber()
  @Min(0)
  amount: number
}
