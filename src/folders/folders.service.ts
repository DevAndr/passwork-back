import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateFolderDto, UpdateFolderDto } from './dto';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFolderDto) {
    return this.prisma.folder.create({
      data: { ...dto, userId },
      include: { children: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.folder.findMany({
      where: { userId },
      include: { children: true, _count: { select: { passwords: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, userId },
      include: { children: true, passwords: true },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

  async update(userId: string, id: string, dto: UpdateFolderDto) {
    await this.findOne(userId, id);
    return this.prisma.folder.update({
      where: { id },
      data: dto,
      include: { children: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.folder.delete({ where: { id } });
  }
}
