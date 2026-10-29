import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EXPENSE_CATEGORIES } from '../../domain/category';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(140)
  description!: string;

  /**
   * Amount in MAJOR units as a decimal string (e.g. "42.50", or "4850" for JPY).
   * Sent as a string to avoid floating-point drift; the server converts it to
   * integer minor units using the group's currency and rejects values with
   * more decimal places than the currency allows.
   */
  @IsString()
  @Matches(/^\d+(\.\d+)?$/, {
    message: 'amount must be a positive decimal number (e.g. "42.50")',
  })
  amount!: string;

  @IsDateString({}, { message: 'date must be an ISO 8601 date string' })
  date!: string;

  @IsIn(EXPENSE_CATEGORIES, {
    message: `category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
  })
  category!: string;

  @IsString()
  @MinLength(1, { message: 'payerId is required' })
  payerId!: string;

  /** Members who share this expense. Defaults (on the client) to all members. */
  @IsArray()
  @ArrayNotEmpty({ message: 'Select at least one participant' })
  @ArrayMaxSize(50)
  @IsString({ each: true })
  participantIds!: string[];

  /** Only EQUAL is supported in the MVP. */
  @IsOptional()
  @IsIn(['EQUAL'], { message: 'Only the EQUAL split type is supported' })
  splitType?: 'EQUAL';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
