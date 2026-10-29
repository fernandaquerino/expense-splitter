import { Module } from '@nestjs/common';
import { SplitService } from './split/split.service';
import { BalanceService } from './balance/balance.service';

/**
 * Domain module: pure business-rule services with no I/O. Imported by the
 * feature modules that orchestrate persistence around them.
 */
@Module({
  providers: [SplitService, BalanceService],
  exports: [SplitService, BalanceService],
})
export class DomainModule {}
