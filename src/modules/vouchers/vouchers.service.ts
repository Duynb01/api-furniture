import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {
  }

  async create(createVoucherDTO: CreateVoucherDto){
    try {
      return await this.prisma.voucher.create({
        data: {
          name: createVoucherDTO.name,
          code: createVoucherDTO.code,
          discount: createVoucherDTO.discount,
          type: createVoucherDTO.type,
          startDate: new Date(createVoucherDTO.startDate),
          expiryDate: new Date(createVoucherDTO.expiryDate),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Mã voucher đã tồn tại!');
      }
      throw error
    }
  }

  async findAll() {
    const vouchers = await this.prisma.voucher.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        discount: true,
        type: true,
        expiryDate: true,
        startDate: true,
        active: true
      },
      orderBy:{
        expiryDate: 'asc'
      },
    })
    await Promise.all(vouchers.map((voucher) => this.checkDate(voucher.id)));
    return vouchers;
  }

  async findValidByCode(code: string) {
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        code,
        active: true,
        expiryDate:{
          gt: new Date()
        }
      }
    })
    if (!voucher) throw new BadRequestException('Voucher không tồn tại hoặc đã hết hạn!');
    return voucher;
  }

  async findByUser(userId: string){
    const voucherUsers = await this.prisma.voucherUser.findMany({
      where: {
        userId,
      },
      include: {
        voucher:{
          select:{
            id: true,
            name: true,
            code: true,
            discount: true,
            type: true,
            expiryDate: true,
            active: true,
          }
        }
      },
      orderBy:{
        voucher:{
          expiryDate: 'asc'
        }
      }
    })
    return voucherUsers.map((v) => v.voucher)
  }

  async claimVoucher(userId:string, voucherId: string){
    const voucher = await this.prisma.voucher.findUnique({
      where:{
        id: voucherId
      }
    })
    if (!voucher) throw new NotFoundException("Voucher không tồn tại")
    if(new Date(voucher.expiryDate) < new Date()){
      throw new BadRequestException('Voucher đã hết hạn')
    }
    const alreadyClaimed = await this.prisma.voucherUser.findFirst({
      where: {
        userId,
        voucherId
      }
    })
    if(alreadyClaimed) throw new BadRequestException("Bạn đã lưu voucher này rồi")
    return this.prisma.voucherUser.create({
      data:{
        userId,
        voucherId
      },
      include:{
        voucher:{
          select:{
            id: true,
            name: true,
            code: true,
            discount: true,
            type: true,
            expiryDate: true
          }
        }
      }
    })
  }

  async remove(id: string){
    const voucher = await this.prisma.voucher.findUnique({
      where:{
        id
      }
    })
    if (!voucher) throw new NotFoundException('Voucher không tồn tại');
    return this.prisma.voucher.delete({
      where: { id },
    });
  }

  async status (id: string, updateDto: UpdateVoucherDto){
    const voucher = await this.prisma.voucher.findUnique({
      where: {id},
    });
    if(!voucher) throw new NotFoundException("Voucher dùng không tồn tại");
    await this.prisma.voucher.update({
      where: {id},
      data: {
        ...(typeof updateDto.active === 'boolean' && { active: updateDto.active }),
        ...(typeof updateDto.expiryDate === 'string' && { expiryDate: new Date(updateDto.expiryDate) }),
      }
    })
    return {
      message: 'Cập nhật thành công'
    }
  }

  private async checkDate(id: string): Promise<void> {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      select: {
        id: true,
        expiryDate: true,
        active: true
      },
    });
    if (!voucher) {
      throw new NotFoundException('Voucher không tồn tại');
    }
    const isExpired = voucher.expiryDate <= new Date()
    if (isExpired && voucher.active) {
      await this.prisma.voucher.update({
        where: { id },
        data: { active: false },
      });
    }
  }
}
