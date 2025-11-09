import { Controller, Post, Body } from '@nestjs/common';
import { SysUsersService } from '../services/sys_users.service';
import { CreateSysUserDto } from '../dto/create-sys_users.dto';
import { UpdateSysUserDto } from '../dto/update-sys_users.dto';
import { FilterSysUserDto } from '../dto/filter-sys_users.dto';

@Controller('system/sys_users')
export class SysUsersController {
  constructor(private readonly service: SysUsersService) {}

  // Lấy danh sách theo filter
  @Post('list')
  findAll(@Body() filter: FilterSysUserDto) {
    return this.service.findAll(filter);
  }

  // Lấy 1 bản ghi theo rowguid
  @Post('get')
  findOne(@Body('rowguid') rowguid: string) {
    return this.service.findOne(rowguid);
  }

  // Tạo mới
  @Post('create')
  create(@Body() dto: CreateSysUserDto) {
    return this.service.create(dto);
  }

  // Cập nhật
  // @Post('update')
  // update(
  //   @Body('rowguid') rowguid: string,
  //   @Body() dto: UpdateSysUserDto
  // ) {
  //   return this.service.update(rowguid, dto);
  // }

  // Xóa 1 bản ghi
  @Post('delete')
  delete(@Body('rowguid') rowguid: string) {
    return this.service.delete(rowguid);
  }

  // Xóa nhiều bản ghi
  @Post('delete-many')
  deleteMany(@Body('rowguid') rowguid: string[]) {
    return this.service.deleteMany(rowguid);
  }
}
