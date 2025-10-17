import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Filtro global para traducir errores de Prisma a respuestas HTTP limpias
 * 
 * Códigos de error comunes de Prisma:
 * - P2002: Unique constraint violation
 * - P2025: Record not found
 * - P2003: Foreign key constraint violation
 * - P2014: Relation violation
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.BAD_REQUEST;
    let message = 'Error en la base de datos';

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[] | undefined;
        message = `Ya existe un registro con ${target?.join(', ') || 'estos valores'}`;
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado';
        break;

      case 'P2003':
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Referencia inválida a otro registro';
        break;

      case 'P2014':
        // Relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'No se puede eliminar el registro porque tiene relaciones';
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error interno del servidor';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}

