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
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto } from './dto';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private tags: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTagDto) {
    return this.tags.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tags for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Array of tags with password count',
  })
  findAll(@CurrentUser('id') userId: string) {
    return this.tags.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tag with its passwords' })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiResponse({ status: 200, description: 'Tag with associated passwords' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tags.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiResponse({ status: 200, description: 'Tag updated' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tags.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiResponse({ status: 204, description: 'Tag deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tags.remove(userId, id);
  }
}
