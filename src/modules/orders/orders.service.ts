import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CartsService } from '../carts/carts.service';
// import { VouchersService } from '../vouchers/vouchers.service';
import { generateOrderCode } from '../../utils/generate-code';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService,
              private readonly cartsService: CartsService,
              private readonly productsService: ProductsService,
              // private readonly vouchersService: VouchersService
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const code = generateOrderCode();
    const order = await this.prisma.order.create({
      data:{
        code,
        userId,
        status: 'PROCESSING',
        voucherCode: createOrderDto.voucherCode,
        total: createOrderDto.totalPrice,
        items: {
          create: createOrderDto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        },
        shippingInfo: {
          create: {
            name: createOrderDto.info.name,
            phone: createOrderDto.info.phone,
            address: createOrderDto.info.address,
            note: createOrderDto.info.note,
          },
        },
      },
      include:{
        items: true,
        shippingInfo: true,
      }
    })
    await this.handleUpdateData(userId, createOrderDto.items)
    return {
      message: 'Đặt hàng thành công',
      orderId: order.id
    };
  }

  private async handleUpdateData(userId: string, items: OrderItemDto[]){
    const cartItemIds = items
      .filter(item => item.cartItemId)
      .map(item => item.cartItemId);

    await Promise.all(
      cartItemIds.map((id: string) => this.cartsService.removeFromCart(userId, id))
    );

    await Promise.all(
      items.map(item => {
        const { productId, quantity } = item;
        if (productId && quantity) {
          return this.productsService.decreaseProductQuantity(productId, Number(quantity));
        }
      })
    );
  }

  async getByUser(userId: string){
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
        Payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    }));
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include:{
        items:true,
        Payment: true,
        shippingInfo: true,
        user: {
          select:{
            id: true,
            name: true,
            email: true
          }
        }

      },
      orderBy:{
        createdAt: 'desc'
      }
    });


    return orders.map((order)=>{
      return {
        id: order.id,
        code: order.code,
        status: order.status,
        voucherCode: order.voucherCode,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
        shippingInfo: order.shippingInfo
          ? {
            id: order.shippingInfo.id,
            name: order.shippingInfo.name,
            phone: order.shippingInfo.phone,
            address: order.shippingInfo.address,
            note: order.shippingInfo.note,
          }
          : null,
        user: order.user,
        Payment: order.Payment,
      }
    })
  }

  async findOne(orderId: string){
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                productImages: true
              },
            }
          },
        },
        shippingInfo: true,
        Payment: true,
        user: {
          select:{
            id: true,
            name: true,
            email: true
          }
        }
      },
    });
    if(!order) throw new NotFoundException(`Không tìm thấy đơn hàng`);
    return {
      id: order.id,
      code: order.code,
      status: order.status,
      voucherCode: order.voucherCode,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        url: item.product.productImages.map((img) => img.url)[0],
      })),
      user: order.user,
      shippingInfo: order.shippingInfo
        ? {
          id: order.shippingInfo.id,
          name: order.shippingInfo.name,
          phone: order.shippingInfo.phone,
          address: order.shippingInfo.address,
          note: order.shippingInfo.note,
        }
        : null,
      Payment: order.Payment,
    }
  }

  async cancelOrderByUser(id: string, userId: string){
    const order = await this.prisma.order.findUnique({ where: {id} })
    if(!order || order.userId !== userId){
      throw new ForbiddenException('Không có quyền hủy đơn này.')
    }
    if(order.status !== 'PROCESSING'){
      throw new BadRequestException('Không thể hủy đơn ở trạng thái hiện tại');
    }
    return this.prisma.order.update({
      where: {id},
      data: {status: 'CANCELLED'}
    })
  }

  async updateStatus(orderId: string, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: {id: orderId},
      data: { status: updateOrderDto.status }
    });
  }
}
