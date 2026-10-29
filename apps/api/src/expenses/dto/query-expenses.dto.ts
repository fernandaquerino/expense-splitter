import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { EXPENSE_CATEGORIES } from '../../domain/category';

/** Query params for filtering a group's expenses (spec: filter by category & date). */
export class QueryExpensesDto {
  @IsOptional()
  @IsIn(EXPENSE_CATEGORIES, {
    message: `category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
  })
  category?: string;

  /** Inclusive lower bound on expense date (ISO 8601). */
  @IsOptional()
  @IsDateString({}, { message: 'from must be an ISO 8601 date string' })
  from?: string;

  /** Inclusive upper bound on expense date (ISO 8601). */
  @IsOptional()
  @IsDateString({}, { message: 'to must be an ISO 8601 date string' })
  to?: string;

  /** Optional: only expenses paid by this member. */
  @IsOptional()
  @IsString()
  payerId?: string;
}
