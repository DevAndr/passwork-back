import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth';
import { GeneratorService } from './generator.service';
import { GeneratePasswordDto } from './dto/generate-password.dto';

@ApiTags('Generator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('generator')
export class GeneratorController {
  constructor(private generator: GeneratorService) {}

  @Get()
  @ApiOperation({ summary: 'Generate a random password' })
  @ApiResponse({ status: 200, description: 'Generated password string' })
  generate(@Query() dto: GeneratePasswordDto) {
    return this.generator.generate(dto);
  }
}
