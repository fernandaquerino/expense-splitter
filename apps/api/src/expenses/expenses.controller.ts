import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { ExpensesService } from './expenses.service';

/** Expenses are always scoped to a group. */
@Controller('groups/:groupId/expenses')
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Post()
  create(@Param('groupId') groupId: string, @Body() dto: CreateExpenseDto) {
    return this.expenses.create(groupId, dto);
  }

  @Get()
  findAll(
    @Param('groupId') groupId: string,
    @Query() query: QueryExpensesDto,
  ) {
    return this.expenses.findAll(groupId, query);
  }

  @Get(':id')
  findOne(@Param('groupId') groupId: string, @Param('id') id: string) {
    return this.expenses.findOne(groupId, id);
  }

  @Patch(':id')
  update(
    @Param('groupId') groupId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenses.update(groupId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('groupId') groupId: string, @Param('id') id: string) {
    return this.expenses.remove(groupId, id);
  }
}
