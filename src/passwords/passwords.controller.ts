import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth';
import { CurrentUser } from '../common/decorators';
import { PasswordsService } from './passwords.service';
import { CreatePasswordDto, UpdatePasswordDto } from './dto';

@ApiTags('Passwords')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('passwords')
export class PasswordsController {
  constructor(private passwords: PasswordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new password entry' })
  @ApiResponse({ status: 201, description: 'Password created' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePasswordDto) {
    return this.passwords.create(userId, dto);
  }

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import passwords from a CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Passwords imported successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid CSV format' })
  importCsv(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    return this.passwords.importCsv(userId, file.buffer);
  }

  @Get()
  @ApiOperation({ summary: 'List all passwords for the current user' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title, url, or username',
  })
  @ApiQuery({
    name: 'folderId',
    required: false,
    description: 'Filter by folder UUID',
  })
  @ApiResponse({ status: 200, description: 'Array of password entries' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('search') search?: string,
    @Query('folderId') folderId?: string,
  ) {
    return this.passwords.findAll(userId, search, folderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single password with history' })
  @ApiParam({ name: 'id', description: 'Password UUID' })
  @ApiResponse({
    status: 200,
    description: 'Password entry with change history',
  })
  @ApiResponse({ status: 404, description: 'Password not found' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.passwords.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a password entry' })
  @ApiParam({ name: 'id', description: 'Password UUID' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 404, description: 'Password not found' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.passwords.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a password entry' })
  @ApiParam({ name: 'id', description: 'Password UUID' })
  @ApiResponse({ status: 204, description: 'Password deleted' })
  @ApiResponse({ status: 404, description: 'Password not found' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.passwords.remove(userId, id);
  }
}
