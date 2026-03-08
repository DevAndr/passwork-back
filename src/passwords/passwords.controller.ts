import {
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
