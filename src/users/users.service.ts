import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';

import { User } from '@prisma/client';

interface CreateOrUpdateUserDto {
  fullName: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class UsersService {


  constructor(private readonly prisma: PrismaService, private readonly logger: AppLogger) {}

  /**
   * Normaliza un número de teléfono removiendo espacios, guiones y paréntesis
   */
  private normalizePhone(phone?: string): string | undefined {
    if (!phone) return undefined;
    return phone.replace(/[\s\-\(\)]/g, '');
  }

  /**
   * Crea o actualiza un usuario basado en email o teléfono
   *
   * Lógica:
   * 1. Normaliza el teléfono (remueve espacios, guiones, paréntesis)
   * 2. Busca usuario existente por email o phone
   * 3. Si existe, actualiza sus datos
   * 4. Si no existe, crea uno nuevo
   *
   * @param dto Datos del usuario
   * @returns Usuario creado o actualizado
   */
  async createOrUpdate(dto: CreateOrUpdateUserDto): Promise<User> {
    // Normalizar teléfono
    const normalizedPhone = this.normalizePhone(dto.phone);

    // Buscar usuario existente por email o phone
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.email ? [{ email: dto.email }] : []),
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
    });

    if (existing) {
      this.logger.debug(`Actualizando usuario existente: ${existing.id}`);
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          fullName: dto.fullName,
          email: dto.email,
          phone: normalizedPhone,
        },
      });
    }

    this.logger.debug(`Creando nuevo usuario: ${dto.fullName}`);
    return this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: normalizedPhone,
      },
    });
  }

  /**
   * Busca un usuario por ID
   */
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  /**
   * Busca un usuario por teléfono
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { phone },
    });
  }
}
