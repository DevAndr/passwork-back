import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'work' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '#ff5733', description: 'Tag color in hex' })
  @IsOptional()
  @IsString()
  color?: string;
}
