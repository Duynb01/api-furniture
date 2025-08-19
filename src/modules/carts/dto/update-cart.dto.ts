import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
