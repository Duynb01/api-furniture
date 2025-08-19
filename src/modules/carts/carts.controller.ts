import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  addToCart(@Request() request: any, @Body() createCartDto: AddCartDto) {
    return this.cartsService.addToCart(request.user.id, createCartDto);
  }
  @Get()
  getMyCart(@Request() request: any) {
    return this.cartsService.findUserCart(request.user.id);
  }
  @Patch(':id')
  updateQuantity(
    @Request() request: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartsService.updateQuantity(request.user.id, id, dto);
  }
  @Delete()
  clearCart(@Request() request: any){
    return this.cartsService.clearCart(request.user.id)
  }
  @Delete(':id')
  removeFromCart(@Request() request: any, @Param('id') id: string) {
    return this.cartsService.removeFromCart(request.user.id, id);
  }
}
