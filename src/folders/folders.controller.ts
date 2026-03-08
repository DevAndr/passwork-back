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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth';
import { CurrentUser } from '../common/decorators';
import { FoldersService } from './folders.service';
import { CreateFolderDto, UpdateFolderDto } from './dto';

@ApiTags('Folders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FoldersController {
  constructor(private folders: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({ status: 201, description: 'Folder created' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateFolderDto) {
    return this.folders.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all folders for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Array of folders with children and password count',
  })
  findAll(@CurrentUser('id') userId: string) {
    return this.folders.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single folder with its passwords' })
  @ApiParam({ name: 'id', description: 'Folder UUID' })
  @ApiResponse({
    status: 200,
    description: 'Folder with children and passwords',
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.folders.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a folder' })
  @ApiParam({ name: 'id', description: 'Folder UUID' })
  @ApiResponse({ status: 200, description: 'Folder updated' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
  ) {
    return this.folders.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a folder (passwords moved to root)' })
  @ApiParam({ name: 'id', description: 'Folder UUID' })
  @ApiResponse({ status: 204, description: 'Folder deleted' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.folders.remove(userId, id);
  }
}
