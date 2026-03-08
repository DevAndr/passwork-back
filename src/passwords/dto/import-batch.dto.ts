import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ImportBatchItemDto {
  @ApiProperty({ example: 'google.com' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'https://google.com' })
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
}

export class ImportBatchDto {
  @ApiProperty({ type: [ImportBatchItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportBatchItemDto)
  entries: ImportBatchItemDto[];
}
