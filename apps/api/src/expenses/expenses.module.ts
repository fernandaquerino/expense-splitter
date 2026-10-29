import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { GroupsModule } from '../groups/groups.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { ExpensesRepository } from './expenses.repository';

@Module({
  imports: [DomainModule, GroupsModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensesRepository],
  exports: [ExpensesService],
})
export class ExpensesModule {}
