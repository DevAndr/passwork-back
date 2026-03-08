import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async importCsv(userId: string, fileBuffer: Buffer) {
    const content = fileBuffer.toString('utf-8').trim();
    const lines = content.split(/\r?\n/);

    if (lines.length < 2) {
      throw new BadRequestException('CSV file is empty or has no data rows');
    }

    const header = lines[0].toLowerCase();
    if (!header.includes('url') || !header.includes('password')) {
      throw new BadRequestException(
        'Invalid CSV format. Expected header: url,username,password,comment,tags',
      );
    }

    const rows = lines.slice(1).filter((line) => line.trim());
    const results: any[] = [];

    for (const row of rows) {
      const cols = this.parseCsvRow(row);
      const [url, username, password, comment] = cols;

      if (!password) continue;

      let title = url || 'Imported password';
      try {
        title = new URL(url).hostname;
      } catch {
        // keep url as title if parsing fails
      }

      try {
        const created = await this.prisma.password.create({
          data: {
            userId,
            title,
            url: url || null,
            username: username || null,
            encryptedPassword: password,
            encryptedNotes: comment || null,
          },
          include: { tags: { include: { tag: true } }, folder: true },
        });

        results.push(created);
      } catch (error) {
        if (error?.code === 'P2002') {
          continue; // skip duplicates
        }
        throw error;
      }
    }

    return { imported: results.length, passwords: results };
  }

  private parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (inQuotes) {
        if (char === '"' && row[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current);
    return result;
  }
}
