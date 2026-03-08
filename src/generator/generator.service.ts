import { Injectable, BadRequestException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { GeneratePasswordDto } from './dto/generate-password.dto';

@Injectable()
export class GeneratorService {
  generate(dto: GeneratePasswordDto): { password: string } {
    const {
      length = 16,
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
    } = dto;

    let charset = '';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      throw new BadRequestException(
        'At least one character set must be enabled',
      );
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[randomInt(charset.length)];
    }

    return { password };
  }
}
