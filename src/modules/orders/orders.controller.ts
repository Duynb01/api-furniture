import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() request:any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(request.user.id, createOrderDto);
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('me')
  getByUser(@Req() request:any){
    return this.ordersService.getByUser(request.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  async cancelOrder(@Param('id') id: string, @Req() req: any){
    return this.ordersService.cancelOrderByUser(id, req.user.id)
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersService.updateStatus(id, updateOrderDto);
    return{
      message: 'Successful',
      data:{
        id: order.id,
        code: order.code,
        total: order.total,
        status: order.status,
        userId: order.userId,
        createdAt: order.createdAt
      }
    }
  }



}
