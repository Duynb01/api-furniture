import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusRoleDto } from './dto/update-status-role.dto';
import { Roles } from '../../common/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({summary: 'Lấy thông tin người dùng'})
  @ApiResponse({ status: 200, description: 'Thông tin người dùng.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  updateProfile(@Request() request: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(request.user.id, updateUserDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật trạng thái hoạt động và vai trò người dùng (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  updateStatus(@Param('id') id: string, @Body() updateDTO: UpdateStatusRoleDto) {
    return this.usersService.status(id, updateDTO);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xóa người dùng (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công hoặc vô hiệu hóa.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
