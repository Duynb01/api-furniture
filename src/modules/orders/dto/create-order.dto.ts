import {
  IsArray, IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {PaymentMethod} from '../../payments/dto/create-payment.dto';

enum OrderStatus{
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class OrderItemDto{
  @IsOptional()
  @IsString()
  cartItemId?: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

class ShippingInfoDto{
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateOrderDto{
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingInfoDto)
  info:ShippingInfoDto

  @IsEnum(PaymentMethod)
  method: PaymentMethod

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsNumber()
  @Min(0)
  totalPrice: number;
}