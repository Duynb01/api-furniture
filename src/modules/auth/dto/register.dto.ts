import { LoginDto } from './login.dto';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto extends LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MinLength(2, {message: 'Tên phải lớn hơn 2 ký tự!'})
  name: string;
}
