import { PartialType } from '@nestjs/swagger';
import { CreateSysUserDto } from './create-sys_users.dto';

export class UpdateSysUserDto extends PartialType(CreateSysUserDto) {}
