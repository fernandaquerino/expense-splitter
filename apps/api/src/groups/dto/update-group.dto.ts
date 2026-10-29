import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SUPPORTED_CURRENCY_CODES } from '../../domain/currency';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Group name cannot be empty' })
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCY_CODES, {
    message: `currencyCode must be one of: ${SUPPORTED_CURRENCY_CODES.join(', ')}`,
  })
  currencyCode?: string;
}
