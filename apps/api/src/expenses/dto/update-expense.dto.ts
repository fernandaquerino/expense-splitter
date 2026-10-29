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

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Description cannot be empty' })
  @MaxLength(140)
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+(\.\d+)?$/, {
    message: 'amount must be a positive decimal number (e.g. "42.50")',
  })
  amount?: string;

  @IsOptional()
  @IsDateString({}, { message: 'date must be an ISO 8601 date string' })
  date?: string;

  @IsOptional()
  @IsIn(EXPENSE_CATEGORIES, {
    message: `category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
  })
  category?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  payerId?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Select at least one participant' })
  @ArrayMaxSize(50)
  @IsString({ each: true })
  participantIds?: string[];

  @IsOptional()
  @IsIn(['EQUAL'], { message: 'Only the EQUAL split type is supported' })
  splitType?: 'EQUAL';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
