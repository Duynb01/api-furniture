import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentDto{
  @IsString()
  @IsNotEmpty()
  status: string

  @IsOptional()
  @IsString()
  transactionId? :string
}
