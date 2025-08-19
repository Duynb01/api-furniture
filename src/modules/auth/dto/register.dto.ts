import { LoginDto } from './login.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto extends LoginDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
