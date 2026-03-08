import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GeneratePasswordDto {
  @ApiPropertyOptional({ default: 16, minimum: 4, maximum: 128 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(128)
  length?: number = 16;

  @ApiPropertyOptional({
    default: true,
    description: 'Include uppercase letters',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  uppercase?: boolean = true;

  @ApiPropertyOptional({
    default: true,
    description: 'Include lowercase letters',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lowercase?: boolean = true;

  @ApiPropertyOptional({ default: true, description: 'Include numbers' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  numbers?: boolean = true;

  @ApiPropertyOptional({
    default: true,
    description: 'Include special characters',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  symbols?: boolean = true;
}
