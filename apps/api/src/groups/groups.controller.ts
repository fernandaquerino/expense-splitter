import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.groups.create(dto);
  }

  @Get()
  findAll() {
    return this.groups.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groups.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groups.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.groups.remove(id);
  }

  // --- members ---

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: CreateMemberDto) {
    return this.groups.addMember(id, dto);
  }

  @Patch(':id/members/:memberId')
  updateMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.groups.updateMember(id, memberId, dto);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(204)
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.groups.removeMember(id, memberId);
  }
}
