import { Controller, Get, Post, Body, Patch, Param, Request, Delete, UseGuards } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateVoucherDto){
    const voucher = await this.vouchersService.create(dto)
    return {
      message: 'Tạo voucher thành công!',
      data: {
        id: voucher.id,
        code: voucher.code,
        discount: voucher.discount,
        type: voucher.type,
        expiryDate: voucher.expiryDate,
      },
    }
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  claimVoucher(@Request() request:any, @Param('id') voucherId: string){
    return this.vouchersService.claimVoucher(request.user.id, voucherId)
  }

  @Get()
  findAll() {
    return this.vouchersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyVouchers(@Request() request: any){
    return this.vouchersService.findByUser(request.user.id)
  }

  @Get(':code')
  @UseGuards(JwtAuthGuard)
  async validVoucherCode(@Param('code') code: string) {
    return this.vouchersService.findValidByCode(code)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() updateDTO: UpdateVoucherDto) {
    return this.vouchersService.status(id, updateDTO);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string){
    return this.vouchersService.remove(id)
  }
}

