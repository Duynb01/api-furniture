import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusRoleDto } from './dto/update-status-role.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: {
          select:{
            name: true
          }
        },
        createdAt: true,
        active: true
      }
    })
    return users.map((user)=>{
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        role: user.role.name,
        createdAt: user.createdAt,
        active: user.active
      }
    })
  }

  async findOne(id: string){
    const user = await this.prisma.user.findUnique({
      where: {id},
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: {
          select:{
            name: true
          }
        }
      }
    })
    if(!user) throw new NotFoundException("Không tìm thấy người dùng")
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role.name,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {id},
    });
    if(!user) throw new NotFoundException("Người dùng không tồn tại");
    const data: any = {};

    if(updateUserDto.infoDto){
      if (updateUserDto.infoDto.name !== undefined) data.name = updateUserDto.infoDto.name;
      if (updateUserDto.infoDto.phone !== undefined) data.phone = updateUserDto.infoDto.phone;
      if (updateUserDto.infoDto.address !== undefined) data.address = updateUserDto.infoDto.address;
    }

    if (updateUserDto.passwordDto) {
      if (!user.password) {
        throw new Error("User password not found");
      }
      const isCheck = await bcrypt.compare(updateUserDto.passwordDto.oldPassword, user.password);
      if(!isCheck) throw new BadRequestException("Mật khẩu hiện tại không đúng");
      data.password = await bcrypt.hash(updateUserDto.passwordDto.newPassword, 10);
    }

    await this.prisma.user.update({ where: { id }, data });
    return { message: 'Cập nhật người dùng thành công' };
  }

  async status(id: string, updateDto: UpdateStatusRoleDto){
    const user = await this.prisma.user.findUnique({
      where: {id},
    });
    if(!user) throw new NotFoundException("Người dùng không tồn tại");
    await this.prisma.user.update({
      where: {id},
      data: {
        ...(typeof updateDto.active === 'boolean' && { active: updateDto.active }),
        ...(typeof updateDto.roleId === 'number' && { roleId: updateDto.roleId }),
      }
    })
    return {
      message: 'Cập nhật thành công'
    }
  }

  async remove(id: string) {
    return this.prisma.user.update({ where: { id }, data:{active: false} });
  }
}
