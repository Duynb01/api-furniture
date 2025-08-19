import { Injectable, NotFoundException } from '@nestjs/common';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserCart(userId: string) {
    const data = await this.prisma.cartItem.findMany({
      where: { userId },
      select: {
        id: true,
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            productImages: {
              select: { url: true },
              take: 1
            }
          }
        }
      }

    })
    return data.map((item)=> ({
      cartItemId: item.id,
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      stock: item.product.stock,
      url: item.product.productImages[0]?.url || null,
    }))
  }

  async addToCart(userId: string, addToCartDto: AddCartDto){
    const findItem = await this.prisma.cartItem.findFirst({
      where: {userId, productId: addToCartDto.productId}
    })
    if(findItem){
      return this.prisma.cartItem.update({
        where: {id: findItem.id},
        data: {
          quantity: findItem.quantity + addToCartDto.quantity
        }
      })
    }
    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity
      }
    });
  }
  async updateQuantity(userId: string, cartItemId: string, updateCartDto: UpdateCartDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.userId !== userId) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: updateCartDto.quantity },
    });
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.userId !== userId) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    return this.prisma.cartItem.delete({ where: { id: cartItemId } });
  }
  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
