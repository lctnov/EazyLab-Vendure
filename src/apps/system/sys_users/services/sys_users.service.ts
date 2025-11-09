import { Injectable, NotFoundException } from '@nestjs/common';
import { SysUsersRepository } from '../repositories/sys_users.repository';
import { CreateSysUserDto } from '../dto/create-sys_users.dto';
import { UpdateSysUserDto } from '../dto/update-sys_users.dto';
import { FilterSysUserDto } from '../dto/filter-sys_users.dto';

@Injectable()
export class SysUsersService {
  constructor(private readonly repo: SysUsersRepository) {}

  // Lấy danh sách người dùng theo filter
  async findAll(filter: FilterSysUserDto) {
    return this.repo.findAll({
      where: {
        username: filter.username ? { contains: filter.username } : undefined,
        email: filter.email ? { contains: filter.email } : undefined,
        isactive: filter.isactive,
      },
      orderBy: { createdtime: 'desc' },
    });
  }

  // Lấy một bản ghi theo rowguid
  async findOne(rowguid: string) {
    const user = await this.repo.findOne(rowguid);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với rowguid: ${rowguid}`);
    }
    return user;
  }

  // Tạo mới người dùng
  async create(dto: CreateSysUserDto) {
    return this.repo.create(dto);
  }

  // Cập nhật người dùng
  // async update(rowguid: string, updateDto: UpdateSysUserDto) {
  //   return this.repo.update(rowguid, updateDto);
  // }

  // Xóa một người dùng
  async delete(rowguid: string) {
    await this.findOne(rowguid); // kiểm tra tồn tại trước
    return this.repo.delete(rowguid);
  }

  // Xóa nhiều người dùng
  async deleteMany(rowguid: string[]) {
    return this.repo.deleteMany(rowguid);
  }
}
