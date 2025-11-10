import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database/prisma.service';
import { CreateSysUserDto } from '../dto/create-sys_users.dto';
import { UpdateSysUserDto } from '../dto/update-sys_users.dto';

@Injectable()
export class SysUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params?: any) {
    return this.prisma.sYS_USERS.findMany(params);
  }

  findOne(rowguid: string) {
    return this.prisma.sYS_USERS.findUnique({ where: { rowguid } });
  }

  create(dto: CreateSysUserDto) {
    return this.prisma.sYS_USERS.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: dto.password,
        expiredate: dto.expiredate,
        birthday: dto.birthday,
        address: dto.address,
        telphone: dto.telphone,
        isactive: dto.isactive ?? true,
        role: 'admin',
        createdby: dto.createdby,
        createdtime: new Date(),
      },
    });
  }

  // update(rowguid: string, data: UpdateSysUserDto) {
  //   let data:any = {...data, role: 'admin'};
  //   return this.prisma.sYS_USERS.update({
  //     where: { rowguid },
  //     data,
  //   });
  // }

  delete(rowguid: string) {
    return this.prisma.sYS_USERS.delete({ where: { rowguid } });
  }

  deleteMany(rowguid: string[]) {
    return this.prisma.sYS_USERS.deleteMany({
      where: { rowguid: { in: rowguid } },
    });
  }
}
