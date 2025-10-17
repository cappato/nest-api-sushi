import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para marcar endpoints como públicos
 * (sin requerir autenticación)
 */
export const Public = () => SetMetadata('isPublic', true);

