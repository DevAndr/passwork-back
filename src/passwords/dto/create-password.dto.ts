import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePasswordDto {
  @ApiProperty({ example: 'Gmail' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'https://mail.google.com' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 'user@gmail.com' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'Password encrypted on the client side (E2E)' })
  @IsString()
  encryptedPassword: string;

  @ApiPropertyOptional({ description: 'Notes encrypted on the client side' })
  @IsOptional()
  @IsString()
  encryptedNotes?: string;

  @ApiPropertyOptional({ description: 'Folder UUID to place the password in' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ description: 'Array of tag UUIDs', type: [String] })
  @IsOptional()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
