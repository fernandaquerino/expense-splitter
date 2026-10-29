import {
  IsEmail,
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @MinLength(1, { message: 'Member name is required' })
  @MaxLength(60)
  name!: string;

  /** Optional — omit for a name-only member with no registered account. */
  @IsOptional()
  @IsEmail({}, { message: 'Member email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsHexColor({ message: 'avatarColor must be a hex color' })
  avatarColor?: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Member name cannot be empty' })
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Member email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsHexColor({ message: 'avatarColor must be a hex color' })
  avatarColor?: string;
}
