import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreatePasswordDto, UpdatePasswordDto } from './dto';

@Injectable()
export class PasswordsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePasswordDto) {
    const { tagIds, ...data } = dto;

    return this.prisma.password.create({
      data: {
        ...data,
        userId,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: { tags: { include: { tag: true } }, folder: true },
    });
  }

  async findAll(userId: string, search?: string, folderId?: string) {
    return this.prisma.password.findMany({
      where: {
        userId,
        folderId: folderId || undefined,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { url: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { tags: { include: { tag: true } }, folder: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const password = await this.prisma.password.findFirst({
      where: { id, userId },
      include: {
        tags: { include: { tag: true } },
        folder: true,
        history: { orderBy: { changedAt: 'desc' } },
      },
    });
    if (!password) {
      throw new NotFoundException('Password not found');
    }
    return password;
  }

  async update(userId: string, id: string, dto: UpdatePasswordDto) {
    const existing = await this.findOne(userId, id);
    const { tagIds, ...data } = dto;

    if (dto.encryptedPassword) {
      await this.prisma.passwordHistory.create({
        data: {
          passwordId: id,
          encryptedPassword: existing.encryptedPassword,
          encryptedNotes: existing.encryptedNotes,
        },
      });
    }

    if (tagIds !== undefined) {
      await this.prisma.passwordTag.deleteMany({ where: { passwordId: id } });
    }

    return this.prisma.password.update({
      where: { id },
      data: {
        ...data,
        tags:
          tagIds !== undefined
            ? { create: tagIds.map((tagId) => ({ tagId })) }
            : undefined,
      },
      include: { tags: { include: { tag: true } }, folder: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.password.delete({ where: { id } });
  }
}
