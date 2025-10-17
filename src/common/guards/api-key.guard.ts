import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

/**
 * Guard para proteger endpoints con API Key
 * 
 * Uso:
 * @UseGuards(ApiKeyGuard)
 * @Public() // Para marcar endpoints públicos
 * 
 * Configuración:
 * .env: API_KEY=your-secret-key
 * 
 * Header requerido:
 * x-api-key: your-secret-key
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar si el endpoint está marcado como público
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    const validApiKey = this.configService.get<string>('API_KEY');

    // En desarrollo, permitir acceso libre si no hay API_KEY configurada
    if ((process.env.NODE_ENV || 'development') === 'development' && !validApiKey) {
      return true;
    }

    // En producción, requerir API_KEY siempre
    if (!validApiKey) {
      throw new UnauthorizedException('API Key not configured');
    }

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}

