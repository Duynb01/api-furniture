import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService,
              private readonly CategoryService: CategoriesService) {}

  async create(dto: CreateProductDto) {
      const category = await this.CategoryService.findOne(dto.category)
      if(!category) throw new NotFoundException('Sản phẩm không tồn tại');
      const {id: categoryId} = category

     const {id: productId} =await this.prisma.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          stock: dto.stock,
          categoryId: categoryId,
        },
      });
      await this.prisma.productImage.create({
        data:{
          url: dto.url,
          productId: productId
        }
      })

    return {
      message: 'Thêm sản phẩm thành công',
      id: productId,
    }
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        category: {
          select: {
            name: true
          }
        },
        productImages: {
          select: {
            url: true
          },
          take: 1,
        },
        active: true
      },
    });
    return products.map((product)=>{
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        category: product.category?.name || null,
        url: product.productImages[0]?.url || null,
        active: product.active
      }
    })
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        description: true,
        category: {
          select: {
            name: true
          }
        },
        productImages: {
          select: {
            url: true
          },
          take: 1,
        },
        active: true
      }
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    const images = product.productImages || [];
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      category: product.category?.name || null,
      url: images[0]?.url || null,
      active: product.active
    }
  }

  async update(id: string, updateDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    const data:any = {};
    if (typeof updateDto.active === 'boolean') {
      data.active = updateDto.active;
    }
    if (typeof updateDto.price === 'string') {
      data.price = Number(updateDto.price);
    }
    if(typeof updateDto.stock === 'string'){
      data.stock = Number(updateDto.stock);
    }
    return this.prisma.product.update({
      where: { id },
      data
    })
  }

  async decreaseProductQuantity(id: string, quantity: number){
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {id: true, stock: true},
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    if(product.stock < quantity){
        throw new BadRequestException('Số lượng tồn kho không đủ');
    }
    return this.prisma.product.update({
      where: { id },
      data: {stock: product.stock - quantity}
    })
  }

  remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }
}
