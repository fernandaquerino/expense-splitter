import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsHexColor,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { SUPPORTED_CURRENCY_CODES } from '../../domain/currency';

export class CreateMemberInlineDto {
  @IsString()
  @MinLength(1, { message: 'Member name is required' })
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Member email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsHexColor({ message: 'avatarColor must be a hex color' })
  avatarColor?: string;
}

export class CreateGroupDto {
  @IsString()
  @MinLength(1, { message: 'Group name is required' })
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsIn(SUPPORTED_CURRENCY_CODES, {
    message: `currencyCode must be one of: ${SUPPORTED_CURRENCY_CODES.join(', ')}`,
  })
  currencyCode!: string;

  /** Optional initial members to create alongside the group. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateMemberInlineDto)
  members?: CreateMemberInlineDto[];
}
