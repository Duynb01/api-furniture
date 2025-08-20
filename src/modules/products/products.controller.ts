import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const ROOM_CATEGORY_MAP: Record<string, { ids: number[], name: string }> = {
  'phong-khach': { ids: [1, 2, 3, 6], name: 'Phòng khách' },
  'phong-ngu': { ids: [4, 5], name: 'Phòng ngủ' },
  'phong-an-va-bep': { ids: [7], name: 'Phòng ăn & Bếp' },
  'phong-lam-viec': { ids: [5, 6], name: 'Phòng làm việc' },
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':slug/room')
  async findRoomStyle(@Param('slug') slug: string) {
    const room = ROOM_CATEGORY_MAP[slug] || { ids: [1,2,3,4,5,6,7,8], name: 'Tất cả phòng' };
    const products = await this.productsService.findRoomStyle(room.ids);
    return {
      room: room.name,
      products,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}