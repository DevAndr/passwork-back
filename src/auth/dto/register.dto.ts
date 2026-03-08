import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Hash of master password (derived on client)' })
  @IsString()
  masterPasswordHash: string;

  @ApiProperty({
    description: 'Salt for client-side encryption key derivation',
  })
  @IsString()
  encryptionSalt: string;
}
