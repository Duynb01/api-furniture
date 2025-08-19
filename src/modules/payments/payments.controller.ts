import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Request } from 'express';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findAll(@Query('status') status?:string) {
    return this.paymentsService.getAll(status);
  }

  @Patch(':orderId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  updateStatus(
    @Param('orderId') orderId: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.updateStatus(orderId, updatePaymentDto.status, updatePaymentDto.transactionId);
  }

  @Post('vnpay-create')
  async createVnpay(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    return this.paymentsService.createVnpayPayment(dto);
  }

  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any) {
    return this.paymentsService.handleVnpayReturn(query);
  }
}
