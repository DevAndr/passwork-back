import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({ example: 'Social Media' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Parent folder UUID for nesting' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
